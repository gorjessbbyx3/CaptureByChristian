import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface PropertyResearchData {
  price: string;
  bedroomsBathrooms: string;
  address: string;
  interiorLivingArea: string;
  lotSize: string;
  garage: string;
  yearBuilt: string;
  hoa: string;
  hoaFees: string;
  zoning: string;
  mlsNumber: string;
  interiorDetails: string;
  exteriorFeatures: string;
  utilities: string;
  parking: string;
  areaNeighborhood: string;
  lavaZone: string;
  access: string;
  floodRisk: string;
  annualPropertyTax: string;
  estimatedRentalIncome: string;
  financing: string[];
}

export default function PropertyResearch() {
  const { toast } = useToast();
  const [formData, setFormData] = useState<PropertyResearchData>({
    price: "",
    bedroomsBathrooms: "",
    address: "",
    interiorLivingArea: "",
    lotSize: "",
    garage: "",
    yearBuilt: "",
    hoa: "",
    hoaFees: "",
    zoning: "",
    mlsNumber: "",
    interiorDetails: "",
    exteriorFeatures: "",
    utilities: "",
    parking: "",
    areaNeighborhood: "",
    lavaZone: "",
    access: "",
    floodRisk: "",
    annualPropertyTax: "",
    estimatedRentalIncome: "",
    financing: []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof PropertyResearchData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFinancingChange = (option: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      financing: checked 
        ? [...prev.financing, option]
        : prev.financing.filter(f => f !== option)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await apiRequest('POST', '/api/property-research', formData);
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Property research request submitted successfully!",
        });
        // Reset form or redirect as needed
        setFormData({
          price: "",
          bedroomsBathrooms: "",
          address: "",
          interiorLivingArea: "",
          lotSize: "",
          garage: "",
          yearBuilt: "",
          hoa: "",
          hoaFees: "",
          zoning: "",
          mlsNumber: "",
          interiorDetails: "",
          exteriorFeatures: "",
          utilities: "",
          parking: "",
          areaNeighborhood: "",
          lavaZone: "",
          access: "",
          floodRisk: "",
          annualPropertyTax: "",
          estimatedRentalIncome: "",
          financing: []
        });
      } else {
        throw new Error('Failed to submit property research request');
      }
    } catch (error) {
      console.error('Error submitting property research:', error);
      toast({
        title: "Error",
        description: "Failed to submit property research request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const financingOptions = [
    { id: "cash", label: "Cash" },
    { id: "conventional", label: "Conventional Loan" },
    { id: "va", label: "VA Loan" },
    { id: "fha", label: "FHA Loan" },
    { id: "seller", label: "Seller Financing" }
  ];

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Property Research Input Form</CardTitle>
          <p className="text-muted-foreground">Enter the criteria for the property you are researching.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Section 1: Property Overview */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔑</span>
                <h2 className="text-2xl font-semibold">Property Overview</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="bedroomsBathrooms">Bedrooms/Bathrooms (e.g., 3/2)</Label>
                  <Input
                    id="bedroomsBathrooms"
                    value={formData.bedroomsBathrooms}
                    onChange={(e) => handleInputChange('bedroomsBathrooms', e.target.value)}
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    rows={3}
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="interiorLivingArea">Interior Living Area (sq ft)</Label>
                  <Input
                    id="interiorLivingArea"
                    value={formData.interiorLivingArea}
                    onChange={(e) => handleInputChange('interiorLivingArea', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="lotSize">Lot Size (e.g., acres, sq ft)</Label>
                  <Input
                    id="lotSize"
                    value={formData.lotSize}
                    onChange={(e) => handleInputChange('lotSize', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="garage">Garage (e.g., 2-car, attached)</Label>
                  <Input
                    id="garage"
                    value={formData.garage}
                    onChange={(e) => handleInputChange('garage', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="yearBuilt">Year Built</Label>
                  <Input
                    id="yearBuilt"
                    value={formData.yearBuilt}
                    onChange={(e) => handleInputChange('yearBuilt', e.target.value)}
                  />
                </div>
                
                <div className="space-y-3">
                  <Label>HOA</Label>
                  <RadioGroup value={formData.hoa} onValueChange={(value) => handleInputChange('hoa', value)}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="hoa-yes" />
                      <Label htmlFor="hoa-yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="hoa-no" />
                      <Label htmlFor="hoa-no">No</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div>
                  <Label htmlFor="hoaFees">HOA Fees (if applicable)</Label>
                  <Input
                    id="hoaFees"
                    value={formData.hoaFees}
                    onChange={(e) => handleInputChange('hoaFees', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="zoning">Zoning</Label>
                  <Input
                    id="zoning"
                    value={formData.zoning}
                    onChange={(e) => handleInputChange('zoning', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="mlsNumber">MLS #</Label>
                  <Input
                    id="mlsNumber"
                    value={formData.mlsNumber}
                    onChange={(e) => handleInputChange('mlsNumber', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Section 2: Property Features */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🏡</span>
                <h2 className="text-2xl font-semibold">Property Features</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <Label htmlFor="interiorDetails">Interior Details</Label>
                  <Textarea
                    id="interiorDetails"
                    rows={4}
                    placeholder="e.g., flooring, kitchen features, recent upgrades..."
                    value={formData.interiorDetails}
                    onChange={(e) => handleInputChange('interiorDetails', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="exteriorFeatures">Exterior Features</Label>
                  <Textarea
                    id="exteriorFeatures"
                    rows={4}
                    placeholder="e.g., pool, lanai, fencing, landscaping..."
                    value={formData.exteriorFeatures}
                    onChange={(e) => handleInputChange('exteriorFeatures', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="utilities">Utilities</Label>
                  <Textarea
                    id="utilities"
                    rows={3}
                    placeholder="e.g., electric, water source, septic/sewer, internet..."
                    value={formData.utilities}
                    onChange={(e) => handleInputChange('utilities', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="parking">Parking</Label>
                  <Textarea
                    id="parking"
                    rows={3}
                    placeholder="e.g., driveway, street parking, carport details..."
                    value={formData.parking}
                    onChange={(e) => handleInputChange('parking', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Section 3: Location Highlights */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🌄</span>
                <h2 className="text-2xl font-semibold">Location Highlights</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="areaNeighborhood">Area/Neighborhood</Label>
                  <Input
                    id="areaNeighborhood"
                    value={formData.areaNeighborhood}
                    onChange={(e) => handleInputChange('areaNeighborhood', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="lavaZone">Lava Zone</Label>
                  <Select value={formData.lavaZone} onValueChange={(value) => handleInputChange('lavaZone', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a Zone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Zone 1</SelectItem>
                      <SelectItem value="2">Zone 2</SelectItem>
                      <SelectItem value="3">Zone 3</SelectItem>
                      <SelectItem value="4">Zone 4</SelectItem>
                      <SelectItem value="5">Zone 5</SelectItem>
                      <SelectItem value="6">Zone 6</SelectItem>
                      <SelectItem value="7">Zone 7</SelectItem>
                      <SelectItem value="8">Zone 8</SelectItem>
                      <SelectItem value="9">Zone 9</SelectItem>
                      <SelectItem value="Outside">Outside of zones</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="access">Access</Label>
                  <Textarea
                    id="access"
                    rows={3}
                    placeholder="e.g., paved roads, proximity to highways, nearby amenities..."
                    value={formData.access}
                    onChange={(e) => handleInputChange('access', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="floodRisk">Flood Risk</Label>
                  <Input
                    id="floodRisk"
                    placeholder="e.g., Zone X, AE, etc."
                    value={formData.floodRisk}
                    onChange={(e) => handleInputChange('floodRisk', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Section 4: Financial Info */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="text-2xl">💸</span>
                <h2 className="text-2xl font-semibold">Financial Info</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="annualPropertyTax">Annual Property Tax</Label>
                  <Input
                    id="annualPropertyTax"
                    value={formData.annualPropertyTax}
                    onChange={(e) => handleInputChange('annualPropertyTax', e.target.value)}
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="estimatedRentalIncome">Estimated Rental Income</Label>
                  <Textarea
                    id="estimatedRentalIncome"
                    rows={3}
                    placeholder="Provide details on potential long-term or short-term rental income..."
                    value={formData.estimatedRentalIncome}
                    onChange={(e) => handleInputChange('estimatedRentalIncome', e.target.value)}
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label>Financing Options</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    {financingOptions.map((option) => (
                      <div key={option.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`financing-${option.id}`}
                          checked={formData.financing.includes(option.id)}
                          onCheckedChange={(checked) => handleFinancingChange(option.id, checked as boolean)}
                        />
                        <Label htmlFor={`financing-${option.id}`} className="text-sm">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex justify-end">
              <Button 
                type="submit" 
                size="lg" 
                disabled={isSubmitting}
                className="px-8"
              >
                {isSubmitting ? "Submitting..." : "Submit for Research"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}