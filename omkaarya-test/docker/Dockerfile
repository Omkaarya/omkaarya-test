# Dockerfile — Omkaarya Development
FROM node:20-alpine

# Install build dependencies
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Install dependencies first (for better caching)
COPY package.json package-lock.json* ./
RUN npm install

# Copy source code
COPY . .

# Expose Next.js dev port
EXPOSE 3000

# Set environment to development
ENV NODE_ENV development

# Start development server
CMD ["npm", "run", "dev"]
