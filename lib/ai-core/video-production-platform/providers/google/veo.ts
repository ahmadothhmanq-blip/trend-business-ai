// Google Veo is implemented in the existing provider adapter to avoid logic duplication.
// This file only re-exports it under the Google provider layer namespace.
export { veoVideoProvider, veoConfigured, probeVeoHealth } from "@/lib/ai-core/video-production-platform/providers/veo";

