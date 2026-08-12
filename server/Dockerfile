# ── Build stage ──
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .

# ── Production stage ──
FROM node:20-alpine
RUN apk add --no-cache dumb-init
ENV NODE_ENV=production
WORKDIR /app

# Non-root user
RUN addgroup -g 1001 -S mlinzi && \
    adduser  -S mlinzi -u 1001 -G mlinzi
RUN mkdir -p uploads && chown -R mlinzi:mlinzi /app

COPY --from=build --chown=mlinzi:mlinzi /app .

USER mlinzi
EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:5000/ || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
