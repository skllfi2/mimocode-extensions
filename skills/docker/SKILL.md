---
name: docker
description: Use when working with Docker: building images, managing containers, docker-compose, troubleshooting, and optimization.
---

# Docker Guide

## Essential Commands

```bash
# Build image
docker build -t myapp:latest .

# Run container
docker run -d -p 8080:80 --name myapp myapp:latest

# List containers
docker ps -a

# View logs
docker logs -f myapp

# Execute command in container
docker exec -it myapp /bin/sh

# Stop and remove
docker stop myapp && docker rm myapp
```

## Dockerfile Best Practices

```dockerfile
# Use specific base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json first (layer caching)
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Use non-root user
USER node

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "server.js"]
```

## Docker Compose

```yaml
version: '3.8'
services:
  web:
    build: .
    ports:
      - "8080:80"
    depends_on:
      - db
    environment:
      - DATABASE_URL=postgres://db:5432/mydb

  db:
    image: postgres:16-alpine
    volumes:
      - pgdata:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=mydb

volumes:
  pgdata:
```

## Optimization

- **Multi-stage builds**: Reduce image size
- **Layer caching**: Order COPY instructions by change frequency
- **.dockerignore**: Exclude unnecessary files
- **Alpine images**: Use for smaller footprint
- **Health checks**: Add HEALTHCHECK instruction
