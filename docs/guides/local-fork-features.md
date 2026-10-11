# Local fork contract

This local 0.20.x fork is named **RemNote Local Bridge** and has its own manifest ID. Disable the store bridge before enabling it. See the [companion server extensions](../../../remnote-mcp-server/docs/guides/local-fork-features.md).

- `update_note.headingSize` accepts `H1`, `H2`, `H3`, or `normal`, using SDK `setFontSize`. It can be changed without
  changing the title, aliases, or content children. Omitting the field preserves its current value.
- `read_note.headingSize` returns the root's native size in every view, with ordinary text reported as `normal`.
  Read a child Rem by its exact ID to inspect its size; structured child results do not include this field.
- Bridge/server minor versions must match. Restart the updated server and reload the updated bridge together.
- `insert_image` accepts `parentRemId`, filename, MIME, size, base64 bytes, and optional plain-text caption. The server
  reads a local PNG/JPEG/GIF/WebP up to 10 MiB; the bridge validates the payload again, then uses the SDK HTML importer
  on a detached image Rem, then verifies fresh readback for up to 30 seconds and attaches a separate caption/image
  subtree in a short transaction. This handles SDK calls that save media without resolving and overwrite target text.
  Failed staging is removed. It succeeds only for one managed `%LOCAL_FILE%` image and
  returns its exact Rem/media IDs. Existing note content is preserved. Images can sync through RemNote; permissions
  and write gates are unchanged. External URL, SVG/PDF, inline replacement, and back-text upload are excluded.

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
