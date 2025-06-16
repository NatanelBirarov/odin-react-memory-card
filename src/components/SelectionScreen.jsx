import React from "react";

export default function SelectionScreen({
  onSelectSet,
  gameData,
  pokemonSets,
}) {
  return (
    <>
      <div className="selection-screen">
        {/* <div className="pokeball-border border-left">
        <div className="pokeball-border-inner"></div>
      </div> */}
        <div className="selections">
          {pokemonSets.map((set) => (
            <React.Fragment key={set.id}>
              <div className="selection" onClick={() => onSelectSet(set.id)}>
                <span className="selection-name">{set.name}</span>
                <img
                  className="selection-image"
                  src={set.image}
                  alt={set.name}
                />
                <span className="selection-level">
                  {gameData[set.id]} / {set.levels}
                </span>
              </div>
              <div className="selection-disabled hidden">
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
