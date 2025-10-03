import { Controller, Post, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('create-order')
  async createOrder(@Body() body: { amount: number; receipt: string }) {
    if (!body.amount || !body.receipt) {
        throw new BadRequestException('Amount and receipt are required');
    }
    return this.paymentsService.createRazorpayOrder(body.amount, body.receipt);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('verify')
  async verifyPayment(
    @Body()
    body: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
      internal_order_id: string; // The ID from our own database
    },
  ) {
    return this.paymentsService.verifyPayment(
      body.razorpay_order_id,
      body.razorpay_payment_id,
      body.razorpay_signature,
      body.internal_order_id,
    );
  }
}
