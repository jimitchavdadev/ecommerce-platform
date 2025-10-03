import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { CreateOrderDto } from './orders/dto/create-order.dto';
import { OrderStatus, User } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createOrderDto: CreateOrderDto, user: User) {
    // This function can now be used to create the initial "PENDING" order
    const { items, shippingAddress } = createOrderDto;
    const productIds = items.map((item) => item.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      throw new BadRequestException('One or more products not found');
    }

    const total = items.reduce((acc, item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        throw new BadRequestException(
          `Product with ID ${item.productId} not found`,
        );
      }
      if (product.stock < item.quantity) {
        throw new BadRequestException(`Not enough stock for ${product.name}`);
      }
      return acc + product.price * item.quantity;
    }, 0);
    
    // Create the order with PENDING status. Payment will update it later.
    return this.prisma.order.create({
      data: {
        userId: user.id,
        total,
        shippingAddress,
        status: 'PENDING',
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
      },
    });
  }
  
  // This service is now exported from the module, so it can be injected elsewhere
  async updateOrderStatus(orderId: string, status: OrderStatus) {
    // In a real app, you might only decrement stock here, once payment is 'PAID'
    const order = await this.prisma.order.update({
        where: { id: orderId },
        data: { status },
        include: { items: true },
    });

    // If payment is successful, decrement stock
    if (status === 'PAID') {
        for (const item of order.items) {
            await this.prisma.product.update({
                where: { id: item.productId },
                data: { stock: { decrement: item.quantity } },
            });
        }
    }
    
    return order;
  }

  async findMyOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // New method for admins
  async findAllOrders() {
    return this.prisma.order.findMany({
      include: {
        user: {
          select: { name: true, email: true },
        },
        items: {
          include: {
            product: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
