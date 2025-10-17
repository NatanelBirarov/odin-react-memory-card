import { PokemonTCG } from "@devdrc/pokemon-tcg-sdk-ts";
import fetchPokemon from "./pokemonFactory";
import { QueryOptions } from "./types";

const pokemonQuery = (fetchParams: QueryOptions) => ({
  queryKey: fetchParams.queryKey,
  queryFn: () => fetchPokemon(fetchParams),
  staleTime: Infinity,
});

export const titleScreenQuery = () => {
  const params: PokemonTCG.IParameter = {
    q: "set.name:Prismatic supertype:Pokémon",
    orderBy: "-tcgplayer.prices.holofoil.mid",
    select: "id,images",
  };

  return pokemonQuery({ queryKey: ["card", "-1"], type: "card", params });
};

export const selectionScreenQuery = () => {
  const params: PokemonTCG.IParameter = {
    orderBy: "releaseDate",
  };

  return pokemonQuery({ queryKey: ["set"], type: "set", params });
};

export const gameScreenQuery = (setId: string) => {
  const params: PokemonTCG.IParameter = {
    q: `set.id:${setId}`, // supertype:Pokémon
    orderBy: "tcgplayer.prices.holofoil.mid",
    select: "id,name,images",
  };

  return pokemonQuery({ queryKey: ["card", setId], type: "card", params });
};
