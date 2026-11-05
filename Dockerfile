# Pinned to the local Node version (node -v: v26.8.1). Verified on Docker Hub.
FROM node:26.8.1-alpine3.23 AS base
ENV NEXT_TELEMETRY_DISABLED=1
# Node 26 images no longer ship corepack, so install the pnpm version from package.json directly.
RUN npm install -g pnpm@10.17.0
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL \
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=$NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
# lib/env.ts validates server env at import, and page data is collected at build.
# These build-only placeholders never reach the runner stage, which starts from base.
ENV SUPABASE_URL=http://127.0.0.1:54321 \
    SUPABASE_SECRET_KEY=build-placeholder \
    UNSUBSCRIBE_TOKEN_SECRET=build-placeholder-build-placeholder-000 \
    SITE_URL=$NEXT_PUBLIC_SITE_URL
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM base AS runner
ENV NODE_ENV=production \
    HOSTNAME=0.0.0.0 \
    PORT=3000
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
USER node
EXPOSE 3000
CMD ["node", "server.js"]
