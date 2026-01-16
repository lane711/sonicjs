# Wrangler Configuration Protocol

**Date:** January 16, 2026  
**Purpose:** Stop wrangler.toml conflicts between upstream, fork, and infowall

---

## The Problem

Different repositories have different Cloudflare account resources:

| Repository | KV Namespace ID | Account ID | DB ID |
|-----------|----------------|------------|-------|
| **Upstream** (lane711) | `a16f8246fc294d809c90b0fb2df6d363` | (upstream's) | (varies) |
| **Fork** (mmcintosh) | `a16f8246fc294d809c90b0fb2df6d363` | (fork's) | (varies) |
| **Infowall** | `f2df7de3ecbd4861a73b79df7a3c3fec` | `f61c658f1de7911b0a529f38308adb21` | `a331db92...` |

When you branch from upstream and push to fork/infowall, CI fails because KV namespace IDs don't match.

---

## The Solution: Branch-Specific Configs

### Step 1: Save Your Configs

Create backup files that Git will ignore:

```bash
# Save infowall config
cp my-sonicjs-app/wrangler.toml my-sonicjs-app/wrangler.toml.infowall

# Save fork config (if different from upstream)
cp my-sonicjs-app/wrangler.toml my-sonicjs-app/wrangler.toml.fork
```

### Step 2: Use This Script When Switching

Create `scripts/switch-wrangler-config.sh`:

```bash
#!/bin/bash
# Switch wrangler.toml config based on target

TARGET=$1

case $TARGET in
  upstream)
    echo "Using upstream wrangler.toml (no changes needed)"
    git checkout upstream/main -- my-sonicjs-app/wrangler.toml
    ;;
  fork)
    echo "Using fork wrangler.toml config"
    cp my-sonicjs-app/wrangler.toml.fork my-sonicjs-app/wrangler.toml
    ;;
  infowall)
    echo "Using infowall wrangler.toml config"
    cp my-sonicjs-app/wrangler.toml.infowall my-sonicjs-app/wrangler.toml
    ;;
  *)
    echo "Usage: $0 {upstream|fork|infowall}"
    exit 1
    ;;
esac

echo "✅ Wrangler config switched to: $TARGET"
```

### Step 3: Use in Workflow

```bash
# When creating a PR for upstream:
git checkout -b fix/some-feature upstream/main
# DON'T change wrangler.toml - keep upstream's config
npm run build:core
git add packages/core/
git commit -m "fix: something"

# To test on fork (optional):
./scripts/switch-wrangler-config.sh fork
git push origin fix/some-feature
# Revert: git checkout upstream/main -- my-sonicjs-app/wrangler.toml

# To test on infowall:
./scripts/switch-wrangler-config.sh infowall
git add my-sonicjs-app/wrangler.toml
git commit -m "chore: infowall config [skip ci]"
git push infowall fix/some-feature

# Before submitting upstream:
./scripts/switch-wrangler-config.sh upstream
git add my-sonicjs-app/wrangler.toml
git commit -m "chore: revert to upstream config [skip ci]"
git push upstream fix/some-feature
```

---

## Better Solution: Skip Fork/Infowall CI for Upstream PRs

For PRs destined for upstream, **don't test on fork/infowall CI**. Instead:

### Option A: Manual Local Testing (Recommended)

```bash
# Test locally with your config
cd my-sonicjs-app
npm run dev
# Manually test the feature

# Then submit to upstream with THEIR config unchanged
git checkout -b fix/feature upstream/main
# Make your changes
# DON'T touch wrangler.toml
git push upstream fix/feature
```

### Option B: Test on Infowall Only

```bash
# Branch from upstream
git checkout -b fix/feature upstream/main

# Make feature changes
# Commit feature

# Create separate test branch for infowall
git checkout -b fix/feature-infowall-test
./scripts/switch-wrangler-config.sh infowall
git add my-sonicjs-app/wrangler.toml
git commit -m "chore: infowall config for testing [skip ci]"
git push infowall fix/feature-infowall-test

# When tests pass, submit original branch to upstream
git checkout fix/feature
git push upstream fix/feature  # Has upstream's config
```

---

## Current Slug Dropdown Situation

### For This PR:

1. **Fork PR #18** - Has upstream config, will fail CI ❌
   - **Solution:** Close it or ignore CI failure
   - **Reason:** We can't fix fork CI without fork-specific resources

2. **Infowall PR #5** - Needs infowall config ✅
   - **Solution:** Already pushed with infowall config
   - **Status:** CI running with correct config

3. **Upstream PR** - Will use upstream config ✅
   - **Solution:** Create from current branch (already has upstream config)
   - **Timing:** After infowall CI passes

---

## Why This Happens

GitHub Actions **should** handle database IDs (it does), but **KV namespace IDs are hardcoded** in wrangler.toml and differ per account.

**Upstream's approach:**
- Uses specific KV namespace ID in wrangler.toml
- GitHub Actions updates database name/ID per PR
- But KV ID stays the same (assumes it exists in your account)

**The mismatch:**
- Fork/infowall don't have upstream's KV namespace
- Deployment fails looking for non-existent KV resource

---

## Long-Term Fix Recommendations

### For Upstream (lane711)

Suggest to upstream maintainer:

```toml
# Instead of hardcoded KV ID:
[[kv_namespaces]]
binding = "CACHE_KV"
id = "a16f8246fc294d809c90b0fb2df6d363"  # ← This fails on forks

# Use environment variable:
[[kv_namespaces]]
binding = "CACHE_KV"
id = "${KV_NAMESPACE_ID}"  # ← Forks can set their own

# Then GitHub Actions can inject it:
# env:
#   KV_NAMESPACE_ID: ${{ secrets.KV_NAMESPACE_ID }}
```

### For Your Workflow

**Best practice going forward:**

1. ✅ **DO:** Branch from upstream/main for upstream PRs
2. ✅ **DO:** Keep upstream's wrangler.toml unchanged
3. ✅ **DO:** Test locally or on infowall with swapped config
4. ❌ **DON'T:** Commit wrangler.toml changes to upstream PRs
5. ❌ **DON'T:** Try to run fork CI for upstream-destined PRs

---

## Quick Reference Commands

```bash
# Create the switch script
cat > scripts/switch-wrangler-config.sh << 'EOF'
#!/bin/bash
TARGET=$1
case $TARGET in
  upstream) git checkout upstream/main -- my-sonicjs-app/wrangler.toml ;;
  fork) cp my-sonicjs-app/wrangler.toml.fork my-sonicjs-app/wrangler.toml 2>/dev/null || echo "No fork config saved" ;;
  infowall) cp my-sonicjs-app/wrangler.toml.infowall my-sonicjs-app/wrangler.toml ;;
  *) echo "Usage: $0 {upstream|fork|infowall}"; exit 1 ;;
esac
echo "✅ Config: $TARGET"
EOF
chmod +x scripts/switch-wrangler-config.sh

# Save current configs
cp my-sonicjs-app/wrangler.toml my-sonicjs-app/wrangler.toml.infowall

# Switch configs as needed
./scripts/switch-wrangler-config.sh infowall  # For infowall testing
./scripts/switch-wrangler-config.sh upstream  # For upstream PRs
```

---

## Current Branch Status

**Branch:** `fix/slug-field-type-dropdown`

**Wrangler.toml state:**
- ✅ Currently has upstream config (correct for upstream PR)
- ✅ Infowall branch has infowall config commit on top
- ❌ Fork PR has upstream config (will fail CI, but that's OK)

**Next steps:**
1. Let infowall CI complete
2. Submit to upstream with upstream config (already correct)
3. Ignore fork CI failure (expected with upstream config)

---

## Summary

**The Root Cause:** KV namespace IDs are account-specific and hardcoded in wrangler.toml

**The Workaround:** Keep separate config files and swap them based on target repository

**The Best Practice:** For upstream PRs, keep upstream's config and test locally/manually

**This PR:** 
- Fork CI will fail (expected, ignore it)
- Infowall CI should pass (has infowall config)
- Upstream PR will work (has upstream config)

---

**Stop fighting the config - work with it using this protocol!** 🎯
