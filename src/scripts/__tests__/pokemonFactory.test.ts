import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock fetchHandler to avoid real network calls.
vi.mock("../fetchHandler", () => ({
  fetchWithRetry: vi.fn(),
}));

// Mock utils parseJson.
vi.mock("../utils", () => ({
  parseJson: vi.fn((res: { json: () => unknown }) => res.json()),
}));

// Provide env vars.
vi.stubEnv("VITE_POKEMONTCG_API_KEY", "test-api-key");

import fetchPokemon from "../pokemonFactory";
import { fetchWithRetry } from "../fetchHandler";
import type { QueryOptions } from "../types";

const mockFetchWithRetry = vi.mocked(fetchWithRetry);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("fetchPokemon", () => {
  describe("API success path", () => {
    it("fetches cards from API on success", async () => {
      const mockCards = [
        { id: "base1-1", name: "Bulbasaur", images: { small: "a", large: "b" } },
      ];
      mockFetchWithRetry.mockResolvedValue({
        json: () => Promise.resolve({ data: mockCards }),
      } as unknown as Response);

      const params: QueryOptions = {
        queryKey: ["card", "base1"],
        type: "card",
        params: { q: "set.id:base1" },
      };

      const result = await fetchPokemon(params);
      expect(result).toEqual(mockCards);
      expect(mockFetchWithRetry).toHaveBeenCalledTimes(1);
    });

    it("fetches sets from API on success", async () => {
      const mockSets = [
        { id: "base1", name: "Base", total: 102, images: { symbol: "s", logo: "l" } },
      ];
      mockFetchWithRetry.mockResolvedValue({
        json: () => Promise.resolve({ data: mockSets }),
      } as unknown as Response);

      const params: QueryOptions = {
        queryKey: ["set"],
        type: "set",
        params: { orderBy: "releaseDate" },
      };

      const result = await fetchPokemon(params);
      expect(result).toEqual(mockSets);
    });
  });

  describe("API failure → local fallback", () => {
    it("falls back to local set data when API fails", async () => {
      const localSets = [
        { id: "base1", name: "Base", total: 102, images: { symbol: "s", logo: "l" } },
      ];

      // First call (API) fails, second call (local fallback) succeeds.
      mockFetchWithRetry
        .mockRejectedValueOnce(new Error("API down"))
        .mockResolvedValueOnce({
          json: () => Promise.resolve(localSets),
        } as unknown as Response);

      const params: QueryOptions = {
        queryKey: ["set"],
        type: "set",
        params: {},
      };

      const result = await fetchPokemon(params);
      expect(result).toEqual(localSets);
    });

    it("falls back to local card data when API fails", async () => {
      const localCards = [
        {
          id: "base1-1",
          name: "Bulbasaur",
          images: { small: "s", large: "l" },
          cardmarket: { prices: { averageSellPrice: 5 } },
        },
      ];

      mockFetchWithRetry
        .mockRejectedValueOnce(new Error("API down")) // API call fails
        .mockResolvedValueOnce({
          json: () => Promise.resolve(localCards), // base1.json file
        } as unknown as Response);

      const params: QueryOptions = {
        queryKey: ["card", "base1"],
        type: "card",
        params: { q: "set.id:base1" },
      };

      const result = await fetchPokemon(params);
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty("id", "base1-1");
    });

    it("throws when both API and local fallback fail for sets", async () => {
      mockFetchWithRetry
        .mockRejectedValueOnce(new Error("API down"))
        .mockRejectedValueOnce(new Error("Local fetch failed"));

      const params: QueryOptions = {
        queryKey: ["set"],
        type: "set",
        params: {},
      };

      await expect(fetchPokemon(params)).rejects.toThrow("Local fetch failed");
    });

    it("handles Prismatic special case (queryKey -1) in local fallback", async () => {
      const prismaticCards = [
        {
          id: "sv8pt5-1",
          name: "Eevee",
          supertype: "Pokémon",
          set: { name: "Prismatic Evolutions" },
          images: { small: "s", large: "l" },
          cardmarket: { prices: { averageSellPrice: 10 } },
        },
        {
          id: "sv8pt5-2",
          name: "Trainer Card",
          supertype: "Trainer",
          set: { name: "Prismatic Evolutions" },
          images: { small: "s2", large: "l2" },
          cardmarket: { prices: { averageSellPrice: 2 } },
        },
      ];

      mockFetchWithRetry
        .mockRejectedValueOnce(new Error("API down")) // API fails
        .mockResolvedValueOnce({
          json: () => Promise.resolve(prismaticCards), // sv8pt5.json
        } as unknown as Response);

      const params: QueryOptions = {
        queryKey: ["card", "-1"],
        type: "card",
        params: { q: "set.name:Prismatic" },
      };

      const result = await fetchPokemon(params);
      // Should filter out non-Pokémon supertypes.
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty("id", "sv8pt5-1");
    });
  });
});
