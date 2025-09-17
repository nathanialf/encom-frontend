import React from 'react';
import { HexagonCanvas } from '../components/HexagonCanvas';
import { MapControls } from '../components/MapControls';
import { MapStatistics } from '../components/MapStatistics';
import { useMapGeneration } from '../hooks/useMapGeneration';
import { useWindowDimensions } from '../hooks/useWindowDimensions';

const App: React.FC = () => {
  const { mapData, isLoading, error, generateMap, clearError } = useMapGeneration();
  const { isMobile, isTablet } = useWindowDimensions();

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#000', 
      color: '#00ffff',
      fontFamily: 'monospace'
    }}>
      <div style={{
        maxWidth: isMobile ? '100%' : '1400px', // Full width on mobile
        margin: '0 auto',
        padding: isMobile ? '8px' : '20px' // Minimal padding on mobile for full width
      }}>
        {/* Header */}
        <header style={{ textAlign: 'center', marginBottom: isMobile ? '20px' : '32px' }}>
          <h1 style={{ 
            margin: '0', 
            fontSize: isMobile ? '2rem' : '2.5rem', 
            fontWeight: 'bold',
            textShadow: '0 0 10px #00ffff'
          }}>
            ENCOM
          </h1>
          <p style={{ 
            margin: '8px 0 0 0', 
            fontSize: isMobile ? '1rem' : '1.1rem', 
            opacity: 0.8 
          }}>
            Hexagonal Map Generation System
          </p>
        </header>

        {/* Error Display */}
        {error && (
          <div style={{
            backgroundColor: '#330000',
            border: '1px solid #ff0000',
            borderRadius: '4px',
            padding: '16px',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ color: '#ff6666' }}>{error}</span>
            <button
              onClick={clearError}
              style={{
                backgroundColor: 'transparent',
                border: '1px solid #ff6666',
                borderRadius: '4px',
                color: '#ff6666',
                padding: '4px 8px',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>
          </div>
        )}

        <div style={{ 
          display: 'flex', 
          gap: isMobile ? '15px' : (isTablet ? '18px' : '20px'), 
          alignItems: 'flex-start',
          flexDirection: isMobile ? 'column' : 'row' // Responsive layout
        }}>
          {/* Left Panel - Controls */}
          <div style={{ 
            minWidth: isMobile ? '100%' : (isTablet ? '280px' : '300px'),
            width: isMobile ? '100%' : 'auto',
            flexShrink: 0 // Prevent controls from shrinking
          }}>
            <div style={{
              backgroundColor: '#111',
              border: '1px solid #00ffff',
              borderRadius: '8px',
              padding: isMobile ? '16px' : '20px'
            }}>
              <MapControls 
                onGenerateMap={generateMap}
                isLoading={isLoading}
              />
            </div>

            {/* Statistics - Only show on desktop/tablet, not mobile */}
            {mapData && !isMobile && (
              <div style={{ marginTop: '20px' }}>
                <MapStatistics metadata={mapData.metadata} />
              </div>
            )}
          </div>

          {/* Right Panel - Canvas */}
          <div style={{ 
            flex: 1, 
            display: 'flex', 
            justifyContent: 'center',
            width: '100%',
            minWidth: 0, // Allow flex item to shrink
            // On mobile, ensure full width usage
            ...(isMobile && { 
              width: '100%',
              maxWidth: '100%' 
            })
          }}>
            {isLoading && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '400px',
                gap: '16px'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  border: '4px solid #333',
                  borderTop: '4px solid #00ffff',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                <p>Generating hexagonal map...</p>
                <style>
                  {`
                    @keyframes spin {
                      0% { transform: rotate(0deg); }
                      100% { transform: rotate(360deg); }
                    }
                  `}
                </style>
              </div>
            )}

            {mapData && !isLoading && (
              <HexagonCanvas 
                hexagons={mapData.hexagons}
                hexSize={35}
              />
            )}

            {!mapData && !isLoading && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '400px',
                border: '2px dashed #00ffff44',
                borderRadius: '8px',
                padding: '40px',
                textAlign: 'center'
              }}>
                <h3 style={{ margin: '0 0 16px 0', color: '#00ffff88' }}>
                  No Map Generated
                </h3>
                <p style={{ margin: '0', color: '#00ffff66' }}>
                  Use the controls on the left to generate a hexagonal map
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Statistics - Show below canvas on mobile */}
        {mapData && isMobile && (
          <div style={{ marginTop: '20px' }}>
            <MapStatistics metadata={mapData.metadata} />
          </div>
        )}

        {/* Footer */}
        <footer style={{ 
          textAlign: 'center', 
          marginTop: isMobile ? '30px' : '40px', 
          padding: isMobile ? '15px' : '20px',
          borderTop: '1px solid #00ffff22',
          color: '#00ffff66',
          fontSize: isMobile ? '12px' : '14px'
        }}>
          <p>Powered by AWS Lambda • API Gateway • React</p>
        </footer>
      </div>
    </div>
  );
};

export default App;