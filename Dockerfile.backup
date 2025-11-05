# Use the official Node.js runtime as the base image
FROM node:18-alpine

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Set the working directory inside the container
WORKDIR /app

# Create a non-root user first
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy package files
COPY --chown=nodejs:nodejs package*.json ./

# Switch to nodejs user for npm install
USER nodejs

# Install dependencies
# Using npm install for compatibility with older lockfile versions
RUN npm install --only=production && \
    npm cache clean --force

# Copy the rest of the application code
COPY --chown=nodejs:nodejs . .

# Expose the port that the app runs on
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production \
    PORT=3000 \
    NPM_CONFIG_LOGLEVEL=warn

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application with dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]