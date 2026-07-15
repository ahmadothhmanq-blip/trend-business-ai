import {
  auditAnalyzePrompt,
  brandAnalyzePrompt,
  businessAnalyzePrompt,
  contentAnalyzePrompt,
  creativeAnalyzePrompt,
  managerAnalyzePrompt,
  marketingAnalyzePrompt,
  serviceGeneratePrompt,
  servicePlanPrompt,
  socialAnalyzePrompt,
} from "@/lib/ai/prompts";
import { createTextPlugin } from "@/plugins/types";

export const brandPlugin = createTextPlugin({
  id: "brand",
  name: "Brand Designer",
  analyzePrompt: (input) => brandAnalyzePrompt(input.prompt),
  planPrompt: (input, analysis) =>
    servicePlanPrompt("brand identity", input.prompt, analysis),
  generatePrompt: (input, analysis, plan) =>
    serviceGeneratePrompt("brand identity kit", input.prompt, analysis, plan),
});

export const contentPlugin = createTextPlugin({
  id: "content",
  name: "Content Studio",
  analyzePrompt: (input) => contentAnalyzePrompt(input.prompt),
  planPrompt: (input, analysis) =>
    servicePlanPrompt("content", input.prompt, analysis),
  generatePrompt: (input, analysis, plan) =>
    serviceGeneratePrompt("content package", input.prompt, analysis, plan),
});

export const creativePlugin = createTextPlugin({
  id: "creative",
  name: "Creative Studio",
  analyzePrompt: (input) => creativeAnalyzePrompt(input.prompt),
  planPrompt: (input, analysis) =>
    servicePlanPrompt("creative production", input.prompt, analysis),
  generatePrompt: (input, analysis, plan) =>
    serviceGeneratePrompt("creative direction package", input.prompt, analysis, plan),
});

export const marketingPlugin = createTextPlugin({
  id: "marketing",
  name: "Marketing",
  analyzePrompt: (input) => marketingAnalyzePrompt(input.prompt),
  planPrompt: (input, analysis) =>
    servicePlanPrompt("marketing campaign", input.prompt, analysis),
  generatePrompt: (input, analysis, plan) =>
    serviceGeneratePrompt("marketing campaign package", input.prompt, analysis, plan),
});

export const businessPlugin = createTextPlugin({
  id: "business",
  name: "Business Intelligence",
  analyzePrompt: (input) => businessAnalyzePrompt(input.prompt),
  planPrompt: (input, analysis) =>
    servicePlanPrompt("business intelligence", input.prompt, analysis),
  generatePrompt: (input, analysis, plan) =>
    serviceGeneratePrompt("business intelligence report", input.prompt, analysis, plan),
});

export const managerPlugin = createTextPlugin({
  id: "manager",
  name: "Business Manager",
  analyzePrompt: (input) => managerAnalyzePrompt(input.prompt),
  planPrompt: (input, analysis) =>
    servicePlanPrompt("business management", input.prompt, analysis),
  generatePrompt: (input, analysis, plan) =>
    serviceGeneratePrompt("business execution roadmap", input.prompt, analysis, plan),
});

export const auditPlugin = createTextPlugin({
  id: "audit",
  name: "Business Audit",
  analyzePrompt: (input) => auditAnalyzePrompt(input.prompt),
  planPrompt: (input, analysis) =>
    servicePlanPrompt("business audit", input.prompt, analysis),
  generatePrompt: (input, analysis, plan) =>
    serviceGeneratePrompt("business audit report", input.prompt, analysis, plan),
});

export const socialPlugin = createTextPlugin({
  id: "social",
  name: "Social Media",
  analyzePrompt: (input) => socialAnalyzePrompt(input.prompt),
  planPrompt: (input, analysis) =>
    servicePlanPrompt("social media growth", input.prompt, analysis),
  generatePrompt: (input, analysis, plan) =>
    serviceGeneratePrompt("social media growth plan", input.prompt, analysis, plan),
});
