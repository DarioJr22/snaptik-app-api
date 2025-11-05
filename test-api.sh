#!/bin/bash

# Test script for SnapTik API endpoints

BASE_URL="http://localhost:3000"
SAMPLE_URL="https://www.tiktok.com/@test/video/123456789"

echo "🧪 Testing SnapTik API Endpoints"
echo "================================"

# Test 1: Health Check
echo -e "\n1️⃣ Testing Health Check..."
curl -s "$BASE_URL/" | jq '.'

# Test 2: Download endpoint
echo -e "\n2️⃣ Testing Download endpoint..."
curl -s -X POST "$BASE_URL/download" \
  -H "Content-Type: application/json" \
  -d "{\"url\": \"$SAMPLE_URL\"}" | jq '.'

# Test 3: Info endpoint  
echo -e "\n3️⃣ Testing Info endpoint..."
curl -s -X POST "$BASE_URL/info" \
  -H "Content-Type: application/json" \
  -d "{\"url\": \"$SAMPLE_URL\"}" | jq '.'

# Test 4: Invalid URL
echo -e "\n4️⃣ Testing Invalid URL..."
curl -s -X POST "$BASE_URL/download" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://invalid-url.com"}' | jq '.'

echo -e "\n✅ Tests completed!"