import React, { useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import SettingsPage from "../SettingsPage/SettingsPage";
import Menu from "../Menu/Menu";
import HowToPlayPage from "../HowToPlayPage/HowToPlay";
import Loader from "../Loader/Loader";
import { selectionPageQuery } from "../../scripts/queries";
import { useQuery } from "@tanstack/react-query";
import { PokemonTCG } from "@devdrc/pokemon-tcg-sdk-ts";
import Img from "../Img/Img";
import Button from "../Button/Button";

import styles from "./SetSelectionPage.module.css";
import { useGameData } from "../../scripts/gameDataHooks";
import { useSettingsContext } from "../../context/SettingsContext";

type SetLogo = {
  id: string;
  name: string;
  image: string;
  levels: number;
};

export default function SetSelectionPage() {
  const {
    showSettings,
    setShowSettings,
    showHowTo,
    setShowHowTo,
    musicVolume,
  } = useSettingsContext();

  const selectAudioRef = useRef(new Audio("/audio/selectClick.mp3"));
  const bgAudioRef = useRef<HTMLAudioElement>(null);
  const { data: persistedGameData = [], isError: isGameDataError } =
    useGameData();

  const {
    data: pokemonData,
    isError: isPokemonError,
    isLoading: isPokemonLoading,
  } = useQuery(selectionPageQuery());
  const navigate = useNavigate();

  function handleReloadPage() {
    window.location.reload();
  }

  useEffect(() => {
    if (bgAudioRef.current) bgAudioRef.current.volume = musicVolume;
  }, [musicVolume]);

  const pokemonSets: SetLogo[] = useMemo(() => {
    if (!pokemonData) return [];
    return (pokemonData as PokemonTCG.ISet[])
      .filter((set) => set.name !== "Journey Together")
      .map((set) => ({
        id: set.id,
        name: set.name,
        image: set.images.logo,
        levels:
          set.total % 10 > 5
            ? Math.floor(set.total / 10 + 1)
            : Math.floor(set.total / 10),
      }));
  }, [pokemonData]);

  const gameData = useMemo(() => {
    if (persistedGameData.length > 0) return persistedGameData;
    return pokemonSets.map((set) => ({
      id: set.id,
      completedLevels: 0,
      levels: set.levels,
      highScore: 0,
      completed: false,
    }));
  }, [persistedGameData, pokemonSets]);

  function handleSelectGame(id: string) {
    void (async () => {
      try {
        await selectAudioRef.current.play();
        void navigate(`/gamepage/${id}`);
      } catch (error) {
        console.error("Error playing audio:", error);
      }
    })();
  }

  if (isPokemonLoading) {
    return <Loader />;
  }

  if (isPokemonError || isGameDataError || !pokemonSets.length) {
    return (
      <>
        <audio ref={bgAudioRef} src="/audio/selectionBg.mp3" autoPlay loop />
        {showSettings && (
          <SettingsPage onClose={() => setShowSettings(false)} />
        )}
        {showHowTo && <HowToPlayPage onClose={() => setShowHowTo(false)} />}
        <div className={styles.main}>
          <div className={styles.selections}>
            <Button type="titlePage" onClick={handleReloadPage}>
              Reload
            </Button>
            <Button
              type="titlePage"
              onClick={() => {
                void navigate("/titlepage");
              }}
            >
              Back to title
            </Button>
          </div>
          <Menu
            onShowSettings={() => setShowSettings(true)}
            onShowHowTo={() => setShowHowTo(true)}
            onReturnToSelection={() => {
              void navigate("/selectionpage");
            }}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <audio ref={bgAudioRef} src="/audio/selectionBg.mp3" autoPlay loop />
      {showSettings && <SettingsPage onClose={() => setShowSettings(false)} />}
      {showHowTo && <HowToPlayPage onClose={() => setShowHowTo(false)} />}
      <div className={styles.main}>
        <div className={styles.selections}>
          {pokemonSets.map((set, index) => {
            const currentSetData = gameData[index] || {
              completedLevels: 0,
              completed: false,
              levels: set.levels,
              id: set.id,
              highScore: 0,
            };
            const unlocked =
              index === 0 || !!gameData[index - 1]?.completed;
            const completedLevels = currentSetData.completedLevels;

            return (
              <React.Fragment key={set.id}>
                <div
                  className={styles.selection}
                  onClick={() => {
                    if (!unlocked) return;
                    handleSelectGame(set.id);
                  }}
                  aria-disabled={!unlocked}
                  style={{ cursor: unlocked ? "pointer" : "not-allowed" }}
                >
                  <span className={styles.name}>{set.name}</span>
                  <Img type="selection" src={set.image} alt={set.name} />
                  <span className={styles.level}>
                    {completedLevels} / {set.levels}
                  </span>
                  <div
                    className={`${styles.overlay} ${unlocked ? styles.hidden : ""
                      }`}
                  >
                    <span>Complete the previous set to unlock this one!</span>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
        <Menu
          onShowSettings={() => setShowSettings(true)}
          onShowHowTo={() => setShowHowTo(true)}
          onReturnToSelection={() => {
            void navigate("/selectionpage");
          }}
        />
      </div>
    </>
  );
}
