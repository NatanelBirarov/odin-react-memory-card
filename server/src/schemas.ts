import z from "zod";

export const settingsSchema = z.object({
  musicVolume: z
    .number()
    .min(0, "Music volume must be at least 0")
    .max(1, "Music volume must be at most 1"),
  sfxVolume: z
    .number()
    .min(0, "SFX volume must be at least 0")
    .max(1, "SFX volume must be at most 1"),
});

export const gameDataSchema = z.object({
  setId: z.string().min(1, "Set ID is required"),
  completedLevels: z
    .number()
    .int()
    .min(0, "Completed levels must be at least 0"),
  levels: z.number().int().min(1, "Levels must be at least 1"),
  highScore: z.number().int().min(0, "High score must be at least 0"),
  completed: z.boolean(),
});
