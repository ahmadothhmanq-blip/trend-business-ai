/** @deprecated Import from @/lib/social-media/publishing instead */
export { queuePostSchedule, canPublish, nextScheduleStatus } from "./publishing-legacy";
export {
  publishPost,
  schedulePost,
  retryFailedJob,
  processScheduledJobs,
} from "./publishing/engine";

import { publishPost } from "./publishing/engine";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { PublishPostInput } from "./publishing/engine";

/** Backward-compatible alias */
export async function publishToPlatform(supabase: SupabaseClient, input: PublishPostInput) {
  return publishPost(supabase, input);
}
