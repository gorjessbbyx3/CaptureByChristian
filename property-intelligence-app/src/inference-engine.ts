// Property Intelligence Inference Engine
// Deduces unknown property information from known data

export interface PropertyData {
  // Basic Info
  address?: string;
  totalSquareFootage?: number;
  lotSize?: number;
  yearBuilt?: number;
  propertyType?: 'single-family' | 'condo' | 'townhouse' | 'multi-family';
  
  // Rooms
  bedrooms?: number;
  bathrooms?: number;
  rooms?: {
    [roomName: string]: {
      squareFootage?: number;
      dimensions?: { length: number; width: number };
      type: 'bedroom' | 'bathroom' | 'kitchen' | 'living' | 'dining' | 'office' | 'other';
    };
  };
  
  // Financial
  purchasePrice?: number;
  marketValue?: number;
  taxAssessedValue?: number;
  monthlyRent?: number;
  
  // Features
  garage?: boolean;
  basement?: boolean;
  attic?: boolean;
  pool?: boolean;
  
  // Location
  zipCode?: string;
  neighborhood?: string;
  schoolDistrict?: string;
}

export interface InferenceResult {
  field: string;
  value: any;
  confidence: number; // 0-1
  reasoning: string;
  sources: string[];
}

export class PropertyInferenceEngine {
  private standardRoomSizes = {
    'master-bedroom': { min: 200, max: 400, typical: 300 },
    'bedroom': { min: 100, max: 200, typical: 150 },
    'bathroom': { min: 35, max: 80, typical: 50 },
    'kitchen': { min: 100, max: 300, typical: 180 },
    'living': { min: 200, max: 500, typical: 350 },
    'dining': { min: 100, max: 200, typical: 140 },
  };

  private propertyTypeMultipliers = {
    'single-family': 1.0,
    'condo': 0.85,
    'townhouse': 0.9,
    'multi-family': 1.2,
  };

  async analyzeProperty(knownData: PropertyData): Promise<InferenceResult[]> {
    const results: InferenceResult[] = [];
    
    // Infer missing room sizes
    results.push(...this.inferRoomSizes(knownData));
    
    // Infer property value
    results.push(...this.inferPropertyValue(knownData));
    
    // Infer missing room count
    results.push(...this.inferRoomCounts(knownData));
    
    // Infer rental potential
    results.push(...this.inferRentalValue(knownData));
    
    return results;
  }

  private inferRoomSizes(data: PropertyData): InferenceResult[] {
    const results: InferenceResult[] = [];
    
    if (!data.totalSquareFootage || !data.rooms) {
      return results;
    }

    // Calculate known room total
    const knownRoomTotal = Object.values(data.rooms)
      .reduce((sum, room) => sum + (room.squareFootage || 0), 0);
    
    const remainingSquareFootage = data.totalSquareFootage - knownRoomTotal;
    const unknownRooms = Object.entries(data.rooms)
      .filter(([_, room]) => !room.squareFootage);

    if (unknownRooms.length > 0 && remainingSquareFootage > 0) {
      // Distribute remaining space based on room type standards
      const totalTypicalSize = unknownRooms.reduce((sum, [_, room]) => {
        const typical = this.getTypicalRoomSize(room.type);
        return sum + typical;
      }, 0);

      unknownRooms.forEach(([roomName, room]) => {
        const typicalSize = this.getTypicalRoomSize(room.type);
        const proportionalSize = (typicalSize / totalTypicalSize) * remainingSquareFootage;
        
        results.push({
          field: `rooms.${roomName}.squareFootage`,
          value: Math.round(proportionalSize),
          confidence: 0.75,
          reasoning: `Calculated based on remaining square footage (${remainingSquareFootage} sq ft) distributed proportionally among unknown rooms according to typical ${room.type} size standards.`,
          sources: ['room-size-standards', 'proportional-calculation']
        });
      });
    }

    return results;
  }

  private inferPropertyValue(data: PropertyData): InferenceResult[] {
    const results: InferenceResult[] = [];
    
    if (data.marketValue || !data.totalSquareFootage) {
      return results;
    }

    // Use regional price per square foot
    const avgPricePerSqFt = this.getRegionalPricePerSqFt(data.zipCode || '');
    const baseValue = data.totalSquareFootage * avgPricePerSqFt;
    
    // Apply property type multiplier
    const multiplier = data.propertyType ? this.propertyTypeMultipliers[data.propertyType] : 1.0;
    const adjustedValue = baseValue * multiplier;
    
    // Apply age adjustment
    const ageAdjustment = this.calculateAgeAdjustment(data.yearBuilt);
    const finalValue = adjustedValue * ageAdjustment;
    
    results.push({
      field: 'marketValue',
      value: Math.round(finalValue),
      confidence: 0.65,
      reasoning: `Estimated based on ${data.totalSquareFootage} sq ft at $${avgPricePerSqFt}/sq ft, adjusted for property type (${data.propertyType || 'unknown'}) and age.`,
      sources: ['regional-pricing', 'property-type-adjustment', 'age-adjustment']
    });

    return results;
  }

  private inferRoomCounts(data: PropertyData): InferenceResult[] {
    const results: InferenceResult[] = [];
    
    // Infer bedrooms if missing
    if (!data.bedrooms && data.totalSquareFootage) {
      const estimatedBedrooms = Math.max(1, Math.floor(data.totalSquareFootage / 400));
      results.push({
        field: 'bedrooms',
        value: estimatedBedrooms,
        confidence: 0.6,
        reasoning: `Estimated based on total square footage (${data.totalSquareFootage} sq ft) assuming approximately 400 sq ft per bedroom.`,
        sources: ['size-based-estimation']
      });
    }

    // Infer bathrooms if missing
    if (!data.bathrooms && data.bedrooms) {
      const estimatedBathrooms = Math.max(1, Math.ceil(data.bedrooms / 2));
      results.push({
        field: 'bathrooms',
        value: estimatedBathrooms,
        confidence: 0.7,
        reasoning: `Estimated based on ${data.bedrooms} bedrooms, assuming approximately 1 bathroom per 2 bedrooms.`,
        sources: ['bedroom-bathroom-ratio']
      });
    }

    return results;
  }

  private inferRentalValue(data: PropertyData): InferenceResult[] {
    const results: InferenceResult[] = [];
    
    if (data.monthlyRent || !data.totalSquareFootage || !data.bedrooms) {
      return results;
    }

    // Use regional rental rates
    const avgRentPerSqFt = this.getRegionalRentalRate(data.zipCode || '');
    const baseRent = data.totalSquareFootage * avgRentPerSqFt;
    
    // Adjust for bedroom count
    const bedroomAdjustment = data.bedrooms * 200; // $200 per bedroom
    const adjustedRent = baseRent + bedroomAdjustment;
    
    results.push({
      field: 'monthlyRent',
      value: Math.round(adjustedRent),
      confidence: 0.7,
      reasoning: `Estimated based on ${data.totalSquareFootage} sq ft at $${avgRentPerSqFt}/sq ft, adjusted for ${data.bedrooms} bedrooms.`,
      sources: ['regional-rental-rates', 'bedroom-adjustment']
    });

    return results;
  }

  private getTypicalRoomSize(roomType: string): number {
    const sizeMap: Record<string, number> = {
      'bedroom': 150,
      'bathroom': 50,
      'kitchen': 180,
      'living': 350,
      'dining': 140,
      'office': 120,
      'other': 100
    };
    return sizeMap[roomType] || 100;
  }

  private getRegionalPricePerSqFt(zipCode: string): number {
    // Mock implementation - in real app, this would query a real estate API
    const priceMap: Record<string, number> = {
      '90210': 800,
      '10001': 600,
      '33139': 450,
      '94102': 750,
      '60601': 300,
      '02101': 550
    };
    
    if (zipCode && priceMap[zipCode]) {
      return priceMap[zipCode];
    }
    
    // Default regional pricing based on zip code prefix
    const prefix = zipCode?.substring(0, 3);
    switch (prefix) {
      case '902': return 700;
      case '100': return 550;
      case '331': return 400;
      case '941': return 700;
      case '606': return 250;
      case '021': return 500;
      default: return 200;
    }
  }

  private getRegionalRentalRate(zipCode: string): number {
    // Mock implementation - in real app, this would query rental data
    const rateMap: Record<string, number> = {
      '90210': 2.5,
      '10001': 2.0,
      '33139': 1.8,
      '94102': 2.3,
      '60601': 1.2,
      '02101': 1.9
    };
    
    if (zipCode && rateMap[zipCode]) {
      return rateMap[zipCode];
    }
    
    // Default rental rate per sq ft
    return 1.5;
  }

  private calculateAgeAdjustment(yearBuilt?: number): number {
    if (!yearBuilt) return 1.0;
    
    const currentYear = new Date().getFullYear();
    const age = currentYear - yearBuilt;
    
    if (age <= 5) return 1.1; // New construction premium
    if (age <= 15) return 1.05;
    if (age <= 30) return 1.0;
    if (age <= 50) return 0.9;
    return 0.8; // Older property discount
  }
}
