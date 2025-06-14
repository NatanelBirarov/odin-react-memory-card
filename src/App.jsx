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
  const [isLoading, setIsLoading] = useState(false);
  const [showTitleScreen, setShowTitleScreen] = useState(true);
  const [showSelectionScreen, setShowSelectionScreen] = useState(false);
  const [showGameScreen, setShowGameScreen] = useState(false);

  const pokemonSetCards = useRef([]);

  async function handleSelectSet(setId) {
    setShowTitleScreen(false);
    setShowSelectionScreen(false);
    try {
      setIsLoading(true);
      const pokemonSet = await pokemon.card.all({
        q: `set.id:${setId} supertype:Pokémon`,
        orderBy: "tcgplayer.prices.holofoil.mid",
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
      setShowGameScreen(true);
    } catch (error) {
      console.log(error);
    }
  }

  function handleShowSelectionScreen() {
    setShowTitleScreen(false);
    setShowSelectionScreen(true);
  }

  return (
    <>
      {isLoading && <Loader />}
      {showTitleScreen && (
        <TitleScreen
          pokemonApi={pokemon}
          cards={pokemonSetCards.current}
          onShowSelectionScreen={handleShowSelectionScreen}
        />
      )}
      {showSelectionScreen && (
        <SelectionScreen pokemonApi={pokemon} onSelectSet={handleSelectSet} />
      )}
      {showGameScreen && (
        <GameScreen
          currentSetCards={pokemonSetCards.current}
          startingLevel={0}
        />
      )}
    </>
  );
}

export default App;
