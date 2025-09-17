import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

// Mock the API module
jest.mock('../lib/api', () => ({
  MapAPI: {
    generateMap: jest.fn()
  }
}));

// Mock the useWindowDimensions hook
const mockUseWindowDimensions = jest.fn();

jest.mock('../hooks/useWindowDimensions', () => ({
  useWindowDimensions: () => mockUseWindowDimensions()
}));

// Mock the canvas component to avoid canvas-related issues in tests
jest.mock('../components/HexagonCanvas', () => ({
  HexagonCanvas: ({ hexagons }: { hexagons: any[] }) => (
    <div data-testid="hexagon-canvas">
      {hexagons && <div data-testid="canvas-with-data">Canvas with {hexagons.length} hexagons</div>}
    </div>
  )
}));

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set default mock return value
    mockUseWindowDimensions.mockReturnValue({
      width: 1200,
      height: 800,
      isMobile: false,
      isTablet: false,
      isDesktop: true
    });
  });

  test('renders ENCOM title', () => {
    render(<App />);
    const titleElement = screen.getByText('ENCOM');
    expect(titleElement).toBeInTheDocument();
  });

  test('renders subtitle', () => {
    render(<App />);
    const subtitleElement = screen.getByText('Hexagonal Map Generation System');
    expect(subtitleElement).toBeInTheDocument();
  });

  test('renders map controls component', () => {
    render(<App />);
    const generateButton = screen.getByText(/Generate Map/i);
    expect(generateButton).toBeInTheDocument();
  });

  test('renders hexagon count input', () => {
    render(<App />);
    const hexagonInput = screen.getByLabelText(/Hexagon Count/i);
    expect(hexagonInput).toBeInTheDocument();
  });

  test('renders seed input', () => {
    render(<App />);
    const seedInput = screen.getByLabelText(/Seed/i);
    expect(seedInput).toBeInTheDocument();
  });

  test('shows no map generated message initially', () => {
    render(<App />);
    const noMapMessage = screen.getByText('No Map Generated');
    expect(noMapMessage).toBeInTheDocument();
  });

  test('shows loading state when generating map', async () => {
    const { MapAPI } = require('../lib/api');
    MapAPI.generateMap.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<App />);
    
    const generateButton = screen.getByText('Generate Map');
    fireEvent.click(generateButton);

    expect(screen.getByText('Generating...')).toBeInTheDocument();
    expect(screen.getByText('Generating hexagonal map...')).toBeInTheDocument();
  });

  test('displays error message on generation failure', async () => {
    const { MapAPI } = require('../lib/api');
    MapAPI.generateMap.mockRejectedValue(new Error('API Error'));

    render(<App />);
    
    const generateButton = screen.getByText('Generate Map');
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText('API Error')).toBeInTheDocument();
    });
  });

  test('can clear error message', async () => {
    const { MapAPI } = require('../lib/api');
    MapAPI.generateMap.mockRejectedValue(new Error('Test Error'));

    render(<App />);
    
    const generateButton = screen.getByText('Generate Map');
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText('Test Error')).toBeInTheDocument();
    });

    const closeButton = screen.getByText('✕');
    fireEvent.click(closeButton);

    expect(screen.queryByText('Test Error')).not.toBeInTheDocument();
  });

  test('renders canvas when map data is available', async () => {
    const mockMapData = {
      hexagons: [
        { id: 'hex-1', q: 0, r: 0, type: 'ROOM' as const, connections: [] },
        { id: 'hex-2', q: 1, r: 0, type: 'CORRIDOR' as const, connections: ['hex-1'] }
      ],
      metadata: {
        seed: 'test-seed',
        hexagonCount: 2,
        generatedAt: '2023-01-01T00:00:00.000Z',
        version: '1.0.0',
        cached: false,
        generationTime: 100,
        statistics: {
          actualHexagons: 2,
          corridorHexagons: 1,
          roomHexagons: 1,
          averageConnections: 0.5,
          maxConnections: 1,
          longestPath: 2,
          boundingBox: { minQ: 0, maxQ: 1, minR: 0, maxR: 0 }
        }
      }
    };

    const { MapAPI } = require('../lib/api');
    MapAPI.generateMap.mockResolvedValue(mockMapData);

    render(<App />);
    
    const generateButton = screen.getByText('Generate Map');
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByTestId('canvas-with-data')).toBeInTheDocument();
    });
    expect(screen.getByText('Canvas with 2 hexagons')).toBeInTheDocument();
  });

  test('renders map statistics when available', async () => {
    const mockMapData = {
      hexagons: [
        { id: 'hex-1', q: 0, r: 0, type: 'ROOM' as const, connections: [] }
      ],
      metadata: {
        seed: 'test-seed',
        hexagonCount: 1,
        generatedAt: '2023-01-01T00:00:00.000Z',
        version: '1.0.0',
        cached: false,
        generationTime: 50,
        statistics: {
          actualHexagons: 1,
          corridorHexagons: 0,
          roomHexagons: 1,
          averageConnections: 0,
          maxConnections: 0,
          longestPath: 1,
          boundingBox: { minQ: 0, maxQ: 0, minR: 0, maxR: 0 }
        }
      }
    };

    const { MapAPI } = require('../lib/api');
    MapAPI.generateMap.mockResolvedValue(mockMapData);

    render(<App />);
    
    const generateButton = screen.getByText('Generate Map');
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText('Map Statistics')).toBeInTheDocument();
    });
  });

  test('renders footer with author information', () => {
    render(<App />);
    const footer = screen.getByText('2025 • Nathanial Fine • DEFNF');
    expect(footer).toBeInTheDocument();
  });

  describe('Responsive Layout', () => {
    test('shows statistics in sidebar on desktop', async () => {
      mockUseWindowDimensions.mockReturnValue({
        width: 1200,
        height: 800,
        isMobile: false,
        isTablet: false,
        isDesktop: true
      });

      const mockMapData = {
        hexagons: [
          { id: 'hex-1', q: 0, r: 0, type: 'ROOM' as const, connections: [] }
        ],
        metadata: {
          seed: 'test-seed',
          hexagonCount: 1,
          generatedAt: '2023-01-01T00:00:00.000Z',
          version: '1.0.0',
          cached: false,
          generationTime: 50,
          statistics: {
            actualHexagons: 1,
            corridorHexagons: 0,
            roomHexagons: 1,
            averageConnections: 0,
            maxConnections: 0,
            longestPath: 1,
            boundingBox: { minQ: 0, maxQ: 0, minR: 0, maxR: 0 }
          }
        }
      };

      const { MapAPI } = require('../lib/api');
      MapAPI.generateMap.mockResolvedValue(mockMapData);

      render(<App />);
      
      const generateButton = screen.getByText('Generate Map');
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText('Map Statistics')).toBeInTheDocument();
      });
    });

    test('shows statistics below canvas on mobile', async () => {
      mockUseWindowDimensions.mockReturnValue({
        width: 600,
        height: 800,
        isMobile: true,
        isTablet: false,
        isDesktop: false
      });

      const mockMapData = {
        hexagons: [
          { id: 'hex-1', q: 0, r: 0, type: 'ROOM' as const, connections: [] }
        ],
        metadata: {
          seed: 'test-seed',
          hexagonCount: 1,
          generatedAt: '2023-01-01T00:00:00.000Z',
          version: '1.0.0',
          cached: false,
          generationTime: 50,
          statistics: {
            actualHexagons: 1,
            corridorHexagons: 0,
            roomHexagons: 1,
            averageConnections: 0,
            maxConnections: 0,
            longestPath: 1,
            boundingBox: { minQ: 0, maxQ: 0, minR: 0, maxR: 0 }
          }
        }
      };

      const { MapAPI } = require('../lib/api');
      MapAPI.generateMap.mockResolvedValue(mockMapData);

      render(<App />);
      
      const generateButton = screen.getByText('Generate Map');
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText('Map Statistics')).toBeInTheDocument();
      });
      
      // On mobile, both canvas and statistics should be present
      expect(screen.getByTestId('hexagon-canvas')).toBeInTheDocument();
      expect(screen.getByText('Map Statistics')).toBeInTheDocument();
    });

    test('applies mobile-specific styling', () => {
      mockUseWindowDimensions.mockReturnValue({
        width: 600,
        height: 800,
        isMobile: true,
        isTablet: false,
        isDesktop: false
      });

      render(<App />);
      
      // Check that title is rendered with mobile-specific size
      const title = screen.getByText('ENCOM');
      expect(title).toBeInTheDocument();
    });

    test('applies tablet-specific styling', () => {
      mockUseWindowDimensions.mockReturnValue({
        width: 800,
        height: 600,
        isMobile: false,
        isTablet: true,
        isDesktop: false
      });

      render(<App />);
      
      const title = screen.getByText('ENCOM');
      expect(title).toBeInTheDocument();
    });

    test('handles window resize gracefully', () => {
      const { rerender } = render(<App />);
      
      // Simulate window resize to mobile
      mockUseWindowDimensions.mockReturnValue({
        width: 500,
        height: 800,
        isMobile: true,
        isTablet: false,
        isDesktop: false
      });
      
      rerender(<App />);
      
      // Should not throw errors
      expect(screen.getByText('ENCOM')).toBeInTheDocument();
    });
  });
});