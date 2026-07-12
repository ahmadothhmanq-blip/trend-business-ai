import type { AIProvider, GeneratedProjectFile } from "@/lib/ai/types";

export type GenerateFileOptions<T> = {
  provider: AIProvider;
  prompt: string;
  schema: object;
  maxAttempts?: number;
  validate: (result: T) => { valid: boolean; reason?: string };
};

export async function generateWithValidation<T extends GeneratedProjectFile>(
  options: GenerateFileOptions<T>,
): Promise<T> {
  const maxAttempts = options.maxAttempts ?? 3;
  let validationReason = "";

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const prompt = validationReason
      ? `${options.prompt}\n\nPrevious attempt failed validation: ${validationReason}`
      : options.prompt;

    const result = await options.provider.generateJson<T>({
      prompt,
      schema: options.schema,
    });

    const validation = options.validate(result);
    if (validation.valid) {
      return result;
    }

    validationReason = validation.reason ?? "Generated output failed validation.";
  }

  throw new Error(`Generation failed after ${maxAttempts} attempts: ${validationReason}`);
}
