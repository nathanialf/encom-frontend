import React, { useState } from 'react';
import { MapGenerationRequest } from '../types/map';

interface MapControlsProps {
  onGenerateMap: (request: MapGenerationRequest) => void;
  isLoading: boolean;
  className?: string;
}

export const MapControls: React.FC<MapControlsProps> = ({
  onGenerateMap,
  isLoading,
  className
}) => {
  const [hexagonCount, setHexagonCount] = useState(25);
  const [seed, setSeed] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const request: MapGenerationRequest = {
      hexagonCount,
      ...(seed.trim() && { seed: seed.trim() })
    };
    onGenerateMap(request);
  };

  return (
    <div className={className}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label htmlFor="hexagonCount" style={{ color: '#00ffff', fontSize: '14px', fontWeight: 'bold' }}>
            Hexagon Count:
          </label>
          <input
            id="hexagonCount"
            type="number"
            min="5"
            max="1000"
            value={hexagonCount}
            onChange={(e) => setHexagonCount(parseInt(e.target.value) || 25)}
            disabled={isLoading}
            style={{
              padding: '8px',
              backgroundColor: '#111',
              border: '1px solid #00ffff',
              borderRadius: '4px',
              color: '#00ffff',
              fontSize: '14px'
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label htmlFor="seed" style={{ color: '#00ffff', fontSize: '14px', fontWeight: 'bold' }}>
            Seed (optional):
          </label>
          <input
            id="seed"
            type="text"
            value={seed}
            onChange={(e) => setSeed(e.target.value)}
            disabled={isLoading}
            placeholder="Leave empty for random"
            style={{
              padding: '8px',
              backgroundColor: '#111',
              border: '1px solid #00ffff',
              borderRadius: '4px',
              color: '#00ffff',
              fontSize: '14px'
            }}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={{
            padding: '12px 24px',
            backgroundColor: isLoading ? '#333' : '#00ffff',
            color: isLoading ? '#666' : '#000',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s'
          }}
        >
          {isLoading ? 'Generating...' : 'Generate Map'}
        </button>
      </form>
    </div>
  );
};