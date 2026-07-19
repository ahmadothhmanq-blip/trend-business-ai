export type {
  WebsiteEditActionType,
  WebsiteEditAction,
  UnderstoodSection,
  WebsiteUnderstanding,
  WebsiteImprovementCategory,
  WebsiteImprovementSuggestion,
  WebsiteEditorSuggestionsReport,
  WebsiteEditResult,
} from "@/lib/ai-core/website-editor/types";

export {
  understandWebsite,
  parseHomeComponentOrder,
} from "@/lib/ai-core/website-editor/understand";

export {
  parseWebsiteEditCommand,
  describeEditActions,
  actionsNeedingAiContinue,
} from "@/lib/ai-core/website-editor/parse-command";

export {
  applyWebsiteEditActions,
  buildContinueInstructionFromActions,
} from "@/lib/ai-core/website-editor/actions";

export { buildWebsiteImprovementSuggestions } from "@/lib/ai-core/website-editor/suggestions";

export {
  runWebsiteEditor,
  suggestWebsiteImprovements,
  type RunWebsiteEditorParams,
} from "@/lib/ai-core/website-editor/engine";
