#!/usr/bin/env node
/**
 * Dev server lifecycle CLI.
 *
 *   npm run dev         → start (reuse if already healthy)
 *   npm run dev:ensure  → wait/reuse or start for QA harnesses
 *   npm run dev:stop    → stop the running dev server
 *   npm run dev:status  → print lock + health state
 */
import {
  ensureDevServer,
  getDevServerStatus,
  startDevServerForeground,
  stopDevServer,
} from "./lib/dev-server.mjs";

const cmd = process.argv[2] || "start";

async function main() {
  switch (cmd) {
    case "start": {
      const result = await startDevServerForeground();
      if (result?.action === "reuse") break;
      break;
    }

    case "ensure": {
      const result = await ensureDevServer({ allowStart: true });
      console.log(
        `[dev:ensure] ${result.action} → ${result.baseUrl ?? "(none)"}`,
      );
      if (!result.baseUrl) process.exit(1);
      break;
    }

    case "stop": {
      const result = await stopDevServer();
      console.log(`[dev:stop] ${result.action} (ok=${result.ok})`);
      if (!result.ok) process.exit(1);
      break;
    }

    case "status": {
      const status = await getDevServerStatus();
      console.log(JSON.stringify(status, null, 2));
      break;
    }

    default:
      console.error(`Unknown command: ${cmd}`);
      console.error("Usage: node scripts/dev-server.mjs <start|ensure|stop|status>");
      process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
