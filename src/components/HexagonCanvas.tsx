import React, { useRef, useEffect, useState } from 'react';
import { Hexagon } from '../types/map';
import { HexagonMath } from '../lib/hexagon-math';

interface HexagonCanvasProps {
  hexagons: Hexagon[];
  hexSize?: number;
  className?: string;
}

export const HexagonCanvas: React.FC<HexagonCanvasProps> = ({
  hexagons,
  hexSize = 30,
  className
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredHex, setHoveredHex] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1.0);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || hexagons.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fixed canvas size (viewport)
    const canvasWidth = canvas.parentElement?.clientWidth || 800;
    const canvasHeight = canvas.parentElement?.clientHeight || 600;
    
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Calculate map bounds for centering
    const positions = hexagons.map(h => ({ q: h.q, r: h.r }));
    const mapBounds = HexagonMath.calculateCanvasSize(positions, hexSize);
    const mapCenter = {
      x: mapBounds.width / 2,
      y: mapBounds.height / 2
    };

    // Center the map in the viewport initially
    const viewportCenter = {
      x: canvasWidth / 2,
      y: canvasHeight / 2
    };

    // Apply transformations: translate to center, then apply pan and zoom
    ctx.save();
    ctx.translate(viewportCenter.x, viewportCenter.y);
    ctx.scale(zoom, zoom);
    ctx.translate(panOffset.x, panOffset.y);
    ctx.translate(-mapCenter.x, -mapCenter.y);

    // Draw connections first (so they appear behind hexagons)
    ctx.strokeStyle = '#00ffff40';
    ctx.lineWidth = 2;
    
    hexagons.forEach(hex => {
      const hexCenter = HexagonMath.axialToPixel(hex.q, hex.r, hexSize);

      hex.connections.forEach(connectionId => {
        const connectedHex = hexagons.find(h => h.id === connectionId);
        if (connectedHex) {
          const connectedCenter = HexagonMath.axialToPixel(connectedHex.q, connectedHex.r, hexSize);

          ctx.beginPath();
          ctx.moveTo(hexCenter.x, hexCenter.y);
          ctx.lineTo(connectedCenter.x, connectedCenter.y);
          ctx.stroke();
        }
      });
    });

    // Draw hexagons
    hexagons.forEach(hex => {
      const center = HexagonMath.axialToPixel(hex.q, hex.r, hexSize);

      const vertices = HexagonMath.getHexagonVertices(center, hexSize * 0.9);
      
      // Fill hexagon
      ctx.beginPath();
      ctx.moveTo(vertices[0].x, vertices[0].y);
      for (let i = 1; i < vertices.length; i++) {
        ctx.lineTo(vertices[i].x, vertices[i].y);
      }
      ctx.closePath();

      // Set colors based on type and hover state
      const isHovered = hoveredHex === hex.id;
      if (hex.type === 'ROOM') {
        ctx.fillStyle = isHovered ? '#ff8800aa' : '#ff880044';
        ctx.strokeStyle = isHovered ? '#ff8800' : '#ff8800aa';
      } else {
        ctx.fillStyle = isHovered ? '#00ffff44' : '#00ffff22';
        ctx.strokeStyle = isHovered ? '#00ffff' : '#00ffff88';
      }
      
      ctx.fill();
      ctx.lineWidth = isHovered ? 3 : 2;
      ctx.stroke();

      // Draw coordinates
      if (isHovered) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${hex.q},${hex.r}`, center.x, center.y + 4);
      }
    });

    // Restore canvas context
    ctx.restore();

  }, [hexagons, hexSize, hoveredHex, zoom, panOffset]);

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || hexagons.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // Transform mouse coordinates to map space
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const viewportCenter = { x: canvasWidth / 2, y: canvasHeight / 2 };
    
    const positions = hexagons.map(h => ({ q: h.q, r: h.r }));
    const mapBounds = HexagonMath.calculateCanvasSize(positions, hexSize);
    const mapCenter = { x: mapBounds.width / 2, y: mapBounds.height / 2 };

    // Inverse transform: undo the canvas transformations
    const transformedX = (mouseX - viewportCenter.x) / zoom - panOffset.x + mapCenter.x;
    const transformedY = (mouseY - viewportCenter.y) / zoom - panOffset.y + mapCenter.y;

    // Find closest hexagon
    let closestHex: string | null = null;
    let minDistance = Infinity;

    hexagons.forEach(hex => {
      const center = HexagonMath.axialToPixel(hex.q, hex.r, hexSize);

      const distance = Math.sqrt(
        Math.pow(transformedX - center.x, 2) + Math.pow(transformedY - center.y, 2)
      );

      if (distance < hexSize && distance < minDistance) {
        closestHex = hex.id;
        minDistance = distance;
      }
    });

    setHoveredHex(closestHex);
  };

  const handleMouseLeave = () => {
    setHoveredHex(null);
  };

  const handleWheel = (event: React.WheelEvent) => {
    event.preventDefault();
    const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.1, Math.min(3.0, prev * zoomFactor)));
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (event.button === 0) { // Left click
      setIsDragging(true);
      setDragStart({ x: event.clientX - panOffset.x, y: event.clientY - panOffset.y });
    }
  };

  const handleMouseMoveCanvas = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      setPanOffset({
        x: event.clientX - dragStart.x,
        y: event.clientY - dragStart.y
      });
    } else {
      handleMouseMove(event);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setZoom(1.0);
    setPanOffset({ x: 0, y: 0 });
  };

  const takeScreenshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create a temporary link element to download the image
    const link = document.createElement('a');
    link.download = `encom-map-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={className} style={{ position: 'relative' }}>
      {/* Zoom Controls */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: '5px'
      }}>
        <button
          onClick={() => setZoom(prev => Math.min(3.0, prev * 1.2))}
          style={{
            backgroundColor: '#00ffff',
            color: '#000',
            border: 'none',
            borderRadius: '4px',
            padding: '5px 10px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          +
        </button>
        <button
          onClick={() => setZoom(prev => Math.max(0.1, prev / 1.2))}
          style={{
            backgroundColor: '#00ffff',
            color: '#000',
            border: 'none',
            borderRadius: '4px',
            padding: '5px 10px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          -
        </button>
        <button
          onClick={resetView}
          style={{
            backgroundColor: '#ff8800',
            color: '#000',
            border: 'none',
            borderRadius: '4px',
            padding: '5px 10px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 'bold'
          }}
        >
          Reset
        </button>
        <button
          onClick={takeScreenshot}
          style={{
            backgroundColor: '#88ff00',
            color: '#000',
            border: 'none',
            borderRadius: '4px',
            padding: '5px 10px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 'bold'
          }}
        >
          📷 Save
        </button>
      </div>

      {/* Canvas Container */}
      <div
        style={{
          width: '100%',
          height: '80vh',
          border: '1px solid #00ffff',
          borderRadius: '4px',
          background: '#000',
          position: 'relative',
          cursor: isDragging ? 'grabbing' : 'grab',
          overflow: 'hidden'
        }}
        onWheel={handleWheel}
      >
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMoveCanvas}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          style={{
            display: 'block',
            background: '#000',
            width: '100%',
            height: '100%'
          }}
        />
      </div>

      {/* Instructions */}
      <div style={{
        position: 'absolute',
        bottom: '10px',
        left: '10px',
        color: '#00ffff88',
        fontSize: '12px',
        background: '#00000088',
        padding: '5px 10px',
        borderRadius: '4px'
      }}>
        Scroll to zoom • Drag to pan • Hover hexagons for coordinates
      </div>
    </div>
  );
};