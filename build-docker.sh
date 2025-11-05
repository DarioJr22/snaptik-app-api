#!/bin/bash

echo "🐳 Building Docker image for SnapTik API..."

# Build the Docker image
docker build -t snaptik-api .

echo "✅ Docker image built successfully!"

# Optional: Run the container locally for testing
echo "🚀 To test locally, run:"
echo "docker run -p 3000:3000 snaptik-api"
echo ""
echo "📡 Then access: http://localhost:3000"