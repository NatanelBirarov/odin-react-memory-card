import React, { createContext, useContext, useState } from "react";
import { ContextType } from "../scripts/types";

export const SettingsContext = createContext<ContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [showSettings, setShowSettings] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.5);
  const [sfxVolume, setSfxVolume] = useState(0.5);

  const contextValue: ContextType = {
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
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettingsContext() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettingsContext must be used within a SettingsProvider");
  }
  return context;
}
