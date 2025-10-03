import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './orders/dto/create-order.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from './common/decorators/get-user.decorator';
import * as client from '@prisma/client';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';

@Controller('orders')
@UseGuards(AuthGuard('jwt'))
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }

  @Post()
  create(@Body() createOrderDto: CreateOrderDto, @GetUser() user: client.User) {
    // This now just creates a PENDING order
    return this.ordersService.create(createOrderDto, user);
  }

  @Get('my-orders')
  findMyOrders(@GetUser() user: client.User) {
    return this.ordersService.findMyOrders(user.id);
  }

  @Get('all')
  @UseGuards(RolesGuard)
  @Roles(client.Role.ADMIN)
  findAllOrders() {
    return this.ordersService.findAllOrders();
  }
}
