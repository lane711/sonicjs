# Phase 2: Core Module Migration - Week 1

**Started**: 2025-01-17
**Status**: 🚧 In Progress
**Timeline**: 4 weeks
**Current**: Week 1 - Types, Utils, Database

## Week 1 Objectives

Move the foundation layers to `@sonicjs/core`:
- ✅ Types (Tier 1) - Zero dependencies
- ✅ Utils (Tier 2) - Depends on types only
- ✅ Database (Tier 1) - Independent layer

**Expected Outcome**: Core package with types, utils, and database layer buildable and testable.

## Week 1 Tasks

### Task 1: Install Dependencies ⏳
```bash
cd packages/core
npm install
```

### Task 2: Move Types
- Copy `src/types/` to `packages/core/src/types/`
- Create `packages/core/src/types/index.ts` with exports
- Update internal imports if needed
- Test build

### Task 3: Move Utils
- Copy `src/utils/` to `packages/core/src/utils/`
- Create `packages/core/src/utils/index.ts` with exports
- Update imports to use local types
- Test build

### Task 4: Move Database
- Copy `src/db/` to `packages/core/src/db/`
- Copy `migrations/` to `packages/core/migrations/`
- Create exports
- Test build

### Task 5: Verify Build
- Run `npm run build` in packages/core
- Verify dist/ output structure
- Check TypeScript definitions
- Test imports

## Progress Log

**2025-01-17 - Started Phase 2**
- Created Phase 2 plan document
- Set up todo tracking
- Beginning Task 1: Install dependencies

---

## Week 1 Success Criteria

- [ ] All dependencies installed
- [ ] Types, utils, database moved to core
- [ ] Package builds without errors
- [ ] TypeScript definitions generated
- [ ] No circular dependencies introduced
- [ ] Week 1 documentation complete
