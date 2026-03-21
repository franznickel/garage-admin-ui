# =========================================
# Stage 1: Build the Angular Application
# =========================================
ARG NODE_VERSION=22.18.0-alpine
ARG NGINX_VERSION=alpine3.21

FROM node:${NODE_VERSION} AS builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN --mount=type=cache,target=/root/.npm \
    npm ci --legacy-peer-deps

COPY . .

RUN npm run build

# =========================================
# Stage 2: Serve with Nginx
# =========================================
FROM nginxinc/nginx-unprivileged:${NGINX_VERSION} AS runner

USER 0

COPY nginx.conf /etc/nginx/nginx.conf

COPY --from=builder /app/dist/*/browser /usr/share/nginx/html

RUN chmod -R g=u /usr/share/nginx/html

USER 1001

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:4004/ || exit 1

EXPOSE 4004

CMD ["nginx", "-c", "/etc/nginx/nginx.conf", "-g", "daemon off;"]
