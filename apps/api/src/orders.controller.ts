import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './orders/dto/create-order.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from './common/decorators/get-user.decorator';
import type { User } from '@prisma/client';

@Controller('orders')
@UseGuards(AuthGuard('jwt'))
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto, @GetUser() user: User) {
    return this.ordersService.create(createOrderDto, user);
  }

  @Get('my-orders')
  findMyOrders(@GetUser() user: User) {
    return this.ordersService.findMyOrders(user.id);
  }
}
