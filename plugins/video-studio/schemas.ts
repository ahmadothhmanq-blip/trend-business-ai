const stringArray = { type: "array", items: { type: "string" } };

export const videoAnalysisSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    concept: { type: "string" },
    videoType: { type: "string" },
    style: { type: "string" },
    mood: { type: "string" },
    targetAudience: { type: "string" },
    keyMessages: stringArray,
    visualTheme: { type: "string" },
    pacing: { type: "string" },
  },
  required: ["title", "concept", "videoType", "style", "mood", "targetAudience", "keyMessages", "visualTheme", "pacing"],
};

export const videoPlanSchema = {
  type: "object",
  properties: {
    scenes: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          description: { type: "string" },
          duration: { type: "string" },
          visualDirection: { type: "string" },
          cameraMove: { type: "string" },
          mood: { type: "string" },
          transition: { type: "string" },
        },
        required: ["id", "name", "description", "duration", "visualDirection", "cameraMove", "mood", "transition"],
      },
    },
    colorPalette: stringArray,
    musicDirection: { type: "string" },
    pacing: { type: "string" },
    totalDuration: { type: "string" },
    narrativeArc: { type: "string" },
  },
  required: ["scenes", "colorPalette", "musicDirection", "pacing", "totalDuration", "narrativeArc"],
};

export const videoSceneOutputSchema = {
  type: "object",
  properties: {
    narration: { type: "string" },
    musicDirection: { type: "string" },
    sfxNotes: { type: "string" },
    svgStoryboard: { type: "string" },
    visualPrompt: { type: "string" },
  },
  required: ["narration", "musicDirection", "sfxNotes", "svgStoryboard", "visualPrompt"],
};

export const videoThumbnailSchema = {
  type: "object",
  properties: {
    svgCode: { type: "string" },
  },
  required: ["svgCode"],
};
