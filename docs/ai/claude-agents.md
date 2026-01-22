# SonicJS Claude Code Agents

This document provides comprehensive documentation for all Claude Code agents available in the SonicJS repository. These agents are specialized prompts that help automate common development, marketing, and maintenance tasks.

## Quick Reference

All agents are prefixed with `sonicjs-` for namespacing. Invoke them using the slash command format:

```
/sonicjs-<agent-name> [arguments]
```

## Agent Categories

### Development Agents

| Agent | Command | Purpose |
|-------|---------|---------|
| Fullstack Dev | `/sonicjs-fullstack-dev` | Full stack development with planning, testing, documentation |
| PR Fixer | `/sonicjs-pr-fixer` | Fix PRs: cherry-pick forks, enable Dependabot e2e, resolve issues |
| Release Engineer | `/sonicjs-release-engineer` | Manage releases, versioning, and changelogs |

### Marketing & Content Agents

| Agent | Command | Purpose |
|-------|---------|---------|
| Release Announcement | `/sonicjs-release-announcement` | Generate release announcements |
| SEO Expert | `/sonicjs-seo` | SEO optimization recommendations |
| SEO Blog | `/sonicjs-seo-blog` | Generate SEO-optimized blog posts |
| SEO Audit | `/sonicjs-seo-audit` | Audit website for SEO improvements |
| SEO Keywords | `/sonicjs-seo-keywords` | Keyword research for content |
| SEO Sitemap | `/sonicjs-seo-sitemap` | Generate/update sitemaps |
| Discord Sync | `/sonicjs-seo-discord-sync` | Sync Discord content for searchability |
| Social Post | `/sonicjs-social-post` | Generate social media posts |
| Blog Image | `/sonicjs-blog-image` | Generate blog images via DALL-E |

---

## Development Agents

### `/sonicjs-fullstack-dev`

**Purpose**: Expert full stack developer agent for building features with a systematic approach.

**Key Features**:
- Mandatory planning phase with documented plans in `docs/ai/plans/`
- Test-driven development (90% coverage target)
- Unit tests with Vitest, E2E tests with Playwright
- No regressions policy - all existing tests must pass

**Workflow**:
1. **Plan** - Create plan document, wait for approval
2. **Implement** - Use TodoWrite, commit frequently
3. **Unit Test** - 90% coverage on new code
4. **E2E Test** - Playwright specs for user workflows
5. **Regression Test** - Verify all tests pass

**Usage Examples**:
```
/sonicjs-fullstack-dev plan add-dark-mode
/sonicjs-fullstack-dev implement
/sonicjs-fullstack-dev test unit dark-mode
/sonicjs-fullstack-dev review
```

---

### `/sonicjs-pr-fixer`

**Purpose**: Fix and merge problematic PRs including fork PRs, Dependabot PRs, and any PR needing fixes.

**Modes**:

#### Mode 1: Fork PR Cherry-Pick
Cherry-pick commits from fork PRs while preserving contributor attribution.

```
/sonicjs-pr-fixer fork 532
/sonicjs-pr-fixer fork https://github.com/lane711/sonicjs/pull/532
```

**What it does**:
- Analyzes the fork PR
- Creates a new branch from main
- Cherry-picks commits (preserving original authorship)
- Handles merge conflicts with user guidance
- Runs tests and allows fixes with Co-Authored-By attribution
- Creates new PR crediting the original contributor

#### Mode 2: Dependabot PR Enabler
Enable e2e tests on Dependabot PRs by pushing human commits.

```
/sonicjs-pr-fixer dependabot              # List and select
/sonicjs-pr-fixer dependabot all          # All Dependabot PRs
/sonicjs-pr-fixer dependabot 123          # Specific PR
/sonicjs-pr-fixer dependabot 123,124      # Multiple PRs
```

**What it does**:
- Lists open Dependabot PRs
- Pushes empty commit to change workflow actor
- Enables access to repository secrets for e2e tests

#### Mode 3: Fix Any PR
Checkout and fix any PR with issues.

```
/sonicjs-pr-fixer fix 532
```

**What it does**:
- Checks out the PR branch
- Runs tests to identify issues
- Applies fixes with proper attribution
- Pushes updates

---

### `/sonicjs-release-engineer`

**Purpose**: Manage releases, versioning, and changelogs.

**Usage**:
```
/sonicjs-release-engineer
```

**What it does**:
- Determines next version based on commits
- Updates package versions
- Generates changelog entries
- Creates release PRs
- Tags releases

---

## Marketing & Content Agents

### `/sonicjs-release-announcement`

**Purpose**: Generate release announcements for various channels.

**Usage**:
```
/sonicjs-release-announcement
```

**Generates announcements for**:
- GitHub release notes
- Discord
- Twitter/X
- Blog posts

---

### `/sonicjs-seo`

**Purpose**: SEO expert for optimization recommendations.

**Usage**:
```
/sonicjs-seo
```

**What it does**:
- Analyzes pages for SEO issues
- Recommends improvements
- Suggests meta tags, structured data
- Identifies keyword opportunities

---

### `/sonicjs-seo-blog`

**Purpose**: Generate SEO-optimized blog posts.

**Usage**:
```
/sonicjs-seo-blog [topic]
```

**What it does**:
- Researches keywords
- Creates outline with SEO structure
- Writes optimized content
- Adds meta descriptions, titles

---

### `/sonicjs-seo-audit`

**Purpose**: Comprehensive SEO audit of the website.

**Usage**:
```
/sonicjs-seo-audit
```

**What it does**:
- Crawls site pages
- Identifies SEO issues
- Prioritizes fixes
- Generates audit report

---

### `/sonicjs-seo-keywords`

**Purpose**: Keyword research for content planning.

**Usage**:
```
/sonicjs-seo-keywords [topic]
```

**What it does**:
- Researches relevant keywords
- Analyzes competition
- Suggests content opportunities
- Groups keywords by intent

---

### `/sonicjs-seo-sitemap`

**Purpose**: Generate or update XML sitemaps.

**Usage**:
```
/sonicjs-seo-sitemap
```

**What it does**:
- Crawls site structure
- Generates sitemap.xml
- Sets priorities and frequencies
- Validates sitemap

---

### `/sonicjs-seo-discord-sync`

**Purpose**: Sync Discord content for searchability.

**Usage**:
```
/sonicjs-seo-discord-sync
```

**What it does**:
- Exports Discord discussions
- Converts to searchable content
- Creates FAQ pages
- Links to original discussions

---

### `/sonicjs-social-post`

**Purpose**: Generate social media posts.

**Usage**:
```
/sonicjs-social-post [topic]
```

**What it does**:
- Creates platform-specific posts
- Optimizes for engagement
- Suggests hashtags
- Provides posting schedule

---

### `/sonicjs-blog-image`

**Purpose**: Generate blog images using DALL-E.

**Usage**:
```
/sonicjs-blog-image [description]
```

**What it does**:
- Generates image prompts
- Creates images via ChatGPT/DALL-E
- Optimizes for web
- Suggests alt text

---

## Agent File Location

All agent definitions are stored in:
```
.claude/commands/sonicjs-*.md
```

## Creating New Agents

To create a new agent:

1. Create a new file in `.claude/commands/sonicjs-<name>.md`
2. Follow the existing agent structure:
   - Title and purpose
   - Background/context
   - Workflow steps
   - Usage examples
   - Important notes
   - Error handling

3. Update this documentation
4. Update `AGENTS.md` with the new agent

## Best Practices

1. **Always use TodoWrite** - Track progress for complex tasks
2. **Follow quality standards** - Use fullstack-dev standards for any code changes
3. **Preserve attribution** - Credit original contributors
4. **Document changes** - Keep plans and docs updated
5. **Test thoroughly** - No regressions allowed
