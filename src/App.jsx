import { useState } from "react";
import { useEffect } from "react";
import Card from "./Card";
import Score from "./Score";
import "./styles.css";
import Loader from "./Loader";
import TitleScreen from "./TitleScreen";

import pokemon from "pokemontcgsdk";
import GameScreen from "./GameScreen";

pokemon.configure({ apiKey: "a087390f-8839-444e-90b6-b09b9ecb6699" });

function App() {
  const [pokemonSetCards, setPokemonSetCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGameStarted, setIsGameStarted] = useState(false);

  useEffect(() => {
    const createNewCards = async () => {
      setIsLoading(true);
      const pokemonSet = await pokemon.card.all({
        q: "set.name:Prismatic supertype:Pokémon",
        orderBy: "-tcgplayer.prices.holofoil.mid",
      });
      setPokemonSetCards(
        pokemonSet.map((card) => {
          return {
            id: card.id,
            name: card.name,
            image: card.images.large,
            clicked: false,
          };
        })
      );
      setIsLoading(false);
    };
    createNewCards();
  }, []);

  function handleGameStart() {
    setIsGameStarted(true);
  }

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : isGameStarted ? (
        <GameScreen currentSetCards={pokemonSetCards} startingLevel={0} />
      ) : (
        <TitleScreen
          cards={pokemonSetCards}
          onClick={handleGameStart}
          pokemonApi={pokemon}
        />
      )}
    </>
  );
}

export default App;
