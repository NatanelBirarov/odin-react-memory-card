import { useEffect, useRef, useState } from "react";
import Loader from "./Loader";
import TitleScreen from "./TitleScreen";
import GameScreen from "./GameScreen";
import SelectionScreen from "./SelectionScreen";

import { getLocalStorage, setLocalStorage } from "../js/localStorageFactory";

import pokemon from "pokemontcgsdk";

import "./styles.css";

pokemon.configure({ apiKey: "a087390f-8839-444e-90b6-b09b9ecb6699" });

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [showTitleScreen, setShowTitleScreen] = useState(false);
  const [showSelectionScreen, setShowSelectionScreen] = useState(false);
  const [showGameScreen, setShowGameScreen] = useState(false);

  const pokemonSetCards = useRef([]);
  const gameData = useRef([]);
  const pokemonSets = useRef([]);

  useEffect(() => {
    const getSets = async () => {
      try {
        setIsLoading(true);
        const pokemonSet = await pokemon.set.all({
          orderBy: "releaseDate",
        });
        pokemonSets.current = pokemonSet.map((set) => {
          return {
            id: set.id,
            name: set.name,
            image: set.images.logo,
            levels:
              set.total % 10 > 5
                ? Math.floor(set.total / 10 + 1)
                : Math.floor(set.total / 10),
          };
        });
        pokemonSets.current = pokemonSets.current.filter((set) => {
          return set.name !== "Journey Together";
        });
        gameData.current = getLocalStorage("gameData");
        if (!gameData.current) {
          gameData.current = [];
          pokemonSets.current.forEach((set) => {
            gameData.current.push({
              id: set.id,
              currentLevel: 0,
              levels: set.levels,
              highScore: 0,
              completed: false,
            });
          });
          setLocalStorage("gameData", gameData.current);
        }
        // pokemonSets.current.forEach((set, index) => {
        //   set.previousCompleted =
        //     index !== 0 && gameData.current[index - 1].completed ? true : false;
        // });

        setIsLoading(false);
        setShowTitleScreen(true);
      } catch (error) {
        console.log(error);
      }
    };
    getSets();
  }, []);

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
      gameData.current = getLocalStorage("gameData");
      setIsLoading(false);
      setShowGameScreen(true);
    } catch (error) {
      console.log(error);
    }
  }

  function handleShowSelectionScreen() {
    setShowGameScreen(false);
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
        <SelectionScreen
          onSelectSet={handleSelectSet}
          pokemonSets={pokemonSets.current}
        />
      )}
      {showGameScreen && (
        <GameScreen
          currentSetCards={pokemonSetCards.current}
          onShowSelectionScreen={handleShowSelectionScreen}
          gameData={gameData.current}
        />
      )}
    </>
  );
}

export default App;
