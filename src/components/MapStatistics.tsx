import React from 'react';
import { MapMetadata } from '../types/map';

interface MapStatisticsProps {
  metadata: MapMetadata;
  className?: string;
}

export const MapStatistics: React.FC<MapStatisticsProps> = ({
  metadata,
  className
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className={className} style={{ 
      backgroundColor: '#111', 
      border: '1px solid #00ffff', 
      borderRadius: '4px', 
      padding: '16px',
      color: '#00ffff'
    }}>
      <h3 style={{ margin: '0 0 16px 0', color: '#00ffff' }}>Map Statistics</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '14px' }}>
        <div>
          <strong>Seed:</strong> {metadata.seed}
        </div>
        <div>
          <strong>Version:</strong> {metadata.version}
        </div>
        
        <div>
          <strong>Generated:</strong> {formatDate(metadata.generatedAt)}
        </div>
        <div>
          <strong>Generation Time:</strong> {metadata.generationTime}ms
        </div>
        
        <div>
          <strong>Total Hexagons:</strong> {metadata.statistics.actualHexagons}
        </div>
        <div>
          <strong>Corridors:</strong> {metadata.statistics.corridorHexagons}
        </div>
        
        <div>
          <strong>Rooms:</strong> {metadata.statistics.roomHexagons}
        </div>
        <div>
          <strong>Avg Connections:</strong> {metadata.statistics.averageConnections.toFixed(2)}
        </div>
        
        <div>
          <strong>Max Connections:</strong> {metadata.statistics.maxConnections}
        </div>
        <div>
          <strong>Longest Path:</strong> {metadata.statistics.longestPath}
        </div>
      </div>
      
      <div style={{ marginTop: '12px', padding: '8px', backgroundColor: '#222', borderRadius: '4px' }}>
        <strong>Bounding Box:</strong>
        <div style={{ fontSize: '12px', marginTop: '4px' }}>
          Q: {metadata.statistics.boundingBox.minQ} to {metadata.statistics.boundingBox.maxQ} | 
          R: {metadata.statistics.boundingBox.minR} to {metadata.statistics.boundingBox.maxR}
        </div>
      </div>
    </div>
  );
};