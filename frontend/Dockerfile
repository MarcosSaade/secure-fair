FROM node:18-alpine AS build

WORKDIR /app

# Accept build-time env vars (baked into the Vite bundle)
ARG VITE_API_URL=http://localhost:8000
ARG VITE_APP_NAME="Secure Fair"
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_APP_NAME=$VITE_APP_NAME

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# ── Production stage ─────────────────────────────────────────────────────────
FROM nginx:alpine

# Copy built files
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
