import { describe, it, expect } from 'vitest';
import { PropertyInferenceEngine } from './inference-engine';

describe('PropertyInferenceEngine', () => {
  const engine = new PropertyInferenceEngine();

  describe('analyzeProperty', () => {
    it('should infer room sizes when total square footage is provided', async () => {
      const data = {
        totalSquareFootage: 2000,
        rooms: {
          'living-room': { type: 'living' as const },
          'kitchen': { type: 'kitchen' as const },
          'bedroom-1': { type: 'bedroom' as const, squareFootage: 150 },
          'bathroom-1': { type: 'bathroom' as const }
        }
      };

      const results = await engine.analyzeProperty(data);
      
      const livingRoomSize = results.find(r => r.field === 'rooms.living-room.squareFootage');
      const kitchenSize = results.find(r => r.field === 'rooms.kitchen.squareFootage');
      const bathroomSize = results.find(r => r.field === 'rooms.bathroom-1.squareFootage');

      expect(livingRoomSize).toBeDefined();
      expect(kitchenSize).toBeDefined();
      expect(bathroomSize).toBeDefined();
      expect(livingRoomSize?.confidence).toBeGreaterThan(0.7);
    });

    it('should infer property value when square footage and zip code are provided', async () => {
      const data = {
        totalSquareFootage: 1500,
        zipCode: '90210',
        propertyType: 'single-family' as const,
        yearBuilt: 2020
      };

      const results = await engine.analyzeProperty(data);
      
      const marketValue = results.find(r => r.field === 'marketValue');
      expect(marketValue).toBeDefined();
      expect(marketValue?.value).toBeGreaterThan(1000000); // 90210 is expensive
      expect(marketValue?.confidence).toBeGreaterThan(0.6);
    });

    it('should infer bedroom count based on square footage', async () => {
      const data = {
        totalSquareFootage: 1200
      };

      const results = await engine.analyzeProperty(data);
      
      const bedrooms = results.find(r => r.field === 'bedrooms');
      expect(bedrooms).toBeDefined();
      expect(bedrooms?.value).toBeGreaterThanOrEqual(3);
      expect(bedrooms?.confidence).toBeGreaterThan(0.5);
    });

    it('should infer bathroom count based on bedrooms', async () => {
      const data = {
        bedrooms: 3
      };

      const results = await engine.analyzeProperty(data);
      
      const bathrooms = results.find(r => r.field === 'bathrooms');
      expect(bathrooms).toBeDefined();
      expect(bathrooms?.value).toBeGreaterThanOrEqual(2);
      expect(bathrooms?.confidence).toBeGreaterThan(0.6);
    });

    it('should infer rental value based on square footage and bedrooms', async () => {
      const data = {
        totalSquareFootage: 1000,
        bedrooms: 2,
        zipCode: '10001'
      };

      const results = await engine.analyzeProperty(data);
      
      const monthlyRent = results.find(r => r.field === 'monthlyRent');
      expect(monthlyRent).toBeDefined();
      expect(monthlyRent?.value).toBeGreaterThan(2000);
      expect(monthlyRent?.confidence).toBeGreaterThan(0.6);
    });

    it('should handle empty data gracefully', async () => {
      const data = {};
      const results = await engine.analyzeProperty(data);
      expect(results).toBeInstanceOf(Array);
      expect(results.length).toBeGreaterThanOrEqual(0);
    });

    it('should handle partial data', async () => {
      const data = {
        totalSquareFootage: 800,
        zipCode: '60601'
      };

      const results = await engine.analyzeProperty(data);
      
      const bedrooms = results.find(r => r.field === 'bedrooms');
      const marketValue = results.find(r => r.field === 'marketValue');
      
      expect(bedrooms).toBeDefined();
      expect(marketValue).toBeDefined();
    });

    it('should apply age-based adjustments correctly', async () => {
      const data = {
        totalSquareFootage: 2000,
        zipCode: '90210',
        yearBuilt: 1990
      };

      const results = await engine.analyzeProperty(data);
      
      const marketValue = results.find(r => r.field === 'marketValue');
      expect(marketValue).toBeDefined();
      expect(marketValue?.reasoning).toContain('age');
    });

    it('should apply property type multipliers', async () => {
      const data = {
        totalSquareFootage: 1500,
        zipCode: '10001',
        propertyType: 'condo' as const
      };

      const results = await engine.analyzeProperty(data);
      
      const marketValue = results.find(r => r.field === 'marketValue');
      expect(marketValue).toBeDefined();
      expect(marketValue?.reasoning).toContain('condo');
    });
  });

  describe('getRegionalPricePerSqFt', () => {
    it('should return correct prices for known zip codes', () => {
      const engine = new PropertyInferenceEngine();
      
      expect((engine as any).getRegionalPricePerSqFt('90210')).toBe(800);
      expect((engine as any).getRegionalPricePerSqFt('10001')).toBe(600);
      expect((engine as any).getRegionalPricePerSqFt('60601')).toBe(300);
    });

    it('should return default for unknown zip codes', () => {
      const engine = new PropertyInferenceEngine();
      
      expect((engine as any).getRegionalPricePerSqFt('99999')).toBe(200);
    });
  });

  describe('calculateAgeAdjustment', () => {
    it('should apply premium for new construction', () => {
      const engine = new PropertyInferenceEngine();
      const currentYear = new Date().getFullYear();
      
      expect((engine as any).calculateAgeAdjustment(currentYear - 2)).toBe(1.1);
    });

    it('should apply discount for older properties', () => {
      const engine = new PropertyInferenceEngine();
      
      expect((engine as any).calculateAgeAdjustment(1970)).toBe(0.8);
    });

    it('should return 1.0 for no year built', () => {
      const engine = new PropertyInferenceEngine();
      
      expect((engine as any).calculateAgeAdjustment(undefined)).toBe(1.0);
    });
  });
});
