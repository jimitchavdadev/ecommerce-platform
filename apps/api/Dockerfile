# ---- Base Stage: Setup Node and PNPM ----
FROM node:20-alpine AS base
WORKDIR /usr/src/app
RUN corepack enable
ENV CI=true

# ---- Build Stage: Install all deps, build, and prune for production ----
FROM base AS builder
WORKDIR /usr/src/app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter api exec prisma generate
# FIX: Corrected pnpm filter syntax
RUN pnpm --filter api run build
RUN pnpm prune --prod

# ---- Production Stage: Create the final, minimal image ----
FROM base AS runner
WORKDIR /usr/src/app

# Copy only the necessary production files from the builder stage
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/apps/api/dist ./apps/api/dist
COPY --from=builder /usr/src/app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /usr/src/app/apps/api/package.json ./apps/api/package.json

# Change to the api directory to run the final commands
WORKDIR /usr/src/app/apps/api

EXPOSE 3001

# The start command now runs migrations and starts the app
CMD ["pnpm", "start:prod"]