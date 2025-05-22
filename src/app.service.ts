import { Injectable } from '@nestjs/common';
import { PrismaClient, User } from '@prisma/client';

@Injectable()
export class AppService {
  private prisma = new PrismaClient();

  async getUsers(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  getHello(): string {
    return 'Hello World!';
  }
}
