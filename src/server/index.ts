// Kai's Real Stripe Integration - Time to make MONEY! 💰

import Stripe from 'stripe';

export class UPPStripeProcessor {
  private stripe: Stripe;

  constructor() {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is required!');
    }
    
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16'
    });
    
    console.log('💳 Stripe processor initialized - Ready to make money! 🌊');
  }

  // Process payment from ANY device
  async processDevicePayment(paymentData: {
    amount: number;
    deviceType: string;
    deviceId: string;
    description: string;
    customerEmail?: string;
    metadata?: Record<string, string>;
  }) {
    try {
      console.log(`💰 Processing ${paymentData.deviceType} payment: $${paymentData.amount}`);

      // Create payment intent
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(paymentData.amount * 100), // Convert to cents
        currency: 'usd',
        description: `UPP ${paymentData.deviceType}: ${paymentData.description}`,
        metadata: {
          device_type: paymentData.deviceType,
          device_id: paymentData.deviceId,
          upp_system: 'kai_v1',
          ...paymentData.metadata
        },
        receipt_email: paymentData.customerEmail
      });

      console.log(`✅ Payment Intent: ${paymentIntent.id} - $${paymentData.amount}`);

      return {
        success: true,
        payment_intent_id: paymentIntent.id,
        client_secret: paymentIntent.client_secret,
        amount: paymentData.amount,
        status: paymentIntent.status,
        device_type: paymentData.deviceType
      };

    } catch (error) {
      console.error('💥 Stripe Error:', error);
      throw new Error(`Payment failed: ${error.message}`);
    }
  }

  // Confirm payment (when device completes payment)
  async confirmPayment(paymentIntentId: string, paymentMethodId: string) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.confirm(paymentIntentId, {
        payment_method: paymentMethodId
      });

      console.log(`🎉 Payment confirmed: ${paymentIntentId}`);

      return {
        success: true,
        status: paymentIntent.status,
        amount_received: paymentIntent.amount_received / 100,
        transaction_id: paymentIntent.id
      };

    } catch (error) {
      console.error('💥 Payment confirmation failed:', error);
      throw error;
    }
  }

  // Get payment status
  async getPaymentStatus(paymentIntentId: string) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      
      return {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        created: new Date(paymentIntent.created * 1000),
        metadata: paymentIntent.metadata
      };
    } catch (error) {
      console.error('Error getting payment status:', error);
      throw error;
    }
  }

  // Create customer for recurring payments
  async createCustomer(email: string, name: string, deviceType: string) {
    try {
      const customer = await this.stripe.customers.create({
        email,
        name,
        metadata: {
          device_type: deviceType,
          upp_customer: 'true',
          created_by: 'kai_upp_system'
        }
      });

      console.log(`👤 Customer created: ${customer.id} (${email})`);
      return customer;
    } catch (error) {
      console.error('Customer creation failed:', error);
      throw error;
    }
  }
}
