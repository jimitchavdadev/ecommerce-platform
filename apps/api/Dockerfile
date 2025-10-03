# ---- Base Stage: Install dependencies ----
FROM node:20-alpine AS base
WORKDIR /usr/src/app
# Use corepack to enable pnpm
RUN corepack enable

# ---- Dependencies Stage: Install production dependencies ----
FROM base AS deps
WORKDIR /usr/src/app
COPY pnpm-lock.yaml ./
COPY package.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/ packages/
RUN pnpm install --prod --frozen-lockfile

# ---- Build Stage: Build the application ----
FROM base AS builder
WORKDIR /usr/src/app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm run build --filter=api


# ---- Production Stage: Create the final, small image ----
FROM node:20-alpine AS runner
WORKDIR /usr/src/app

# Copy production dependencies from the 'deps' stage
COPY --from=deps /usr/src/app/node_modules ./node_modules

# This is the line that was causing the error and has been REMOVED:
# COPY --from=deps /usr/src/app/apps/api/node_modules ./apps/api/node_modules

# Copy the built application from the 'builder' stage
COPY --from=builder /usr/src/app/apps/api/dist ./apps/api/dist

# Copy Prisma schema and client generation assets
COPY apps/api/prisma ./apps/api/prisma

# Change to the api directory before running commands
WORKDIR /usr/src/app/apps/api

# Generate the Prisma client
RUN pnpm exec prisma generate

# The port your app will listen on within the container
EXPOSE 3001

# The command to run migrations and start the application
CMD ["pnpm", "start:prod"]