import React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const stripePromise = loadStripe("pk_test_51RxLZYGwpkkGQNGqRTtUe8RtFEYL1JuvBkmvy89f3nByT9fs1eHZ7uTi1osnDtkfvLWsMn3tinPHfD4DyfruHDPq00NxOcTbnQ");

interface StripeCheckoutFormProps {
  amount: number;
  orderId: string;
  onPaymentSuccess: (paymentIntentId: string) => void;
  onPaymentError: (error: string) => void;
}

function CheckoutForm({ amount, orderId, onPaymentSuccess, onPaymentError }: StripeCheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      // Create payment intent
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          amount: amount,
          orderId: orderId,
        }),
      });

      const { clientSecret } = await response.json();

      if (!clientSecret) {
        throw new Error('Failed to create payment intent');
      }

      // Confirm payment
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        },
      });

      if (result.error) {
        onPaymentError(result.error.message || 'Payment failed');
        toast({
          title: 'Payment Failed',
          description: result.error.message || 'Payment processing failed',
          variant: 'destructive',
        });
      } else if (result.paymentIntent?.status === 'succeeded') {
        onPaymentSuccess(result.paymentIntent.id);
        toast({
          title: 'Payment Successful',
          description: 'Your payment has been processed successfully!',
        });
      }
    } catch (error) {
      console.error('Payment error:', error);
      onPaymentError('Payment processing failed');
      toast({
        title: 'Payment Error',
        description: 'An error occurred during payment processing',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="border border-gray-200 rounded-lg p-4">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
        />
      </div>
      <Button 
        type="submit" 
        disabled={!stripe || isProcessing}
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
    </form>
  );
}

interface StripeButtonProps {
  amount: number;
  orderId: string;
  onPaymentSuccess: (paymentIntentId: string) => void;
  onPaymentError: (error: string) => void;
}

export default function StripeButton({ amount, orderId, onPaymentSuccess, onPaymentError }: StripeButtonProps) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm 
        amount={amount} 
        orderId={orderId} 
        onPaymentSuccess={onPaymentSuccess}
        onPaymentError={onPaymentError}
      />
    </Elements>
  );
}
