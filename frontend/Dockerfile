# syntax=docker/dockerfile:1.7
# ─── STAGE 1: deps — только node_modules ─────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app

# Alpine нужен libc6-compat для sharp (next/image image processor)
RUN apk add --no-cache libc6-compat openssl

COPY package.json package-lock.json ./
# Prisma 7 требует пакеты из prisma/ доступными на postinstall
COPY prisma ./prisma

# npm ci — точное соответствие lock-файлу, ускоряет и делает reproducible
# postinstall из package.json запустит prisma generate → положит client в src/generated
RUN npm ci

# ─── STAGE 2: builder — компилирует Next.js ──────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

RUN apk add --no-cache libc6-compat openssl

# Приносим deps и весь исходник
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma
COPY --from=deps /app/src/generated ./src/generated
COPY . .

# Отключаем телеметрию Next.js в build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Prisma-клиент уже есть из postinstall, но регенерируем на случай изменений
RUN npx prisma generate

# Билд генерирует .next/standalone/ (thanks to output: "standalone" в next.config.ts)
# и .next/static/, которые нужны отдельно
RUN npm run build

# ─── STAGE 3: runner — минимальный runtime ────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

# Runtime dependencies: sharp+libc6-compat + wget для healthcheck
RUN apk add --no-cache libc6-compat openssl wget

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Non-root пользователь для безопасности
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Стандартный public/ (шрифты, favicon)
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# .next/static нужен рядом со standalone (тот его ждёт по пути ./.next/static)
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Standalone — содержит server.js + минимальный node_modules
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

USER nextjs
EXPOSE 3000

# Healthcheck — Caddy будет полагаться на него для routing
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:3000/ || exit 1

# Standalone кладёт server.js в корень (не в .next/standalone/server.js)
CMD ["node", "server.js"]
