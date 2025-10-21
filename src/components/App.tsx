import Loader from "./Loader/Loader";
import { Outlet, useNavigation } from "react-router-dom";

import "../styles/styles.css";
import { useState } from "react";
import LocalStorageFactory from "../scripts/localStorageFactory";
import { ContextType } from "../scripts/types";

type VolumeType = {
  musicVolume: number;
  sfxVolume: number;
};

function App() {
  const volume: VolumeType = LocalStorageFactory.get("volume");
  if (!volume) {
    LocalStorageFactory.set("volume", {
      musicVolumeInit: 0.5,
      sfxVolumeInit: 0.5,
    });
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

  const context: ContextType = {
    showSettings,
    setShowSettings,
    showHowTo,
    setShowHowTo,
    musicVolume,
    setMusicVolume,
    sfxVolume,
    setSfxVolume,
  };

  return (
    <Outlet context={context} />
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
