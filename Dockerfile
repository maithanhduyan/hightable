# Stage 1: Build
FROM node:20-alpine AS builder

# Cài corepack và pnpm
RUN corepack enable && corepack prepare pnpm@8.15.5 --activate

WORKDIR /workspace


CMD [ "sleep", "infinity"]
