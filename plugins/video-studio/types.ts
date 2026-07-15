export type VideoPluginInput = {
  prompt: string;
  videoType: string;
  style: string;
  aspectRatio: string;
  duration: string;
  mood: string;
  cameraMove: string;
  options: string[];
  sceneCount: number;
};

export type VideoAnalysis = {
  title: string;
  concept: string;
  videoType: string;
  style: string;
  mood: string;
  targetAudience: string;
  keyMessages: string[];
  visualTheme: string;
  pacing: string;
};

export type VideoScenePlan = {
  id: string;
  name: string;
  description: string;
  duration: string;
  visualDirection: string;
  cameraMove: string;
  mood: string;
  transition: string;
};

export type VideoPlanResult = {
  scenes: VideoScenePlan[];
  colorPalette: string[];
  musicDirection: string;
  pacing: string;
  totalDuration: string;
  narrativeArc: string;
};

export type VideoOutput = {
  title: string;
  description: string;
  videoType: string;
  style: string;
  scenes: {
    id: string;
    name: string;
    description: string;
    duration: string;
    visualPrompt: string;
    cameraMove: string;
    mood: string;
    narration: string;
    musicDirection: string;
    sfxNotes: string;
    transition: string;
    svgStoryboard: string;
  }[];
  script: string;
  voiceoverScript: string;
  musicSuggestions: { name: string; genre: string; mood: string; bpm: string }[];
  subtitles: { timestamp: string; text: string }[];
  thumbnailSvg: string;
  colorGrade: string;
  files: { path: string; content: string; language: string }[];
};

export type VideoProgressEvent = string;
