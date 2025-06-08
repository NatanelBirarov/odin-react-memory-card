import { useMemo, useState } from "react";
import { useEffect } from "react";
import Card from "./Card";
import Score from "./Score";
import "./styles.css";

import pokemon from "pokemontcgsdk";

pokemon.configure({ apiKey: "a087390f-8839-444e-90b6-b09b9ecb6699" });

function App() {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [currentScore, setCurrentScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [pokemonSetCards, setPokemonSetCards] = useState([]);
  const [currentLevelCards, setCurrentLevelCards] = useState([]);
  const [isShuffling, setIsShuffling] = useState(false);

  useEffect(() => {
    const createNewCards = async () => {
      const pokemonSet = await pokemon.card.all({
        q: "set.name:Prismatic supertype:Pokémon",
        orderBy: "-tcgplayer.prices.holofoil.mid",
      });
      console.log(pokemonSet);
      setPokemonSetCards(
        pokemonSet.map((card) => {
          return {
            name: card.name,
            image: card.images.large,
            clicked: false,
          };
        })
      );
      setCurrentLevelCards(
        pokemonSet
          .slice(currentLevel * 10, currentLevel * 10 + 10)
          .map((card) => {
            return {
              name: card.name,
              image: card.images.large,
              clicked: false,
            };
          })
      );
    };
    createNewCards();
  }, []);

  return (
    <>
      <div className="header">
        <img className="header-img" src="/pokeball-main.png" alt="Logo" />
        <div className="logo-container">
          <img src="/logo1.png" alt="Logo" className="logo1" />
          <img src="/logo2.png" alt="Logo" className="logo2" />
        </div>
        <img className="header-img" src="/pokeball-main.png" alt="Logo" />
      </div>
      <div className="main-text">
        <div className="instructions">
          <p>Try to click on all the cards without</p>
          <p>clicking on the same card twice!</p>
        </div>
        <Score currentScore={currentScore} highScore={highScore} />
      </div>
      <div className="container">
        <div className="cards-container">
          {currentLevelCards.map((card, index) => (
            <Card
              key={card.name}
              name={card.name}
              image={card.image}
              isShuffling={isShuffling}
              setIsShuffling={setIsShuffling}
              currentScore={currentScore}
              setCurrentScore={setCurrentScore}
              highScore={highScore}
              setHighScore={setHighScore}
              currentLevelCards={currentLevelCards}
              setCurrentLevelCards={setCurrentLevelCards}
            />
          ))}
        </div>
      </div>
    </>
  );
}

export default App;
