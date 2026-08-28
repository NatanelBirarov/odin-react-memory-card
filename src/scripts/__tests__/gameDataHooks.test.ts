import { describe, it, expect } from "vitest";
import { upsertGameData } from "../gameDataHooks";
import type { SetDataType } from "../types";

const makeSet = (id: string, overrides: Partial<SetDataType> = {}): SetDataType => ({
  id,
  completedLevels: 0,
  levels: 5,
  highScore: 0,
  completed: false,
  ...overrides,
});

describe("upsertGameData", () => {
  it("inserts into empty array", () => {
    const result = upsertGameData([], makeSet("base1"));
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("base1");
  });

  it("appends when ID does not exist", () => {
    const current = [makeSet("base1")];
    const result = upsertGameData(current, makeSet("base2"));
    expect(result).toHaveLength(2);
    expect(result[1].id).toBe("base2");
  });

  it("updates existing item by ID", () => {
    const current = [makeSet("base1", { highScore: 5 })];
    const result = upsertGameData(current, makeSet("base1", { highScore: 10 }));
    expect(result).toHaveLength(1);
    expect(result[0].highScore).toBe(10);
  });

  it("preserves other items when updating", () => {
    const current = [
      makeSet("base1", { highScore: 5 }),
      makeSet("base2", { highScore: 3 }),
      makeSet("base3", { highScore: 7 }),
    ];
    const result = upsertGameData(current, makeSet("base2", { highScore: 99 }));
    expect(result).toHaveLength(3);
    expect(result[0].highScore).toBe(5); // base1 unchanged
    expect(result[1].highScore).toBe(99); // base2 updated
    expect(result[2].highScore).toBe(7); // base3 unchanged
  });

  it("does not mutate original array", () => {
    const current = [makeSet("base1")];
    const result = upsertGameData(current, makeSet("base2"));
    expect(current).toHaveLength(1); // original unchanged
    expect(result).toHaveLength(2);
  });

  it("replaces the item at the same index position", () => {
    const current = [makeSet("a"), makeSet("b"), makeSet("c")];
    const updated = makeSet("b", { completed: true });
    const result = upsertGameData(current, updated);
    expect(result[1]).toEqual(updated);
  });
});
