import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Razorpay = require('razorpay'); // FIX: Changed import style for CommonJS compatibility
import * as crypto from 'crypto';
import { OrdersService } from 'src/orders.service';

@Injectable()
export class PaymentsService {
  private razorpay: Razorpay;

  constructor(
    private readonly configService: ConfigService,
    private readonly ordersService: OrdersService,
  ) {
    const key_id = this.configService.get<string>('RAZORPAY_KEY_ID');
    const key_secret = this.configService.get<string>('RAZORPAY_KEY_SECRET');

    if (!key_id || !key_secret) {
      throw new InternalServerErrorException('Razorpay keys are not configured.');
    }

    this.razorpay = new Razorpay({ key_id, key_secret });
  }

  async createRazorpayOrder(amount: number, receiptId: string) {
    const options = {
      amount: Math.round(amount * 100), // Amount in the smallest currency unit (e.g., paise)
      currency: 'INR',
      receipt: receiptId,
    };
    try {
      const order = await this.razorpay.orders.create(options);
      return order;
    } catch (error) {
      console.error('Razorpay order creation failed:', error);
      throw new BadRequestException('Could not create payment order.');
    }
  }

  async verifyPayment(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string,
    internalOrderId: string,
  ) {
    const body = `${razorpayOrderId}|${razorpayPaymentId}`;

    // FIX: Ensure the secret key exists before using it
    const secret = this.configService.get<string>('RAZORPAY_KEY_SECRET');
    if (!secret) {
      throw new InternalServerErrorException('Razorpay secret key is not configured.');
    }

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpaySignature) {
      // Payment is legitimate, update order status
      await this.ordersService.updateOrderStatus(internalOrderId, 'PAID');
      return { status: 'success', orderId: internalOrderId };
    } else {
      // Payment verification failed
      await this.ordersService.updateOrderStatus(internalOrderId, 'CANCELED');
      throw new BadRequestException('Payment verification failed.');
    }
  }
}