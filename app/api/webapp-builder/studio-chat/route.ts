import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  advanceStudioChat,
  createStudioChatState,
  isStudioChatApproveReady,
  seedStudioChatVertical,
  studioChatIntroMessage,
  type StudioChatState,
  type StudioChatVertical,
} from "@/lib/webapp/studio-chat/engine";

export const dynamic = "force-dynamic";

const verticalSchema = z.enum([
  "crm",
  "booking",
  "ecommerce",
  "healthcare",
  "finance",
  "custom",
]);

const bodySchema = z.object({
  message: z.string().trim().min(1).max(4000).optional(),
  language: z.string().trim().max(64).optional(),
  state: z.unknown().optional(),
  bootstrap: z.boolean().optional(),
  seedVertical: verticalSchema.optional(),
});

function asState(value: unknown, language?: string | null): StudioChatState {
  if (value && typeof value === "object") {
    const raw = value as StudioChatState;
    if (Array.isArray(raw.turns) && typeof raw.phase === "string") {
      return raw;
    }
  }
  return createStudioChatState(language);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const language = parsed.data.language ?? null;

  if (parsed.data.bootstrap) {
    const state = createStudioChatState(language);
    const intro = studioChatIntroMessage(language);
    let bootstrapped: StudioChatState = {
      ...state,
      turns: [
        {
          id: `intro-${Date.now()}`,
          role: "assistant",
          content: intro,
          createdAt: new Date().toISOString(),
        },
      ],
      phase: "clarify",
    };
    let assistantMessage = intro;
    let plan = null;
    if (parsed.data.seedVertical && parsed.data.seedVertical !== "custom") {
      const seeded = seedStudioChatVertical(
        bootstrapped,
        parsed.data.seedVertical as StudioChatVertical,
        language,
      );
      bootstrapped = seeded.state;
      assistantMessage = seeded.assistantMessage;
      plan = seeded.plan;
    }
    return NextResponse.json({
      ok: true,
      bootstrap: true,
      assistantMessage,
      state: bootstrapped,
      plan,
      shouldBuild: false,
    });
  }

  const message = parsed.data.message?.trim();
  if (!message) {
    return NextResponse.json({ error: "Message required" }, { status: 400 });
  }

  const prev = asState(parsed.data.state, language);
  const reply = advanceStudioChat(prev, message);

  return NextResponse.json({
    ok: true,
    assistantMessage: reply.assistantMessage,
    state: reply.state,
    plan: reply.plan,
    shouldBuild: isStudioChatApproveReady(reply),
  });
}
