#!/bin/bash
# Switch wrangler.toml config based on target repository
# Usage: ./scripts/switch-wrangler-config.sh {upstream|fork|infowall}

TARGET=$1
WRANGLER_FILE="my-sonicjs-app/wrangler.toml"

if [ -z "$TARGET" ]; then
  echo "Usage: $0 {upstream|fork|infowall}"
  echo ""
  echo "Switches wrangler.toml configuration to match target repository's Cloudflare resources"
  exit 1
fi

case $TARGET in
  upstream)
    echo "🔄 Switching to upstream wrangler.toml config..."
    git checkout upstream/main -- $WRANGLER_FILE
    if [ $? -eq 0 ]; then
      echo "✅ Using upstream config (lane711/sonicjs)"
      echo "   - KV: a16f8246fc294d809c90b0fb2df6d363"
      echo "   - Ready for upstream PR submission"
    else
      echo "❌ Failed to checkout upstream config"
      exit 1
    fi
    ;;
    
  fork)
    echo "🔄 Switching to fork wrangler.toml config..."
    if [ -f "$WRANGLER_FILE.fork" ]; then
      cp "$WRANGLER_FILE.fork" "$WRANGLER_FILE"
      echo "✅ Using fork config (mmcintosh/sonicjs)"
      echo "   - Restored from $WRANGLER_FILE.fork"
    else
      echo "⚠️  No fork config found at $WRANGLER_FILE.fork"
      echo "   Using current config or checkout from origin/main"
      git checkout origin/main -- $WRANGLER_FILE 2>/dev/null
    fi
    ;;
    
  infowall)
    echo "🔄 Switching to infowall wrangler.toml config..."
    if [ -f "$WRANGLER_FILE.infowall" ]; then
      cp "$WRANGLER_FILE.infowall" "$WRANGLER_FILE"
      echo "✅ Using infowall config"
      echo "   - KV: f2df7de3ecbd4861a73b79df7a3c3fec"
      echo "   - Account: f61c658f1de7911b0a529f38308adb21"
      echo "   - Ready for infowall testing"
    else
      echo "❌ No infowall config found at $WRANGLER_FILE.infowall"
      echo "   Run: git show infowall/main:my-sonicjs-app/wrangler.toml > my-sonicjs-app/wrangler.toml.infowall"
      exit 1
    fi
    ;;
    
  *)
    echo "❌ Unknown target: $TARGET"
    echo "Usage: $0 {upstream|fork|infowall}"
    exit 1
    ;;
esac

echo ""
echo "📝 Current config:"
grep -A2 "binding = \"CACHE_KV\"" $WRANGLER_FILE | grep "id ="
