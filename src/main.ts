import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaClient } from '@prisma/client';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const prisma = new PrismaClient();
  await prisma.$connect();
  const port = process.env.API_PORT || 3000;
  await app.listen(port);
  console.log(`Server is running on http://localhost:${port}`);
}

bootstrap()
  .then(() => { })
  .catch((error) => {
    console.error('Error starting the server:', error);
    process.exit(1);
  });

// bootstrap();
