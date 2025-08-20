import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NavigationHeader } from '@/components/NavigationHeader';
import { SearchFilters } from '@/components/SearchFilters';
import { MedicineCard } from '@/components/MedicineCard';
import { CartItem } from '@/components/CartItem';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { medicineService } from '@/services/medicine';
import { orderService } from '@/services/orders';
import { Search, ShoppingCart, ClipboardList, CreditCard } from 'lucide-react';

export default function ReceiverDashboard() {
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  // Get cart items
  const { data: cartItems = [], isLoading: cartLoading } = useQuery({
    queryKey: ['/api/cart'],
  });

  // Get orders
  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['/api/orders'],
  });

  // Search medicines
  const handleSearch = async (filters: any) => {
    setIsSearching(true);
    try {
      const results = await medicineService.searchMedicines(filters);
      setSearchResults(results);
    } catch (error: any) {
      toast({
        title: 'Search Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: orderService.addToCart,
    onSuccess: () => {
      toast({
        title: 'Added to Cart',
        description: 'Medicine has been added to your cart successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to Add to Cart',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update cart item mutation
  const updateCartMutation = useMutation({
    mutationFn: ({ cartId, quantity }: { cartId: string; quantity: number }) =>
      orderService.updateCartItem(cartId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to Update Cart',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Remove from cart mutation
  const removeFromCartMutation = useMutation({
    mutationFn: orderService.removeFromCart,
    onSuccess: () => {
      toast({
        title: 'Removed from Cart',
        description: 'Item has been removed from your cart.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to Remove Item',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleAddToCart = (medicineId: string, quantity: number) => {
    addToCartMutation.mutate({ medicineId, quantity });
  };

  const handleUpdateCartItem = (cartId: string, quantity: number) => {
    updateCartMutation.mutate({ cartId, quantity });
  };

  const handleRemoveFromCart = (cartId: string) => {
    removeFromCartMutation.mutate(cartId);
  };

  const handleProceedToCheckout = () => {
    if (cartItems.length === 0) {
      toast({
        title: 'Cart is Empty',
        description: 'Please add some medicines to your cart before proceeding.',
        variant: 'destructive',
      });
      return;
    }
    setLocation('/checkout');
  };

  // Calculate cart total
  const cartTotal = cartItems.reduce((total: number, item: any) => {
    return total + (parseFloat(item.medicinePrice) * item.quantity);
  }, 0);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_transit':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Receiver Dashboard</h1>
          <p className="text-gray-600">Search and purchase medicines from nearby healthcare providers</p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="search" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="search" className="flex items-center">
              <Search className="w-4 h-4 mr-2" />
              Search Medicines
            </TabsTrigger>
            <TabsTrigger value="cart" className="flex items-center">
              <ShoppingCart className="w-4 h-4 mr-2" />
              My Cart
              {cartItems.length > 0 && (
                <Badge className="bg-red-500 text-white text-xs ml-2">
                  {cartItems.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center">
              <ClipboardList className="w-4 h-4 mr-2" />
              My Orders
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search">
            <div className="space-y-6">
              <SearchFilters onSearch={handleSearch} isLoading={isSearching} />
              
              {/* Search Results */}
              {searchResults.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Search Results ({searchResults.length} found)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {searchResults.map((medicine) => (
                        <MedicineCard
                          key={medicine.id}
                          medicine={medicine}
                          onAddToCart={handleAddToCart}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {isSearching && (
                <div className="flex justify-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full" />
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="cart">
            <Card>
              <CardHeader>
                <CardTitle>Shopping Cart</CardTitle>
              </CardHeader>
              <CardContent>
                {cartLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full" />
                  </div>
                ) : cartItems.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Your cart is empty. Search for medicines to add them to your cart.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map((item: any) => (
                      <CartItem
                        key={item.id}
                        item={item}
                        onUpdateQuantity={handleUpdateCartItem}
                        onRemove={handleRemoveFromCart}
                      />
                    ))}
                    
                    {/* Cart Total */}
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-lg font-semibold">Total:</span>
                        <span className="text-2xl font-bold text-green-600">₹{cartTotal.toFixed(2)}</span>
                      </div>
                      <Button
                        onClick={handleProceedToCheckout}
                        className="w-full bg-green-600 hover:bg-green-700"
                        disabled={cartItems.length === 0}
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        Proceed to Checkout
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>My Orders</CardTitle>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full" />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No orders found. Place your first order to see it here.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Payment Status</TableHead>
                          <TableHead>Delivery Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map((order: any) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">#{order.id.slice(-8)}</TableCell>
                            <TableCell>{formatDate(order.createdAt)}</TableCell>
                            <TableCell>₹{parseFloat(order.totalAmount).toFixed(2)}</TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(order.paymentStatus)}>
                                {order.paymentStatus}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(order.deliveryStatus)}>
                                {order.deliveryStatus}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
