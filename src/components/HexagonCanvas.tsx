import React, { useRef, useEffect, useState } from 'react';
import { Hexagon } from '../types/map';
import { HexagonMath } from '../lib/hexagon-math';
import { useWindowDimensions } from '../hooks/useWindowDimensions';

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
  const { height: windowHeight, isMobile, isTablet } = useWindowDimensions();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredHex, setHoveredHex] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1.0);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastTouchDistance, setLastTouchDistance] = useState<number | null>(null);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || hexagons.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Responsive canvas size based on container dimensions
    const containerElement = canvas.parentElement;
    if (!containerElement) return;
    
    const canvasWidth = containerElement.clientWidth;
    const canvasHeight = containerElement.clientHeight;
    
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Calculate map bounds and proper offset for centering
    const positions = hexagons.map(h => ({ q: h.q, r: h.r }));
    const mapBounds = HexagonMath.calculateCanvasSize(positions, hexSize);
    const mapOffset = HexagonMath.calculateOffset(positions, hexSize);
    const mapCenter = {
      x: mapBounds.width / 2,
      y: mapBounds.height / 2
    };

    // Center the map in the viewport initially
    const viewportCenter = {
      x: canvasWidth / 2,
      y: canvasHeight / 2
    };

    // On first load, calculate optimal zoom to fit entire map in viewport
    if (isFirstLoad && hexagons.length > 0) {
      // Use bounding box approach to ensure entire map is visible
      const paddingFactor = isMobile ? 0.85 : 0.8; // Leave some padding around the map
      const availableWidth = canvasWidth * paddingFactor;
      const availableHeight = canvasHeight * paddingFactor;
      
      // Calculate zoom to fit the map bounds within available space
      const zoomX = availableWidth / mapBounds.width;
      const zoomY = availableHeight / mapBounds.height;
      
      // Use the smaller zoom to ensure entire map fits
      let optimalZoom = Math.min(zoomX, zoomY);
      
      // Set reasonable min/max zoom bounds
      const minZoom = 0.2;
      const maxZoom = isMobile ? 5.0 : 4.0;
      optimalZoom = Math.max(minZoom, Math.min(maxZoom, optimalZoom));
      
      setZoom(optimalZoom);
      setPanOffset({ x: 0, y: 0 }); // Reset pan to center
      setIsFirstLoad(false);
    }

    // Apply transformations: translate to center, then apply pan and zoom
    ctx.save();
    ctx.translate(viewportCenter.x, viewportCenter.y);
    ctx.scale(zoom, zoom);
    ctx.translate(panOffset.x, panOffset.y);
    ctx.translate(mapOffset.x - mapCenter.x, mapOffset.y - mapCenter.y);

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

  }, [hexagons, hexSize, hoveredHex, zoom, panOffset, isFirstLoad, isMobile]);

  // Reset first load flag when hexagons change (new map generated)
  useEffect(() => {
    if (hexagons.length > 0) {
      setIsFirstLoad(true);
    }
  }, [hexagons.length]);

  // Force re-centering when switching to mobile (for better mobile experience)
  useEffect(() => {
    if (hexagons.length > 0 && isMobile) {
      setIsFirstLoad(true);
    }
  }, [isMobile, hexagons.length]);

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
    const mapOffset = HexagonMath.calculateOffset(positions, hexSize);
    const mapCenter = { x: mapBounds.width / 2, y: mapBounds.height / 2 };

    // Inverse transform: undo the canvas transformations (must match rendering transformations)
    const transformedX = (mouseX - viewportCenter.x) / zoom - panOffset.x - (mapOffset.x - mapCenter.x);
    const transformedY = (mouseY - viewportCenter.y) / zoom - panOffset.y - (mapOffset.y - mapCenter.y);

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
    // Trigger auto-centering logic
    setIsFirstLoad(true);
  };

  // Touch event handlers for mobile support
  const getTouchDistance = (touch1: React.Touch, touch2: React.Touch) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getTouchCenter = (touch1: React.Touch, touch2: React.Touch) => {
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2
    };
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    
    if (event.touches.length === 1) {
      // Single touch - start panning
      setIsDragging(true);
      const touch = event.touches[0];
      setDragStart({ 
        x: touch.clientX - panOffset.x, 
        y: touch.clientY - panOffset.y 
      });
    } else if (event.touches.length === 2) {
      // Two touches - start zooming
      setIsDragging(false);
      const distance = getTouchDistance(event.touches[0], event.touches[1]);
      setLastTouchDistance(distance);
      
      // Store initial touch positions for reference if needed
      getTouchCenter(event.touches[0], event.touches[1]);
    }
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    
    if (event.touches.length === 1 && isDragging) {
      // Single touch - pan
      const touch = event.touches[0];
      setPanOffset({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y
      });
    } else if (event.touches.length === 2 && lastTouchDistance !== null) {
      // Two touches - zoom
      const currentDistance = getTouchDistance(event.touches[0], event.touches[1]);
      const scale = currentDistance / lastTouchDistance;
      
      // Apply zoom with limits
      setZoom(prev => Math.max(0.1, Math.min(3.0, prev * scale)));
      setLastTouchDistance(currentDistance);
    }
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    
    if (event.touches.length === 0) {
      // All touches ended
      setIsDragging(false);
      setLastTouchDistance(null);
    } else if (event.touches.length === 1) {
      // One touch remaining, reset for panning
      setLastTouchDistance(null);
      if (!isDragging) {
        setIsDragging(true);
        const touch = event.touches[0];
        setDragStart({ 
          x: touch.clientX - panOffset.x, 
          y: touch.clientY - panOffset.y 
        });
      }
    }
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
    <div className={className} style={{ 
      position: 'relative', 
      width: '100%',
      // Ensure full width on mobile
      ...(isMobile && { 
        width: '100%',
        maxWidth: '100%' 
      })
    }}>
      {/* Zoom Controls */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: isMobile ? '8px' : '5px'
      }}>
        <button
          onClick={() => setZoom(prev => Math.min(3.0, prev * 1.2))}
          style={{
            backgroundColor: '#00ffff',
            color: '#000',
            border: 'none',
            borderRadius: '4px',
            padding: isMobile ? '10px 14px' : '5px 10px',
            cursor: 'pointer',
            fontSize: isMobile ? '18px' : '14px',
            fontWeight: 'bold',
            minWidth: isMobile ? '44px' : 'auto',
            minHeight: isMobile ? '44px' : 'auto'
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
            padding: isMobile ? '10px 14px' : '5px 10px',
            cursor: 'pointer',
            fontSize: isMobile ? '18px' : '14px',
            fontWeight: 'bold',
            minWidth: isMobile ? '44px' : 'auto',
            minHeight: isMobile ? '44px' : 'auto'
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
            padding: isMobile ? '8px 12px' : '5px 10px',
            cursor: 'pointer',
            fontSize: isMobile ? '14px' : '12px',
            fontWeight: 'bold',
            minWidth: isMobile ? '44px' : 'auto',
            minHeight: isMobile ? '44px' : 'auto'
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
            padding: isMobile ? '8px 12px' : '5px 10px',
            cursor: 'pointer',
            fontSize: isMobile ? '14px' : '12px',
            fontWeight: 'bold',
            minWidth: isMobile ? '44px' : 'auto',
            minHeight: isMobile ? '44px' : 'auto'
          }}
        >
          📷 Save
        </button>
      </div>

      {/* Canvas Container */}
      <div
        style={{
          width: '100%',
          height: isMobile 
            ? `${Math.min(windowHeight * 0.55, windowHeight - 280)}px` // Mobile: slightly shorter but full width
            : isTablet 
              ? `${Math.min(windowHeight * 0.65, windowHeight - 120)}px` // Tablet: shorter and wider
              : `${Math.min(windowHeight * 0.70, windowHeight - 100)}px`, // Desktop: shorter and wider
          minHeight: isMobile ? '280px' : (isTablet ? '400px' : '450px'), // Adjusted minimums for better aspect ratios
          maxHeight: isMobile ? '60vh' : (isTablet ? '70vh' : '75vh'), // More reasonable maximums
          border: '1px solid #00ffff',
          borderRadius: '4px',
          background: '#000',
          position: 'relative',
          cursor: isDragging ? 'grabbing' : 'grab',
          overflow: 'hidden',
          touchAction: 'none' // Prevent default touch behaviors
        }}
        onWheel={handleWheel}
      >
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMoveCanvas}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
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
        fontSize: '11px',
        background: '#00000aa',
        padding: '6px 12px',
        borderRadius: '4px',
        maxWidth: '280px',
        lineHeight: '1.3'
      }}>
        <div style={{ display: 'block' }}>
          🖱️ <strong>Desktop:</strong> Scroll to zoom • Drag to pan • Hover for coordinates
        </div>
        <div style={{ display: 'block', marginTop: '2px' }}>
          📱 <strong>Mobile:</strong> Pinch to zoom • Touch drag to pan
        </div>
      </div>
    </div>
  );
};