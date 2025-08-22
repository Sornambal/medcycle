import { useQuery } from '@tanstack/react-query';
import { useParams, useLocation } from 'wouter';
import { NavigationHeader } from '@/components/NavigationHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { orderService } from '@/services/orders';
import { PDFGenerator, defaultCompanyInfo } from '../lib/pdfGenerator.ts';
import { CheckCircle, MapPin, Download, ArrowLeft } from 'lucide-react';

export default function OrderConfirmation() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const orderId = params.orderId;

  const { data: order, isLoading } = useQuery({
    queryKey: ['/api/orders', orderId],
    queryFn: () => orderService.getOrder(orderId!),
    enabled: !!orderId,
  });

  const handleTrackOrder = () => {
    // In a real implementation, this would navigate to a tracking page
    alert('Order tracking functionality would be implemented here.');
  };

  const handleDownloadBill = () => {
    if (!order) return;
    
    // Create bill data structure for PDF generation
    const billData = {
      order: {
        ...order,
        items: [
          // This would normally come from the order items API
          // For now, we'll use a placeholder
          {
            name: 'Medicine Item',
            company: 'Pharma Co.',
            quantity: 1,
            unitPrice: order.totalAmount,
            totalPrice: order.totalAmount,
            senderName: 'MedCycle Seller'
          }
        ],
        buyer: {
          organizationName: 'Healthcare Organization',
          email: 'customer@example.com',
          mobile: '+91-9876543210'
        }
      },
      companyInfo: defaultCompanyInfo
    };

    PDFGenerator.downloadBill(billData);
  };

  const handleContinueShopping = () => {
    setLocation('/receiver/dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavigationHeader />
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavigationHeader />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h2>
              <p className="text-gray-600 mb-6">The order you're looking for doesn't exist or has been removed.</p>
              <Button onClick={() => setLocation('/receiver/dashboard')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader />
      
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-lg">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="text-green-600 w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
                <p className="text-gray-600">Thank you for your order. Your medicines will be delivered soon.</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Order Details</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Order ID:</p>
                    <p className="font-semibold">#{order.id.slice(-8)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Order Date:</p>
                    <p className="font-semibold">{formatDate(order.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Amount:</p>
                    <p className="font-semibold text-green-600">₹{parseFloat(order.totalAmount).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payment Status:</p>
                    <p className="font-semibold text-green-600 capitalize">{order.paymentStatus}</p>
                  </div>
                </div>
                
                {order.deliveryAddress && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600">Delivery Address:</p>
                    <p className="font-medium">{order.deliveryAddress}</p>
                  </div>
                )}
              </div>

              <div className="flex space-x-4 mb-6">
                <Button
                  onClick={handleTrackOrder}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Track Order
                </Button>
                <Button
                  onClick={handleDownloadBill}
                  variant="outline"
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Bill
                </Button>
              </div>

              <div className="text-center">
                <Button
                  variant="link"
                  onClick={handleContinueShopping}
                  className="text-blue-600 hover:text-blue-700"
                >
                  Continue Shopping
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
