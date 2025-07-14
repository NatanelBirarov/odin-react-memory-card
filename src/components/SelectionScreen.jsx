import React, { useEffect, useRef } from "react";
import { getLocalStorage, setLocalStorage } from "../js/localStorageFactory";
import { useLoaderData, useNavigate, useOutletContext } from "react-router-dom";
import SettingsScreen from "./SettingsScreen";
import Menu from "./Menu";
import HowToScreen from "./HowToScreen";

export default function SelectionScreen() {
  const {
    showSettings,
    setShowSettings,
    showHowTo,
    setShowHowTo,
    musicVolume,
    sfxVolume,
  } = useOutletContext();

  const selectAudioRef = useRef(new Audio("/selectClick.mp3"));
  const bgAudioRef = useRef(null);
  const pokemonSets = useRef([]);
  const gameData = useRef([]);
  const pokemonData = useLoaderData();
  const navigate = useNavigate();

  useEffect(() => {
    bgAudioRef.current.volume = musicVolume;
  }, [musicVolume]);

  pokemonSets.current = pokemonData.map((set) => {
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
        completedLevels: 0,
        levels: set.levels,
        highScore: 0,
        completed: false,
      });
    });
    setLocalStorage("gameData", gameData.current);
  }

  function handleSelectGame(id) {
    selectAudioRef.current.play();
    navigate(`/gamescreen/${id}`);
  }

  return (
    <>
      <audio
        className="title-screen-audio"
        ref={bgAudioRef}
        src="/selectionBg.mp3"
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
