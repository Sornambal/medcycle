import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_51RxLZYGwpkkGQNGquXKL2uJFLCuIaeaU35Es0PR2l6184FysKSymAVz6R7HhHrEvWGb7mDRgkBuy0lDfwjAEhyOX00pzq0sFJT', {
  apiVersion: '2025-06-30.basil',
});

export interface PaymentIntentData {
  amount: number;
  currency?: string;
  orderId: string;
  customerEmail?: string;
}

export const stripeService = {
  async createPaymentIntent(data: PaymentIntentData) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(data.amount * 100), // Convert to cents
        currency: data.currency || 'inr',
        metadata: {
          orderId: data.orderId,
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      };
    } catch (error) {
      console.error('Stripe payment intent creation error:', error);
      throw new Error('Failed to create payment intent');
    }
  },

  async confirmPayment(paymentIntentId: string) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status === 'succeeded') {
        return {
          success: true,
          paymentId: paymentIntent.id,
          amount: paymentIntent.amount / 100, // Convert back to rupees
          currency: paymentIntent.currency,
        };
      }
      
      return {
        success: false,
        error: 'Payment not completed',
      };
    } catch (error) {
      console.error('Stripe payment confirmation error:', error);
      throw new Error('Failed to confirm payment');
    }
  },

  async refundPayment(paymentIntentId: string, amount?: number) {
    try {
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount ? Math.round(amount * 100) : undefined,
      });

      return {
        success: true,
        refundId: refund.id,
        amount: refund.amount / 100,
      };
    } catch (error) {
      console.error('Stripe refund error:', error);
      throw new Error('Failed to process refund');
    }
  },
};
