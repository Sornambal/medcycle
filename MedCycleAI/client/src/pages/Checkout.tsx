import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation } from 'wouter';
import { NavigationHeader } from '@/components/NavigationHeader';
import { Button } from '@/components/ui/button';
import StripeButton from '@/components/StripeButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { orderService } from '@/services/orders';
import { CreditCard, Lock, University } from 'lucide-react';

const checkoutSchema = z.object({
  deliveryAddress: z.string().min(10, 'Please provide a detailed delivery address'),
  paymentMethod: z.enum(['card', 'netbanking'], {
    required_error: 'Please select a payment method',
  }),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showStripePayment, setShowStripePayment] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  const form = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      deliveryAddress: '',
      paymentMethod: undefined,
    },
  });

  // Get cart items
  interface CartItem {
    id: string;
    medicineName: string;
    medicinePrice: string;
    quantity: number;
  }

  const { data: cartItems = [], isLoading: cartLoading } = useQuery<CartItem[]>({
    queryKey: ['/api/cart'],
  });

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: orderService.createOrder,
    onSuccess: (data) => {
      setOrderId(data.order.id);
      setShowStripePayment(true);
    },
    onError: (error: Error) => {
      toast({
        title: 'Order Creation Failed',
        description: error.message,
        variant: 'destructive',
      });
      setIsProcessing(false);
    },
  });

  const handleStripePaymentSuccess = (paymentIntentId: string) => {
    toast({
      title: 'Payment Successful',
      description: 'Your order has been placed successfully!',
    });
    setLocation(`/order-confirmation/${orderId}`);
  };

  const handleStripePaymentError = (error: string) => {
    toast({
      title: 'Payment Failed',
      description: error,
      variant: 'destructive',
    });
    setIsProcessing(false);
  };

  const onSubmit = (data: CheckoutForm) => {
    if (cartItems.length === 0) {
      toast({
        title: 'Cart is Empty',
        description: 'Please add items to your cart before checkout.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    createOrderMutation.mutate({ deliveryAddress: data.deliveryAddress });
  };

  // Calculate totals
  const subtotal = cartItems.reduce((total: number, item: any) => {
    return total + (parseFloat(item.medicinePrice) * item.quantity);
  }, 0);

  const deliveryFee = 50; // Fixed delivery fee
  const total = subtotal + deliveryFee;

  if (cartLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavigationHeader />
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavigationHeader />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
              <p className="text-gray-600 mb-6">Add some medicines to your cart before checkout.</p>
              <Button onClick={() => setLocation('/receiver/dashboard')}>
                Continue Shopping
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cartItems.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center py-2 border-b">
                    <div>
                      <p className="font-medium">{item.medicineName}</p>
                      <p className="text-sm text-gray-600">
                        Qty: {item.quantity} × ₹{item.medicinePrice}
                      </p>
                    </div>
                    <p className="font-semibold">
                      ₹{(parseFloat(item.medicinePrice) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between mb-2">
                  <span>Subtotal:</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Delivery Fee:</span>
                  <span>₹{deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Checkout Form */}
          <Card>
            <CardHeader>
              <CardTitle>Delivery & Payment</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="deliveryAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Delivery Address</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter your complete delivery address"
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Method</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="space-y-4"
                          >
                            <div className="border border-gray-200 rounded-lg p-4">
                              <div className="flex items-center space-x-3">
                                <RadioGroupItem value="card" id="card" />
                                <Label htmlFor="card" className="flex items-center cursor-pointer">
                                  <CreditCard className="w-6 h-6 mr-3 text-green-600" />
                                  <span>Credit / Debit Card (Stripe)</span>
                                </Label>
                              </div>
                            </div>
                            
                            <div className="border border-gray-200 rounded-lg p-4">
                              <div className="flex items-center space-x-3">
                                <RadioGroupItem value="netbanking" id="netbanking" />
                                <Label htmlFor="netbanking" className="flex items-center cursor-pointer">
                                  <University className="w-6 h-6 mr-3 text-purple-600" />
                                  <span>Net Banking</span>
                                </Label>
                              </div>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {!showStripePayment ? (
                    <Button
                      type="submit"
                      className="w-full bg-green-600 hover:bg-green-700"
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      ) : (
                        <Lock className="w-4 h-4 mr-2" />
                      )}
                      Proceed to Payment
                    </Button>
                  ) : (
                    <StripeButton
                      amount={total}
                      orderId={orderId!}
                      onPaymentSuccess={handleStripePaymentSuccess}
                      onPaymentError={handleStripePaymentError}
                    />
                  )}
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
