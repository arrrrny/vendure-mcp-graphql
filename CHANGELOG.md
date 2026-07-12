# Changelog

## 1.5.0 (2026-07-12)

- Added `channelToken` parameter to batch mutation tools.
  - `admin_batch_mutation` and `shop_batch_mutation` now accept an optional `channelToken` parameter.
  - When provided, the channel token is explicitly set to `'default-channel'` for all batch operations.
  - Allows batch mutations to target specific channels in multi-channel setups.

## 1.4.0 (2026-06-18)

- Added `describe_operation` tool — describe any GraphQL query or mutation in detail.
  - Accepts an operation name and returns which API(s) it's available on (Admin, Shop, or both).
  - Shows the return type with all its fields and their types (resolved through wrappers).
  - Shows all arguments with their input type fields.
  - Optional `api` parameter to restrict lookup to a specific API.
- Added `get_admin_type` tool — introspect a single Admin API type by name (fields, input fields, enum values).
- Added `get_shop_type` tool — same for Shop API.
- Internal: added `allOperationsWithTypesQuery` and helper functions to support type-based operation resolution.

## 1.3.0 (2026-06-09)

- Internal restructuring and improvements.

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
