#!/bin/bash
set -e

echo "🧪 Testing like CI does..."
echo ""

# Step 1: Clean slate
echo "1️⃣ Cleaning local environment..."
cd my-sonicjs-app
rm -rf .wrangler
cd ..

# Step 2: Build core
echo ""
echo "2️⃣ Building core package..."
npm run build:core

# Step 3: Delete and recreate local database
echo ""
echo "3️⃣ Setting up fresh local database..."
cd my-sonicjs-app

# The dev server will auto-create the database and run migrations on first start
echo "✅ Database will be created when dev server starts"

# Step 4: Start dev server in background
echo ""
echo "4️⃣ Starting dev server..."
npm run dev > /tmp/sonicjs-dev-server.log 2>&1 &
DEV_PID=$!
echo "Dev server PID: $DEV_PID"

# Step 5: Wait for server to be ready
echo ""
echo "5️⃣ Waiting for server to be ready..."
for i in {1..30}; do
  if curl -s -o /dev/null -w "%{http_code}" "http://localhost:8787" | grep -q "200\|301\|302"; then
    echo "✅ Server is ready!"
    break
  fi
  if [ $i -eq 30 ]; then
    echo "❌ Server failed to start"
    kill $DEV_PID 2>/dev/null || true
    exit 1
  fi
  echo "Attempt $i/30: Waiting..."
  sleep 2
done

# Step 6: Run E2E tests
echo ""
echo "6️⃣ Running E2E tests..."
cd ..
npm run e2e -- tests/e2e/37-contact-form-plugin.spec.ts --reporter=list

# Capture test exit code
TEST_EXIT_CODE=$?

# Step 7: Cleanup
echo ""
echo "7️⃣ Cleaning up..."
kill $DEV_PID 2>/dev/null || true
echo ""

if [ $TEST_EXIT_CODE -eq 0 ]; then
  echo "✅ ALL TESTS PASSED! 🎉"
else
  echo "❌ Tests failed with exit code: $TEST_EXIT_CODE"
  echo ""
  echo "📋 Dev server logs:"
  tail -50 /tmp/sonicjs-dev-server.log
fi

exit $TEST_EXIT_CODE
