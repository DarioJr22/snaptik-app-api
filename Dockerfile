# Alternative Dockerfile for Railway (simpler approach)
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy all files
COPY . .

# Install all dependencies (including dev dependencies first, then remove them)
RUN npm install && \
    npm prune --production && \
    npm cache clean --force

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 && \
    chown -R nextjs:nodejs /app

USER nextjs

# Expose port
EXPOSE 3000

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Start the application
CMD ["npm", "start"]