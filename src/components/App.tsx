import Loader from "./Loader/Loader";
import { Outlet, useNavigation } from "react-router-dom";

import "../styles/global.css";
import { useEffect, useState } from "react";
import LocalStorageFactory from "../scripts/localStorageFactory";
import { ContextType } from "../scripts/types";
import ApiClient from "../scripts/apiClient";

type SettingsType = {
  musicVolume: number;
  sfxVolume: number;
};

function App() {
  const [showSettings, setShowSettings] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.5);
  const [sfxVolume, setSfxVolume] = useState(0.5);
  const [user, setUser] = useState(null);
  const [isLogged, setIsLogged] = useState(false);

  const navigation = useNavigation();

  useEffect(() => {
    async function loadSettings() {
      let settings: SettingsType = LocalStorageFactory.get("settings");
      if (!settings) {
        settings = await ApiClient.getSettings("local-user");
        LocalStorageFactory.set("settings", {
          musicVolumeInit: settings.musicVolume,
          sfxVolumeInit: settings.sfxVolume,
        });
      }
    }
    loadSettings();
  }, []);

  // if (pokemonData.isError) return <div>Error</div>;
  if (navigation.state === "loading") return <Loader />;

  const context: ContextType = {
    user,
    setUser,
    isLogged,
    setIsLogged,
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
