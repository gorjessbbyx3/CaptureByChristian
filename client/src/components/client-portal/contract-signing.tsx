
import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, 
  Pen, 
  Calendar,
  Shield
} from "lucide-react";

interface ContractSigningProps {
  contract: any;
  onSign: (signatureData: any) => void;
  onCancel: () => void;
}

export default function ContractSigning({ contract, onSign, onCancel }: ContractSigningProps) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [signature, setSignature] = useState("");
  const [fullName, setFullName] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [signatureMethod, setSignatureMethod] = useState<'type' | 'draw'>('type');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (canvasRef.current) {
      setSignature(canvasRef.current.toDataURL());
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignature("");
  };

  const handleSign = () => {
    if (!fullName || !agreedToTerms) {
      toast({
        title: "Please complete all required fields",
        description: "Name and agreement to terms are required.",
        variant: "destructive"
      });
      return;
    }

    if (signatureMethod === 'draw' && !signature) {
      toast({
        title: "Signature required",
        description: "Please draw your signature in the box above.",
        variant: "destructive"
      });
      return;
    }

    const signatureData = {
      fullName,
      date,
      signature: signatureMethod === 'type' ? fullName : signature,
      signatureMethod,
      ipAddress: null, // Will be captured server-side
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    };

    onSign(signatureData);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Contract Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>{contract.title}</span>
          </CardTitle>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>Created: {new Date(contract.createdAt).toLocaleDateString()}</span>
            </div>
            {contract.totalAmount && (
              <div className="flex items-center space-x-1">
                <span>Amount: ${parseFloat(contract.totalAmount).toLocaleString()}</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <div 
              className="whitespace-pre-wrap border rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto"
              dangerouslySetInnerHTML={{ __html: contract.templateContent.replace(/\n/g, '<br />') }}
            />
          </div>
        </CardContent>
      </Card>

      {/* E-Signature Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Pen className="h-5 w-5" />
            <span>Electronic Signature</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Please review the contract above and provide your electronic signature below.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Signature Method Selection */}
          <div className="space-y-4">
            <Label>Signature Method</Label>
            <div className="flex space-x-4">
              <Button
                variant={signatureMethod === 'type' ? 'default' : 'outline'}
                onClick={() => setSignatureMethod('type')}
              >
                Type Name
              </Button>
              <Button
                variant={signatureMethod === 'draw' ? 'default' : 'outline'}
                onClick={() => setSignatureMethod('draw')}
              >
                Draw Signature
              </Button>
            </div>
          </div>

          {/* Signature Input */}
          {signatureMethod === 'type' ? (
            <div className="space-y-2">
              <Label htmlFor="typed-signature">Type Your Full Name</Label>
              <Input
                id="typed-signature"
                type="text"
                placeholder="Enter your full legal name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="text-lg font-script"
                style={{ fontFamily: 'cursive' }}
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Draw Your Signature</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={150}
                  className="border border-gray-200 rounded cursor-crosshair bg-white w-full"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-sm text-muted-foreground">
                    Draw your signature in the box above
                  </p>
                  <Button variant="outline" size="sm" onClick={clearSignature}>
                    Clear
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="full-name">Full Legal Name</Label>
                <Input
                  id="full-name"
                  type="text"
                  placeholder="Enter your full legal name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Date Field */}
          <div className="space-y-2">
            <Label htmlFor="signature-date">Date</Label>
            <Input
              id="signature-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <Separator />

          {/* Legal Agreements */}
          <div className="space-y-4">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms-agreement"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="terms-agreement"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I agree to the terms and conditions
                </label>
                <p className="text-xs text-muted-foreground">
                  By checking this box, I acknowledge that I have read, understood, and agree to be bound by all terms and conditions outlined in this contract.
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900">Electronic Signature Legal Notice</p>
                  <p className="text-blue-700 mt-1">
                    Your electronic signature has the same legal effect as a handwritten signature. 
                    This document will be legally binding once signed.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button 
              onClick={handleSign}
              disabled={!fullName || !agreedToTerms}
              className="bg-green-600 hover:bg-green-700"
            >
              <Pen className="h-4 w-4 mr-2" />
              Sign Contract
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
