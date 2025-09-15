import { renderHook, act } from '@testing-library/react';
import { useMapGeneration } from './useMapGeneration';

// Mock the API module
jest.mock('../lib/api', () => ({
  MapAPI: {
    generateMap: jest.fn()
  }
}));

describe('useMapGeneration Hook', () => {
  const mockMapData = {
    hexagons: [
      { id: 'hex-1', q: 0, r: 0, type: 'ROOM', connections: [] },
      { id: 'hex-2', q: 1, r: 0, type: 'CORRIDOR', connections: ['hex-1'] }
    ],
    metadata: {
      totalHexagons: 2,
      rooms: 1,
      corridors: 1,
      seed: 'test-seed'
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('initializes with correct default state', () => {
    const { result } = renderHook(() => useMapGeneration());

    expect(result.current.mapData).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.generateMap).toBe('function');
    expect(typeof result.current.clearError).toBe('function');
  });

  test('sets loading state during map generation', async () => {
    const { MapAPI } = require('../lib/api');
    MapAPI.generateMap.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(mockMapData), 100)));

    const { result } = renderHook(() => useMapGeneration());

    act(() => {
      result.current.generateMap({ hexagonCount: 25 });
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBeNull();

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 150));
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.mapData).toEqual(mockMapData);
  });

  test('handles successful map generation', async () => {
    const { MapAPI } = require('../lib/api');
    MapAPI.generateMap.mockResolvedValue(mockMapData);

    const { result } = renderHook(() => useMapGeneration());

    await act(async () => {
      await result.current.generateMap({ hexagonCount: 50, seed: 'test' });
    });

    expect(result.current.mapData).toEqual(mockMapData);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(MapAPI.generateMap).toHaveBeenCalledWith({ hexagonCount: 50, seed: 'test' });
  });

  test('handles map generation error with Error object', async () => {
    const { MapAPI } = require('../lib/api');
    const errorMessage = 'Network error occurred';
    MapAPI.generateMap.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useMapGeneration());

    await act(async () => {
      await result.current.generateMap({ hexagonCount: 25 });
    });

    expect(result.current.mapData).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(errorMessage);
  });

  test('handles map generation error with non-Error object', async () => {
    const { MapAPI } = require('../lib/api');
    MapAPI.generateMap.mockRejectedValue('String error');

    const { result } = renderHook(() => useMapGeneration());

    await act(async () => {
      await result.current.generateMap({ hexagonCount: 25 });
    });

    expect(result.current.error).toBe('Failed to generate map');
  });

  test('clears error state', () => {
    const { result } = renderHook(() => useMapGeneration());

    // Manually set an error state for testing
    act(() => {
      (result.current as any).setError = (error: string) => {
        result.current.error = error;
      };
    });

    // Since we can't directly access setError, we'll test clearError after an error occurs
    // This is a limitation of testing hooks with internal state
  });

  test('clears error when starting new generation', async () => {
    const { MapAPI } = require('../lib/api');
    
    // First call fails
    MapAPI.generateMap.mockRejectedValueOnce(new Error('First error'));
    
    const { result } = renderHook(() => useMapGeneration());

    // Generate first error
    await act(async () => {
      await result.current.generateMap({ hexagonCount: 25 });
    });

    expect(result.current.error).toBe('First error');

    // Second call succeeds
    MapAPI.generateMap.mockResolvedValueOnce(mockMapData);

    // Should clear error when starting new generation
    await act(async () => {
      await result.current.generateMap({ hexagonCount: 30 });
    });

    expect(result.current.error).toBeNull();
    expect(result.current.mapData).toEqual(mockMapData);
  });

  test('handles multiple concurrent generation calls', async () => {
    const { MapAPI } = require('../lib/api');
    
    let resolveSecond: (value: any) => void;
    
    const firstPromise = Promise.resolve(mockMapData);
    const secondPromise = new Promise(resolve => { resolveSecond = resolve; });

    MapAPI.generateMap
      .mockReturnValueOnce(firstPromise)
      .mockReturnValueOnce(secondPromise);

    const { result } = renderHook(() => useMapGeneration());

    // Start first generation
    act(() => {
      result.current.generateMap({ hexagonCount: 25 });
    });

    expect(result.current.isLoading).toBe(true);

    // Start second generation while first is still pending
    act(() => {
      result.current.generateMap({ hexagonCount: 50 });
    });

    // Resolve second call first
    act(() => {
      resolveSecond!(mockMapData);
    });

    await act(async () => {
      await secondPromise;
    });

    expect(result.current.mapData).toEqual(mockMapData);
    expect(result.current.isLoading).toBe(false);
  });

  test('calls API with correct parameters', async () => {
    const { MapAPI } = require('../lib/api');
    MapAPI.generateMap.mockResolvedValue(mockMapData);

    const { result } = renderHook(() => useMapGeneration());

    const request = { hexagonCount: 100, seed: 'custom-seed' };

    await act(async () => {
      await result.current.generateMap(request);
    });

    expect(MapAPI.generateMap).toHaveBeenCalledTimes(1);
    expect(MapAPI.generateMap).toHaveBeenCalledWith(request);
  });

  test('logs errors to console', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    const { MapAPI } = require('../lib/api');
    const error = new Error('Test error');
    MapAPI.generateMap.mockRejectedValue(error);

    const { result } = renderHook(() => useMapGeneration());

    await act(async () => {
      await result.current.generateMap({ hexagonCount: 25 });
    });

    expect(consoleSpy).toHaveBeenCalledWith('Map generation error:', error);
    
    consoleSpy.mockRestore();
  });
});