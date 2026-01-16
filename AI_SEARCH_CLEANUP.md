# 🚨 PR CLEANUP - STARTING NOW

## Current Branch: feature/ai-search-plugin (PR #483)

### Critical Issues Found:
1. ❌ **ACCOUNT ID EXPOSED**: `f61c658f1de7911b0a529f38308adb21` with email `Mmcintosh@infowall.com`
2. ❌ Your database ID: `6f8d5de1-4df4-44ac-99d4-8654e7c6b891`
3. ❌ 42 commits (needs squashing)
4. ❌ Session files and turnstile contamination mentioned in commits

### Action Steps for AI Search PR:

**Step 1: Create clean branch**
```bash
git checkout -b feature/ai-search-plugin-clean
```

**Step 2: Reset to main and keep changes**
```bash
git reset --soft origin/main
```

**Step 3: Revert wrangler.toml to upstream**
```bash
git checkout origin/main -- my-sonicjs-app/wrangler.toml
```

**Step 4: Check what AI-specific config is needed**
- Review if `[ai]` binding is required for this feature
- Review if vectorize binding is needed

**Step 5: Create one clean commit**

**Step 6: Force push and update PR**

---

## Question Before We Proceed:

**For AI Search Plugin - does it NEED**:
1. AI binding (`[ai]` in wrangler.toml)?
2. Vectorize binding?
3. Any other Cloudflare-specific config?

Or can it work with just the code changes?

---

**Ready to start cleanup?**
