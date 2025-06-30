# Graphiti MCP Server Setup

This document describes the setup and usage of the Graphiti MCP (Model Context Protocol) server for the SonicJS AI project.

## What is Graphiti?

Graphiti is a temporal knowledge graph system designed for AI agents. It enables:

- **Temporal Knowledge Graphs**: Build per-project temporal knowledge graphs that your AI agents can query
- **Dynamic Graph Management**: Automatically extracts entities & relationships from unstructured text and records every change as time-stamped episodes
- **Persistent Memory**: AI assistants can maintain context and memory across sessions

## Prerequisites

1. **Neo4j Database**: Required for graph storage
2. **OpenAI API Key**: Required for LLM operations and embeddings
3. **Python 3.10+**: Required for running the MCP server
4. **uv Package Manager**: Required for dependency management

## Installation Steps

### 1. Neo4j Database Setup

Start Neo4j using Docker:

```bash
cd .graphiti-mcp
docker-compose -f docker-compose.neo4j-only.yml up -d
```

This will start Neo4j with:
- Web interface: http://localhost:7474
- Bolt connection: bolt://localhost:7687
- Username: `neo4j`
- Password: `demodemo`

### 2. Environment Configuration

Edit `.graphiti-mcp/.env` and set your OpenAI API key:

```bash
OPENAI_API_KEY=your_actual_openai_api_key_here
```

### 3. Claude Desktop Configuration

The Claude Desktop configuration is already set up in `~/.config/claude-desktop/claude_desktop_config.json`. Update the `OPENAI_API_KEY` in the configuration:

```json
{
  "mcpServers": {
    "graphiti": {
      "env": {
        "OPENAI_API_KEY": "your_actual_openai_api_key_here"
      }
    }
  }
}
```

### 4. Restart Claude Desktop

After updating the configuration, restart Claude Desktop to load the new MCP server.

## Usage

Once configured, the Graphiti MCP server provides these tools to Claude:

- **add_episode**: Add information to the knowledge graph
- **search_nodes**: Search for entities in the graph
- **search_facts**: Search for relationships between entities
- **get_episodes**: Retrieve recent episodes
- **clear_graph**: Clear all graph data

The knowledge graph is namespaced to `sonicjs-ai` to keep project data separate.

## Testing the Integration

You can test if the integration is working by asking Claude to:

1. Remember project information: "Please remember that this project uses Hono.js framework"
2. Search for information: "What do you remember about this project's technology stack?"
3. Check status: "What's the status of the Graphiti knowledge graph?"

## Troubleshooting

### Neo4j Connection Issues

1. Ensure Neo4j is running: `docker ps`
2. Check Neo4j logs: `docker-compose -f .graphiti-mcp/docker-compose.neo4j-only.yml logs neo4j`
3. Verify connection: Open http://localhost:7474 in browser

### OpenAI API Issues

1. Verify your API key is valid
2. Check you have sufficient API credits
3. Ensure the key is set in both `.env` and Claude Desktop config

### MCP Server Issues

1. Check Claude Desktop logs for MCP connection errors
2. Test the server manually: `cd .graphiti-mcp && uv run graphiti_mcp_server.py --transport stdio`
3. Verify `uv` is installed and accessible at `/Users/lane/.local/bin/uv`

## File Structure

- `.graphiti-mcp/`: Graphiti MCP server installation
- `.graphiti-mcp/.env`: Environment configuration
- `.graphiti-mcp/docker-compose.neo4j-only.yml`: Neo4j Docker setup
- `~/.config/claude-desktop/claude_desktop_config.json`: Claude Desktop MCP configuration

## Benefits

With Graphiti MCP server integrated:

- **Project Memory**: Claude remembers project details across sessions
- **Relationship Mapping**: Automatically connects related concepts and entities
- **Temporal Context**: Tracks when information was added and how it evolves
- **Enhanced Reasoning**: Can traverse knowledge graph for better context-aware responses