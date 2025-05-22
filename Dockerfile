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
