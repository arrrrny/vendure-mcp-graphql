# vendure-mcp-graphql

MCP (Model Context Protocol) server for interacting with Vendure GraphQL APIs (Admin & Shop).

## Installation

```bash
npm install -g vendure-mcp-graphql
```

## Usage

Configure as an MCP server in your IDE (like Claude Desktop):

```json
{
  "mcpServers": {
    "vendure-mcp-graphql": {
      "command": "vendure-mcp-graphql",
      "args": [],
      "env": {
        "VENDURE_URL": "http://localhost:3000/admin-api",
        "VENDURE_AUTH_TOKEN": "your-token-here"
      }
    }
  }
}
```

## Features

- Admin API access
- Shop API access
- GraphQL introspection and execution

## License

MIT
