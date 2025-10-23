# Documentation Site in Monorepo

This is the official documentation website for SonicJS, located at the root level of the monorepo.

## Monorepo Structure

```
sonicjs-ai/
├── packages/
│   ├── core/           # @sonicjs-cms/core - Core framework
│   └── create-app/     # create-sonicjs-app - Project scaffolder
├── www/                # Documentation website (this directory)
├── src/                # Main application (monolith)
├── migrations/         # Database migrations
├── templates/          # Project templates
├── docs/               # Internal/AI documentation
└── package.json        # Root workspace config
```

## Working in the Monorepo

### Running the Docs Site

```bash
# From monorepo root
npm run dev:www

# From this directory
cd www
npm run dev
```

The site will be available at http://localhost:3010

### Building

```bash
# From monorepo root
npm run build:www

# From this directory
npm run build
```

### Installing Dependencies

Always install from the monorepo root to ensure workspace linking works correctly:

```bash
# From monorepo root
npm install

# To add a new dependency to www
npm install some-package --workspace=www
```

## Deployment

The docs site is deployed separately from the main application to Cloudflare Pages:

```bash
# From monorepo root
npm run deploy:www

# From this directory
npm run deploy
```

## Integration with Core Package

While this docs site documents the `@sonicjs-cms/core` package, it doesn't directly depend on it. The docs are standalone and focus on explaining how to use SonicJS.

If you need to reference types or code from core in the docs, you can install it as a dev dependency:

```bash
npm install @sonicjs-cms/core --save-dev --workspace=www
```

## Port Configuration

The docs site runs on port `3010` to avoid conflicts with other services:

- Main app: `8787` (Wrangler dev server)
- Docs: `3010` (Next.js dev server)

## Version Sync

The www package version (`2.0.1`) should generally match the core package version for consistency, though this isn't strictly required since www is private and not published to npm.
