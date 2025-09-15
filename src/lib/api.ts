import { MapResponse, MapGenerationRequest } from '../types/map';

const API_ENDPOINTS = {
  dev: 'https://kxt2knsej3.execute-api.us-west-1.amazonaws.com/dev',
  prod: 'https://encom.riperoni.com'
} as const;

type Environment = keyof typeof API_ENDPOINTS;

const environment = (process.env.REACT_APP_ENVIRONMENT as Environment) || 'dev';
const API_BASE_URL = API_ENDPOINTS[environment];

export class MapAPI {
  private static readonly ENDPOINT = `${API_BASE_URL}/api/v1/map/generate`;

  static async generateMap(request: MapGenerationRequest): Promise<MapResponse> {
    try {
      const response = await fetch(this.ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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