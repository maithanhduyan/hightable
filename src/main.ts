import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaClient } from '@prisma/client';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const prisma = new PrismaClient();
  await prisma.$connect();
  await app.listen(3000);
}
bootstrap()
  .then(() => console.log('Server is running on http://localhost:3000'))
  .catch((error) => {
    console.error('Error starting the server:', error);
    process.exit(1);
  });
// Uncomment the following line to enable shutdown hooks
// app.enableShutdownHooks();
// Uncomment the following line to enable shutdown hooks
// bootstrap();
