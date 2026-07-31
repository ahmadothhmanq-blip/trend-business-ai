/**
 * Image Intelligence — backward-compatible facade over the Image Intelligence Engine (IIE).
 * EDS-005: authoritative image reasoning lives in iie-engine.ts.
 */

export {
  runImageIntelligenceEngine,
  runImageIntelligenceFromBrief,
  getImageIntelligenceTraceFromBrief,
  getImageSystemSpecFromBrief,
  persistImageIntelligenceOnBrief,
  type RunImageIntelligenceEngineParams,
} from "@/lib/ai-core/image-intelligence/iie-engine";
