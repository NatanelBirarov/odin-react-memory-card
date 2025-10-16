import { PokemonTCG } from "@devdrc/pokemon-tcg-sdk-ts";
import { CardData, QueryOptions } from "./types";
import { fetchWithRetry } from "./fetchHandler";
// pokemon.configure({ apiKey: "a087390f-8839-444e-90b6-b09b9ecb6699" });

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  const timeoutPromise = new Promise<T>((_, reject) => {
    setTimeout(() => reject(new Error("Request timed out")), timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]);
}

export default async function fetchPokemon(
  fetchParams: QueryOptions
): Promise<PokemonTCG.ISet[] | PokemonTCG.ICard[] | CardData[]> {
  try {
    const pokemonQueryHandler: (
      params: PokemonTCG.IParameter
    ) => Promise<PokemonTCG.ICard[] | PokemonTCG.ISet[]> =
      PokemonTCG[
        fetchParams.type === "card" ? "findCardsByQueries" : "findSetsByQueries"
      ];
    const result = await fetchWithRetry(
      () => pokemonQueryHandler(fetchParams.params)
      // { timeoutSecs: , tries: 3 }
    ); // 5-second timeout
    return result;
  } catch (error) {
    console.error("Error fetching Pokémon data from API:", error);
    console.info("Trying to fetch local data...:");

    if (fetchParams.type === "card") {
      try {
        const res = await fetch("/data/card/.card.json");
        const files: string[] = await res.json();
        const results: PokemonTCG.ICard[] = await Promise.all(
          files.map(async (file) => {
            const fileRes = await fetch(`/data/card/${file}`);
            return fileRes.json();
          })
        );

        if (fetchParams.queryKey[1] === -1) {
          // If the queryKey is -1, filter for cards from the "Prismatic" set
          return results
            .flat()
            .filter(
              (card: PokemonTCG.ICard) =>
                card.id.includes("sv8pt5") && card.supertype === "Pokémon"
            )
            .sort(
              (a: PokemonTCG.ICard, b: PokemonTCG.ICard) =>
                (b.tcgplayer?.prices?.holofoil?.mid || 0) -
                (a.tcgplayer?.prices?.holofoil?.mid || 0)
            )
            .map((card: PokemonTCG.ICard) => {
              return { id: card.id, images: card.images } as CardData;
            });
        } else {
          // Otherwise, filter by set ID
          return results
            .flat()
            .filter(
              (card: PokemonTCG.ICard) =>
                card.set.id === fetchParams.queryKey[1]
            )
            .sort(
              (a: PokemonTCG.ICard, b: PokemonTCG.ICard) =>
                (b.tcgplayer?.prices?.holofoil?.mid || 0) -
                (a.tcgplayer?.prices?.holofoil?.mid || 0)
            )
            .map((card: PokemonTCG.ICard) => {
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
        const setsData = await fetch(`/data/set/.set.json`);
        const setsDataJson: PokemonTCG.ISet[] = await setsData.json();
        return setsDataJson;
      } catch (fetchError) {
        console.error("Error fetching local Pokémon sets data:", fetchError);
        throw fetchError;
      }
    }
  }
}
