import { useState, useCallback } from 'react';
import { MapResponse, MapGenerationRequest } from '../types/map';
import { MapAPI } from '../lib/api';

interface UseMapGenerationResult {
  mapData: MapResponse | null;
  isLoading: boolean;
  error: string | null;
  generateMap: (request: MapGenerationRequest) => Promise<void>;
  clearError: () => void;
}

export const useMapGeneration = (): UseMapGenerationResult => {
  const [mapData, setMapData] = useState<MapResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateMap = useCallback(async (request: MapGenerationRequest) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await MapAPI.generateMap(request);
      setMapData(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate map';
      setError(errorMessage);
      console.error('Map generation error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    mapData,
    isLoading,
    error,
    generateMap,
    clearError
  };
};