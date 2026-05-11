# vendure-mcp-graphql

[![npm version](https://img.shields.io/npm/v/vendure-mcp-graphql.svg)](https://www.npmjs.com/package/vendure-mcp-graphql) [![npm downloads](https://img.shields.io/npm/dm/vendure-mcp-graphql.svg)](https://www.npmjs.com/package/vendure-mcp-graphql)

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
        "VENDURE_API_KEY": "your-key-here"
      }
    }
  }
}
```

## Tools

### Admin API

| Tool                    | Description                                              |
| ----------------------- | -------------------------------------------------------- |
| `admin_query`           | Execute a GraphQL query on the Admin API                 |
| `admin_mutation`        | Execute a GraphQL mutation on the Admin API              |
| `admin_batch_mutation`  | Execute a mutation in bulk for multiple IDs (concurrent) |
| `get_admin_schema`      | Fetch the full Admin API schema introspection            |
| `list_admin_operations` | List all available Admin API queries and mutations       |

### Shop API

| Tool                   | Description                                              |
| ---------------------- | -------------------------------------------------------- |
| `shop_query`           | Execute a GraphQL query on the Shop API                  |
| `shop_mutation`        | Execute a GraphQL mutation on the Shop API               |
| `shop_batch_mutation`  | Execute a mutation in bulk for multiple IDs (concurrent) |
| `get_shop_schema`      | Fetch the full Shop API schema introspection             |
| `list_shop_operations` | List all available Shop API queries and mutations        |

### Batch Mutations

The batch mutation tools allow you to run a single mutation across multiple IDs concurrently. Useful for bulk operations like deleting or updating many records at once.

**Parameters:**

- `mutation` (required) — GraphQL mutation string with an ID variable (e.g. `$id: ID!`)
- `ids` (required) — Array of IDs to run the mutation for
- `variableName` — Name of the ID variable in the mutation (default: `"id"`)
- `extraVariables` — Additional variables to pass alongside each ID
- `concurrency` — Max concurrent mutations (default: `5`)

**Example — bulk delete products:**

```json
{
  "mutation": "mutation DeleteProduct($id: ID!) { deleteProduct(id: $id) { result } }",
  "ids": ["1", "2", "3"],
  "concurrency": 3
}
```

**Returns per-ID results:**

```json
{
  "total": 3,
  "succeeded": 2,
  "failed": 1,
  "results": [
    {
      "id": "1",
      "success": true,
      "data": { "deleteProduct": { "result": "DELETED" } }
    },
    {
      "id": "2",
      "success": true,
      "data": { "deleteProduct": { "result": "DELETED" } }
    },
    { "id": "3", "success": false, "error": "Product not found" }
  ]
}
```

## License

MIT
