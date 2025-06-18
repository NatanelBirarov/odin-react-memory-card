import React from "react";
import { getLocalStorage } from "../js/localStorageFactory";

export default function SelectionScreen({ onSelectSet, pokemonSets }) {
  const gameData = getLocalStorage("gameData");

  return (
    <>
      <div className="selection-screen">
        {/* <div className="pokeball-border border-left">
        <div className="pokeball-border-inner"></div>
      </div> */}
        <div className="selections">
          {pokemonSets.map((set, index) => (
            <React.Fragment key={set.id}>
              <div
                className={`selection ${
                  index === 0 || gameData[index - 1].completed
                    ? ""
                    : "selection-disabled"
                }`}
                onClick={() => onSelectSet(set.id)}
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
