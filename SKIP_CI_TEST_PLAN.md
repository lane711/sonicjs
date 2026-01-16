# Skip CI Fix - Test Plan

**Date:** January 14, 2026  
**Purpose:** Test the skip CI functionality after implementation

---

## Implementation Status

**Current:** Not yet implemented  
**Next:** Add skip check job to `.github/workflows/pr-tests.yml`

---

## Test Plan

### Test 1: Skip CI with `[skip ci]` in Commit Message

**Purpose:** Verify that commits with `[skip ci]` skip the test job

**Steps:**
1. Create a test branch: `test/skip-ci-validation`
2. Make a small change (e.g., update a comment or add whitespace)
3. Commit with message: `test: verify skip ci works [skip ci]`
4. Push to trigger PR or push event
5. **Expected:** Test job should be skipped, only `check-skip` job runs

**Verification:**
- Check GitHub Actions run
- `check-skip` job should complete successfully
- `test` job should show "Skipped" status
- No deployment or test execution should occur

---

### Test 2: Normal CI Run (No Skip)

**Purpose:** Verify that commits without skip instructions run normally

**Steps:**
1. On same test branch: `test/skip-ci-validation`
2. Make another small change
3. Commit with message: `test: verify normal ci runs`
4. Push to trigger PR or push event
5. **Expected:** Both `check-skip` and `test` jobs should run normally

**Verification:**
- Check GitHub Actions run
- `check-skip` job should complete and output `skip=false`
- `test` job should run normally (deploy, test, etc.)

---

### Test 3: Multiple Skip Variations

**Purpose:** Verify all skip instruction formats work

**Test Cases:**
1. `[skip ci]` - Standard format
2. `[ci skip]` - Alternative format
3. `[no ci]` - Alternative format
4. `[skip actions]` - Alternative format
5. `[actions skip]` - Alternative format
6. `skip-checks:true` - Trailer format (needs two blank lines before)

**Steps:**
For each format:
1. Commit with that format in message
2. Push and verify test job is skipped

**Verification:**
- All formats should result in skipped test job

---

### Test 4: Case Insensitivity

**Purpose:** Verify skip instructions work regardless of case

**Test Cases:**
- `[SKIP CI]`
- `[Skip Ci]`
- `[skip CI]`

**Steps:**
1. Commit with uppercase/mixed case skip instruction
2. Push and verify test job is skipped

**Verification:**
- Case variations should all work

---

### Test 5: Skip in Middle of Message

**Purpose:** Verify skip works even if not at start/end of message

**Test Cases:**
- `feat: add feature [skip ci] and more text`
- `[skip ci] feat: add feature`
- `feat: add feature - [skip ci]`

**Steps:**
1. Commit with skip instruction in various positions
2. Push and verify test job is skipped

**Verification:**
- Skip should work regardless of position in commit message

---

### Test 6: Pull Request Target Event

**Purpose:** Verify skip works with `pull_request_target` event

**Steps:**
1. Create PR from fork
2. Add commit with `[skip ci]` to PR branch
3. Push commit
4. **Expected:** Test job should be skipped

**Verification:**
- PR should update without triggering test job
- Only `check-skip` job should run

---

### Test 7: Push Event

**Purpose:** Verify skip works with `push` event

**Steps:**
1. Push directly to branch (not via PR)
2. Commit with `[skip ci]`
3. Push commit
4. **Expected:** Test job should be skipped

**Verification:**
- Push event should respect skip instruction
- Test job should be skipped

---

## Implementation Checklist

Before testing, ensure:

- [ ] `check-skip` job is added to workflow
- [ ] `check-skip` job checks commit message for skip instructions
- [ ] `check-skip` job outputs `should-skip` value
- [ ] `test` job depends on `check-skip` job
- [ ] `test` job has condition: `if: needs.check-skip.outputs.should-skip != 'true'`
- [ ] Skip check handles both `pull_request_target` and `push` events
- [ ] Skip check is case-insensitive
- [ ] Skip check handles all skip instruction formats

---

## Test Execution Order

1. **First:** Test 1 (basic skip functionality) - Most important
2. **Second:** Test 2 (normal run) - Verify we didn't break normal flow
3. **Third:** Test 3 (all formats) - Verify robustness
4. **Fourth:** Test 6 & 7 (both events) - Verify works for all triggers
5. **Last:** Tests 4 & 5 (edge cases) - Polish

---

## Success Criteria

✅ **All tests pass** = Skip CI fix is working correctly

**Minimum viable:** Tests 1 and 2 must pass (basic skip + normal run)

---

## Rollback Plan

If tests fail:
1. Revert workflow changes
2. Document what didn't work
3. Try alternative implementation approach

---

## Post-Testing Cleanup

After successful testing:
1. Delete test branch: `test/skip-ci-validation`
2. Update `WORKFLOW_UPSTREAM_REVERT_PROTOCOL.md` to confirm skip works
3. Update `STATE_JAN14_SKIP_CI_ISSUE.md` to mark as resolved

---

## Notes

- Test branch can be created on your fork (mmcintosh/sonicjs)
- No need to create PR to upstream for testing
- Can test multiple commits on same branch sequentially
- Each test should be quick (skip check runs fast)
