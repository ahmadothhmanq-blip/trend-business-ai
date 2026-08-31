import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { agentAnalyzePrompt, agentSummarizePrompt } from "@/lib/ai/prompts/ai-agents";
import { brandAnalyzePrompt } from "@/lib/ai/prompts/brand-identity";
import { businessAnalyzePrompt, businessGeneratePrompt } from "@/lib/ai/prompts/business-suite";
import {
  contentAnalyzePrompt,
  contentGeneratePrompt,
  contentHeadlinesPrompt,
  contentSeoPrompt,
} from "@/lib/ai/prompts/content-studio";
import { imageAnalyzePrompt, imageConceptPrompt } from "@/lib/ai/prompts/image-generator";
import { lpAnalyzePrompt, lpBlueprintPrompt, lpFilePrompt } from "@/lib/ai/prompts/landing-page";
import { logoAnalyzePrompt } from "@/lib/ai/prompts/logo";
import { serviceGeneratePrompt } from "@/lib/ai/prompts/services";
import { videoAnalyzePrompt, videoScenePrompt, videoScriptPrompt } from "@/lib/ai/prompts/video-studio";
import { websiteAnalyzePrompt } from "@/lib/ai/prompts/website";
import { webappAnalyzePrompt, webappFilePrompt } from "@/lib/ai/prompts/webapp";
import { buildCampaignGenerationPrompt } from "@/lib/marketing/prompts";
import { buildPostGenerationPrompt } from "@/lib/social-media/prompts";
import { buildWebsiteLanguageDirective } from "@/lib/ai-core/website-builder/language-directive";
import { aiOutputLanguageDirective } from "@/lib/ai/prompts/language-directive.server";
import { buildDirectorPrompt } from "@/lib/ai-core/video-production-platform/director/llm";

const LANGUAGES = [
  "Arabic",
  "English",
  "German",
  "Spanish",
  "French",
  "Japanese",
] as const;

const contentInput = (language: string) => ({
  prompt: "Write about warehouse automation",
  contentTool: "writer",
  contentType: "blog-post",
  tone: "professional",
  audience: "operators",
  language,
  brandVoice: "",
  writingStyle: "editorial",
  creativityLevel: "balanced",
  options: ["seo", "cta", "headlines"],
  seoKeywords: "automation",
});

function assertNativeGls(prompt: string, language: string) {
  assert.match(prompt, new RegExp(language));
  assert.match(prompt, /natively|Do NOT write English/i);
  assert.match(prompt, /translate afterward/i);
}

describe("GLS product prompt contracts", () => {
  for (const language of LANGUAGES) {
    describe(language, () => {
      it("Website Builder analyze + language directive cover site artifacts", () => {
        const prompt = websiteAnalyzePrompt({
          prompt: "Corporate consulting site",
          projectType: "business",
          projectKind: "website",
          language,
          theme: "modern",
          features: [],
        });
        assert.match(prompt, new RegExp(language));
        const directive = buildWebsiteLanguageDirective({ language, prompt: "Corporate consulting site" });
        assert.match(directive, /navigation/i);
        assert.match(directive, /buttons/i);
        assert.match(directive, /blog content/i);
        assert.match(directive, /SEO/i);
        assert.match(directive, /translate afterward/i);
      });

      it("App Builder analyze enumerates app copy", () => {
        const prompt = webappAnalyzePrompt({
          prompt: "CRM for clinics",
          appType: "crm",
          language,
          designStyle: "modern",
          colorStyle: "blue",
          features: ["auth"],
        });
        assertNativeGls(prompt, language);
        assert.match(prompt, /navigation/i);
        assert.match(prompt, /dashboard copy/i);
      });

      it("Landing Page analyze/blueprint/file generate natively", () => {
        const input = {
          prompt: "SaaS waitlist",
          pageType: "saas",
          language,
          designStyle: "modern",
          colorStyle: "blue",
          sections: ["hero", "features"],
        };
        assertNativeGls(lpAnalyzePrompt(input), language);
        assertNativeGls(lpBlueprintPrompt(input, {}), language);
        const file = lpFilePrompt({
          input,
          analysis: {},
          blueprint: {},
          dynamicPlan: {},
          filePlan: {
            path: "app/page.tsx",
            purpose: "Landing page",
            language: "tsx",
            category: "pages",
          },
          projectTree: [],
          existingFiles: [],
        });
        assertNativeGls(file, language);
        assert.match(file, /STRUCTURAL hints/i);
      });

      it("Content Studio covers article, SEO meta, and headlines", () => {
        const input = contentInput(language);
        assertNativeGls(contentAnalyzePrompt(input), language);
        assertNativeGls(
          contentGeneratePrompt(
            input,
            {
              title: "Title",
              mainMessage: "Msg",
              keyPoints: ["a"],
              toneAnalysis: "pro",
              competitiveAngle: "angle",
            },
            {
              sections: [{ heading: "H", purpose: "P", keyPoints: ["a"] }],
              seoStrategy: "seo",
              primaryKeyword: "kw",
            },
          ),
          language,
        );
        const seo = contentSeoPrompt("body", "kw", "blog-post", language);
        assertNativeGls(seo, language);
        assert.match(seo, /meta title/i);
        assert.match(seo, /meta description/i);
        assertNativeGls(
          contentHeadlinesPrompt("Title", "blog-post", "professional", "ops", language),
          language,
        );
      });

      it("Video Studio covers script, VO, captions, titles", () => {
        const videoInput = {
          prompt: "Product demo",
          videoType: "product-demo",
          style: "cinematic",
          aspectRatio: "16:9",
          duration: "15s",
          mood: "confident",
          cameraMove: "dolly",
          options: ["script"],
          sceneCount: 3,
          language,
        };
        assertNativeGls(videoAnalyzePrompt(videoInput), language);
        assertNativeGls(
          videoScriptPrompt(
            {
              title: "Demo",
              concept: "c",
              videoType: "product-demo",
              style: "cinematic",
              mood: "confident",
              targetAudience: "buyers",
              keyMessages: ["value"],
              visualTheme: "studio",
              pacing: "fast",
            },
            [
              {
                id: "scene-1",
                name: "Hook",
                description: "Open",
                duration: "3s",
                visualDirection: "wide",
                cameraMove: "dolly",
                mood: "bold",
                transition: "cut",
              },
            ],
            language,
          ),
          language,
        );
        const scene = videoScenePrompt(
          {
            title: "Demo",
            concept: "c",
            videoType: "product-demo",
            style: "cinematic",
            mood: "confident",
            targetAudience: "buyers",
            keyMessages: ["value"],
            visualTheme: "studio",
            pacing: "fast",
          },
          {
            id: "scene-1",
            name: "Hook",
            description: "Open",
            duration: "3s",
            visualDirection: "wide",
            cameraMove: "dolly",
            mood: "bold",
            transition: "cut",
          },
          0,
          1,
          "16:9",
          language,
        );
        assertNativeGls(scene, language);
        assert.match(scene, /on-screen labels/i);
      });

      it("Image, Logo, and Brand keep user-facing copy in GLS", () => {
        const imageInput = {
          prompt: "Server rack hero",
          imageType: "hero-banner",
          style: "photoreal",
          aspectRatio: "16:9",
          mood: "precise",
          negativePrompt: "",
          options: [],
          brandColors: [],
          batchCount: 2,
          language,
        };
        assertNativeGls(imageAnalyzePrompt(imageInput), language);
        assertNativeGls(
          imageConceptPrompt(imageInput, {
            subject: "rack",
            imageType: "hero-banner",
            style: "photoreal",
            mood: "precise",
            colorDirection: "cool",
            compositionNotes: "wide",
            targetUse: "web",
            technicalRequirements: ["4k"],
          }, {
            name: "Primary",
            description: "Hero",
            compositionNotes: "centered",
            colorPalette: ["#111111"],
            lightingDirection: "studio",
          }),
          language,
        );
        assertNativeGls(
          logoAnalyzePrompt({
            brandName: "Nexus",
            prompt: "tech mark",
            logoStyle: "combination",
            industry: "saas",
            colorPalette: "blue",
            iconStyle: "geometric",
            typography: "sans",
            personality: "precise",
            options: [],
            language,
          }),
          language,
        );
        assertNativeGls(
          brandAnalyzePrompt({
            brandName: "Nexus",
            brandType: "saas",
            industry: "saas",
            targetAudience: "ops",
            brandPersonality: "precise",
            prompt: "identity",
            deliverables: ["guidelines"],
            language,
          }),
          language,
        );
      });

      it("Marketing, social, business, and agents generate in GLS", () => {
        assertNativeGls(
          buildCampaignGenerationPrompt({ brief: "Launch", language }),
          language,
        );
        const social = buildPostGenerationPrompt({
          platform: "linkedin",
          topic: "launch",
          tone: "Professional",
          language,
        });
        assertNativeGls(`${social.system}\n${social.prompt}`, language);
        assertNativeGls(
          businessAnalyzePrompt({
            prompt: "Expand into DACH",
            businessTool: "business-plan",
            businessType: "saas",
            industry: "software",
            companyStage: "growth",
            targetMarket: "EU",
            options: [],
            language,
          }),
          language,
        );
        assertNativeGls(
          agentAnalyzePrompt({
            task: "Draft a weekly ops report",
            agentType: "analyst",
            systemPrompt: "You are an analyst.",
            tools: [],
            language,
          }),
          language,
        );
        assertNativeGls(
          serviceGeneratePrompt(
            "marketing campaign package",
            "Launch",
            {},
            {},
            language,
          ),
          language,
        );
      });
    });
  }

  it("shared helper no longer uses the weak one-liner", () => {
    const d = aiOutputLanguageDirective("German");
    assert.doesNotMatch(d, /^[\s\n]*Respond entirely in German\.[\s\n]*$/);
    assert.match(d, /CRITICAL — Generation Language/);
  });

  it("Video Director prompt includes the video GLS block", () => {
    const prompt = buildDirectorPrompt({
      prompt: "Studio product film",
      duration: 12,
      language: "Japanese",
      workflow: "product",
      aspectRatio: "16:9",
    });
    assertNativeGls(prompt, "Japanese");
    assert.match(prompt, /voice-over|captions|subtitles/i);
    assert.match(prompt, /visual generation prompt/i);
  });

  it("App Builder file prompt keeps website-class language rules", () => {
    const prompt = webappFilePrompt({
      input: {
        prompt: "CRM",
        appType: "crm",
        language: "French",
        designStyle: "modern",
        colorStyle: "blue",
        features: [],
      },
      analysis: {},
      blueprint: {},
      dynamicPlan: {},
      filePlan: {
        path: "app/page.tsx",
        purpose: "Home",
        language: "tsx",
        category: "pages",
      },
      projectTree: [],
      existingFiles: [],
    });
    assertNativeGls(prompt, "French");
  });

  it("Business generate prompt includes GLS", () => {
    const prompt = businessGeneratePrompt(
      {
        prompt: "Plan",
        businessTool: "business-plan",
        businessType: "saas",
        industry: "software",
        companyStage: "startup",
        targetMarket: "EU",
        options: [],
        language: "German",
      },
      {
        title: "Plan",
        businessContext: "ctx",
        mainChallenges: ["c"],
        keyQuestions: ["q"],
        industryInsights: "i",
      },
      { sections: [{ heading: "H", purpose: "P", keyPoints: ["k"] }] },
    );
    assertNativeGls(prompt, "German");
  });

  it("Agent summarize prompt includes GLS", () => {
    const prompt = agentSummarizePrompt({
      task: "Report",
      agentType: "analyst",
      stepResults: [{ name: "Step", result: "Done" }],
      language: "Arabic",
    });
    assertNativeGls(prompt, "Arabic");
  });
});
