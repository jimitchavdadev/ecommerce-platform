# ---- Base Stage: Install dependencies ----
FROM node:20-alpine AS base
WORKDIR /usr/src/app
RUN npm install -g pnpm

# ---- Dependencies Stage: Install production dependencies ----
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/
# In a monorepo, you might have shared packages too. This is a basic setup.
RUN pnpm install --prod --frozen-lockfile

# ---- Build Stage: Build the application ----
FROM base AS builder
WORKDIR /usr/src/app
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .
RUN pnpm run build --filter=api


# ---- Production Stage: Create the final, small image ----
FROM node:20-alpine AS runner
WORKDIR /usr/src/app

# Copy production dependencies from the 'deps' stage
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY --from=deps /usr/src/app/apps/api/node_modules ./apps/api/node_modules

# Copy the built application from the 'builder' stage
COPY --from=builder /usr/src/app/apps/api/dist ./apps/api/dist

# Copy Prisma schema and client generation assets
COPY apps/api/prisma ./apps/api/prisma
# The Prisma client was already generated in the build stage,
# but we ensure it's here for the runtime.
RUN npx prisma generate

WORKDIR /usr/src/app/apps/api

# The port your app will listen on within the container
EXPOSE 3001

# The command to run migrations and start the application
CMD ["pnpm", "start:prod"]
