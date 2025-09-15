import { HexagonMath } from './hexagon-math';

describe('HexagonMath', () => {
  describe('axialToPixel', () => {
    test('converts origin hexagon coordinates correctly', () => {
      const result = HexagonMath.axialToPixel(0, 0, 30);
      expect(result.x).toBeCloseTo(0, 2);
      expect(result.y).toBeCloseTo(0, 2);
    });

    test('converts positive q coordinate', () => {
      const result = HexagonMath.axialToPixel(1, 0, 30);
      expect(result.x).toBeCloseTo(45, 2); // 3/2 * 30
      expect(result.y).toBeCloseTo(25.98, 1); // sqrt(3)/2 * 30
    });

    test('converts positive r coordinate', () => {
      const result = HexagonMath.axialToPixel(0, 1, 30);
      expect(result.x).toBeCloseTo(0, 2); // 3/2 * 0
      expect(result.y).toBeCloseTo(51.96, 1); // sqrt(3) * 30
    });

    test('converts negative coordinates', () => {
      const result = HexagonMath.axialToPixel(-1, -1, 30);
      expect(result.x).toBeCloseTo(-45, 2); // 3/2 * -30
      expect(result.y).toBeCloseTo(-77.94, 1); // sqrt(3)/2 * -30 + sqrt(3) * -30
    });

    test('scales with different hex sizes', () => {
      const result1 = HexagonMath.axialToPixel(1, 0, 10);
      const result2 = HexagonMath.axialToPixel(1, 0, 20);
      
      expect(result2.x).toBeCloseTo(result1.x * 2, 2);
      expect(result2.y).toBeCloseTo(result1.y * 2, 2);
    });

    test('handles zero hex size', () => {
      const result = HexagonMath.axialToPixel(1, 1, 0);
      expect(result.x).toBe(0);
      expect(result.y).toBe(0);
    });
  });

  describe('getHexagonVertices', () => {
    test('returns 6 vertices for a hexagon', () => {
      const center = { x: 0, y: 0 };
      const vertices = HexagonMath.getHexagonVertices(center, 30);
      expect(vertices).toHaveLength(6);
    });

    test('vertices are equidistant from center', () => {
      const center = { x: 100, y: 100 };
      const size = 30;
      const vertices = HexagonMath.getHexagonVertices(center, size);
      
      vertices.forEach(vertex => {
        const distance = Math.sqrt(
          Math.pow(vertex.x - center.x, 2) + Math.pow(vertex.y - center.y, 2)
        );
        expect(distance).toBeCloseTo(size, 1);
      });
    });

    test('first vertex is at correct angle (0 degrees)', () => {
      const center = { x: 0, y: 0 };
      const size = 30;
      const vertices = HexagonMath.getHexagonVertices(center, size);
      
      // First vertex should be at 0 degrees (0 radians)
      const expectedX = size * Math.cos(0);
      const expectedY = size * Math.sin(0);
      
      expect(vertices[0].x).toBeCloseTo(expectedX, 2);
      expect(vertices[0].y).toBeCloseTo(expectedY, 2);
    });

    test('vertices form a regular hexagon', () => {
      const center = { x: 0, y: 0 };
      const vertices = HexagonMath.getHexagonVertices(center, 30);
      
      // Check that angles between consecutive vertices are 60 degrees
      for (let i = 0; i < 6; i++) {
        const current = vertices[i];
        const next = vertices[(i + 1) % 6];
        
        const angle1 = Math.atan2(current.y, current.x);
        const angle2 = Math.atan2(next.y, next.x);
        
        let angleDiff = angle2 - angle1;
        if (angleDiff < 0) angleDiff += 2 * Math.PI;
        if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;
        
        expect(Math.abs(angleDiff - Math.PI / 3)).toBeLessThan(0.1); // 60 degrees ± tolerance
      }
    });

    test('scales vertices with size parameter', () => {
      const center = { x: 0, y: 0 };
      const vertices1 = HexagonMath.getHexagonVertices(center, 10);
      const vertices2 = HexagonMath.getHexagonVertices(center, 20);
      
      for (let i = 0; i < 6; i++) {
        expect(vertices2[i].x).toBeCloseTo(vertices1[i].x * 2, 2);
        expect(vertices2[i].y).toBeCloseTo(vertices1[i].y * 2, 2);
      }
    });

    test('translates vertices with center offset', () => {
      const center1 = { x: 0, y: 0 };
      const center2 = { x: 50, y: 100 };
      
      const vertices1 = HexagonMath.getHexagonVertices(center1, 30);
      const vertices2 = HexagonMath.getHexagonVertices(center2, 30);
      
      for (let i = 0; i < 6; i++) {
        expect(vertices2[i].x).toBeCloseTo(vertices1[i].x + 50, 2);
        expect(vertices2[i].y).toBeCloseTo(vertices1[i].y + 100, 2);
      }
    });
  });

  describe('calculateCanvasSize', () => {
    test('calculates size for single hexagon at origin', () => {
      const positions = [{ q: 0, r: 0 }];
      const size = HexagonMath.calculateCanvasSize(positions, 30);
      
      expect(size.width).toBeGreaterThan(60); // At least 2 * hexSize
      expect(size.height).toBeGreaterThan(60);
    });

    test('calculates size for multiple hexagons', () => {
      const positions = [
        { q: 0, r: 0 },
        { q: 1, r: 0 },
        { q: 0, r: 1 },
        { q: -1, r: 0 },
        { q: 0, r: -1 }
      ];
      const size = HexagonMath.calculateCanvasSize(positions, 30);
      
      expect(size.width).toBeGreaterThan(120); // Should accommodate spread
      expect(size.height).toBeGreaterThan(120);
    });

    test('handles empty positions array', () => {
      const positions: { q: number; r: number }[] = [];
      const size = HexagonMath.calculateCanvasSize(positions, 30);
      
      expect(size.width).toBeGreaterThan(0);
      expect(size.height).toBeGreaterThan(0);
    });

    test('handles negative coordinates', () => {
      const positions = [
        { q: -2, r: -2 },
        { q: 2, r: 2 }
      ];
      const size = HexagonMath.calculateCanvasSize(positions, 30);
      
      expect(size.width).toBeGreaterThan(0);
      expect(size.height).toBeGreaterThan(0);
    });

    test('scales with hex size parameter', () => {
      const positions = [{ q: 1, r: 1 }];
      const size1 = HexagonMath.calculateCanvasSize(positions, 10);
      const size2 = HexagonMath.calculateCanvasSize(positions, 20);
      
      expect(size2.width).toBeGreaterThan(size1.width);
      expect(size2.height).toBeGreaterThan(size1.height);
    });
  });

  describe('calculateOffset', () => {
    test('calculates offset for single hexagon', () => {
      const positions = [{ q: 0, r: 0 }];
      const offset = HexagonMath.calculateOffset(positions, 30);
      
      expect(offset.x).toBeGreaterThan(0);
      expect(offset.y).toBeGreaterThan(0);
    });

    test('calculates offset for multiple hexagons', () => {
      const positions = [
        { q: -1, r: -1 },
        { q: 1, r: 1 }
      ];
      const offset = HexagonMath.calculateOffset(positions, 30);
      
      expect(offset.x).toBeGreaterThan(0);
      expect(offset.y).toBeGreaterThan(0);
    });

    test('handles empty positions array', () => {
      const positions: { q: number; r: number }[] = [];
      const offset = HexagonMath.calculateOffset(positions, 30);
      
      expect(offset.x).toBe(0); // Returns {x: 0, y: 0} for empty array
      expect(offset.y).toBe(0);
    });

    test('provides consistent offset for same positions', () => {
      const positions = [{ q: 5, r: 3 }, { q: -2, r: 1 }];
      const offset1 = HexagonMath.calculateOffset(positions, 30);
      const offset2 = HexagonMath.calculateOffset(positions, 30);
      
      expect(offset1.x).toBe(offset2.x);
      expect(offset1.y).toBe(offset2.y);
    });

    test('offset ensures no negative coordinates after conversion', () => {
      const positions = [{ q: -10, r: -10 }];
      const offset = HexagonMath.calculateOffset(positions, 30);
      
      const pixelCoord = HexagonMath.axialToPixel(-10, -10, 30);
      const adjustedX = pixelCoord.x + offset.x;
      const adjustedY = pixelCoord.y + offset.y;
      
      expect(adjustedX).toBeGreaterThanOrEqual(30); // At least padding
      expect(adjustedY).toBeGreaterThanOrEqual(30);
    });

    test('scales offset with hex size', () => {
      const positions = [{ q: 1, r: 1 }];
      const offset1 = HexagonMath.calculateOffset(positions, 10);
      const offset2 = HexagonMath.calculateOffset(positions, 20);
      
      // Both offsets should be positive for same relative positions
      expect(offset1.x).toBeGreaterThan(0);
      expect(offset1.y).toBeGreaterThan(0);
      expect(offset2.x).toBeGreaterThan(0);
      expect(offset2.y).toBeGreaterThan(0);
    });
  });

  describe('integration tests', () => {
    test('axialToPixel and calculateOffset work together correctly', () => {
      const positions = [
        { q: 0, r: 0 },
        { q: 1, r: 0 },
        { q: 0, r: 1 }
      ];
      
      const hexSize = 30;
      const offset = HexagonMath.calculateOffset(positions, hexSize);
      
      // All converted coordinates should be positive after applying offset
      positions.forEach(pos => {
        const pixel = HexagonMath.axialToPixel(pos.q, pos.r, hexSize);
        expect(pixel.x + offset.x).toBeGreaterThan(0);
        expect(pixel.y + offset.y).toBeGreaterThan(0);
      });
    });

    test('calculateCanvasSize accommodates all hexagons with vertices', () => {
      const positions = [
        { q: 0, r: 0 },
        { q: 2, r: 0 },
        { q: 0, r: 2 }
      ];
      
      const hexSize = 30;
      const canvasSize = HexagonMath.calculateCanvasSize(positions, hexSize);
      const offset = HexagonMath.calculateOffset(positions, hexSize);
      
      // Check that all hexagon vertices fit within canvas
      positions.forEach(pos => {
        const center = HexagonMath.axialToPixel(pos.q, pos.r, hexSize);
        center.x += offset.x;
        center.y += offset.y;
        
        const vertices = HexagonMath.getHexagonVertices(center, hexSize);
        
        vertices.forEach(vertex => {
          expect(vertex.x).toBeGreaterThanOrEqual(0);
          expect(vertex.y).toBeGreaterThanOrEqual(0);
          expect(vertex.x).toBeLessThanOrEqual(canvasSize.width);
          expect(vertex.y).toBeLessThanOrEqual(canvasSize.height);
        });
      });
    });
  });
});