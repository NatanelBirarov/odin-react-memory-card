import { useEffect, useState } from "react";
import Loader from "./Loader";
import Card from "./Card";
import Score from "./Score";

export default function GameScreen({ currentSetCards, startingLevel }) {
  const [currentLevel, setCurrentLevel] = useState(startingLevel);
  const [currentScore, setCurrentScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [currentLevelCards, setCurrentLevelCards] = useState([]);
  const [isShuffling, setIsShuffling] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const newLevelCards = currentSetCards.slice(
      currentLevel * 10,
      currentLevel * 10 + 10
    );
    setCurrentLevelCards(newLevelCards);
    setIsLoading(false);
  }, [currentLevel]);

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <div className="header">
            <img className="header-img" src="/pokeball-main.png" alt="Logo" />
            <div className="logo-container">
              <img src="/logo1.png" alt="Logo" className="logo1" />
              <img src="/logo2.png" alt="Logo" className="logo2" />
            </div>
            <img className="header-img" src="/pokeball-main.png" alt="Logo" />
          </div>
          <>
            <div className="main-text">
              <div className="instructions">
                <p>Try to click on all the cards without</p>
                <p>clicking on the same card twice!</p>
              </div>
              <Score currentScore={currentScore} highScore={highScore} />
            </div>
            <div className="container">
              <div className="cards-container">
                {currentLevelCards.map((card) => (
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
        </>
      )}
    </>
  );
}
