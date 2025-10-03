import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { CreateOrderDto } from './orders/dto/create-order.dto';
import { User } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createOrderDto: CreateOrderDto, user: User) {
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

    const order = await this.prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId: user.id,
          total,
          shippingAddress,
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }
      return newOrder;
    });

    return order;
  }

  // New method to find orders for the authenticated user
  async findMyOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: true, // Include product details in each order item
          },
        },
      },
      orderBy: {
        createdAt: 'desc', // Show most recent orders first
      },
    });
  }
}
