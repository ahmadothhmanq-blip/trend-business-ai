import { z } from "zod";

export const favoriteSchema = z.object({
  is_favorite: z.boolean(),
});
