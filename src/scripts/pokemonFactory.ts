import { PokemonTCG } from "@devdrc/pokemon-tcg-sdk-ts";
import { CardData, QueryOptions } from "./types";
// pokemon.configure({ apiKey: "a087390f-8839-444e-90b6-b09b9ecb6699" });

export default async function fetchPokemon(
  fetchParams: QueryOptions
): Promise<PokemonTCG.ISet[] | PokemonTCG.ICard[] | CardData[]> {
  try {
    return PokemonTCG[
      fetchParams.type === "card" ? "findCardsByQueries" : "findSetsByQueries"
    ](fetchParams.params);
  } catch (error) {
    console.error("Error fetching Pokémon data fro API:", error);
    console.error("Trying to fetch local data...:");

    if (fetchParams.type === "card") {
      try {
        const res = await fetch("/data/card/.card.json");
        const files: string[] = await res.json();
        const results: PokemonTCG.ICard[] = await Promise.all(
          files.map(async (file) => {
            const fileRes = await fetch(`/data/${file}`);
            return fileRes.json();
          })
        );

        if (fetchParams.queryKey[1] === -1) {
          // If the queryKey is -1, filter for specific cards
          return results
            .flat()
            .filter(
              (card: PokemonTCG.ICard) =>
                card.set.name.includes("Prismatic") &&
                card.supertype === "Pokémon"
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
