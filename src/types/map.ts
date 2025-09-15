export interface HexagonPosition {
  q: number;
  r: number;
}

export interface Hexagon {
  id: string;
  q: number;
  r: number;
  connections: string[];
  type: 'CORRIDOR' | 'ROOM';
}

export interface MapStatistics {
  actualHexagons: number;
  corridorHexagons: number;
  roomHexagons: number;
  averageConnections: number;
  maxConnections: number;
  longestPath: number;
  boundingBox: {
    minQ: number;
    maxQ: number;
    minR: number;
    maxR: number;
  };
}

export interface MapMetadata {
  seed: string;
  hexagonCount: number;
  generatedAt: string;
  version: string;
  cached: boolean;
  generationTime: number;
  statistics: MapStatistics;
}

export interface MapResponse {
  metadata: MapMetadata;
  hexagons: Hexagon[];
}

export interface MapGenerationRequest {
  hexagonCount: number;
  seed?: string;
}