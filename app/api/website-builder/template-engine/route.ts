import { NextResponse } from "next/server";
import { z } from "zod";
import {
  getWbTemplateEngine,
  initializeWbTemplateEngine,
} from "@/lib/website/template-engine/index.server";

export const dynamic = "force-dynamic";

const previewBodySchema = z.object({
  templateId: z.string().min(1),
  pageId: z.string().min(1).optional(),
  locale: z.string().min(2).optional(),
  rtl: z.boolean().optional(),
  brandName: z.string().min(1).optional(),
});

/**
 * GET  /api/website-builder/template-engine
 * GET  /api/website-builder/template-engine?id=<templateId>
 * GET  /api/website-builder/template-engine?status=1
 *
 * POST /api/website-builder/template-engine  { templateId, ...context }
 *      Returns rendered preview HTML for a template package.
 */
export async function GET(request: Request) {
  const engine = getWbTemplateEngine();
  await engine.initialize();

  const url = new URL(request.url);
  const statusOnly = url.searchParams.get("status");
  if (statusOnly === "1") {
    return NextResponse.json({
      ok: true,
      status: engine.getStatus(),
      loadReport: engine.getLastLoadReport(),
    });
  }

  const templateId = url.searchParams.get("id")?.trim();
  if (templateId) {
    const manifest = await engine.getManifest(templateId);
    if (!manifest) {
      return NextResponse.json(
        { ok: false, error: `Template "${templateId}" not found.` },
        { status: 404 },
      );
    }
    return NextResponse.json({ ok: true, template: manifest });
  }

  const templates = await engine.listTemplates();
  return NextResponse.json({
    ok: true,
    count: templates.length,
    templates,
    status: engine.getStatus(),
  });
}

export async function POST(request: Request) {
  const engine = await initializeWbTemplateEngine();
  const body = await request.json().catch(() => null);
  const parsed = previewBodySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Invalid preview request body." },
      { status: 400 },
    );
  }

  const preview = await engine.buildPreview(parsed.data.templateId, {
    pageId: parsed.data.pageId,
    locale: parsed.data.locale,
    rtl: parsed.data.rtl,
    brandName: parsed.data.brandName,
  });

  if (!preview) {
    return NextResponse.json(
      { ok: false, error: `Template "${parsed.data.templateId}" not found.` },
      { status: 404 },
    );
  }

  return NextResponse.json({ ok: true, preview });
}
