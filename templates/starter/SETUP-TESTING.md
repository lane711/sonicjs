# Local Testing Setup

This guide shows how to test the packages locally before publishing to npm.

## Setup npm link

### 1. Link the core package globally

```bash
cd packages/core
npm link
```

### 2. Create a test project

```bash
npx create-sonicjs@alpha my-test-app
# OR use local version:
cd packages/create-app
node bin/create-sonicjs-app.js my-test-app \
  --template=starter \
  --database=test-db \
  --bucket=test-media \
  --include-example \
  --skip-cloudflare \
  --skip-git
```

### 3. Link core package in test app

```bash
cd my-test-app
npm link @sonicjs-cms/core
```

### 4. Make changes and test

When you make changes to `packages/core`:

```bash
cd packages/core
npm run build  # Rebuild after changes
```

The changes will be immediately available in your linked test app!

### 5. Unlink when done

```bash
cd my-test-app
npm unlink @sonicjs-cms/core
npm install  # Reinstall from npm
```

## Running E2E Tests

### Option 1: Run tests against linked package

```bash
cd my-test-app
npm link @sonicjs-cms/core
npm run test:e2e
```

### Option 2: Run tests against local build

```bash
cd packages/core
npm pack  # Creates a .tgz file

cd ../../my-test-app
npm install ../packages/core/sonicjs-cms-core-2.0.0-alpha.3.tgz
npm run test:e2e
```

### Option 3: Test the actual published version

```bash
cd my-test-app
npm install @sonicjs-cms/core@alpha
npm run test:e2e
```

## Current Known Issues

### 404 on root route

The core package doesn't include HTTP routes yet - they're placeholders. Routes need to be migrated from the monolith (`src/routes/`) to the core package (`packages/core/src/routes/`).

**Temporary workaround**: Add routes in your application's index.ts:

```typescript
import { createSonicJSApp } from '@sonicjs-cms/core'
import { Hono } from 'hono'

const customRoutes = new Hono()

customRoutes.get('/', (c) => {
  return c.html('<h1>Welcome to SonicJS!</h1>')
})

const app = createSonicJSApp({
  routes: [{ path: '/', handler: customRoutes }]
})

export default app
```

## Testing Workflow

1. Make changes to `packages/core`
2. Build: `npm run build`
3. Test locally with npm link
4. Run E2E tests
5. When ready, publish alpha version
6. Test published version in fresh project
7. If issues found, fix and repeat

## Debugging Tips

### Check which version is installed

```bash
npm list @sonicjs-cms/core
```

### Check if linked

```bash
ls -la node_modules/@sonicjs-cms/core
# If it's a symlink, it's linked
```

### Force reinstall from npm

```bash
npm unlink @sonicjs-cms/core
rm -rf node_modules/@sonicjs-cms/core
npm install @sonicjs-cms/core@alpha
```
