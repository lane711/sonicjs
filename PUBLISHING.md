# Publishing Guide

This guide explains how to publish new versions of SonicJS packages to npm.

## Prerequisites

1. You must be logged into npm with publish permissions:
   ```bash
   npm login
   ```

2. Verify you're logged in:
   ```bash
   npm whoami
   ```

3. Ensure all tests pass:
   ```bash
   npm test
   npm run e2e
   ```

## Quick Publishing

### Patch Release (Bug fixes - 2.0.4 → 2.0.5)
```bash
npm run release:patch
```

### Minor Release (New features - 2.0.4 → 2.1.0)
```bash
npm run release:minor
```

### Major Release (Breaking changes - 2.0.4 → 3.0.0)
```bash
npm run release:major
```

## What These Commands Do

Each `release:*` command automatically:
1. ✅ Bumps the version in `packages/core/package.json`
2. ✅ Updates the core version reference in `packages/create-app/src/cli.js`
3. ✅ Bumps the version in `packages/create-app/package.json`
4. ✅ Builds the core package
5. ✅ Publishes `@sonicjs-cms/core` to npm
6. ✅ Publishes `create-sonicjs` to npm

## Manual Publishing (Step by Step)

If you prefer more control, you can publish manually:

### 1. Bump the version
```bash
# For patch release (2.0.4 → 2.0.5)
npm run version:patch

# For minor release (2.0.4 → 2.1.0)
npm run version:minor

# For major release (2.0.4 → 3.0.0)
npm run version:major
```

This updates versions in:
- `packages/core/package.json`
- `packages/create-app/package.json`
- `packages/create-app/src/cli.js` (the core version used by create-sonicjs)

### 2. Review the changes
```bash
git diff
```

### 3. Commit the version bump
```bash
git add .
git commit -m "chore: release v2.0.5"
```

### 4. Publish to npm
```bash
# Publish both packages
npm run publish:all

# Or publish individually:
npm run publish:core        # Publishes @sonicjs-cms/core
npm run publish:create-app  # Publishes create-sonicjs
```

### 5. Create a git tag
```bash
# Use the version from packages/core/package.json
git tag v2.0.5
```

### 6. Push changes and tags
```bash
git push
git push --tags
```

## Package Versions

The monorepo maintains two npm packages:

- **@sonicjs-cms/core**: The core framework package
- **create-sonicjs**: The CLI tool for scaffolding new apps

When you bump the core version, the `sync-versions.js` script automatically:
- Updates the create-app CLI to install the new core version
- Bumps the create-sonicjs package version

## Version Synchronization

The `create-sonicjs` CLI hardcodes which version of `@sonicjs-cms/core` to install.
This is located at `packages/create-app/src/cli.js` line ~385:

```javascript
packageJson.dependencies = {
  '@sonicjs-cms/core': '^2.0.4',  // This gets auto-updated
  ...packageJson.dependencies
}
```

The `sync-versions.js` script keeps this in sync with the actual core version.

## Troubleshooting

### "You do not have permission to publish"
Run `npm login` and ensure you're authenticated with an account that has publish permissions.

### "Version already published"
You need to bump the version first. Run one of the `npm run version:*` commands.

### "No .npmrc file found"
Make sure you're in the repository root directory.

### Testing Locally Before Publishing

You can test the packages locally using npm link:

```bash
# In packages/core
cd packages/core
npm run build
npm link

# In your test app
cd /path/to/test-app
npm link @sonicjs-cms/core
```

### Publishing Beta Versions

To publish a beta version:

1. Manually set the version with a beta suffix:
   ```bash
   cd packages/core
   npm version 2.1.0-beta.1 --no-git-tag-version
   node ../../scripts/sync-versions.js
   ```

2. Publish with the beta tag:
   ```bash
   npm publish --workspace=@sonicjs-cms/core --tag beta
   npm publish --workspace=create-sonicjs --tag beta
   ```

3. Users can install with:
   ```bash
   npm create sonicjs@beta
   # or
   npm install @sonicjs-cms/core@beta
   ```

## After Publishing

1. **Verify on npm**: Check that packages are published:
   - https://www.npmjs.com/package/@sonicjs-cms/core
   - https://www.npmjs.com/package/create-sonicjs

2. **Test the CLI**: Try creating a new app:
   ```bash
   npm create sonicjs@latest my-test-app
   cd my-test-app
   npm install
   npm run dev
   ```

3. **Update documentation**: If there are breaking changes or new features, update:
   - README.md
   - CHANGELOG.md
   - Documentation site (www/)

4. **Create GitHub Release**: Create a release on GitHub with release notes:
   ```
   Title: v2.0.5
   Description: Bug fixes and improvements
   - Fixed database tools row click redirect issue
   - Added authentication middleware to database routes
   - Improved E2E test coverage
   ```

## CI/CD Integration (Future)

Consider setting up GitHub Actions to automate publishing:

```yaml
name: Publish to npm
on:
  push:
    tags:
      - 'v*'
jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      - run: npm ci
      - run: npm run publish:all
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```
