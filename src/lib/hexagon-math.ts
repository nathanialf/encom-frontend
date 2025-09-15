import { HexagonPosition } from '../types/map';

export interface Point {
  x: number;
  y: number;
}

export class HexagonMath {
  private static readonly SQRT3 = Math.sqrt(3);

  static axialToPixel(q: number, r: number, size: number): Point {
    const x = size * (3/2 * q);
    const y = size * (this.SQRT3/2 * q + this.SQRT3 * r);
    return { x, y };
  }

  static getHexagonVertices(center: Point, size: number): Point[] {
    const vertices: Point[] = [];
    for (let i = 0; i < 6; i++) {
      const angle = (2 * Math.PI * i) / 6;
      vertices.push({
        x: center.x + size * Math.cos(angle),
        y: center.y + size * Math.sin(angle)
      });
    }
    return vertices;
  }

  static getBoundingBox(positions: HexagonPosition[]): { minQ: number, maxQ: number, minR: number, maxR: number } {
    if (positions.length === 0) {
      return { minQ: 0, maxQ: 0, minR: 0, maxR: 0 };
    }

    let minQ = positions[0].q;
    let maxQ = positions[0].q;
    let minR = positions[0].r;
    let maxR = positions[0].r;

    for (const pos of positions) {
      minQ = Math.min(minQ, pos.q);
      maxQ = Math.max(maxQ, pos.q);
      minR = Math.min(minR, pos.r);
      maxR = Math.max(maxR, pos.r);
    }

    return { minQ, maxQ, minR, maxR };
  }

  static calculateCanvasSize(positions: HexagonPosition[], hexSize: number, padding: number = 50): { width: number, height: number } {
    if (positions.length === 0) {
      return { width: 400, height: 400 };
    }

    const pixels = positions.map(pos => this.axialToPixel(pos.q, pos.r, hexSize));
    
    let minX = pixels[0].x;
    let maxX = pixels[0].x;
    let minY = pixels[0].y;
    let maxY = pixels[0].y;

    for (const pixel of pixels) {
      minX = Math.min(minX, pixel.x);
      maxX = Math.max(maxX, pixel.x);
      minY = Math.min(minY, pixel.y);
      maxY = Math.max(maxY, pixel.y);
    }

    const width = Math.ceil(maxX - minX + 2 * hexSize + 2 * padding);
    const height = Math.ceil(maxY - minY + 2 * hexSize + 2 * padding);

    return { width, height };
  }

  static calculateOffset(positions: HexagonPosition[], hexSize: number, padding: number = 50): Point {
    if (positions.length === 0) {
      return { x: 0, y: 0 };
    }

    const pixels = positions.map(pos => this.axialToPixel(pos.q, pos.r, hexSize));
    
    let minX = pixels[0].x;
    let minY = pixels[0].y;

    for (const pixel of pixels) {
      minX = Math.min(minX, pixel.x);
      minY = Math.min(minY, pixel.y);
    }

    return {
      x: -minX + hexSize + padding,
      y: -minY + hexSize + padding
    };
  }
}