<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Local dev server (single instance)

Next.js allows **one** `next dev` per project (`.next/dev/lock`), regardless of port.

- **Never** run raw `next dev` or spawn duplicate `npm run dev` in background terminals.
- Use `npm run dev` — reuses a healthy server or starts one in the foreground.
- For QA/E2E: scripts call `ensureDevServer()` automatically; you may run `npm run dev:ensure` manually.
- Check state: `npm run dev:status` · Stop: `npm run dev:stop`
