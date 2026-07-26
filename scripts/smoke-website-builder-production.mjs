/**
 * Website Builder production readiness smoke tests (no live LLM).
 * Usage: node scripts/smoke-website-builder-production.mjs
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return readFileSync(join(root, rel), "utf8");
}

const required = [
  "lib/website/builder/copilot-client.ts",
  "lib/website/builder/collaboration.ts",
  "lib/website/builder/access.ts",
  "lib/website/builder/invitation-email.ts",
  "components/dashboard/website-builder/builder-workspace.tsx",
  "components/dashboard/website-builder/copilot-command-panel.tsx",
  "components/dashboard/website-builder/hooks/use-copilot-command.ts",
  "app/api/website-builder/builder/invitations/route.ts",
  "app/api/website-builder/[id]/builder/members/[memberId]/route.ts",
  "app/api/website-builder/[id]/builder/members/[memberId]/resend/route.ts",
  "supabase/migrations/078_website_builder_extensions.sql",
  "supabase/migrations/079_website_builder_collaboration.sql",
  "supabase/migrations/081_website_builder_invitation_email.sql",
  "scripts/verify-website-builder-db.mjs",
  "scripts/verify-website-builder-phases.mjs",
];

for (const rel of required) {
  assert.ok(existsSync(join(root, rel)), `missing ${rel}`);
}

const copilotClient = read("lib/website/builder/copilot-client.ts");
assert.match(copilotClient, /submitWebsiteCopilotCommand/);
assert.match(copilotClient, /copilot\/stream/);
assert.match(copilotClient, /copilot\/commands/);
assert.match(copilotClient, /forceStream/);

const tool = read("components/dashboard/website-builder-tool.tsx");
assert.match(tool, /useCopilotCommand/);
assert.match(tool, /control={copilotControl}/);
assert.match(tool, /handleAiCopilotCommand/);
assert.match(tool, /forceStream/);

const panel = read("components/dashboard/website-builder/copilot-command-panel.tsx");
assert.match(panel, /CopilotCommandPanelView/);
assert.match(panel, /control\?: CopilotCommandControl/);

const collaboration = read("lib/website/builder/collaboration.ts");
assert.match(collaboration, /BUILDER_INVITATION_TTL_DAYS/);
assert.match(collaboration, /isInvitationExpired/);

const access = read("lib/website/builder/access.ts");
assert.match(access, /assertBuilderAccess/);
assert.match(access, /resolveBuilderAccess/);

const invitationsRoute = read("app/api/website-builder/builder/invitations/route.ts");
assert.match(invitationsRoute, /enforceWebsiteUserMutationRateLimit/);
assert.match(invitationsRoute, /acceptSchema/);

const membersRoute = read("app/api/website-builder/[id]/builder/members/route.ts");
assert.match(membersRoute, /invitation_token/);
assert.match(membersRoute, /createInvitationExpiry/);
assert.match(membersRoute, /deliverBuilderInvitationEmail/);

const resendRoute = read(
  "app/api/website-builder/[id]/builder/members/[memberId]/resend/route.ts",
);
assert.match(resendRoute, /deliverBuilderInvitationEmail/);
assert.match(resendRoute, /incrementResend/);

const invitationEmail = read("lib/website/builder/invitation-email.ts");
assert.match(invitationEmail, /SendGridAdapter/);
assert.match(invitationEmail, /email_delivery_status/);

const publishing = read("lib/website/builder/publishing.ts");
assert.match(publishing, /PUBLISHING_CHECKLIST/);
assert.match(publishing, /runBuilderAccessibilityHeuristics/);

const aiBuilder = read("lib/website/builder/ai-builder.ts");
assert.match(aiBuilder, /AI_BUILDER_ACTIONS/);
assert.match(aiBuilder, /Improve SEO/);

console.log("PASS website builder production smoke");
