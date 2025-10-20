# Publishing Guide: @sonicjs-cms/core

This guide covers publishing the `@sonicjs-cms/core` package to npm.

## Prerequisites

1. **npm Account**: You need an npm account with publish access to the `@sonicjs-cms` scope
2. **npm Login**: Run `npm login` and authenticate
3. **Clean Build**: Ensure the package builds without errors
4. **Version Bump**: Update version in `package.json` and `src/index.ts`
5. **Changelog**: Update `CHANGELOG.md` with release notes

## Pre-Publish Checklist

### 1. Version Check

```bash
# Verify version is correct
grep version packages/core/package.json
grep VERSION packages/core/src/index.ts

# Should both show: 2.0.0-alpha.1 (or your target version)
```

### 2. Build Verification

```bash
cd packages/core

# Clean build
rm -rf dist/
npm run build

# Verify no errors
npm run type-check
```

### 3. Test Package Contents

```bash
# Dry run to see what will be published
npm pack --dry-run

# Verify includes:
# ✓ dist/ folder (all compiled files)
# ✓ migrations/ folder
# ✓ README.md
# ✓ CHANGELOG.md
# ✓ LICENSE
# ✓ package.json
```

### 4. Test Installation Locally

```bash
# Pack the package
npm pack

# In a test project
cd /tmp/test-sonicjs
npm init -y
npm install /path/to/sonicjs-cms-core-2.0.0-alpha.1.tgz

# Verify it installs correctly
```

## Publishing

### Alpha Release

For alpha releases (experimental):

```bash
cd packages/core

# Publish with alpha tag
npm publish --tag alpha --access public

# Users install with:
# npm install @sonicjs-cms/core@alpha
```

### Beta Release

For beta releases (feature complete, testing):

```bash
cd packages/core

# Update version to beta
# Edit package.json: "version": "2.0.0-beta.1"
# Edit src/index.ts: export const VERSION = '2.0.0-beta.1'

# Build
npm run build

# Publish with beta tag
npm publish --tag beta --access public

# Users install with:
# npm install @sonicjs-cms/core@beta
```

### Release Candidate

For release candidates (final testing):

```bash
cd packages/core

# Update version
# package.json: "version": "2.0.0-rc.1"
# src/index.ts: VERSION = '2.0.0-rc.1'

# Build and publish
npm run build
npm publish --tag rc --access public
```

### Stable Release

For stable production releases:

```bash
cd packages/core

# Update version (no pre-release suffix)
# package.json: "version": "2.0.0"
# src/index.ts: VERSION = '2.0.0'

# Update CHANGELOG.md with final release notes

# Build
npm run build

# Publish as latest (default tag)
npm publish --access public

# Users install with:
# npm install @sonicjs-cms/core
```

## Post-Publish

### 1. Verify Publication

```bash
# Check npm
npm view @sonicjs-cms/core

# Check specific version
npm view @sonicjs-cms/core@2.0.0-alpha.1

# Verify dist-tags
npm dist-tag ls @sonicjs-cms/core
```

### 2. Create Git Tag

```bash
# Tag the release
git tag v2.0.0-alpha.1
git push origin v2.0.0-alpha.1

# Or create GitHub release
gh release create v2.0.0-alpha.1 \
  --title "v2.0.0-alpha.1" \
  --notes "First alpha release of @sonicjs-cms/core"
```

### 3. Test Installation

```bash
# Fresh install
npm install @sonicjs-cms/core@alpha

# Verify imports work
node -e "const { createSonicJSApp } = require('@sonicjs-cms/core'); console.log('OK')"
```

### 4. Update Documentation

- Update docs.sonicjs.com with new version
- Update README examples if API changed
- Announce on Discord/Twitter
- Update starter template dependency version

## Version Strategy

### Pre-Release Versions

- `2.0.0-alpha.1` → `2.0.0-alpha.2` → `2.0.0-alpha.3`
- `2.0.0-beta.1` → `2.0.0-beta.2`
- `2.0.0-rc.1` → `2.0.0-rc.2`

### Stable Versions

- `2.0.0` → `2.0.1` (patch) → `2.0.2`
- `2.0.0` → `2.1.0` (minor) → `2.2.0`
- `2.0.0` → `3.0.0` (major)

### npm Tags

- `alpha` - Experimental, breaking changes expected
- `beta` - Feature complete, API stabilizing
- `rc` - Release candidate, final testing
- `latest` - Stable production release (default)

## Rollback

If you need to unpublish or deprecate:

```bash
# Deprecate a version (preferred over unpublish)
npm deprecate @sonicjs-cms/core@2.0.0-alpha.1 "Use 2.0.0-alpha.2 instead"

# Unpublish (only within 72 hours, use with caution)
npm unpublish @sonicjs-cms/core@2.0.0-alpha.1

# Update latest tag if needed
npm dist-tag add @sonicjs-cms/core@2.0.0-alpha.2 alpha
```

## Automation (Future)

### GitHub Actions Workflow

```yaml
# .github/workflows/publish.yml
name: Publish to npm

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'

      - name: Install dependencies
        run: |
          cd packages/core
          npm install

      - name: Build
        run: |
          cd packages/core
          npm run build

      - name: Publish
        run: |
          cd packages/core
          npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## Security

### npm 2FA

Enable two-factor authentication:

```bash
npm profile enable-2fa auth-and-writes
```

### Access Tokens

Use automation tokens for CI/CD:

```bash
# Create token at: https://www.npmjs.com/settings/YOUR_USERNAME/tokens
# Add as secret: NPM_TOKEN in GitHub
```

## Troubleshooting

### "Package name too similar to existing package"

- Ensure `@sonicjs-cms/core` scope is available
- Contact npm support if needed

### "403 Forbidden"

- Check you're logged in: `npm whoami`
- Verify you have publish access to the scope
- Check 2FA is set up correctly

### "Version already published"

- Bump the version number
- Cannot republish the same version

### "Missing required files"

- Check `package.json` `files` field
- Ensure `dist/` is built and included
- Use `npm pack --dry-run` to verify

## Package Size

Current package size:
- **Packed**: ~387 KB
- **Unpacked**: ~2.3 MB
- **Files**: 93

Includes:
- Compiled JavaScript (ESM + CJS)
- TypeScript definitions
- Source maps
- Documentation
- Migrations

## Support

- **npm Issues**: https://npm.community/
- **SonicJS Issues**: https://github.com/sonicjs/sonicjs/issues
- **Publishing Questions**: Ask in Discord

---

**Last Updated**: 2025-10-20
**Package Version**: 2.0.0-alpha.1
**Status**: Ready for alpha publication
