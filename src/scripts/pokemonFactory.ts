import { CardData, PokemonCard, PokemonParameter, PokemonSet, QueryOptions } from "./types";
import { fetchWithRetry } from "./fetchHandler";
import { parseJson } from "./utils";

type CardMarket = {
  cardmarket?: {
    url?: string;
    updatedAt?: string;
    prices?: {
      averageSellPrice?: number;
      lowPrice?: number;
      trendPrice?: number;
      germanProLow?: number;
      suggestedPrice?: number;
      reverseHoloSell?: number;
      reverseHoloLow?: number;
      reverseHoloTrend?: number;
      lowPriceExPlus?: number;
      avg1?: number;
      avg7?: number;
      avg30?: number;
      reverseHoloAvg1?: number;
      reverseHoloAvg7?: number;
      reverseHoloAvg30?: number;
    };
  };
};

type CardWithMarket = PokemonCard & CardMarket;

const POKEMON_API_BASE_URL = "https://api.pokemontcg.io/v2";
const API_TIMEOUT_MS = 10000;

function toSearchParams(params: PokemonParameter): URLSearchParams {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (typeof value === "string") {
        searchParams.set(key, value);
      } else if (typeof value === "number" || typeof value === "boolean") {
        searchParams.set(key, String(value));
      } else {
        searchParams.set(key, JSON.stringify(value));
      }
    }
  });

  return searchParams;
}

function buildApiHeaders(): HeadersInit {
  const apiKey = import.meta.env.VITE_POKEMONTCG_API_KEY as string | undefined;

  return apiKey
    ? {
      "Content-Type": "application/json",
      "X-Api-Key": apiKey,
    }
    : {
      "Content-Type": "application/json",
    };
}

async function fetchPokemonApi<T>(
  resource: "cards" | "sets",
  params: PokemonParameter,
): Promise<T[]> {
  const result = await fetchWithRetry(async () => {
    const response = await fetch(
      `${POKEMON_API_BASE_URL}/${resource}?${toSearchParams(params).toString()}`,
      {
        headers: buildApiHeaders(),
        signal: AbortSignal.timeout(API_TIMEOUT_MS),
      },
    );

    if (!response.ok) {
      throw new Error(
        `Pokemon TCG API request failed (${response.status} ${response.statusText})`,
      );
    }

    return response;
  }, 3);

  const data = await parseJson<{ data: T[] }>(result);
  return data.data;
}

export default async function fetchPokemon(
  fetchParams: QueryOptions,
): Promise<PokemonSet[] | CardWithMarket[] | CardData[]> {
  try {
    if (fetchParams.type === "card") {
      return await fetchPokemonApi<CardWithMarket>("cards", fetchParams.params);
    }

    return await fetchPokemonApi<PokemonSet>("sets", fetchParams.params);
  } catch (error: unknown) {
    console.error("Error fetching Pokémon data from API:", error);
    console.info("Trying to fetch local data...:");

    if (fetchParams.type === "card") {
      try {
        if (fetchParams.queryKey[1] === "-1") {
          // If the queryKey is -1, filter for cards from the "Prismatic" set
          const results: CardWithMarket[][] = await fetchCardsFromFiles([
            "sv8pt5.json",
          ]);
          console.info("Successfully fetched local cards data.");
          return results
            .flat()
            .filter(
              (card: CardWithMarket) =>
                card.set?.name === "Prismatic Evolutions" &&
                card.supertype === "Pokémon",
            )
            .sort(
              (a: CardWithMarket, b: CardWithMarket) =>
                (a.cardmarket?.prices?.averageSellPrice ?? 0) -
                (b.cardmarket?.prices?.averageSellPrice ?? 0),
            )
            .map((card: CardWithMarket) => {
              return { id: card.id, images: card.images } as CardData;
            });
        } else {
          // Otherwise, filter by set ID
          const setId = fetchParams.queryKey[1];
          const results = await fetchCardsFromFiles([`${setId}.json`]);
          console.info("Successfully fetched local cards data.");
          const sortedResults = results
            .flat()
            .filter(Boolean) // filters out any empty/falsy items
            .sort(
              (a: CardWithMarket, b: CardWithMarket) =>
                (a.cardmarket?.prices?.averageSellPrice ?? 0) -
                (b.cardmarket?.prices?.averageSellPrice ?? 0),
            );

          return sortedResults.map((card: PokemonCard) => {
            return {
              id: card.id,
              name: card.name,
              images: card.images,
            } as CardData;
          });
        }
      } catch (fetchError) {
        console.error("Error fetching local Pokémon data:", fetchError);
        throw fetchError;
      }
    } else {
      try {
        const setsData = await fetchWithRetry(() =>
          fetch(`/data/set/.set.json`),
        );
        const setsDataJson = await parseJson<PokemonSet[]>(setsData);
        console.info("Successfully fetched local sets data: ", setsDataJson);
        return setsDataJson;
      } catch (fetchError) {
        console.error("Error fetching local Pokémon sets data:", fetchError);
        throw fetchError;
      }
    }
  }
}
async function fetchCardsFromFiles(
  files: string[],
): Promise<CardWithMarket[][]> {
  return Promise.all(
    files.map(async (file) => {
      const fileRes = await fetchWithRetry(() => fetch(`/data/card/${file}`));
      return parseJson<CardWithMarket[]>(fileRes);
    }),
  );
}
