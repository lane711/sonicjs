#!/bin/bash
set -e

echo "🚀 Setting up Cloudflare resources for GitHub Actions CI/CD"
echo ""

cd my-sonicjs-app

# Check if credentials are set
if [ -z "$CLOUDFLARE_API_TOKEN" ] || [ -z "$CLOUDFLARE_ACCOUNT_ID" ]; then
    echo "❌ Error: CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID must be set"
    echo ""
    echo "Set them temporarily:"
    echo "  export CLOUDFLARE_API_TOKEN='your-token-here'"
    echo "  export CLOUDFLARE_ACCOUNT_ID='your-account-id-here'"
    exit 1
fi

echo "✅ Cloudflare credentials found"
echo ""

# 1. Create or get KV namespace for CI
echo "📦 Setting up KV namespace..."
KV_NAME="sonicjs-ci-cache"

# Check if KV exists
EXISTING_KV=$(npx wrangler kv namespace list --json 2>/dev/null | jq -r ".[] | select(.title == \"$KV_NAME\") | .id" || echo "")

if [ -n "$EXISTING_KV" ]; then
    echo "✅ KV namespace '$KV_NAME' already exists: $EXISTING_KV"
    KV_ID="$EXISTING_KV"
else
    echo "Creating new KV namespace: $KV_NAME"
    CREATE_KV_OUTPUT=$(npx wrangler kv namespace create "$KV_NAME" 2>&1)
    echo "$CREATE_KV_OUTPUT"
    
    KV_ID=$(echo "$CREATE_KV_OUTPUT" | grep -oP 'id\s*=\s*"\K[^"]+' || echo "")
    
    if [ -z "$KV_ID" ]; then
        # Try getting it from list
        KV_ID=$(npx wrangler kv namespace list --json | jq -r ".[] | select(.title == \"$KV_NAME\") | .id")
    fi
    
    if [ -z "$KV_ID" ]; then
        echo "❌ Failed to create/get KV namespace"
        exit 1
    fi
    
    echo "✅ Created KV namespace: $KV_ID"
fi

# 2. Create or get R2 bucket for CI
echo ""
echo "📦 Setting up R2 bucket..."
R2_NAME="sonicjs-ci-media"

# Check if R2 bucket exists
EXISTING_R2=$(npx wrangler r2 bucket list --json 2>/dev/null | jq -r ".[] | select(.name == \"$R2_NAME\") | .name" || echo "")

if [ -n "$EXISTING_R2" ]; then
    echo "✅ R2 bucket '$R2_NAME' already exists"
else
    echo "Creating new R2 bucket: $R2_NAME"
    npx wrangler r2 bucket create "$R2_NAME"
    echo "✅ Created R2 bucket: $R2_NAME"
fi

# 3. Update wrangler.toml with CI resource IDs
echo ""
echo "📝 Updating wrangler.toml with CI resource IDs..."

# Backup original
cp wrangler.toml wrangler.toml.backup

# Update KV namespace
sed -i "s/id = \"[a-f0-9]*\"/id = \"$KV_ID\"/" wrangler.toml
sed -i "s/preview_id = \"[a-f0-9]*\"/preview_id = \"$KV_ID\"/" wrangler.toml

# Update R2 bucket
sed -i "s/bucket_name = \"[^\"]*\"/bucket_name = \"$R2_NAME\"/" wrangler.toml

echo "✅ Updated wrangler.toml"
echo ""

# Show the changes
echo "📋 Resource Configuration:"
echo "  KV Namespace ID: $KV_ID"
echo "  R2 Bucket Name: $R2_NAME"
echo ""

# Show relevant section of wrangler.toml
echo "📄 Updated wrangler.toml sections:"
echo ""
grep -A2 "r2_buckets" wrangler.toml
echo ""
grep -A2 "kv_namespaces" wrangler.toml
echo ""

echo "✅ Setup complete!"
echo ""
echo "📌 Next steps:"
echo "  1. Review the changes in wrangler.toml"
echo "  2. Commit and push:"
echo "     git add my-sonicjs-app/wrangler.toml"
echo "     git commit -m 'chore: update Cloudflare resource IDs for CI'"
echo "     git push origin main"
echo "  3. Re-run GitHub Actions"
echo ""
echo "💾 A backup was saved to: my-sonicjs-app/wrangler.toml.backup"
