import React, { useRef } from "react";
import { getLocalStorage, setLocalStorage } from "../js/localStorageFactory";
import { useLoaderData, useNavigate } from "react-router-dom";

export default function SelectionScreen() {
  const pokemonSets = useRef([]);
  const gameData = getLocalStorage("gameData");

  const pokemonData = useLoaderData();
  const navigate = useNavigate();

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
        currentLevel: 0,
        levels: set.levels,
        highScore: 0,
        completed: false,
      });
    });
    setLocalStorage("gameData", gameData.current);
  }

  return (
    <>
      <div className="selection-screen">
        {/* <div className="pokeball-border border-left">
        <div className="pokeball-border-inner"></div>
      </div> */}
        <div className="selections">
          {pokemonSets.current.map((set, index) => (
            <React.Fragment key={set.id}>
              <div
                className={`selection ${
                  index === 0 || gameData[index - 1].completed
                    ? ""
                    : "selection-disabled"
                }`}
                onClick={() => navigate(`/gamescreen/${set.id}`)}
              >
                <span className="selection-name">{set.name}</span>
                <img
                  className="selection-image"
                  src={set.image}
                  alt={set.name}
                />
                <span className="selection-level">
                  {gameData[index].currentLevel} / {set.levels}
                </span>
                <div
                  className={`selection-overlay ${
                    index === 0 || gameData[index - 1].completed ? "hidden" : ""
                  }`}
                >
                  <span>Complete the previous set to unlock this one!</span>
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
        {/* <div className="pokeball-border border-right">
        <div className="pokeball-border-inner"></div>
      </div> */}
      </div>
    </>
  );
}
