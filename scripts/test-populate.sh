#!/bin/bash

# Test script to populate database with dummy content
# Run this script to test the population endpoint

echo "🚀 Testing dummy content population..."
echo ""

# Default URL - change this to match your development server
BASE_URL="http://localhost:8787"

# Test the endpoint
echo "Making POST request to $BASE_URL/admin/populate-dummy-content"
echo ""

# Use curl to make the request
curl -X POST \
  "$BASE_URL/admin/populate-dummy-content" \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status Code: %{http_code}\n" \
  --include \
  --show-error \
  --fail-with-body

echo ""
echo "✅ Test completed!"
echo ""
echo "Note: If you get a 403 error, make sure you're logged in as an admin user."
echo "You can visit the admin panel first at: $BASE_URL/admin"