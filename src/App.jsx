import { useRef, useState } from "react";
import { useEffect } from "react";
import Loader from "./Loader";
import TitleScreen from "./TitleScreen";
import GameScreen from "./GameScreen";
import SelectionScreen from "./SelectionScreen";

import pokemon from "pokemontcgsdk";

import "./styles.css";

pokemon.configure({ apiKey: "a087390f-8839-444e-90b6-b09b9ecb6699" });

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isGameStarted, setIsGameStarted] = useState(false);

  const pokemonSetCards = useRef([]);

  useEffect(() => {
    const createNewCards = async () => {
      setIsLoading(true);
      const pokemonSet = await pokemon.card.all({
        q: "set.name:Prismatic supertype:Pokémon",
        orderBy: "-tcgplayer.prices.holofoil.mid",
      });
      pokemonSetCards.current = pokemonSet.map((card) => {
        return {
          id: card.id,
          name: card.name,
          image: card.images.large,
          clicked: false,
        };
      });
      setIsLoading(false);
    };
    createNewCards();
  }, []);

  function handleGameStart() {
    setIsGameStarted(true);
  }

  return (
    <>
      <SelectionScreen pokemonApi={pokemon} />
      {/* {isLoading ? (
        <Loader />
      ) : isGameStarted ? (
        <GameScreen
          currentSetCards={pokemonSetCards.current}
          startingLevel={0}
        />
      ) : (
        <TitleScreen
          cards={pokemonSetCards.current}
          onClick={handleGameStart}
          pokemonApi={pokemon}
        />
      )} */}
    </>
  );
}

export default App;
