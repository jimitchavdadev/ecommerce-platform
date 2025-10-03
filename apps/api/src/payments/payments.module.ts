import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { OrdersModule } from 'src/orders.module'; // Import OrdersModule

@Module({
  imports: [OrdersModule], // Import OrdersModule to use OrdersService
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
