import Loader from "./Loader";
import { Outlet, useNavigation } from "react-router-dom";

import "./styles.css";
import { useState } from "react";

function App() {
  const [showSettings, setShowSettings] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.5);
  const [sfxVolume, setSfxVolume] = useState(0.5);

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
