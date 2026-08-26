import fetchPokemon from "./pokemonFactory";
import { PokemonParameter, QueryOptions } from "./types";

const pokemonQuery = (fetchParams: QueryOptions) => ({
  queryKey: fetchParams.queryKey,
  queryFn: () => fetchPokemon(fetchParams),
  staleTime: Infinity,
});

export const titlePageQuery = () => {
  const params: PokemonParameter = {
    q: "set.name:Prismatic supertype:Pokémon",
    orderBy: "-tcgplayer.prices.holofoil.mid",
    select: "id,images",
  };

  return pokemonQuery({ queryKey: ["card", "-1"], type: "card", params });
};

export const selectionPageQuery = () => {
  const params: PokemonParameter = {
    orderBy: "releaseDate",
  };

  return pokemonQuery({ queryKey: ["set"], type: "set", params });
};

export const gamePageQuery = (setId: string) => {
  const params: PokemonParameter = {
    q: `set.id:${setId}`, // supertype:Pokémon
    orderBy: "tcgplayer.prices.holofoil.mid",
    select: "id,name,images",
  };

  return pokemonQuery({ queryKey: ["card", setId], type: "card", params });
};
