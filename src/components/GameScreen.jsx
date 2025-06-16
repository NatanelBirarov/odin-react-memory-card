import { use, useCallback, useEffect, useState } from "react";
import Loader from "./Loader";
import Card from "./Card";
import Score from "./Score";
import Modal from "./Modal";
import { getLocalStorage, setLocalStorage } from "../js/localStorageFactory";

export default function GameScreen({
  currentSetCards,
  startingLevel,
  onShowSelectionScreen,
  gameData,
}) {
  const [currentLevel, setCurrentLevel] = useState(startingLevel);
  const [currentScore, setCurrentScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [currentLevelCards, setCurrentLevelCards] = useState([]);
  const [isShuffling, setIsShuffling] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(0);

  const updateLevel = useCallback(() => {
    const newLevelCards = currentSetCards.slice(
      currentLevel * 10,
      currentLevel * 10 + 10
    );
    setCurrentLevelCards(newLevelCards);
  }, [currentLevel, currentSetCards]);

  useEffect(() => {
    setIsLoading(true);
    updateLevel();
    setCurrentScore(0);
    setHighScore(0);
    const setId = currentLevelCards[0].id.split("-")[0];
    setLocalStorage("gameData", {
      ...JSON.parse(getLocalStorage("gameData")),
      [gameData[setId]]: currentLevel,
    });
    setIsLoading(false);
  }, [currentLevel]);

  function handleEndLevelScreen(state) {
    setShowModal(0);
    if (state === 1) {
      setCurrentLevel((curr) => curr + 1);
      if (currentLevel === 10) {
        setShowModal(2);
      }
    } else if (state === 0) {
      updateLevel();
    } else {
      onShowSelectionScreen();
    }
  }

  return (
    <>
      {showModal === -1 ? (
        <Modal>
          <div className="modal-text">
            <p>You failed...</p>
          </div>
          <div className="modal-buttons">
            <button
              className="modal-button"
              onClick={() => handleEndLevelScreen(0)}
            >
              <div className="modal-button-text">Try again</div>
            </button>
            <button
              className="modal-button"
              onClick={() => handleEndLevelScreen(-1)}
            >
              <div className="modal-button-text">Select set</div>
            </button>
          </div>
        </Modal>
      ) : showModal === 1 ? (
        currentLevel + 1 === 2 ? (
          <Modal>
            <div className="modal-text">
              <p>You have completed the set!</p>
              <p>Congratulations!</p>
            </div>
            <div className="modal-buttons">
              <button
                className="modal-button"
                onClick={() => handleEndLevelScreen(-1)}
              >
                <div className="modal-button-text">Select next set</div>
              </button>
            </div>
          </Modal>
        ) : (
          <Modal>
            <div className="modal-text">
              <p>You have completed the level!</p>
              <p>Congratulations!</p>
            </div>
            <div className="modal-buttons">
              <button
                className="modal-button"
                onClick={() => handleEndLevelScreen(1)}
              >
                <div className="modal-button-text">Next level</div>
              </button>
              <button
                className="modal-button"
                onClick={() => handleEndLevelScreen(-1)}
              >
                <div className="modal-button-text">Select set</div>
              </button>
            </div>
          </Modal>
        )
      ) : (
        ""
      )}
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
                {/* <p>Try to click on all the cards without</p>
                <p>clicking on the same card twice!</p> */}
                <span className="game-level">Level: {currentLevel + 1}</span>
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
                    setShowModal={setShowModal}
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
