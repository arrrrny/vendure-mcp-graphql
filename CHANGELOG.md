# Changelog

## 1.1.0 (2025-05-05)
- Added `admin_batch_mutation` tool for bulk mutations on the Admin API (delete, update, etc.).
- Added `shop_batch_mutation` tool for bulk mutations on the Shop API.
- Batch mutations run concurrently with configurable concurrency (default: 5).
- Returns per-ID success/failure results with aggregated totals.

## 1.0.0 (2025-01-24)
- Initial public release of `vendure-mcp-graphql` (formerly `raptorr-graphql-mcp`).
- Standardized package structure for npm publication.
