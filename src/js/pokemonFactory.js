import pokemon from "pokemontcgsdk";
pokemon.configure({ apiKey: "a087390f-8839-444e-90b6-b09b9ecb6699" });

export default function fetchPokemon(type, options) {
  return pokemon[type].all(options);
}
