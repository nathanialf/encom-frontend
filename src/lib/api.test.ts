import { MapAPI } from './api';

// Mock fetch globally
global.fetch = jest.fn();

describe('MapAPI', () => {
  const mockMapResponse = {
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
    // Reset environment variable
    delete process.env.REACT_APP_ENVIRONMENT;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('generateMap', () => {
    test('makes POST request to correct endpoint for dev environment', async () => {
      process.env.REACT_APP_ENVIRONMENT = 'dev';
      
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockMapResponse)
      });

      const request = { hexagonCount: 25, seed: 'test' };
      const result = await MapAPI.generateMap(request);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://encom-api-dev.riperoni.com/api/v1/map/generate',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        }
      );

      expect(result).toEqual(mockMapResponse);
    });

    test('uses dev endpoint by default when environment not set', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockMapResponse)
      });

      const request = { hexagonCount: 50 };
      await MapAPI.generateMap(request);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('encom-api-dev.riperoni.com'),
        expect.any(Object)
      );
    });

    test('uses prod endpoint when environment is prod', async () => {
      // Mock the API module to force reload with new environment
      jest.resetModules();
      process.env.REACT_APP_ENVIRONMENT = 'prod';
      
      const { MapAPI: ProdMapAPI } = require('./api');
      
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockMapResponse)
      });

      const request = { hexagonCount: 100 };
      await ProdMapAPI.generateMap(request);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://encom-api.riperoni.com/api/v1/map/generate',
        expect.any(Object)
      );
    });

    test('sends correct request body', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockMapResponse)
      });

      const request = { hexagonCount: 75, seed: 'custom-seed' };
      await MapAPI.generateMap(request);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        })
      );
    });

    test('handles successful response', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockMapResponse)
      });

      const request = { hexagonCount: 25 };
      const result = await MapAPI.generateMap(request);

      expect(result).toEqual(mockMapResponse);
    });

    test('throws error for HTTP error status', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400
      });

      const request = { hexagonCount: 25 };

      await expect(MapAPI.generateMap(request)).rejects.toThrow('HTTP error! status: 400');
    });

    test('handles network error', async () => {
      const networkError = new Error('Network error');
      (global.fetch as jest.Mock).mockRejectedValue(networkError);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const request = { hexagonCount: 25 };

      await expect(MapAPI.generateMap(request)).rejects.toThrow('Network error');
      expect(consoleSpy).toHaveBeenCalledWith('Failed to generate map:', networkError);

      consoleSpy.mockRestore();
    });

    test('handles JSON parsing error', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON'))
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const request = { hexagonCount: 25 };

      await expect(MapAPI.generateMap(request)).rejects.toThrow('Invalid JSON');
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    test('handles server error status codes', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500
      });

      const request = { hexagonCount: 25 };

      await expect(MapAPI.generateMap(request)).rejects.toThrow('HTTP error! status: 500');
    });

    test('handles timeout scenarios', async () => {
      const timeoutError = new Error('Request timeout');
      (global.fetch as jest.Mock).mockRejectedValue(timeoutError);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const request = { hexagonCount: 25 };

      await expect(MapAPI.generateMap(request)).rejects.toThrow('Request timeout');

      consoleSpy.mockRestore();
    });

    test('handles request without seed parameter', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockMapResponse)
      });

      const request = { hexagonCount: 50 };
      await MapAPI.generateMap(request);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({ hexagonCount: 50 }),
        })
      );
    });

    test('sets correct Content-Type header', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockMapResponse)
      });

      const request = { hexagonCount: 25 };
      await MapAPI.generateMap(request);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    test('handles empty response', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(null)
      });

      const request = { hexagonCount: 25 };
      const result = await MapAPI.generateMap(request);

      expect(result).toBeNull();
    });
  });
});