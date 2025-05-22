# Devcontainer for NestJS + pnpm + Traefik + Postgres + Redis

FROM node:20-alpine

# Cài corepack và pnpm
RUN corepack enable && corepack prepare pnpm@8.15.5 --activate

# Cài các tool hữu ích cho dev
RUN apk add --no-cache bash git curl

WORKDIR /workspace

# Copy package config để tận dụng cache
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile || true

# Copy toàn bộ source code
COPY . .

CMD ["sleep", "infinity"]
