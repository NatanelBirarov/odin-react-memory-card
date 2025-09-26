import React, { useEffect, useMemo, useRef } from "react";
import LocalStorageFactory from "../scripts/localStorageFactory";
import { useNavigate, useOutletContext } from "react-router-dom";
import SettingsScreen from "./SettingsScreen";
import Menu from "./Menu";
import HowToScreen from "./HowToScreen";
import { selectionScreenQuery } from "../scripts/queries";
import { useQuery } from "@tanstack/react-query";
import { ContextType, SetDataType } from "../scripts/types";
import { PokemonTCG } from "@devdrc/pokemon-tcg-sdk-ts";

type SetLogo = {
  id: string;
  name: string;
  image: string;
  levels: number;
};

export default function SelectionScreen() {
  const {
    showSettings,
    setShowSettings,
    showHowTo,
    setShowHowTo,
    musicVolume,
  } = useOutletContext<ContextType>();

  const selectAudioRef = useRef(new Audio("/audio/selectClick.mp3"));
  const bgAudioRef = useRef<HTMLAudioElement>(null);
  const pokemonSets = useRef<SetLogo[]>([]);
  const gameData = useRef<SetDataType[]>([]);
  // const pokemonData = useLoaderData();

  type QueryResult = { data: PokemonTCG.ISet[] };
  const { data: pokemonData } = useQuery(selectionScreenQuery()) as QueryResult;
  const navigate = useNavigate();

  useEffect(() => {
    bgAudioRef.current.volume = musicVolume;
  }, [musicVolume]);

  gameData.current = useMemo(() => {
    let newGameData: SetDataType[] = [];
    if (pokemonData) {
      pokemonSets.current = pokemonData.map((set: PokemonTCG.ISet) => {
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
      pokemonSets.current = pokemonSets.current.filter((set: SetLogo) => {
        return set.name !== "Journey Together";
      });
      newGameData = LocalStorageFactory.get("gameData");
      if (!newGameData) {
        newGameData = [];
        pokemonSets.current.forEach((set: SetLogo) => {
          newGameData.push({
            id: set.id,
            completedLevels: 0,
            levels: set.levels,
            highScore: 0,
            completed: false,
          });
        });
        LocalStorageFactory.set("gameData", gameData.current);
      }
    }
    return newGameData;
  }, [pokemonData]);

  function handleSelectGame(id: string) {
    selectAudioRef.current.play();
    navigate(`/gamescreen/${id}`);
  }

  return (
    <>
      <audio
        className="title-screen-audio"
        ref={bgAudioRef}
        src="/audio/selectionBg.mp3"
        autoPlay
        loop
      />
      {showSettings && (
        <SettingsScreen onClose={() => setShowSettings(false)} />
      )}
      {showHowTo && <HowToScreen onClose={() => setShowHowTo(false)} />}
      <div className="selection-screen">
        {/* <div className="pokeball-border border-left">
        <div className="pokeball-border-inner"></div>
      </div> */}
        <div className="selections">
          {pokemonSets.current.map((set, index) => {
            const unlocked =
              index === 0 || gameData.current[index - 1].completed;
            return (
              <React.Fragment key={set.id}>
                <div
                  className={`selection ${
                    unlocked && !gameData.current[index].completed
                      ? ""
                      : "selection-locked"
                  }`}
                  onClick={() => handleSelectGame(set.id)}
                >
                  <span className="selection-name">{set.name}</span>
                  <img
                    className="selection-image"
                    src={set.image}
                    alt={set.name}
                  />
                  <span className="selection-level">
                    {gameData.current[index].completedLevels} / {set.levels}
                  </span>
                  <div
                    className={`selection-overlay ${unlocked ? "hidden" : ""}`}
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
          onReturnToSelection={() => navigate("/selectionscreen")}
        />
      </div>
    </>
  );
}
