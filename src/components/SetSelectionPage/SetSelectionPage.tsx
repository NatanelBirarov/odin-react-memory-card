import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import SettingsPage from "../SettingsPage/SettingsPage";
import Menu from "../Menu/Menu";
import HowToPlayPage from "../HowToPlayPage/HowToPlay";
import { selectionPageQuery } from "../../scripts/queries";
import { useQuery } from "@tanstack/react-query";
import { ContextType, SetDataType } from "../../scripts/types";
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

  const [pokemonSets, setPokemonSets] = useState<SetLogo[]>([]);
  const selectAudioRef = useRef(new Audio("/audio/selectClick.mp3"));
  const bgAudioRef = useRef<HTMLAudioElement>(null);
  const gameData = useRef<SetDataType[]>([]);
  const { data: persistedGameData = [], isError: isGameDataError } =
    useGameData();
  // const pokemonData = useLoaderData();

  type SelectionPageData = {
    data: PokemonTCG.ISet[] | undefined;
    isError: boolean;
  };
  const { data: pokemonData, isError: isPokemonError } = useQuery(
    selectionPageQuery(),
  ) as SelectionPageData;
  const navigate = useNavigate();

  function handleReloadPage() {
    window.location.reload();
  }

  useEffect(() => {
    if (bgAudioRef.current) bgAudioRef.current.volume = musicVolume;
  }, [musicVolume]);

  useEffect(() => {
    const fetchGameData = () => {
      let pokemonSetsData: SetLogo[] = [];
      if (pokemonData) {
        // Convert API set metadata into UI-friendly cards and derive amount of playable levels.
        pokemonSetsData = pokemonData.map((set: PokemonTCG.ISet) => {
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
        pokemonSetsData = pokemonSetsData.filter((set: SetLogo) => {
          return set.name !== "Journey Together";
        });
      }

      // Prefer persisted progress from the query hook; otherwise bootstrap brand-new progress entries.
      const newGameData =
        persistedGameData.length > 0
          ? persistedGameData
          : pokemonSetsData.map((set: SetLogo) => ({
              id: set.id,
              completedLevels: 0,
              levels: set.levels,
              highScore: 0,
              completed: false,
            }));

      setPokemonSets(pokemonSetsData);
      gameData.current = newGameData;
    };

    fetchGameData();
  }, [pokemonData, persistedGameData]);

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
        {/* <div className="pokeball-border border-left">
        <div className="pokeball-border-inner"></div>
      </div> */}
        <div className={styles.selections}>
          {pokemonSets.map((set, index) => {
            const currentSetData = gameData.current[index];
            const unlocked =
              index === 0 || gameData.current[index - 1].completed;
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
                    className={`${styles.overlay} ${
                      unlocked ? styles.hidden : ""
                    }`}
                  >
                    <span>Complete the previous set to unlock this one!</span>
                  </div>
                  {/* <div
                    className={`selection-overlay ${
                      gameData.current[index].completed && !locked
                        ? ""
                        : "hidden"
                    }`}
                  >
                    <span>Set complete!</span>
                  </div> */}
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
