#!/bin/bash

# Contact Form Plugin - Create Draft PR
# =====================================

echo "🚀 Creating Draft PR for Contact Form Plugin"
echo ""
echo "Branch: feature/contact-plugin-v1"
echo "From: mmcintosh/sonicjs"
echo "To: lane711/sonicjs (upstream)"
echo ""

# Option 1: Via GitHub Web Interface (RECOMMENDED)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "OPTION 1: Create via GitHub Web Interface"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Visit: https://github.com/mmcintosh/sonicjs/pull/new/feature/contact-plugin-v1"
echo ""
echo "2. Set PR details:"
echo "   - Base repository: lane711/sonicjs"
echo "   - Base branch: main"
echo "   - Compare repository: mmcintosh/sonicjs"  
echo "   - Compare branch: feature/contact-plugin-v1"
echo ""
echo "3. Title:"
echo "   feat: Add professional contact form plugin with Google Maps integration"
echo ""
echo "4. Copy description from: PR-DRAFT.md"
echo ""
echo "5. Click 'Create draft pull request' button"
echo ""
echo "6. Add labels: plugin, enhancement, documentation"
echo ""

# Option 2: Using GitHub CLI
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "OPTION 2: Create via GitHub CLI (if installed)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "# Install GitHub CLI first:"
echo "sudo apt install gh"
echo "# or"
echo "brew install gh"
echo ""
echo "# Then authenticate:"
echo "gh auth login"
echo ""
echo "# Create draft PR:"
cat << 'EOF'
gh pr create \
  --draft \
  --title "feat: Add professional contact form plugin with Google Maps integration" \
  --body-file PR-DRAFT.md \
  --base lane711:main \
  --head mmcintosh:feature/contact-plugin-v1 \
  --label "plugin,enhancement,documentation"
EOF
echo ""

# Quick links
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "QUICK LINKS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Your branch:"
echo "https://github.com/mmcintosh/sonicjs/tree/feature/contact-plugin-v1"
echo ""
echo "Your commit:"
echo "https://github.com/mmcintosh/sonicjs/commit/45e2d4ff"
echo ""
echo "Create PR:"
echo "https://github.com/lane711/sonicjs/compare/main...mmcintosh:sonicjs:feature/contact-plugin-v1"
echo ""
echo "Upstream repo:"
echo "https://github.com/lane711/sonicjs"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ PR DRAFT DESCRIPTION READY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Description saved to: PR-DRAFT.md"
echo ""
echo "Next steps:"
echo "  1. Create draft PR using Option 1 (web) or Option 2 (CLI)"
echo "  2. Test on fresh SonicJS installation"
echo "  3. Deploy to Cloudflare Workers"
echo "  4. Update PR with test results"
echo "  5. Mark PR as 'Ready for Review'"
echo ""



