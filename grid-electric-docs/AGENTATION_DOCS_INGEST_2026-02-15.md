# Agentation Docs Ingest (2026-02-15)

Official docs ingested from:
- https://agentation.dev/
- https://agentation.dev/install
- https://agentation.dev/features
- https://agentation.dev/output
- https://agentation.dev/schema
- https://agentation.dev/mcp
- https://agentation.dev/api
- https://agentation.dev/webhooks
- https://agentation.dev/changelog
- https://agentation.dev/faq

## Integration Baseline
- Install package: `npm install agentation -D` (docs recommendation).
- Add component at app root and gate to dev:
  - `import { Agentation } from "agentation";`
  - `{process.env.NODE_ENV === "development" && <Agentation />}`
- React requirement: React 18+.
- Works with SSR/SSG as a client-hydrated component.
- Desktop-first tool.

## Output Model
- Four output detail modes:
  - `Compact`
  - `Standard`
  - `Detailed`
  - `Forensic`
- Output is markdown intended for agent chat input.
- React component hierarchy detail changes by mode:
  - Compact: no React tree
  - Standard: filtered React tree
  - Detailed: smart matching
  - Forensic: full detail including computed styles

## Annotation Format Schema (AFS v1.0)
- Required fields:
  - `id`, `comment`, `elementPath`, `timestamp`, `x`, `y`, `element`
- Common optional fields:
  - `url`, `boundingBox`, `reactComponents`, `cssClasses`, `computedStyles`, `accessibility`, `nearbyText`, `selectedText`
- Browser component fields:
  - `isFixed`, `isMultiSelect`, `fullPath`, `nearbyElements`
- Classification fields:
  - `intent`: `fix | change | question | approve`
  - `severity`: `blocking | important | suggestion`
- Lifecycle fields:
  - `status`: `pending | acknowledged | resolved | dismissed`
  - `resolvedAt`, `resolvedBy`, `thread`
- JSON Schema ID:
  - `https://agentation.dev/schema/annotation.v1.json`

## MCP Integration
- Install MCP package:
  - `npm install agentation-mcp` (or pnpm equivalent)
- CLI:
  - `npx agentation-mcp init`
  - `npx agentation-mcp server`
  - `npx agentation-mcp doctor`
  - `npx agentation-mcp help`
- Server options:
  - `--port <port>` (default `4747`)
  - `--mcp-only`
  - `--http-url <url>`
- Claude wiring:
  - `claude mcp add agentation -- npx agentation-mcp server`

### MCP tools exposed
- `agentation_list_sessions`
- `agentation_get_session`
- `agentation_get_pending`
- `agentation_get_all_pending`
- `agentation_acknowledge`
- `agentation_resolve`
- `agentation_dismiss`
- `agentation_reply`
- `agentation_watch_annotations`

## HTTP API (agentation-mcp server)
- Sessions:
  - `POST /sessions`
  - `GET /sessions`
  - `GET /sessions/:id`
- Annotations:
  - `POST /sessions/:id/annotations`
  - `GET /annotations/:id`
  - `PATCH /annotations/:id`
  - `DELETE /annotations/:id`
  - `POST /annotations/:id/thread`
  - `GET /sessions/:id/pending`
  - `GET /pending`
- Events (SSE):
  - `GET /sessions/:id/events`
  - `GET /events`
- Health:
  - `GET /health`
  - `GET /status`

## Webhooks
- Enable with component prop:
  - `<Agentation webhookUrl="https://your-server.com/webhook" />`
- Event payload types include:
  - `annotation.add`
  - `annotation.delete`
  - `annotation.update`
  - `annotations.clear`
  - `submit`
- Use HTTPS and sanitize user-generated annotation comments server-side.

## Current Changelog Snapshot (as observed)
- `2.2.1` (2026-02-11): fixed occasional unresponsive toolbar button.
- `2.2.0` (2026-02-06): improved animation pause coverage.
- `2.1.0` (2026-02-05): added hands-free mode (`watch_annotations`) and keyboard shortcut toggle.
- `2.0.0` (2026-02-05): major shift to MCP + real-time collaboration.
- `1.3.x` and below: tooltip/computed-style/API and setup improvements.

## Notes For This Repo
- Agentation component is already wired in:
  - `/Users/grid/Desktop/Grid2/src/app/layout.tsx`
- Current setup uses development-only rendering guard.
