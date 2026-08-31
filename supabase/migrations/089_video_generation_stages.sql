-- Separate storyboard completion from playable video render.
ALTER TABLE public.video_generations
  DROP CONSTRAINT IF EXISTS video_generations_status_check;

ALTER TABLE public.video_generations
  ADD CONSTRAINT video_generations_status_check
  CHECK (status IN (
    'pending',
    'generating',
    'storyboard_ready',
    'video_rendered',
    'completed',
    'failed'
  ));
