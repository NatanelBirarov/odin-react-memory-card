import Loader from "./Loader/Loader";
import { Outlet, useNavigation } from "react-router-dom";

import "../styles/global.css";
import { useState } from "react";
import { ContextType } from "../scripts/types";

function App() {
  const [showSettings, setShowSettings] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.5);
  const [sfxVolume, setSfxVolume] = useState(0.5);
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

  return <Outlet context={context} />;
}

export default App;
