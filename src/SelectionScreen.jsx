import React, { useEffect, useRef } from "react";

export default function SelectionScreen({ pokemonApi }) {
  const pokemonSets = useRef([]);

  useEffect(() => {
    const getSets = async () => {
      const pokemonSet = await pokemonApi.set.all({});
      console.log(pokemonSet);
      pokemonSets.current = pokemonSet.map((set) => {
        return { id: set.id, name: set.name, image: set.images.logo };
      });
      pokemonSets.current = pokemonSets.current.filter((set) => {
        return set.name !== "Journey Together";
      });
    };
    getSets();
  }, []);

  return (
    <div className="selection-screen">
      {/* <div className="pokeball-border border-left">
        <div className="pokeball-border-inner"></div>
      </div> */}
      <div className="selections">
        {pokemonSets.current.map((set) => (
          <React.Fragment key={set.id}>
            <div className="selection">
              <span className="selection-name">{set.name}</span>
              <img className="selection-image" src={set.image} alt={set.name} />
              <span className="selection-level">0 / 10</span>
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
  );
}
