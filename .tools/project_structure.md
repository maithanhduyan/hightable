# Cấu trúc Dự án như sau:

```
../
└── hightable
    ├── Dockerfile
    ├── docker-compose.yml
    ├── eslint.config.mjs
    ├── package.json
    ├── pnpm-lock.yaml
    ├── prisma
    │   ├── schema.prisma
    │   └── seed.ts
    ├── src
    │   ├── app.controller.spec.ts
    │   ├── app.controller.ts
    │   ├── app.module.ts
    │   ├── app.service.ts
    │   └── main.ts
    ├── tsconfig.build.json
    └── tsconfig.json
```

# Danh sách chi tiết các file:

## File ../hightable\docker-compose.yml:
```yaml
version: '3.8'

services:
  hightable_backend:
    build: .
    container_name: hightable-backend
    restart: unless-stopped
    env_file:
      - .env
    environment:
      DATABASE_URL: postgres://postgres:postgres@db:5432/hightable
      # REDIS_URL: redis://redis:6379
    depends_on:
      - db
      - redis
    networks:
      - continental 
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.backend.rule=Host(`api.localhost`)"
      - "traefik.http.services.backend.loadbalancer.server.port=3000"

  db:
    image: postgres:17
    container_name: db
    env_file:
      - .env
    restart: unless-stopped
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
      
    volumes:
      - postgresql_data:/var/lib/postgresql/data
    networks:
      - continental 

  redis:
    image: redis:7
    container_name: redis
    restart: unless-stopped
    volumes:
      - redis_data:/data
    networks:
      - continental 

  traefik:
    image: traefik:v3.4.0
    container_name: traefik
    command:
      - "--api.insecure=true"
      - "--providers.docker=true"
      - "--entrypoints.web.address=:80"
    ports:
      - "80:80"
      - "8080:8080" # Traefik dashboard
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
    networks:
      - continental 

volumes:
  postgresql_data:
  redis_data:

networks:
  continental :
    external: true

# Create networks
# docker network create continental 
```

## File ../hightable\Dockerfile:
```
# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Cài pnpm
RUN corepack enable && corepack prepare pnpm@8.15.5 --activate

COPY package*.json ./
COPY pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@8.15.5 --activate

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/pnpm-lock.yaml ./

ENV NODE_ENV=production

CMD ["node", "dist/main.js"]

```

## File ../hightable\prisma\seed.ts:
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.createMany({
    data: [
      { email: 'alice@example.com', name: 'Alice' },
      { email: 'bob@example.com', name: 'Bob' },
      { email: 'carol@example.com', name: 'Carol' },
    ],
  });
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

```

## File ../hightable\src\app.controller.spec.ts:
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();
  });

  describe('getHello', () => {
    it('should return "Hello World!"', () => {
      const appController = app.get(AppController);
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});

```

## File ../hightable\src\app.controller.ts:
```typescript
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('users')
  async getUsers() {
    return this.appService.getUsers();
  }
}

```

## File ../hightable\src\app.module.ts:
```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

```

## File ../hightable\src\app.service.ts:
```typescript
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

```

## File ../hightable\src\main.ts:
```typescript
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

```

