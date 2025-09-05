import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, PenTool, Check } from 'lucide-react';

interface DigitalSignatureProps {
  onSignatureComplete: (signatureData: {
    signature: string;
    signerName: string;
    timestamp: Date;
    ipAddress?: string;
  }) => void;
  signerName?: string;
  title?: string;
  description?: string;
  disabled?: boolean;
}

export default function DigitalSignature({
  onSignatureComplete,
  signerName = '',
  title = 'Digital Signature',
  description = 'Please sign below to complete the agreement',
  disabled = false
}: DigitalSignatureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentSignerName, setCurrentSignerName] = useState(signerName);
  const [hasSignature, setHasSignature] = useState(false);
  const [signatureCompleted, setSignatureCompleted] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Configure drawing style
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Set background to white
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (disabled || signatureCompleted) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || disabled || signatureCompleted) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  // Touch events for mobile
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (disabled || signatureCompleted) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing || disabled || signatureCompleted) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    setSignatureCompleted(false);
  };

  const completeSignature = async () => {
    if (!hasSignature || !currentSignerName.trim()) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Convert canvas to base64 image
    const signatureDataUrl = canvas.toDataURL('image/png');

    // Get client IP (in a real implementation, this would come from the server)
    let clientIP = '';
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      clientIP = data.ip;
    } catch (error) {
      console.log('Could not fetch IP address:', error);
    }

    const signatureData = {
      signature: signatureDataUrl,
      signerName: currentSignerName.trim(),
      timestamp: new Date(),
      ipAddress: clientIP
    };

    setSignatureCompleted(true);
    onSignatureComplete(signatureData);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PenTool className="w-5 h-5" />
          {title}
        </CardTitle>
        <CardDescription>
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Signer Name Input */}
        <div className="space-y-2">
          <Label htmlFor="signerName">Full Name</Label>
          <Input
            id="signerName"
            value={currentSignerName}
            onChange={(e) => setCurrentSignerName(e.target.value)}
            placeholder="Enter your full legal name"
            disabled={disabled || signatureCompleted}
            className="text-lg"
          />
        </div>

        {/* Signature Canvas */}
        <div className="space-y-4">
          <Label>Digital Signature</Label>
          <div className="relative border-2 border-gray-300 rounded-lg bg-white">
            <canvas
              ref={canvasRef}
              className="w-full h-48 cursor-crosshair rounded-lg"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              style={{ 
                touchAction: 'none',
                opacity: disabled || signatureCompleted ? 0.6 : 1
              }}
            />
            {!hasSignature && !signatureCompleted && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-gray-400">
                <div className="text-center">
                  <PenTool className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Sign here using your mouse or finger</p>
                </div>
              </div>
            )}
            {signatureCompleted && (
              <div className="absolute top-2 right-2 bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm flex items-center gap-1">
                <Check className="w-4 h-4" />
                Signed
              </div>
            )}
          </div>
          
          {/* Signature Actions */}
          <div className="flex gap-2 justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={clearSignature}
              disabled={!hasSignature || disabled || signatureCompleted}
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </Button>
            
            <Button
              type="button"
              onClick={completeSignature}
              disabled={!hasSignature || !currentSignerName.trim() || disabled || signatureCompleted}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <Check className="w-4 h-4" />
              {signatureCompleted ? 'Signature Complete' : 'Complete Signature'}
            </Button>
          </div>
        </div>

        {/* Signature Info */}
        {signatureCompleted && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 mb-2">Signature Completed</h4>
            <div className="text-sm text-green-700 space-y-1">
              <p><strong>Signer:</strong> {currentSignerName}</p>
              <p><strong>Date:</strong> {new Date().toLocaleString()}</p>
              <p><strong>Method:</strong> Electronic Signature</p>
            </div>
          </div>
        )}

        {/* Legal Disclaimer */}
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
          <p>
            By signing above, you agree that this electronic signature has the same legal effect 
            as a handwritten signature and that you are legally bound by the terms of this agreement.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}