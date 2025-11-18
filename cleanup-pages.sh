#!/bin/bash

# Script to delete all Cloudflare Pages deployments for demo-sonicjs-com
# This is required before the project can be deleted

PROJECT_NAME="demo-sonicjs-com"
ACCOUNT_ID="f9d6328dc3115e621758a741dda3d5c4"

echo "Fetching all deployments..."
DEPLOYMENT_IDS=$(wrangler pages deployment list --project-name=$PROJECT_NAME --json 2>/dev/null | jq -r '.[].id')

if [ -z "$DEPLOYMENT_IDS" ]; then
    echo "No deployments found or error fetching deployments"
    exit 1
fi

TOTAL=$(echo "$DEPLOYMENT_IDS" | wc -l | tr -d ' ')
echo "Found $TOTAL deployments to delete"

CURRENT=0
for DEPLOYMENT_ID in $DEPLOYMENT_IDS; do
    CURRENT=$((CURRENT + 1))
    echo "[$CURRENT/$TOTAL] Deleting deployment: $DEPLOYMENT_ID"

    # Use Cloudflare API to delete the deployment
    curl -X DELETE \
        "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/pages/projects/$PROJECT_NAME/deployments/$DEPLOYMENT_ID" \
        -H "Authorization: Bearer $(wrangler whoami 2>&1 | grep 'API Token:' | awk '{print $3}')" \
        -s > /dev/null

    # Rate limit: sleep briefly between deletions
    sleep 0.5
done

echo "All deployments deleted! You can now delete the project with:"
echo "wrangler pages project delete $PROJECT_NAME"
