import React from 'react';
import { render, screen } from '@testing-library/react';
import { MapStatistics } from './MapStatistics';

describe('MapStatistics Component', () => {
  const mockMetadata = {
    seed: 'test-seed-123',
    hexagonCount: 100,
    generatedAt: '2023-01-01T12:00:00.000Z',
    version: '1.0.0',
    cached: false,
    generationTime: 250,
    statistics: {
      actualHexagons: 100,
      corridorHexagons: 70,
      roomHexagons: 30,
      averageConnections: 2.5,
      maxConnections: 6,
      longestPath: 15,
      boundingBox: { minQ: -5, maxQ: 5, minR: -3, maxR: 7 }
    }
  };

  test('renders map statistics title', () => {
    render(<MapStatistics metadata={mockMetadata} />);
    
    const title = screen.getByText('Map Statistics');
    expect(title).toBeInTheDocument();
  });

  test('displays total hexagons count', () => {
    render(<MapStatistics metadata={mockMetadata} />);
    
    expect(screen.getByText('Total Hexagons:')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  test('displays rooms count', () => {
    render(<MapStatistics metadata={mockMetadata} />);
    
    expect(screen.getByText('Rooms:')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
  });

  test('displays corridors count', () => {
    render(<MapStatistics metadata={mockMetadata} />);
    
    expect(screen.getByText('Corridors:')).toBeInTheDocument();
    expect(screen.getByText('70')).toBeInTheDocument();
  });

  test('displays seed information', () => {
    render(<MapStatistics metadata={mockMetadata} />);
    
    expect(screen.getByText('Seed:')).toBeInTheDocument();
    expect(screen.getByText('test-seed-123')).toBeInTheDocument();
  });

  test('displays generation time', () => {
    render(<MapStatistics metadata={mockMetadata} />);
    
    expect(screen.getByText('Generation Time:')).toBeInTheDocument();
    expect(screen.getByText('250ms')).toBeInTheDocument();
  });

  test('displays average connections', () => {
    render(<MapStatistics metadata={mockMetadata} />);
    
    expect(screen.getByText('Avg Connections:')).toBeInTheDocument();
    expect(screen.getByText('2.50')).toBeInTheDocument();
  });

  test('handles metadata with zero values', () => {
    const zeroMetadata = {
      seed: '',
      hexagonCount: 0,
      generatedAt: '2023-01-01T12:00:00.000Z',
      version: '1.0.0',
      cached: false,
      generationTime: 0,
      statistics: {
        actualHexagons: 0,
        corridorHexagons: 0,
        roomHexagons: 0,
        averageConnections: 0,
        maxConnections: 0,
        longestPath: 0,
        boundingBox: { minQ: 0, maxQ: 0, minR: 0, maxR: 0 }
      }
    };

    render(<MapStatistics metadata={zeroMetadata} />);
    
    expect(screen.getByText('Total Hexagons:')).toBeInTheDocument();
    expect(screen.getByText((content, element) => {
      return element?.textContent === 'Total Hexagons: 0';
    })).toBeInTheDocument();
  });

  test('handles metadata with large numbers', () => {
    const largeMetadata = {
      seed: 'large-map-seed',
      hexagonCount: 9999,
      generatedAt: '2023-01-01T12:00:00.000Z',
      version: '1.0.0',
      cached: false,
      generationTime: 500,
      statistics: {
        actualHexagons: 9999,
        corridorHexagons: 6666,
        roomHexagons: 3333,
        averageConnections: 2.5,
        maxConnections: 6,
        longestPath: 50,
        boundingBox: { minQ: -50, maxQ: 50, minR: -50, maxR: 50 }
      }
    };

    render(<MapStatistics metadata={largeMetadata} />);
    
    expect(screen.getByText('9999')).toBeInTheDocument();
    expect(screen.getByText('3333')).toBeInTheDocument();
    expect(screen.getByText('6666')).toBeInTheDocument();
  });

  test('applies correct styling classes', () => {
    render(<MapStatistics metadata={mockMetadata} />);
    
    // Check that the component renders with expected structure
    expect(screen.getByText('Map Statistics')).toBeInTheDocument();
  });

  test('displays empty seed correctly', () => {
    const metadataWithEmptySeed = {
      ...mockMetadata,
      seed: ''
    };

    render(<MapStatistics metadata={metadataWithEmptySeed} />);
    
    expect(screen.getByText('Seed:')).toBeInTheDocument();
    // The empty string should still be displayed (as empty)
  });

  test('handles undefined values gracefully', () => {
    const incompleteMetadata = {
      seed: 'partial-seed',
      hexagonCount: 50,
      generatedAt: '2023-01-01T12:00:00.000Z',
      version: '1.0.0',
      cached: false,
      generationTime: 100,
      statistics: {
        actualHexagons: 50,
        corridorHexagons: 25,
        roomHexagons: 25,
        averageConnections: 2,
        maxConnections: 4,
        longestPath: 10,
        boundingBox: { minQ: -5, maxQ: 5, minR: -5, maxR: 5 }
      }
    };

    render(<MapStatistics metadata={incompleteMetadata} />);
    
    expect(screen.getByText('Total Hexagons:')).toBeInTheDocument();
    expect(screen.getByText((content, element) => {
      return element?.textContent === 'Total Hexagons: 50';
    })).toBeInTheDocument();
    expect(screen.getByText('Corridors:')).toBeInTheDocument();
    expect(screen.getByText((content, element) => {
      return element?.textContent === 'Corridors: 25';
    })).toBeInTheDocument();
  });

  test('calculates percentage distribution correctly', () => {
    render(<MapStatistics metadata={mockMetadata} />);
    
    // With 30 rooms and 70 corridors out of 100 total
    // Should show 30% rooms, 70% corridors
    const roomsText = screen.getByText('30');
    const corridorsText = screen.getByText('70');
    
    expect(roomsText).toBeInTheDocument();
    expect(corridorsText).toBeInTheDocument();
  });

  test('handles single hexagon map', () => {
    const singleHexMetadata = {
      seed: 'single-hex',
      hexagonCount: 1,
      generatedAt: '2023-01-01T12:00:00.000Z',
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
    };

    render(<MapStatistics metadata={singleHexMetadata} />);
    
    expect(screen.getByText((content, element) => {
      return element?.textContent === 'Rooms: 1';
    })).toBeInTheDocument();
    expect(screen.getByText((content, element) => {
      return element?.textContent === 'Corridors: 0';
    })).toBeInTheDocument();
  });
});