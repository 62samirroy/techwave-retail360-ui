# ==============================================================================
# TechWave Retail360 - Production Next.js 14 Frontend Dockerfile
# Optimized Standalone output with minimal image size and non-root execution
# ==============================================================================

# ---- Stage 1: Install Dependencies ----
FROM node:20-alpine AS deps

WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY package*.json ./
RUN npm ci

# ---- Stage 2: Build Application ----
FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Enable Next.js standalone output and disable telemetry
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV NEXT_OUTPUT_STANDALONE=true

# Next.js build args for public variables
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_STORE_NAME
ARG NEXT_PUBLIC_STORE_PHONE
ARG NEXT_PUBLIC_STORE_EMAIL
ARG NEXT_PUBLIC_WHATSAPP_PHONE
ARG NEXT_PUBLIC_RAZORPAY_KEY_ID

ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
ENV NEXT_PUBLIC_STORE_NAME=${NEXT_PUBLIC_STORE_NAME}
ENV NEXT_PUBLIC_STORE_PHONE=${NEXT_PUBLIC_STORE_PHONE}
ENV NEXT_PUBLIC_STORE_EMAIL=${NEXT_PUBLIC_STORE_EMAIL}
ENV NEXT_PUBLIC_WHATSAPP_PHONE=${NEXT_PUBLIC_WHATSAPP_PHONE}
ENV NEXT_PUBLIC_RAZORPAY_KEY_ID=${NEXT_PUBLIC_RAZORPAY_KEY_ID}

RUN npm run build

# ---- Stage 3: Production Runner ----
FROM node:20-alpine AS runner

WORKDIR /app

RUN apk add --no-cache curl dumb-init

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Non-root user setup
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy static assets and standalone bundle
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

# Healthcheck to verify frontend HTTP availability
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:3000 || exit 1

ENTRYPOINT ["/usr/bin/dumb-init", "--"]

CMD ["node", "server.js"]
