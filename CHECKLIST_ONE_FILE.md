# ✅ One-Page Checklist: Fix One `any` Type

Print this or keep it visible while working!

---

## Before You Start
- [ ] Run `./pre-work-checks.sh` to verify environment
- [ ] Check file in `ANY_TYPE_PROGRESS.md` → "Tomorrow's Plan"
- [ ] Check all current PRs have passed ✅
- [ ] Coffee ready ☕

---

## Phase 1: Setup (2 min)
```bash
cd ~/Documents/cursor-sonicjs/sonicjs/github/sonicjs

# Verify we're on main
git branch --show-current  # MUST show "main"

# Sync with upstream (lead's main)
git fetch upstream main
git merge upstream/main --no-edit
git push origin main

# Verify clean state
git status  # MUST show "working tree clean"
```
- [ ] On main branch ✅
- [ ] Fork synced with upstream ✅  
- [ ] Working tree clean ✅
- [ ] No unexpected test files ✅

---

## Phase 2: Branch & Edit (5 min)
```bash
git checkout -b refactor/types-FILENAME

# VERIFY you're on the new branch (CRITICAL!)
git branch --show-current  # MUST show refactor/types-FILENAME

# VERIFY branch is based on latest main
git log HEAD..main  # Should show nothing
```
- [ ] Branch created
- [ ] **VERIFIED on correct branch** ✅
- [ ] Branch based on latest main ✅
- [ ] Open file in editor
- [ ] Replace `any` with proper type
- [ ] Add imports if needed
- [ ] Save file
- [ ] Review changes: `git diff`
- [ ] **DOUBLE-CHECK still on correct branch** ✅

---

## Phase 3: LOCAL TESTS (10 min) ⚠️ CRITICAL
```bash
cd packages/core
npm run type-check    # MUST PASS
npm run lint          # MUST PASS
npm run build         # MUST PASS
cd ../..
```
- [ ] ✅ Type check PASSED
- [ ] ✅ Lint PASSED
- [ ] ✅ Build PASSED

**❌ If ANY fail: FIX and re-run all 3**

---

## Phase 4: Commit (2 min)
```bash
git add packages/core/src/PATH/FILE.ts
git add packages/core/dist/
git add packages/core/src/db/migrations-bundle.ts
git commit -m "refactor(types): replace 'any' in FILENAME

Addresses lane711/sonicjs#435

Changes:
- Line X: Changed any to ProperType

Testing:
- npm run type-check ✅
- npm run lint ✅  
- npm run build ✅

Impact:
- Before: N instances
- After: 0 instances"
```
- [ ] Files staged
- [ ] Commit message follows template

---

## Phase 5: Sync (3 min)
```bash
# Fetch latest from BOTH upstream and origin
git fetch upstream main
git fetch origin main

# Check for new commits
git log HEAD..origin/main
```

**If main has new commits:**
```bash
git rebase origin/main  # Cleaner than merge
cd packages/core && npm run type-check && npm run build && cd ../..
```
- [ ] Fetched from upstream ✅
- [ ] Fetched from origin ✅
- [ ] Checked for updates
- [ ] Rebased if needed
- [ ] Re-tested if rebased

**FINAL VERIFICATION:**
```bash
git branch --show-current  # MUST show refactor/types-FILENAME (NOT main!)
```
- [ ] **VERIFIED on correct branch before push** ✅

---

## Phase 6: Push (1 min)
```bash
git push -u origin refactor/types-FILENAME
```
- [ ] Pushed successfully
- [ ] Note PR URL

---

## Phase 7: Create PR (2 min)
```bash
gh pr create \
  --repo mmcintosh/sonicjs \
  --base main \
  --head refactor/types-FILENAME \
  --title "refactor(types): replace 'any' in FILENAME" \
  --body "See template in workflow doc"
```
- [ ] PR created
- [ ] PR # noted: ______

---

## Phase 8: WAIT FOR CI (10-15 min) ⏳

**DO NOT START NEXT FILE YET**

```bash
gh pr checks PR_NUMBER --repo mmcintosh/sonicjs --watch
```

### If CI Passes ✅:
- [ ] All checks green
- [ ] Update `ANY_TYPE_PROGRESS.md`
- [ ] **NOW can start next file**

### If CI Fails ❌:
- [ ] Check logs
- [ ] Fix issue locally
- [ ] Push fix
- [ ] Wait for CI again
- [ ] **DO NOT start next file**

---

## Phase 9: Upstream PR (2 min)
**ONLY after fork CI passes ✅**

```bash
gh pr create \
  --repo lane711/sonicjs \
  --base main \
  --head mmcintosh:refactor/types-FILENAME \
  --title "refactor(types): replace 'any' in FILENAME" \
  --body "[Same as fork PR]"
```
- [ ] Upstream PR created
- [ ] PR # noted: ______

---

## End of File Checklist
- [ ] Update `ANY_TYPE_PROGRESS.md`
- [ ] Note time taken: ______ min
- [ ] Note any issues encountered
- [ ] Note lessons learned

---

## ⏱️ Time Budget
- Setup: 2 min
- Edit: 5 min
- **Local tests: 10 min** ← Most important!
- Commit/sync: 5 min
- Push/PR: 3 min
- **CI wait: 15 min** ← Required!
- **Total: ~40 min per file**

---

## 🚨 NEVER:
- ❌ Skip Phase 3 (local tests)
- ❌ Push without running tests
- ❌ Start next file during CI
- ❌ Create upstream PR before fork passes

## ✅ ALWAYS:
- ✅ Run full test suite locally
- ✅ Wait for fork CI before upstream
- ✅ Update progress doc after each file
- ✅ One file at a time (initially)

---

**Remember:** It's better to do 1 file correctly than 10 files with failures! 🎯

---

Print Date: __________ | File #: _____ | Filename: ________________
