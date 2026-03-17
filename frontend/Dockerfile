# syntax=docker/dockerfile:1

# ---- builder ----
FROM node:20-alpine AS builder

WORKDIR /app

# Layer cache: install deps before copying source so a source change doesn't
# bust the npm ci layer.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build


# ---- runtime ----
# nginx:1.27-alpine — pinned minor, not SHA, to get security patches without
# breaking changes. Update deliberately.
FROM nginx:1.27-alpine AS runtime

# Remove the default config; ours is injected by docker-compose via the
# nginx service, but we still want a clean slate in the image itself.
RUN rm /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

# nginx master process runs as root to bind :80, workers drop to the nginx
# user. Acceptable for a personal project container.
CMD ["nginx", "-g", "daemon off;"]
