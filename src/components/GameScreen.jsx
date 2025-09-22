import { use, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Loader from "./Loader";
import Card from "./Card";
import Score from "./Score";
import Modal from "./Modal";
import {
  getLocalStorage,
  setLocalStorage,
} from "../scripts/localStorageFactory";
import {
  useLoaderData,
  useNavigate,
  useNavigation,
  useOutletContext,
  useParams,
} from "react-router-dom";
import SettingsScreen from "./SettingsScreen";
import Menu from "./Menu";
import HowToScreen from "./HowToScreen";
import Button from "./Button";
import { useQuery } from "@tanstack/react-query";
import { gameScreenQuery } from "../scripts/queries";

export default function GameScreen() {
  const {
    showSettings,
    setShowSettings,
    showHowTo,
    setShowHowTo,
    musicVolume,
  } = useOutletContext();

  const gameData = getLocalStorage("gameData");

  // const pokemonData = useLoaderData();
  const params = useParams();
  const { data: pokemonData } = useQuery(gameScreenQuery(params.setId));
  const navigation = useNavigation();
  const navigate = useNavigate();

  const setId = pokemonData[0].id.split("-")[0];
  const setData = gameData.find((set) => set.id === setId);

  const [isLoading, setIsLoading] = useState(true);
  const [currentScore, setCurrentScore] = useState(0);
  const [highScore, setHighScore] = useState(setData.highScore);
  const [currentLevelCards, setCurrentLevelCards] = useState([]);
  const [isShuffling, setIsShuffling] = useState(false);
  const [showModal, setShowModal] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(setData.completedLevels + 1);

  const pokemonSetCards = useRef([]);
  const bgAudioRef = useRef(null);
  const resultAudioRef = useRef(new Audio("/audio/result.mp3"));

  useEffect(() => {
    bgAudioRef.current.volume = musicVolume;
  }, [musicVolume]);

  if (navigation.state === "loading") return <Loader />;

  pokemonSetCards.current = useMemo(() => {
    let transformedData = [];
    if (pokemonData) {
      transformedData = pokemonData.map((card) => {
        return {
          id: card.id,
          name: card.name,
          image: card.images.large,
          clicked: false,
        };
      });
    }
    return transformedData;
  }, [pokemonData]);

  const levels = setData.levels;

  const updateLevel = useCallback(() => {
    const start = (currentLevel - 1) * 10;
    const end =
      pokemonSetCards.current.length - ((currentLevel - 1) * 10 + 10) > 5
        ? (currentLevel - 1) * 10 + 10
        : pokemonSetCards.current.length;
    const newLevelCards = pokemonSetCards.current.slice(start, end);
    setCurrentLevelCards(newLevelCards);
  }, [currentLevel, pokemonSetCards]);

  useEffect(() => {
    setIsLoading(true);
    updateLevel();
    setCurrentScore(0);
    setHighScore(0);
    setIsLoading(false);
  }, [currentLevel]);

  function handleEndLevelScreen(state, isSuccess) {
    setShowModal(0);
    if (isSuccess) {
      setCurrentLevel(currentLevel + 1);
      const newGameDataArray = gameData.map((set) => {
        if (set.id === setId) {
          return {
            ...setData,
            completedLevels: currentLevel,
            completed: currentLevel === levels,
            highScore: highScore,
          };
        } else {
          return set;
        }
      });
      setLocalStorage("gameData", newGameDataArray);
    }
    if (state === -1) {
      navigate("/selectionscreen");
    } else if (state === 0) {
      resultAudioRef.current.pause();
      resultAudioRef.current.currentTime = 0;
      setTimeout(() => {
        bgAudioRef.current.play();
      }, 500);
      updateLevel();
    } else if (state === 1) {
      resultAudioRef.current.pause();
      resultAudioRef.current.currentTime = 0;
      setTimeout(() => {
        bgAudioRef.current.play();
      }, 500);
    }
  }

  if (showModal !== 0) {
    bgAudioRef.current.pause();
    bgAudioRef.current.currentTime = 0;
    setTimeout(() => {
      resultAudioRef.current.play();
    }, 500);
  }

  return (
    <>
      <audio ref={bgAudioRef} src="/audio/gameBg.mp3" autoPlay loop />
      {showSettings && (
        <SettingsScreen onClose={() => setShowSettings(false)} />
      )}
      {showHowTo && <HowToScreen onClose={() => setShowHowTo(false)} />}
      {showModal === -1 ? (
        <Modal>
          <div className="modal-text">
            <p>You failed...</p>
          </div>
          <div className="modal-buttons">
            <Button
              className="modal-button"
              onClick={() => handleEndLevelScreen(-1, false)}
            >
              <div className="modal-button-text">Select set</div>
            </Button>
            <Button
              className="modal-button"
              onClick={() => handleEndLevelScreen(0, false)}
            >
              <div className="modal-button-text">Try again</div>
            </Button>
          </div>
        </Modal>
      ) : showModal === 1 ? (
        currentLevel >= levels ? (
          <Modal>
            <div className="modal-text">
              <p>You have completed the set!</p>
              <p>Congratulations!</p>
            </div>
            <div className="modal-buttons">
              <Button
                className="modal-button"
                onClick={() => handleEndLevelScreen(-1, true)}
              >
                <div className="modal-button-text">Select next set</div>
              </Button>
            </div>
          </Modal>
        ) : (
          <Modal>
            <div className="modal-text">
              <p>You have completed the level!</p>
              <p>Congratulations!</p>
            </div>
            <div className="modal-buttons">
              <Button
                className="modal-button"
                onClick={() => handleEndLevelScreen(-1, true)}
              >
                <div className="modal-button-text">Select set</div>
              </Button>
              <Button
                className="modal-button"
                onClick={() => handleEndLevelScreen(1, true)}
              >
                <div className="modal-button-text">Next level</div>
              </Button>
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
              <img src="/images/logo1.png" alt="Logo" className="logo1" />
              <img src="/images/logo2.png" alt="Logo" className="logo2" />
            </div>
            <img
              className="header-img"
              src="/images/pokeball-main.png"
              alt="Logo"
            />
          </div>
          <>
            <div className="main-text">
              <div className="instructions">
                {/* <p>Try to click on all the cards without</p>
                <p>clicking on the same card twice!</p> */}
                <span className="game-level">Level: {currentLevel}</span>
              </div>
              <Score currentScore={currentScore} highScore={highScore} />
            </div>
            <div className="container">
              <div className="cards-container">
                {currentLevelCards.map((card) => (
                  <Card
                    key={card.id}
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
      <Menu
        onShowSettings={() => setShowSettings(true)}
        onShowHowTo={() => setShowHowTo(true)}
        onReturnToSelection={() => navigate("/selectionscreen")}
      />
    </>
  );
}
