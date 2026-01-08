#!/bin/bash
# check-pr-ci.sh
# Automated CI status checker with failure log analysis
# Usage: ./check-pr-ci.sh <PR_NUMBER>

set -e

PR_NUMBER=$1
REPO="mmcintosh/sonicjs"

if [ -z "$PR_NUMBER" ]; then
    echo "❌ Error: Please provide PR number"
    echo "Usage: ./check-pr-ci.sh 2"
    exit 1
fi

echo "🔍 Checking PR #$PR_NUMBER CI status..."
echo ""

# Get PR checks
CHECKS=$(gh pr checks $PR_NUMBER --repo $REPO 2>&1)
echo "$CHECKS"
echo ""

# Check if any failed
if echo "$CHECKS" | grep -q "fail"; then
    echo "❌ CI FAILED - Analyzing logs..."
    echo ""
    
    # Get the run ID from the failed check
    RUN_ID=$(echo "$CHECKS" | grep "fail" | awk '{print $NF}' | grep -oP 'runs/\K[0-9]+' | head -1)
    
    if [ -n "$RUN_ID" ]; then
        echo "📋 Fetching failure logs from run $RUN_ID..."
        echo ""
        
        # Get and display failure logs
        gh run view $RUN_ID --repo $REPO --log-failed | grep -E "Error:|FAIL|✖|should allow" -A 15 | head -100
        
        echo ""
        echo "---"
        echo "💡 Next Steps:"
        echo "1. Analyze the error above"
        echo "2. Fix the issue locally"
        echo "3. Test locally (npm run type-check && npm run build)"
        echo "4. Push fix: git push"
        echo "5. Re-run this script to check again"
    else
        echo "⚠️ Could not extract run ID. Check manually:"
        echo "   gh pr view $PR_NUMBER --repo $REPO"
    fi
    
elif echo "$CHECKS" | grep -q "pending"; then
    echo "⏳ CI PENDING - Still running..."
    echo ""
    echo "💡 Options:"
    echo "1. Wait and run this script again in 5 minutes"
    echo "2. Watch live: gh pr checks $PR_NUMBER --repo $REPO --watch"
    
elif echo "$CHECKS" | grep -q "pass"; then
    echo "✅ CI PASSED - All checks green!"
    echo ""
    echo "💡 Next Steps:"
    echo "1. Create upstream PR (if not done yet)"
    echo "2. Update ANY_TYPE_PROGRESS.md"
    echo "3. Start next file (if following serial workflow)"
else
    echo "⚠️ Unknown status. Check manually:"
    echo "   gh pr view $PR_NUMBER --repo $REPO"
fi

echo ""
echo "🔗 PR URL: https://github.com/$REPO/pull/$PR_NUMBER"
