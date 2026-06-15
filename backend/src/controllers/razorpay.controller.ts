import {HttpErrors, post, requestBody} from '@loopback/rest';
import {repository} from '@loopback/repository';
import crypto from 'crypto';
const Razorpay = require('razorpay');
const {v4: uuidv4} = require('uuid');

import {PaymentsRepository} from '../repositories';

type CreateRazorpayOrderBody = {
  amount: number;
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
};

type VerifyRazorpayPaymentBody = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  amount?: number;
  orderId?: string;
};

export class RazorpayController {
  constructor(
    @repository(PaymentsRepository)
    private paymentsRepo: PaymentsRepository,
  ) {}

  @post('/payments/razorpay/order')
  async createOrder(@requestBody() body: CreateRazorpayOrderBody) {
    const amount = Number(body.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      throw new HttpErrors.BadRequest('A valid amount is required.');
    }

    const razorpay = this.getClient();
    const amountInPaise = Math.round(amount * 100);

    let order: {
      id: string;
      amount: number;
      currency: string;
    };

    try {
      order = await razorpay.orders.create({
        amount: amountInPaise,
        currency: body.currency || 'INR',
        receipt: body.receipt || `snackpack_${Date.now()}`,
        notes: body.notes || {},
      });
    } catch (error) {
      console.error('Razorpay order creation failed', error);
      throw new HttpErrors.BadGateway(
        'Unable to create Razorpay order. Please check your Razorpay credentials.',
      );
    }

    await this.tryRecordPayment({
      id: uuidv4(),
      paymentMethod: 'upi',
      transactionId: order.id,
      amount,
      status: 'pending',
    
      providerResponse: JSON.stringify(order),
      createdOnServer: new Date().toISOString(),
      validFlag: true,
      usedFlag: true,
    });

    return {
      success: true,
      keyId: this.getKeyId(),
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    };
  }

  @post('/payments/razorpay/verify')
  async verifyPayment(@requestBody() body: VerifyRazorpayPaymentBody) {
    const {razorpay_order_id, razorpay_payment_id, razorpay_signature} = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new HttpErrors.BadRequest('Razorpay payment details are required.');
    }

    const expectedSignature = crypto
      .createHmac('sha256', this.getKeySecret())
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      throw new HttpErrors.BadRequest('Payment signature verification failed.');
    }

    // await this.tryRecordPayment({
    //   id: uuidv4(),
    //   orderId: body.orderId,
    //   paymentMethod: 'upi',
    //   transactionId: razorpay_payment_id,
    //   amount: Number(body.amount ?? 0),
    //   status: 'success',
    //   providerResponse: JSON.stringify(body),
    //   createdOnServer: new Date().toISOString(),
    //   validFlag: true,
    //   usedFlag: true,
    // });
  
    const payment = await this.paymentsRepo.findOne({
  where: {
    transactionId: razorpay_order_id
  }
});

if (payment?.id) {
  await this.paymentsRepo.updateById(payment.id, {
    status: 'success',
    transactionId: razorpay_payment_id,
    providerResponse: JSON.stringify(body),
  });
}

    return {
      success: true,
      paymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
    };

    
  }

  private getClient() {
    return new Razorpay({
      key_id: this.getKeyId(),
      key_secret: this.getKeySecret(),
    });
  }

  private getKeyId(): string {
    const keyId = process.env.RAZORPAY_KEY_ID;

    if (!keyId) {
      throw new HttpErrors.ServiceUnavailable('Razorpay key id is not configured.');
    }

    return keyId;
  }

  private getKeySecret(): string {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keySecret) {
      throw new HttpErrors.ServiceUnavailable('Razorpay key secret is not configured.');
    }

    return keySecret;
  }

  private async tryRecordPayment(payment: Record<string, unknown>): Promise<void> {
    try {
      await this.paymentsRepo.create(payment);
    } catch (error) {
      console.warn('Unable to record Razorpay payment row', error);
    }
  }
}
