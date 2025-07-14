import Loader from "./Loader";
import { Outlet, useNavigation } from "react-router-dom";

import "./styles.css";
import { useState } from "react";
import { getLocalStorage, setLocalStorage } from "../js/localStorageFactory";

function App() {
  const volume = getLocalStorage("volume", 0.5);
  if (!volume) {
    setLocalStorage("volume", { musicVolumeInit: 0.5, sfxVolumeInit: 0.5 });
  }
  const initialMusicVolume = volume?.musicVolume || 0.5;
  const initialSfxVolume = volume?.sfxVolume || 0.5;
  const [showSettings, setShowSettings] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);
  const [musicVolume, setMusicVolume] = useState(initialMusicVolume);
  const [sfxVolume, setSfxVolume] = useState(initialSfxVolume);

  const navigation = useNavigation();

  // if (pokemonData.isError) return <div>Error</div>;
  if (navigation.state === "loading") return <Loader />;

  return (
    <Outlet
      context={{
        showSettings,
        setShowSettings,
        showHowTo,
        setShowHowTo,
        musicVolume,
        setMusicVolume,
        sfxVolume,
        setSfxVolume,
      }}
    />
    // <>
    //   {/* {isLoading && <Loader />} */}
    //   {showTitleScreen && (
    //     <TitleScreen onShowSelectionScreen={handleShowSelectionScreen} />
    //   )}
    //   {showSelectionScreen && (
    //     <SelectionScreen
    //       onSelectSet={handleSelectSet}
    //       pokemonSets={pokemonSets.current}
    //     />
    //   )}
    //   {showGameScreen && (
    //     <GameScreen
    //       currentSetCards={pokemonSetCards.current}
    //       onShowSelectionScreen={handleShowSelectionScreen}
    //       gameData={gameData.current}
    //     />
    //   )}
    // </>
  );
}

export default App;
