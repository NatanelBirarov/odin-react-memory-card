import pokemon from "pokemontcgsdk";
pokemon.configure({ apiKey: "a087390f-8839-444e-90b6-b09b9ecb6699" });

export default function fetchPokemon(queryKey, type, options) {
  try {
    return pokemon[type].all(options);
  } catch (error) {
    console.error("Error fetching Pokémon data fro API:", error);
    console.error("Trying to fetch local data...:");

    if (type === "card") {
      fetch("/data/card/.card.json")
        .then((res) => res.json())
        .then((files) =>
          Promise.all(
            files.map((file) =>
              fetch(`/data/${file}`).then((res) => res.json())
            )
          )
        )
        .then((results) => {
          if (queryKey[1] === -1) {
            // If the queryKey is -1, filter for specific cards
            return results
              .flat()
              .filter(
                (card) =>
                  card.set.name.includes("Prismatic") &&
                  card.supertype === "Pokémon"
              )
              .sort(
                (a, b) =>
                  (b.tcgplayer?.prices?.holofoil?.mid || 0) -
                  (a.tcgplayer?.prices?.holofoil?.mid || 0)
              )
              .map((card) => {
                card.id, card.images;
              });
          }
          // Otherwise, filter by set ID
          else {
            return results
              .flat()
              .filter((card) => card.set.id === queryKey[1])
              .sort(
                (a, b) =>
                  (b.tcgplayer?.prices?.holofoil?.mid || 0) -
                  (a.tcgplayer?.prices?.holofoil?.mid || 0)
              )
              .map((card) => {
                card.id, card.name, card.images;
              });
          }
        })
        .catch((fetchError) => {
          console.error("Error fetching local Pokémon data:", fetchError);
          throw fetchError;
        });
    } else if (type === "set") {
      return fetch(`/data/set/.set.json`)
        .then((res) => res.json())
        .catch((fetchError) => {
          console.error("Error fetching local Pokémon sets data:", fetchError);
          throw fetchError;
        });
    }
  }
}
