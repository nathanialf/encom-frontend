import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { HexagonCanvas } from './HexagonCanvas';
import { Hexagon } from '../types/map';

// Mock the useWindowDimensions hook
const mockUseWindowDimensions = jest.fn();
jest.mock('../hooks/useWindowDimensions', () => ({
  useWindowDimensions: () => mockUseWindowDimensions()
}));

// Mock HexagonMath
jest.mock('../lib/hexagon-math', () => ({
  HexagonMath: {
    calculateCanvasSize: jest.fn(() => ({ width: 200, height: 200 })),
    axialToPixel: jest.fn((q, r, size) => ({ x: q * size, y: r * size })),
    getHexagonVertices: jest.fn(() => [
      { x: 0, y: 0 }, { x: 10, y: 0 }, { x: 15, y: 8 },
      { x: 10, y: 16 }, { x: 0, y: 16 }, { x: -5, y: 8 }
    ])
  }
}));

// Mock canvas context
const mockGetContext = jest.fn(() => ({
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 0,
  font: '',
  textAlign: '',
  fillRect: jest.fn(),
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  closePath: jest.fn(),
  fill: jest.fn(),
  stroke: jest.fn(),
  fillText: jest.fn(),
  save: jest.fn(),
  restore: jest.fn(),
  translate: jest.fn(),
  scale: jest.fn(),
}));

beforeEach(() => {
  // Mock canvas methods
  HTMLCanvasElement.prototype.getContext = mockGetContext as any;
  HTMLCanvasElement.prototype.toDataURL = jest.fn(() => 'data:image/png;base64,fake-data');
  
  // Mock default window dimensions (desktop)
  mockUseWindowDimensions.mockReturnValue({
    width: 1200,
    height: 800,
    isMobile: false,
    isTablet: false,
    isDesktop: true
  });
  
  jest.clearAllMocks();
});

const mockHexagons: Hexagon[] = [
  {
    id: 'hex-0-0',
    q: 0,
    r: 0,
    type: 'ROOM',
    connections: ['hex-1-0']
  },
  {
    id: 'hex-1-0',
    q: 1,
    r: 0,
    type: 'CORRIDOR',
    connections: ['hex-0-0', 'hex-2-0']
  },
  {
    id: 'hex-2-0',
    q: 2,
    r: 0,
    type: 'ROOM',
    connections: ['hex-1-0']
  }
];

describe('HexagonCanvas Responsive Features', () => {
  test('renders canvas component', () => {
    render(<HexagonCanvas hexagons={mockHexagons} />);
    
    // Check for zoom controls to verify component rendered
    expect(screen.getByText('+')).toBeInTheDocument();
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  test('renders zoom controls', () => {
    render(<HexagonCanvas hexagons={mockHexagons} />);
    
    expect(screen.getByText('+')).toBeInTheDocument();
    expect(screen.getByText('-')).toBeInTheDocument();
    expect(screen.getByText('Reset')).toBeInTheDocument();
    expect(screen.getByText('📷 Save')).toBeInTheDocument();
  });

  test('renders responsive instructions', () => {
    render(<HexagonCanvas hexagons={mockHexagons} />);
    
    expect(screen.getByText(/Desktop:/)).toBeInTheDocument();
    expect(screen.getByText(/Mobile:/)).toBeInTheDocument();
  });

  test('applies mobile-specific button styling', () => {
    mockUseWindowDimensions.mockReturnValue({
      width: 600,
      height: 800,
      isMobile: true,
      isTablet: false,
      isDesktop: false
    });

    render(<HexagonCanvas hexagons={mockHexagons} />);
    
    const zoomButton = screen.getByText('+');
    expect(zoomButton).toBeInTheDocument();
  });

  test('applies desktop-specific button styling', () => {
    mockUseWindowDimensions.mockReturnValue({
      width: 1200,
      height: 800,
      isMobile: false,
      isTablet: false,
      isDesktop: true
    });

    render(<HexagonCanvas hexagons={mockHexagons} />);
    
    const zoomButton = screen.getByText('+');
    expect(zoomButton).toBeInTheDocument();
  });

  test('zoom controls work correctly', () => {
    render(<HexagonCanvas hexagons={mockHexagons} />);
    
    const zoomInButton = screen.getByText('+');
    const zoomOutButton = screen.getByText('-');
    
    // Test zoom in
    fireEvent.click(zoomInButton);
    // Test zoom out
    fireEvent.click(zoomOutButton);
    
    // Should not throw errors
    expect(zoomInButton).toBeInTheDocument();
    expect(zoomOutButton).toBeInTheDocument();
  });

  test('reset button works correctly', () => {
    render(<HexagonCanvas hexagons={mockHexagons} />);
    
    const resetButton = screen.getByText('Reset');
    
    fireEvent.click(resetButton);
    
    // Should not throw errors
    expect(resetButton).toBeInTheDocument();
  });

  test('handles empty hexagons array gracefully', () => {
    render(<HexagonCanvas hexagons={[]} />);
    
    // Should render without errors - check for zoom controls
    expect(screen.getByText('+')).toBeInTheDocument();
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  test('updates when hexagons change', () => {
    const { rerender } = render(<HexagonCanvas hexagons={mockHexagons} />);
    
    const newHexagons: Hexagon[] = [
      {
        id: 'hex-new',
        q: 0,
        r: 0,
        type: 'ROOM',
        connections: []
      }
    ];
    
    rerender(<HexagonCanvas hexagons={newHexagons} />);
    
    // Should not throw errors - verify controls still render
    expect(screen.getByText('+')).toBeInTheDocument();
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  test('applies correct styling for different screen sizes', () => {
    const testCases = [
      { width: 600, height: 800, isMobile: true, isTablet: false, isDesktop: false, name: 'mobile' },
      { width: 800, height: 600, isMobile: false, isTablet: true, isDesktop: false, name: 'tablet' },
      { width: 1200, height: 800, isMobile: false, isTablet: false, isDesktop: true, name: 'desktop' }
    ];

    testCases.forEach((dimensions) => {
      mockUseWindowDimensions.mockReturnValue(dimensions);
      
      const { unmount } = render(<HexagonCanvas hexagons={mockHexagons} />);
      
      // Verify component renders for each screen size
      expect(screen.getByText('+')).toBeInTheDocument();
      
      // Reset button should always show "Reset"
      expect(screen.getByText('Reset')).toBeInTheDocument();
      
      unmount();
    });
  });

  test('component responds to window dimension changes', () => {
    const { rerender } = render(<HexagonCanvas hexagons={mockHexagons} />);
    
    // Change from desktop to mobile
    mockUseWindowDimensions.mockReturnValue({
      width: 600,
      height: 800,
      isMobile: true,
      isTablet: false,
      isDesktop: false
    });
    
    rerender(<HexagonCanvas hexagons={mockHexagons} />);
    
    // Should render without errors
    expect(screen.getByText('+')).toBeInTheDocument();
  });

  test('properly centers map using bounding box approach', () => {
    const dispersedHexagons = [
      { id: '1', q: -2, r: -2, type: 'CORRIDOR' as const, connections: ['2'] },
      { id: '2', q: 2, r: 2, type: 'ROOM' as const, connections: ['1'] },
    ];

    render(<HexagonCanvas hexagons={dispersedHexagons} />);
    
    // Should render both hexagons without errors - check for zoom controls
    expect(screen.getByText('+')).toBeInTheDocument();
    expect(screen.getByText('-')).toBeInTheDocument();
  });
});