import { apiRequest } from '@/lib/queryClient';

export interface CartItem {
  medicineId: string;
  quantity: number;
}

export interface CreateOrderRequest {
  deliveryAddress: string;
}

export interface PaymentRequest {
  paymentMethod: string;
}

export const orderService = {
  async addToCart(data: CartItem) {
    const response = await apiRequest('POST', '/api/cart', data);
    return await response.json();
  },

  async getCart() {
    const response = await apiRequest('GET', '/api/cart');
    return await response.json();
  },

  async updateCartItem(cartId: string, quantity: number) {
    const response = await apiRequest('PUT', `/api/cart/${cartId}`, { quantity });
    return await response.json();
  },

  async removeFromCart(cartId: string) {
    const response = await apiRequest('DELETE', `/api/cart/${cartId}`);
    return await response.json();
  },

  async createOrder(data: CreateOrderRequest) {
    const response = await apiRequest('POST', '/api/orders', data);
    return await response.json();
  },

  async getOrders() {
    const response = await apiRequest('GET', '/api/orders');
    return await response.json();
  },

  async getOrder(orderId: string) {
    const response = await apiRequest('GET', `/api/orders/${orderId}`);
    return await response.json();
  },

  async processPayment(orderId: string, data: PaymentRequest) {
    const response = await apiRequest('POST', `/api/orders/${orderId}/payment`, data);
    return await response.json();
  }
};
