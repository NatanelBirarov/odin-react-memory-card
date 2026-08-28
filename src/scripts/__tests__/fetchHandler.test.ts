import { describe, it, expect, vi } from "vitest";
import { fetchWithRetry } from "../fetchHandler";

describe("fetchWithRetry", () => {
  it("returns value on first successful attempt", async () => {
    const fn = vi.fn().mockResolvedValue("success");

    const result = await fetchWithRetry(fn);

    expect(result).toBe("success");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("retries and succeeds on second attempt", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error("fail"))
      .mockResolvedValue("success");

    const result = await fetchWithRetry(fn);

    expect(result).toBe("success");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("retries twice and succeeds on third attempt (tries=3)", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error("fail 1"))
      .mockRejectedValueOnce(new Error("fail 2"))
      .mockResolvedValue("success");

    const result = await fetchWithRetry(fn, 3);

    expect(result).toBe("success");
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("throws after exhausting all retries", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("always fails"));

    await expect(fetchWithRetry(fn, 3)).rejects.toThrow(
      "Failed after 3 tries: always fails",
    );
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("does not retry when tries=1", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("single fail"));

    await expect(fetchWithRetry(fn, 1)).rejects.toThrow(
      "Failed after 1 tries: single fail",
    );
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("includes original error message in thrown error", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("network timeout"));

    await expect(fetchWithRetry(fn, 2)).rejects.toThrow("network timeout");
  });

  it("returns the value from the successful retry, not earlier attempts", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error("fail"))
      .mockResolvedValue({ data: "correct" });

    const result = await fetchWithRetry(fn, 3);

    expect(result).toEqual({ data: "correct" });
  });

  it("uses default tries=3 when not specified", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error("1"))
      .mockRejectedValueOnce(new Error("2"))
      .mockResolvedValue("ok");

    const result = await fetchWithRetry(fn);

    expect(result).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("throws after default 3 tries when all fail", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("persistent"));

    await expect(fetchWithRetry(fn)).rejects.toThrow("Failed after 3 tries");
    expect(fn).toHaveBeenCalledTimes(3);
  });
});
