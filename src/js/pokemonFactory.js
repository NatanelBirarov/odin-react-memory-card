import pokemon from "pokemontcgsdk";
pokemon.configure({ apiKey: "a087390f-8839-444e-90b6-b09b9ecb6699" });

export default function fetchPokemon(type, options) {
  try {
    const pokemonSet = pokemon[type].all({
      ...options,
    });
    return pokemonSet;
  } catch (error) {
    throw new Error(error);
  }
}
