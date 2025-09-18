import { MapResponse, MapGenerationRequest } from '../types/map';

const API_ENDPOINTS = {
  dev: 'https://kxt2knsej3.execute-api.us-west-1.amazonaws.com/dev',
  prod: 'https://3901ff1oz1.execute-api.us-west-1.amazonaws.com/prod'
} as const;

const API_KEYS = {
  dev: undefined, // No API key required for dev
  prod: process.env.REACT_APP_API_KEY // API key from environment variable
} as const;

type Environment = keyof typeof API_ENDPOINTS;

const environment = (process.env.REACT_APP_ENVIRONMENT as Environment) || 'dev';
const API_BASE_URL = API_ENDPOINTS[environment];
const API_KEY = API_KEYS[environment];

export class MapAPI {
  private static readonly ENDPOINT = `${API_BASE_URL}/api/v1/map/generate`;

  static async generateMap(request: MapGenerationRequest): Promise<MapResponse> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add API key for environments that require it
      if (API_KEY) {
        headers['x-api-key'] = API_KEY;
      }

      const response = await fetch(this.ENDPOINT, {
        method: 'POST',
        headers,
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to generate map:', error);
      throw error;
    }
  }
}