import { describe, it, expect, beforeEach, vi } from "vitest";
import LocalStorageFactory from "../localStorageFactory";

// Use the real jsdom localStorage (provided by vitest jsdom environment).
beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("LocalStorageFactory", () => {
  describe("get", () => {
    it("returns parsed value for an existing key", () => {
      localStorage.setItem("test", JSON.stringify({ a: 1 }));
      expect(LocalStorageFactory.get("test")).toEqual({ a: 1 });
    });

    it("returns null for nonexistent key", () => {
      expect(LocalStorageFactory.get("missing")).toBeNull();
    });

    it("returns null for corrupted (non-JSON) data", () => {
      localStorage.setItem("bad", "not{json");
      expect(LocalStorageFactory.get("bad")).toBeNull();
    });

    it("handles string values", () => {
      localStorage.setItem("str", JSON.stringify("hello"));
      expect(LocalStorageFactory.get("str")).toBe("hello");
    });

    it("handles array values", () => {
      localStorage.setItem("arr", JSON.stringify([1, 2, 3]));
      expect(LocalStorageFactory.get("arr")).toEqual([1, 2, 3]);
    });

    it("handles numeric values", () => {
      localStorage.setItem("num", JSON.stringify(42));
      expect(LocalStorageFactory.get("num")).toBe(42);
    });

    it("handles boolean values", () => {
      localStorage.setItem("bool", JSON.stringify(true));
      expect(LocalStorageFactory.get("bool")).toBe(true);
    });

    it("handles null stored value", () => {
      localStorage.setItem("nil", JSON.stringify(null));
      expect(LocalStorageFactory.get("nil")).toBeNull();
    });
  });

  describe("set", () => {
    it("stores a value that can be retrieved", () => {
      LocalStorageFactory.set("key", { name: "test" });
      expect(JSON.parse(localStorage.getItem("key")!)).toEqual({
        name: "test",
      });
    });

    it("overwrites existing values", () => {
      LocalStorageFactory.set("key", "first");
      LocalStorageFactory.set("key", "second");
      expect(LocalStorageFactory.get("key")).toBe("second");
    });

    it("handles complex nested objects", () => {
      const complex = { a: { b: { c: [1, 2, 3] } } };
      LocalStorageFactory.set("complex", complex);
      expect(LocalStorageFactory.get("complex")).toEqual(complex);
    });
  });

  describe("clearItem", () => {
    it("removes specific key", () => {
      LocalStorageFactory.set("keep", "yes");
      LocalStorageFactory.set("remove", "no");

      LocalStorageFactory.clearItem("remove");

      expect(LocalStorageFactory.get("keep")).toBe("yes");
      expect(LocalStorageFactory.get("remove")).toBeNull();
    });

    it("does not throw for nonexistent key", () => {
      expect(() => LocalStorageFactory.clearItem("nope")).not.toThrow();
    });
  });

  describe("clear", () => {
    it("removes all keys", () => {
      LocalStorageFactory.set("a", 1);
      LocalStorageFactory.set("b", 2);

      LocalStorageFactory.clear();

      expect(LocalStorageFactory.get("a")).toBeNull();
      expect(LocalStorageFactory.get("b")).toBeNull();
    });
  });
});
