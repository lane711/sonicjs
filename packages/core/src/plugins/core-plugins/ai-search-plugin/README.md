# AI Search Plugin for SonicJS

Advanced search capabilities using Cloudflare AI Search. Provides semantic search, full-text search, and advanced filtering across all content collections.

## Features

- ✅ **AI-Powered Semantic Search**: Natural language queries with semantic understanding
- ✅ **Traditional Keyword Search**: Fast keyword-based search as fallback
- ✅ **Dynamic Collection Discovery**: Automatically discovers and adapts to your collections
- ✅ **New Collection Detection**: Notifies when new collections are available for indexing
- ✅ **Advanced Filtering**: Filter by collections, dates, status, tags, and more
- ✅ **Autocomplete Suggestions**: Real-time search suggestions as you type
- ✅ **Search Analytics**: Track search queries, popular terms, and usage patterns
- ✅ **Index Status Tracking**: Monitor indexing progress for each collection
- ✅ **Real-time Indexing**: Automatic updates when content changes

## Installation

The AI Search plugin is a core plugin and is included by default in SonicJS.

### 1. Configure Cloudflare AI Search

1. Go to [Cloudflare Dashboard → AI Search](https://dash.cloudflare.com/?to=/:account/ai-search)
2. Create a new AI Search index
3. Configure the binding in your `wrangler.toml`:

```toml
# Cloudflare AI Search binding is configured via Cloudflare Dashboard
# The binding name will be available as env.AI_SEARCH in Workers
```

### 2. Install Plugin

1. Navigate to **Admin → Plugins**
2. Find "AI Search" in the list
3. Click "Install" and then "Activate"

### 3. Configure Settings

1. Navigate to **Admin → Plugins → AI Search**
2. Select collections to index (checkboxes)
3. Configure search preferences:
   - Enable/disable AI mode
   - Enable/disable autocomplete
   - Set cache duration
   - Set results per page
4. Click "Save Settings"

## Usage

### Advanced Search from Content Page

1. Navigate to **Admin → Content**
2. Click the "Advanced Search" button
3. Enter your search query
4. Select search mode (AI or Keyword)
5. Apply filters (collections, dates, status)
6. Click "Search"

### API Usage

```typescript
import { AISearchService } from '@sonicjs-cms/core/plugins'

const service = new AISearchService(db, aiSearch)

// Execute search
const results = await service.search({
  query: 'blog posts about security',
  mode: 'ai', // or 'keyword'
  filters: {
    collections: [1, 2],
    status: ['published'],
    dateRange: {
      start: new Date('2024-01-01'),
      end: new Date('2024-12-31'),
      field: 'created_at'
    }
  },
  limit: 20,
  offset: 0
})
```

### Autocomplete

```typescript
const suggestions = await service.getSearchSuggestions('blog')
// Returns: ['blog posts', 'blog categories', ...]
```

## Configuration

### Settings

- **Enable AI Search**: Toggle search functionality on/off
- **Enable AI/Semantic Search**: Enable natural language queries
- **Collections to Index**: Select which collections should be searchable
- **Enable Autocomplete**: Show search suggestions
- **Cache Duration**: How long to cache results (hours)
- **Results Per Page**: Maximum results per search
- **Index Media Metadata**: Include R2 media files in index

### New Collection Detection

When you create a new collection:

1. Visit **Admin → Plugins → AI Search**
2. You'll see a notification: "🔔 New Collection Available: 'Collection Name' - Add to search?"
3. Click "Add to Index" to start indexing
4. Or click "Dismiss" to ignore (won't notify again)

## Indexing

### Automatic Indexing

- When you select a collection, indexing starts automatically
- Progress is shown in real-time with status badges
- Indexing runs in the background (non-blocking)

### Manual Re-indexing

1. Go to **Admin → Plugins → AI Search**
2. Find the collection in "Index Status" panel
3. Click "Re-index" button

### Index Status

Status indicators:
- **pending**: Not yet indexed
- **indexing**: Currently being indexed (shows progress bar)
- **completed**: Fully indexed and ready
- **error**: Indexing failed (check error message)

## Search Modes

### AI/Semantic Search

- Natural language queries: "show me blog posts about Cloudflare security from last month"
- Semantic understanding of content
- Relevance scoring
- Best for complex queries

### Keyword Search

- Traditional LIKE queries
- Exact phrase matching
- Faster performance
- Best for simple searches

## Analytics

View search analytics in **Admin → Plugins → AI Search**:

- Total queries (last 30 days)
- AI vs Keyword usage breakdown
- Popular search terms
- Average query time

## Troubleshooting

### Search Not Working

1. Check plugin is installed and activated
2. Verify collections are selected for indexing
3. Check index status - collections should be "completed"
4. Verify Cloudflare AI Search binding is configured

### No Results Found

1. Ensure collections are indexed (check status)
2. Try keyword search mode as fallback
3. Check filters aren't too restrictive
4. Verify content exists in selected collections

### Indexing Stuck

1. Check for error messages in index status
2. Try manual re-indexing
3. Verify database connection
4. Check Cloudflare AI Search service status

## Future Enhancements

- Public-facing search page at `/search`
- Search result highlighting
- Saved searches
- Advanced relevance tuning UI
- Search export/reporting
- Integration with other plugins (FAQ, Blog, etc.)

## References

- [Cloudflare AI Search Documentation](https://developers.cloudflare.com/ai-search/)
- [Issue #362: Advanced search with Cloudflare Search](https://github.com/lane711/sonicjs/issues/362)
