import { describe, it, expect } from "vitest";
import { handleApiError } from "../errorUtils";

describe("handleApiError", () => {
  it("returns fallback message for null input", () => {
    expect(handleApiError(null)).toEqual(["An unexpected error occurred"]);
  });

  it("returns fallback message for undefined input", () => {
    expect(handleApiError(undefined)).toEqual(["An unexpected error occurred"]);
  });

  it("returns the string when input is a string", () => {
    expect(handleApiError("Something went wrong")).toEqual([
      "Something went wrong",
    ]);
  });

  it("extracts message from { message: string } object", () => {
    expect(handleApiError({ message: "Server error" })).toEqual([
      "Server error",
    ]);
  });

  it("extracts array of messages from { message: string[] }", () => {
    expect(handleApiError({ message: ["Error 1", "Error 2"] })).toEqual([
      "Error 1",
      "Error 2",
    ]);
  });

  it("extracts error string from { error: string }", () => {
    expect(handleApiError({ error: "Unauthorized" })).toEqual([
      "Unauthorized",
    ]);
  });

  it("extracts nested message from { error: { message: string } }", () => {
    expect(handleApiError({ error: { message: "Token expired" } })).toEqual([
      "Token expired",
    ]);
  });

  it("returns fallback for empty string message", () => {
    expect(handleApiError({ message: "" })).toEqual([
      "An unexpected error occurred",
    ]);
  });

  it("returns fallback for whitespace-only message", () => {
    expect(handleApiError({ message: "   " })).toEqual([
      "An unexpected error occurred",
    ]);
  });

  it("uses custom fallback message", () => {
    expect(handleApiError(null, "Custom fallback")).toEqual([
      "Custom fallback",
    ]);
  });

  it("returns fallback for object with neither message nor error", () => {
    expect(handleApiError({ code: 500 })).toEqual([
      "An unexpected error occurred",
    ]);
  });

  it("returns fallback for empty object", () => {
    expect(handleApiError({})).toEqual(["An unexpected error occurred"]);
  });

  it("converts non-string array items to strings", () => {
    expect(handleApiError({ message: [42, true] })).toEqual(["42", "true"]);
  });

  it("returns fallback for { error: '' } (empty error string)", () => {
    expect(handleApiError({ error: "" })).toEqual([
      "An unexpected error occurred",
    ]);
  });
});
