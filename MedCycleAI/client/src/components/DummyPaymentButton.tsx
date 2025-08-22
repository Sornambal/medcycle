import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Download } from 'lucide-react';

interface DummyPaymentButtonProps {
  amount: number;
  orderId: string;
  onPaymentSuccess: () => void;
}

export default function DummyPaymentButton({ amount, orderId, onPaymentSuccess }: DummyPaymentButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { toast } = useToast();

  const handleDummyPayment = async () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setShowSuccess(true);
      
      toast({
        title: 'Payment Successful',
        description: 'Your payment has been processed successfully!',
      });
      
      onPaymentSuccess();
    }, 2000);
  };

  if (showSuccess) {
    return (
      <div className="text-center space-y-4">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
        <h3 className="text-xl font-semibold">Payment Successful!</h3>
        <p className="text-gray-600">Your order has been placed successfully.</p>
        <Button 
          onClick={() => window.location.href = `/order-confirmation/${orderId}`}
          className="bg-green-600 hover:bg-green-700"
        >
          <Download className="w-4 h-4 mr-2" />
          Download Receipt
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold mb-2">Test Payment</h4>
        <p className="text-sm text-gray-600 mb-4">
          This is  payment for testing purposes. No actual payment will be processed.
        </p>
        <div className="text-lg font-bold mb-2">
          Total: ₹{amount.toFixed(2)}
        </div>
      </div>
      
      <Button 
        onClick={handleDummyPayment}
        disabled={isProcessing}
        className="w-full bg-blue-600 hover:bg-blue-700"
      >
        {isProcessing ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            Processing...
          </>
        ) : (
          `Pay ₹${amount.toFixed(2)}`
        )}
      </Button>
    </div>
  );
}
