import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ApiClient from "./apiClient";
import LocalStorageFactory from "./localStorageFactory";
import type { SetDataType } from "./types";

// Shared cache key for game data queries and mutations.
export const GAME_DATA_QUERY_KEY = ["gameData"] as const;

/**
 * Inserts a new set or replaces an existing set by id.
 * 
 * @param current - The current array of set data.
 * @param next - The new set data to insert or update.
 * @returns A new array with the updated or appended set data.
 */
export function upsertGameData(
  current: SetDataType[],
  next: SetDataType,
): SetDataType[] {
  const index = current.findIndex((item) => item.id === next.id);
  if (index === -1) {
    return [...current, next];
  }

  const updated = [...current];
  updated[index] = next;
  return updated;
}

/**
 * Reads all game data and optionally hydrates with preloaded data.
 * 
 * @param initialData - Optional initial data to seed the query.
 * @returns A TanStack Query result object for the game data.
 */
export function useGameDataQuery(initialData?: SetDataType[]) {
  return useQuery({
    queryKey: GAME_DATA_QUERY_KEY,
    queryFn: () => ApiClient.getGameData(),
    staleTime: 60 * 1000,
    initialData,
  });
}

/**
 * Reads browser-cached game data once for query hydration and manages caching.
 * Uses local storage to persist the queried data for faster initial loads.
 * 
 * @returns A TanStack Query result object for the game data.
 */
export function useGameData() {
  const [seedData] = useState(
    () =>
      (LocalStorageFactory.get("gameData") as SetDataType[] | null) ||
      undefined,
  );
  const query = useGameDataQuery(seedData);

  useEffect(() => {
    if (!query.data?.length) return;
    LocalStorageFactory.set("gameData", query.data);
  }, [query.data]);

  return query;
}

/**
 * Mutation hook for saving game data to the server.
 * Optimistically updates the React Query cache and local storage before the network request completes,
 * and rolls back the changes if the request fails.
 * 
 * @returns A TanStack Query mutation result object.
 */
export function useSaveGameDataMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (nextGameData: SetDataType) =>
      ApiClient.saveGameData(nextGameData),
    // Optimistically write to cache/local storage before the request completes.
    onMutate: async (nextGameData: SetDataType) => {
      // Avoid race conditions where in-flight queries overwrite optimistic data.
      await queryClient.cancelQueries({ queryKey: GAME_DATA_QUERY_KEY });

      // Snapshot previous state for rollback if saving fails.
      const previous =
        queryClient.getQueryData<SetDataType[]>(GAME_DATA_QUERY_KEY) ?? [];
      const optimistic = upsertGameData(previous, nextGameData);

      queryClient.setQueryData(GAME_DATA_QUERY_KEY, optimistic);
      LocalStorageFactory.set("gameData", optimistic);

      return { previous };
    },
    // Roll back optimistic updates when the mutation errors.
    onError: (_error, _nextGameData, context) => {
      if (context?.previous) {
        queryClient.setQueryData(GAME_DATA_QUERY_KEY, context.previous);
        LocalStorageFactory.set("gameData", context.previous);
      }
    },
    // Refetch so cache is synchronized with server state.
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: GAME_DATA_QUERY_KEY });
    },
  });
}
