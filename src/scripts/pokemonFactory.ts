import { PokemonTCG } from "@devdrc/pokemon-tcg-sdk-ts";
import { CardData, QueryOptions } from "./types";
import { fetchWithRetry } from "./fetchHandler";
// pokemon.configure({ apiKey: "a087390f-8839-444e-90b6-b09b9ecb6699" });

type CardMarket = {
  cardmarket?: {
    url: string;
    updatedAt: string;
    prices: {
      averageSellPrice: number;
      lowPrice: number;
      trendPrice: number;
      germanProLow: number;
      suggestedPrice: number;
      reverseHoloSell: number;
      reverseHoloLow: number;
      reverseHoloTrend: number;
      lowPriceExPlus: number;
      avg1: number;
      avg7: number;
      avg30: number;
      reverseHoloAvg1: number;
      reverseHoloAvg7: number;
      reverseHoloAvg30: number;
    };
  };
};

type CardWithMarket = PokemonTCG.ICard & CardMarket;

export default async function fetchPokemon(
  fetchParams: QueryOptions
): Promise<PokemonTCG.ISet[] | CardWithMarket[] | CardData[]> {
  try {
    const pokemonQueryHandler: (
      params: PokemonTCG.IParameter
    ) => Promise<CardWithMarket[] | PokemonTCG.ISet[]> =
      PokemonTCG[
        fetchParams.type === "card" ? "findCardsByQueries" : "findSetsByQueries"
      ];
    const result = await fetchWithRetry(
      () => pokemonQueryHandler(fetchParams.params),
      { timeoutSecs: 1, tries: 3 }
    );
    return result;
  } catch (error: any) {
    console.error("Error fetching Pokémon data from API:", error);
    console.info("Trying to fetch local data...:");

    if (fetchParams.type === "card") {
      try {
        const res = await fetchWithRetry(() => fetch("/data/card/.card.json"));
        const files: string[] = await res.json();
        const results: CardWithMarket[] = await Promise.all(
          files.map(async (file) => {
            const fileRes = await fetchWithRetry(() =>
              fetch(`/data/card/${file}`)
            );
            return fileRes.json();
          })
        );
        console.info("Successfully fetched local cards data.");
        if (fetchParams.queryKey[1] === "-1") {
          // If the queryKey is -1, filter for cards from the "Prismatic" set
          return results
            .flat()
            .filter(
              (card: CardWithMarket) =>
                card.set && // TODO: remove this check
                card.set.name === "Prismatic Evolutions" &&
                card.supertype === "Pokémon"
            )
            .sort(
              (a: CardWithMarket, b: CardWithMarket) =>
                (a.cardmarket?.prices?.averageSellPrice || 0) -
                (b.cardmarket?.prices?.averageSellPrice || 0)
            )
            .map((card: CardWithMarket) => {
              return { id: card.id, images: card.images } as CardData;
            });
        } else {
          // Otherwise, filter by set ID
          const sortedRetults = results
            .flat()
            .filter(
              (card: CardWithMarket) =>
                card.set && // TODO: remove this check
                card.set.id === fetchParams.queryKey[1]
            )
            .sort(
              (a: CardWithMarket, b: CardWithMarket) =>
                (a.cardmarket?.prices?.averageSellPrice || 0) -
                (b.cardmarket?.prices?.averageSellPrice || 0)
            );

          return sortedRetults.map((card: PokemonTCG.ICard) => {
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
    } else if (fetchParams.type === "set") {
      try {
        const setsData = await fetchWithRetry(() =>
          fetch(`/data/set/.set.json`)
        );
        const setsDataJson: PokemonTCG.ISet[] = await setsData.json();
        console.info("Successfully fetched local sets data: ", setsDataJson);
        return setsDataJson;
      } catch (fetchError) {
        console.error("Error fetching local Pokémon sets data:", fetchError);
        throw fetchError;
      }
    }
    throw new Error("Invalid fetch parameters");
  }
}
