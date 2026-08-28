import { describe, it, expect } from "vitest";
import { settingsSchema, gameDataSchema } from "../schemas";

describe("settingsSchema", () => {
  it("accepts valid volume values (0.5)", () => {
    const result = settingsSchema.safeParse({
      musicVolume: 0.5,
      sfxVolume: 0.5,
    });
    expect(result.success).toBe(true);
  });

  it("accepts boundary volume values (0 and 1)", () => {
    const result = settingsSchema.safeParse({
      musicVolume: 0,
      sfxVolume: 1,
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative musicVolume", () => {
    const result = settingsSchema.safeParse({
      musicVolume: -0.1,
      sfxVolume: 0.5,
    });
    expect(result.success).toBe(false);
  });

  it("rejects musicVolume greater than 1", () => {
    const result = settingsSchema.safeParse({
      musicVolume: 1.1,
      sfxVolume: 0.5,
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-numeric volume", () => {
    const result = settingsSchema.safeParse({
      musicVolume: "loud",
      sfxVolume: 0.5,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing field", () => {
    const result = settingsSchema.safeParse({
      musicVolume: 0.5,
    });
    expect(result.success).toBe(false);
  });
});

describe("gameDataSchema", () => {
  const validData = {
    setId: "base1",
    completedLevels: 3,
    levels: 5,
    highScore: 42,
    completed: false,
  };

  it("accepts valid game data payload", () => {
    const result = gameDataSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("rejects empty setId", () => {
    const result = gameDataSchema.safeParse({
      ...validData,
      setId: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative completedLevels", () => {
    const result = gameDataSchema.safeParse({
      ...validData,
      completedLevels: -1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects levels less than 1", () => {
    const result = gameDataSchema.safeParse({
      ...validData,
      levels: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer levels", () => {
    const result = gameDataSchema.safeParse({
      ...validData,
      levels: 3.5,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative highScore", () => {
    const result = gameDataSchema.safeParse({
      ...validData,
      highScore: -5,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing completed boolean", () => {
    const { completed, ...missingCompleted } = validData;
    const result = gameDataSchema.safeParse(missingCompleted);
    expect(result.success).toBe(false);
  });
});
