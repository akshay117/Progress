# Multi-stage Dockerfile for WeCare Insurance Portal
# Builds both frontend (React/Vite) and backend (Spring Boot) together

# =============================================================================
# Stage 1: Build Frontend
# =============================================================================
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend

# Copy frontend package files
COPY package*.json ./
RUN npm ci

# Copy frontend source code
COPY src ./src
COPY index.html ./
COPY vite.config.js ./

# Build frontend (uses VITE_API_BASE_URL from build args or env)
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN npm run build

# =============================================================================
# Stage 2: Build Backend
# =============================================================================
FROM maven:3.9-eclipse-temurin-17 AS backend-build
WORKDIR /app/backend

# Copy backend pom.xml first for better caching
COPY backend/pom.xml .
RUN mvn dependency:go-offline -B

# Copy backend source code
COPY backend/src ./src

# Build backend JAR
RUN mvn clean package -DskipTests

# =============================================================================
# Stage 3: Final Runtime Image
# =============================================================================
FROM eclipse-temurin:17-jre-alpine AS runtime

# Install nginx and supervisor
RUN apk add --no-cache nginx supervisor bash

WORKDIR /app

# Create directories and ensure nginx directories exist
RUN mkdir -p /app/database \
    /var/log/supervisor \
    /etc/supervisor/conf.d \
    /var/www/html \
    /var/log/nginx \
    /var/cache/nginx \
    /var/run/nginx \
    /etc/nginx/conf.d

# Copy backend JAR from build stage
COPY --from=backend-build /app/backend/target/insurance-portal-1.0.0.jar app.jar

# Copy frontend build from build stage
COPY --from=frontend-build /app/frontend/dist /var/www/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create supervisor configuration to run both services
RUN echo '[supervisord]' > /etc/supervisor/conf.d/supervisord.conf && \
    echo 'nodaemon=true' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'user=root' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo '' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo '[program:backend]' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'command=java -jar /app/app.jar' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'directory=/app' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'autostart=true' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'autorestart=true' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'startretries=3' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'environment=SERVER_PORT=5001' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'stderr_logfile=/var/log/supervisor/backend.err.log' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'stdout_logfile=/var/log/supervisor/backend.out.log' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo '' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo '[program:nginx]' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'command=nginx -g "daemon off;"' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'autostart=true' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'autorestart=true' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'priority=5' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'startsecs=0' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'stderr_logfile=/var/log/supervisor/nginx.err.log' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'stdout_logfile=/var/log/supervisor/nginx.out.log' >> /etc/supervisor/conf.d/supervisord.conf

# Expose port (Render sets PORT env variable dynamically)
EXPOSE 80

# Create entrypoint script to handle PORT dynamically
RUN echo '#!/bin/sh' > /entrypoint.sh && \
    echo 'PORT=${PORT:-80}' >> /entrypoint.sh && \
    echo 'echo "=== Starting WeCare Insurance Portal ==="' >> /entrypoint.sh && \
    echo 'echo "Render PORT environment variable: $PORT"' >> /entrypoint.sh && \
    echo '' >> /entrypoint.sh && \
    echo '# Update nginx config to listen on Render PORT' >> /entrypoint.sh && \
    echo 'if [ -f /etc/nginx/conf.d/default.conf ]; then' >> /entrypoint.sh && \
    echo '  echo "Updating nginx config to listen on port $PORT..."' >> /entrypoint.sh && \
    echo '  sed -i.bak "s/listen 80;/listen $PORT;/" /etc/nginx/conf.d/default.conf' >> /entrypoint.sh && \
    echo '  rm -f /etc/nginx/conf.d/default.conf.bak' >> /entrypoint.sh && \
    echo '  echo "Nginx config updated. Current listen directive:"' >> /entrypoint.sh && \
    echo '  grep "listen" /etc/nginx/conf.d/default.conf' >> /entrypoint.sh && \
    echo 'else' >> /entrypoint.sh && \
    echo '  echo "ERROR: nginx config file not found at /etc/nginx/conf.d/default.conf"' >> /entrypoint.sh && \
    echo '  ls -la /etc/nginx/conf.d/ || echo "conf.d directory listing failed"' >> /entrypoint.sh && \
    echo '  exit 1' >> /entrypoint.sh && \
    echo 'fi' >> /entrypoint.sh && \
    echo '' >> /entrypoint.sh && \
    echo '# Test nginx configuration' >> /entrypoint.sh && \
    echo 'echo "Testing nginx configuration..."' >> /entrypoint.sh && \
    echo 'nginx -t' >> /entrypoint.sh && \
    echo 'if [ $? -ne 0 ]; then' >> /entrypoint.sh && \
    echo '  echo "ERROR: Nginx configuration test failed!"' >> /entrypoint.sh && \
    echo '  echo "Nginx config contents:"' >> /entrypoint.sh && \
    echo '  cat /etc/nginx/conf.d/default.conf' >> /entrypoint.sh && \
    echo '  exit 1' >> /entrypoint.sh && \
    echo 'fi' >> /entrypoint.sh && \
    echo 'echo "Nginx configuration is valid"' >> /entrypoint.sh && \
    echo '' >> /entrypoint.sh && \
    echo '# Start supervisor' >> /entrypoint.sh && \
    echo 'echo "Starting services with supervisor..."' >> /entrypoint.sh && \
    echo 'exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf' >> /entrypoint.sh && \
    chmod +x /entrypoint.sh

# Start supervisor to manage both services
ENTRYPOINT ["/entrypoint.sh"]
