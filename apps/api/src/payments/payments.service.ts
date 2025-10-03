import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Razorpay from 'razorpay';
import * as crypto from 'crypto';
import { OrdersService } from 'src/orders.service';

@Injectable()
export class PaymentsService {
  private razorpay: Razorpay;

  constructor(
    private readonly configService: ConfigService,
    private readonly ordersService: OrdersService, // Inject OrdersService
  ) {
    this.razorpay = new Razorpay({
      key_id: this.configService.get<string>('RAZORPAY_KEY_ID'),
      key_secret: this.configService.get<string>('RAZORPAY_KEY_SECRET'),
    });
  }

  async createRazorpayOrder(amount: number, receiptId: string) {
    const options = {
      amount: amount * 100, // Amount in the smallest currency unit (e.g., paise for INR)
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
    const expectedSignature = crypto
      .createHmac('sha256', this.configService.get<string>('RAZORPAY_KEY_SECRET'))
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
