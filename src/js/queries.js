import fetchPokemon from "./pokemonFactory";

const pokemonQuery = (queryKey, type, options) => ({
  queryKey: queryKey,
  queryFn: () => fetchPokemon(queryKey, type, options),
  staleTime: Infinity,
});

export const titleScreenQuery = () =>
  pokemonQuery(["card", -1], "card", {
    q: "set.name:Prismatic supertype:Pokémon",
    orderBy: "-tcgplayer.prices.holofoil.mid",
    select: "id,images",
  });

export const selectionScreenQuery = () =>
  pokemonQuery(["set"], "set", {
    orderBy: "releaseDate",
  });

export const gameScreenQuery = (setId) =>
  pokemonQuery(["card", setId], "card", {
    q: `set.id:${setId}`, // supertype:Pokémon
    orderBy: "tcgplayer.prices.holofoil.mid",
    select: "id,name,images",
  });
