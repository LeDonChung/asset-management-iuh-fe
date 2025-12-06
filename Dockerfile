# # Use the official Node.js 20 LTS Alpine image for smaller size
# FROM node:20-alpine

# # Add build argument for build number
# ARG BUILD_NUMBER=unknown
# ENV BUILD_NUMBER=${BUILD_NUMBER}

# # Set working directory
# WORKDIR /app

# # Install pnpm globally
# RUN npm install -g pnpm

# # Copy package files and install dependencies
# COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* ./
# RUN pnpm install --frozen-lockfile

# # Copy source code
# COPY . .

# # Build arguments for environment variables
# ARG NODE_ENV=production
# ARG NEXT_PUBLIC_API_URL
# ARG NEXT_PUBLIC_WS_URL
# ARG NEXT_PUBLIC_SOCKET_URL

# # Set environment variables
# ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
# ENV NEXT_PUBLIC_WS_URL=${NEXT_PUBLIC_WS_URL}
# ENV NEXT_PUBLIC_SOCKET_URL=${NEXT_PUBLIC_SOCKET_URL}
# ENV NODE_ENV=${NODE_ENV}

# # Debug - print environment variables during build
# RUN echo "=== Build-time environment variables ===" && \
#     echo "NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL}" && \
#     echo "NEXT_PUBLIC_WS_URL: ${NEXT_PUBLIC_WS_URL}" && \
#     echo "NEXT_PUBLIC_SOCKET_URL: ${NEXT_PUBLIC_SOCKET_URL}" && \
#     echo "NODE_ENV: ${NODE_ENV}"

# # Build the Next.js application
# RUN pnpm run build

# # Expose the port the app runs on
# EXPOSE 3002

# # Start the application
# CMD ["pnpm", "start"]
# Use the official Node.js 20 LTS Alpine image
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Build args
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_WS_URL
ARG NEXT_PUBLIC_SOCKET_URL
ARG NODE_ENV=production

# Make them available in build stage
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_WS_URL=${NEXT_PUBLIC_WS_URL}
ENV NEXT_PUBLIC_SOCKET_URL=${NEXT_PUBLIC_SOCKET_URL}
ENV NODE_ENV=${NODE_ENV}

# Copy dependency files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Debug values to verify build-time args
RUN echo "=== Build-time environment variables ===" && \
    echo "NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL" && \
    echo "NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL" && \
    echo "NEXT_PUBLIC_SOCKET_URL=$NEXT_PUBLIC_SOCKET_URL" && \
    echo "NODE_ENV=$NODE_ENV"

# Build Next.js app
RUN pnpm run build


# ==========================
# Production image
# ==========================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3002

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3002

CMD ["pnpm", "start"]
