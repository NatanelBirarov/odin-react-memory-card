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
              <div className="selection" onClick={() => onSelectSet(set.id)}>
                <span className="selection-name">{set.name}</span>
                <img
                  className="selection-image"
                  src={set.image}
                  alt={set.name}
                />
                <span className="selection-level">
                  {gameData[set.id].currentLevel} / {set.levels}
                </span>
              </div>
              <div
                className={`selection-disabled ${
                  index !== 0 && gameData[set.id].completed ? "hidden" : ""
                }`}
              >
                <span>Complete the previous set to unlock this one!</span>
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
