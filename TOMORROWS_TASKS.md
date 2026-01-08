# Tomorrow's Tasks - SonicJS PRs

## 🎯 Priority 1: Review & Submit Contact Form Fix

### Current Status:
- ✅ Fix implemented: Added `requireAuth()` middleware to admin routes
- ✅ Pushed to main branch
- ⏳ CI currently running: https://github.com/mmcintosh/sonicjs/actions
- 📋 Expected: Should fix the 401 error on line 69 of contact form test

### Action Items:
1. **Check CI Results** (morning)
   - Did the Contact Form test pass?
   - Any new failures?
   
2. **If CI Passes:**
   - Create PR to upstream
   - Branch: main (or create clean branch if needed)
   - Title: `fix(contact-form): apply requireAuth middleware to admin routes`

---

## 🎯 Priority 2: Review & Polish Migration 013 PR

### Current Status:
- ✅ Fix implemented on branch: `fix/migration-013-sql-syntax-error`
- ✅ Pushed to fork
- ✅ Documentation complete
- ⚠️ **NEEDS REVIEW**: Tone/wording might be too prescriptive

### Action Items:
1. **Review PR Description** (`PR_GUIDE_MIGRATION_013.md`)
   - ❌ Remove "should" language: "Migrations should focus on schema"
   - ❌ Remove prescriptive tone: "follows best practices"
   - ✅ Replace with collaborative: "This approach..."
   - ✅ Be humble: "One approach is...", "This fixes the immediate issue..."
   - ✅ Acknowledge it's his project: "Happy to adjust if you prefer a different approach"

2. **Suggested Tone Changes:**
   
   **Instead of:**
   > "Migrations should focus on schema, not sample content"
   
   **Try:**
   > "This fix removes the sample data from the migration to avoid the D1 parser issue. Sample data can still be added through the admin UI or Seed Data plugin."
   
   **Instead of:**
   > "Follows best practices for database migrations"
   
   **Try:**
   > "This approach keeps the migration simple and avoids the SQL parsing complexity."
   
   **Add at end:**
   > "Happy to adjust this approach if you have a preferred solution - I just wanted to unblock fresh installs quickly. Thanks for all your work on SonicJS!"

3. **Update PR_GUIDE_MIGRATION_013.md** with revised wording

4. **Submit PR to Upstream**
   - After wording review
   - Use revised description
   - Be respectful and helpful, not directive

---

## 🎯 Priority 3: Auto-Slug Feature (Optional)

### Current Status:
- ✅ Comprehensive plan created: `AUTO_SLUG_FEATURE_PLAN.md`
- ✅ Bug identified and solution documented
- 📋 Ready to implement when time permits

### Action Items:
- Review plan
- Create feature branch when ready
- Implement fix (simple one-line logic change)
- Add E2E tests

---

## 📊 Current CI Watch

**GitHub Actions:**
- Link: https://github.com/mmcintosh/sonicjs/actions
- Running: Contact Form requireAuth() fix
- Expected time: ~15 minutes total
- Key test: `should allow admin to enable the Google Map` (line 69)

**What We're Waiting For:**
- ✅ Pass: Contact Form test succeeds → Create PR
- ❌ Fail: Need to debug further

---

## 💡 Key Reminders

1. **Tone Matters**: This is a contribution to someone else's project
   - Be collaborative, not prescriptive
   - Offer solutions, don't dictate "best practices"
   - Show appreciation for their work
   
2. **Test First**: Always check CI before creating upstream PRs
   - Saves maintainer time
   - Shows professionalism
   
3. **Documentation**: Both fixes are well-documented
   - Easy for maintainer to review
   - Shows we did our homework

---

## 🌟 What We Accomplished Today

1. ✅ Identified root cause of Contact Form 401 error (missing auth middleware)
2. ✅ Fixed and pushed the fix
3. ✅ Identified critical Migration 013 bug (blocks all fresh installs)
4. ✅ Created comprehensive fix and documentation
5. ✅ Created multiple reference guides (Field Types, Auto-Slug plan)
6. ✅ Set up GitHub Actions CI documentation

**Two critical PRs ready to help the community!** 🚀

---

## 📝 Quick Start for Tomorrow

```bash
# 1. Check CI status
open https://github.com/mmcintosh/sonicjs/actions

# 2. If passed, review the wording changes needed
code PR_GUIDE_MIGRATION_013.md

# 3. Update and test locally
cd /home/siddhartha/Documents/cursor-sonicjs/sonicjs/github/sonicjs
git status
git log --oneline -5

# 4. Ready to submit PRs!
```

---

## 🎯 Success Criteria

- [ ] Contact Form CI passes
- [ ] Migration 013 PR wording reviewed and softened
- [ ] Both PRs submitted to upstream
- [ ] Maintainer has clear, helpful PRs to review

---

**Get some rest! Tomorrow we'll polish the wording and submit these contributions properly.** 😊
