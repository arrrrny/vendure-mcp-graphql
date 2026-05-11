# Changelog

## 1.2.0 (2025-05-06)

- Renamed environment variable `VENDURE_AUTH_TOKEN` to `VENDURE_API_KEY`.

## 1.1.1 (2025-05-05)

- Fixed npm publish: added `files` field to only include `dist/` in package.
- Added `.npmignore` for explicit publish control.

## 1.1.0 (2025-05-05)

- Added `admin_batch_mutation` tool for bulk mutations on the Admin API (delete, update, etc.).
- Added `shop_batch_mutation` tool for bulk mutations on the Shop API.
- Batch mutations run concurrently with configurable concurrency (default: 5).
- Returns per-ID success/failure results with aggregated totals.

## 1.0.0 (2025-01-24)

- Initial public release of `vendure-mcp-graphql` (formerly `raptorr-graphql-mcp`).
- Standardized package structure for npm publication.
