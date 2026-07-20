import { NextResponse } from "next/server";
import { z } from "zod";
import {
  listAppTemplates,
  listComponentsForTemplate,
  runAppDesignEngine,
  matchTemplateFromSignals,
} from "@/lib/ai-core/app-design-platform";

export const dynamic = "force-dynamic";

const designSchema = z.object({
  prompt: z.string().trim().min(5),
  appType: z.string().optional(),
  language: z.string().optional(),
  designStyle: z.string().optional(),
  colorStyle: z.string().optional(),
  features: z.array(z.string()).optional(),
});

/**
 * GET — list professional app templates + component library.
 * POST — run App Design Engine (blueprint only, no code generation).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const templateId = searchParams.get("templateId");

  if (templateId) {
    const template = listAppTemplates().find((t) => t.id === templateId);
    if (!template) {
      return NextResponse.json({ error: "Template not found." }, { status: 404 });
    }
    return NextResponse.json({
      template,
      components: listComponentsForTemplate(template.id),
    });
  }

  return NextResponse.json({
    templates: listAppTemplates().map((t) => ({
      id: t.id,
      label: t.label,
      description: t.description,
      industry: t.industry,
      architecture: t.architecture,
      defaultFeatures: t.defaultFeatures,
      screenCount: t.screens.length,
      modelCount: t.dataModels.length,
      roleCount: t.roles.length,
      userFlows: t.userFlows,
    })),
    componentCount: listComponentsForTemplate("saas-dashboard").length,
  });
}

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const parsed = designSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const matched = matchTemplateFromSignals({
    appType: parsed.data.appType,
    prompt: parsed.data.prompt,
  });
  const designed = runAppDesignEngine(parsed.data);

  return NextResponse.json({
    matchedTemplate: {
      id: matched.id,
      label: matched.label,
      architecture: matched.architecture,
    },
    blueprint: designed.blueprint,
    model: designed.model,
  });
}
