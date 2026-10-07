# Local fork contract

This local 0.18.0 fork is named **RemNote Local Bridge** and has its own manifest ID. Disable the store bridge before enabling it. See the [companion server extensions](../../../remnote-mcp-server/docs/guides/local-fork-features.md).

- `create_note` adds `asFolder`, with title required and content/asDocument forbidden. The adapter uses SDK `setIsFolder(true)` inside the existing transaction. Notes created with an explicit title under a folder are automatically documents. Use their document roots to hold nested Markdown bullets.
- Search/read/list results classify native folders as `folder` before document/concept classification. Existing card status remains independent.
- `get_status` now returns the current SDK knowledge-base ID and `localFork: true`, allowing the companion server to reject folder writes on a store bridge that would ignore the new flag.
- The manifest declares read-only `KnowledgeBaseInfo` access for that ID, separately from the existing `All` bullet read/create/modify/delete scope.
- `export_notes` is a read-only internal indexing action. It accepts an optional cursor and a limit (up to 150) and returns `knowledgeBaseId`, `notes`, `hasMore`, optional `nextCursor`, and `totalRems`.
- The first export page captures all accessible SDK Rem IDs once; subsequent pages render compact metadata plus aliases using the existing search renderer. Batches of ten Rems bound SDK concurrency, and indexing omits unused tag/card metadata. Internal powerup content metadata is excluded. There is no keyword-search result cap.
- Export cursors share the existing short-lived snapshot infrastructure and are bound to the knowledge base. Switching KBs, expired cursors, or disconnected sessions require restarting the refresh.

Semantic embeddings and persistence live in the companion Node server, not in the browser plugin. The plugin does not call an external embedding provider. Ordinary search/read behavior remains available without indexing.
The companion server refreshes on startup/bridge connection and 15 minutes after each completed refresh by default.
`REMNOTE_SEMANTIC_REFRESH_MINUTES` changes the interval; `0` disables automatic refresh. Full scans pick up direct
RemNote edits without requiring a UI-event subscription or a bridge code change.
