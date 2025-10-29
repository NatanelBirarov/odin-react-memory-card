import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Loader from "../Loader/Loader";
import Card from "../Card/Card";
import Score from "../Scores/Scores";
import Modal, { ModalBlockRow, ModalText } from "../Modal/Modal";
import LocalStorageFactory from "../../scripts/localStorageFactory";
import {
  useNavigate,
  useNavigation,
  useOutletContext,
  useParams,
} from "react-router-dom";
import SettingsPage from "../SettingsPage/SettingsPage";
import Menu from "../Menu/Menu";
import HowToPlayPage from "../HowToPlayPage/HowToPlay";
import Button from "../Button/Button";
import { useQuery } from "@tanstack/react-query";
import { gameScreenQuery } from "../../scripts/queries";
import { CardData, SetDataType, ContextType } from "../../scripts/types";

import modalStyles from "../Modal/Modal.module.css";
import Img from "../Img/Img";
import styles from "./GamePage.module.css";
import ApiClient from "../../scripts/apiClient";

type GameDataType = SetDataType[];

export default function GamePage() {
  const {
    showSettings,
    setShowSettings,
    showHowTo,
    setShowHowTo,
    musicVolume,
  } = useOutletContext<ContextType>();

  const gameData: GameDataType = LocalStorageFactory.get("gameData");

  // const pokemonData = useLoaderData();
  const params = useParams();

  type GameScreenData = { data: CardData[] };
  const { data: pokemonData } = useQuery(
    gameScreenQuery(params.setId)
  ) as GameScreenData;
  const navigation = useNavigation();
  const navigate = useNavigate();

  const setId = pokemonData[0].id.split("-")[0];
  const setData = gameData.find((set) => set.id === setId);

  const [isLoading, setIsLoading] = useState(true);
  const [currentScore, setCurrentScore] = useState(0);
  const [highScore, setHighScore] = useState(setData.highScore);
  const [currentLevelCards, setCurrentLevelCards] = useState<CardData[]>([]);
  const [isShuffling, setIsShuffling] = useState(false);
  const [showModal, setShowModal] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(setData.completedLevels + 1);

  const pokemonSetCards = useRef<CardData[]>([]);
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

  function handleEndLevelScreen(state: number, isSuccess: boolean) {
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
      ApiClient.saveGameData("local-user", {
        ...setData,
        completedLevels: currentLevel,
        completed: currentLevel === levels,
        highScore: highScore,
      });
      LocalStorageFactory.set("gameData", newGameDataArray);
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
      {showSettings && <SettingsPage onClose={() => setShowSettings(false)} />}
      {showHowTo && <HowToPlayPage onClose={() => setShowHowTo(false)} />}
      {showModal === -1 ? (
        <Modal contentType="gameScreenModalContent">
          <ModalText>
            <p>You failed...</p>
          </ModalText>
          <ModalBlockRow>
            <Button
              type="modal"
              onClick={() => handleEndLevelScreen(-1, false)}
            >
              <div className={modalStyles.modalText}>Select set</div>
            </Button>
            <Button type="modal" onClick={() => handleEndLevelScreen(0, false)}>
              <div className={modalStyles.modalText}>Try again</div>
            </Button>
          </ModalBlockRow>
        </Modal>
      ) : showModal === 1 ? (
        currentLevel >= levels ? (
          <Modal contentType="gameScreenModalContent">
            <ModalText>
              <p>You have completed the set!</p>
              <p>Congratulations!</p>
            </ModalText>
            <ModalBlockRow>
              <Button
                type="modal"
                onClick={() => handleEndLevelScreen(-1, true)}
              >
                <div className={modalStyles.modalText}>Select next set</div>
              </Button>
            </ModalBlockRow>
          </Modal>
        ) : (
          <Modal contentType="gameScreenModalContent">
            <ModalText>
              <p>You have completed the level!</p>
              <p>Congratulations!</p>
            </ModalText>
            <ModalBlockRow>
              <Button
                type="modal"
                onClick={() => handleEndLevelScreen(-1, true)}
              >
                <div className={modalStyles.modalText}>Select set</div>
              </Button>
              <Button
                type="modal"
                onClick={() => handleEndLevelScreen(1, true)}
              >
                <div className={modalStyles.modalText}>Next level</div>
              </Button>
            </ModalBlockRow>
          </Modal>
        )
      ) : (
        ""
      )}
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <div className={styles.header}>
            <Img type="small" src="/images/pokeball-main.png" alt="Logo" />
            <div className={styles.logo}>
              <Img src="/images/logo1.png" alt="Logo" type="medium" />
              <Img src="/images/logo2.png" alt="Logo" type="medium" />
            </div>
            <Img type="small" src="/images/pokeball-main.png" alt="Logo" />
          </div>
          <>
            <div className={styles.gameState}>
              <span className={styles.level}>Level: {currentLevel}</span>
              <Score currentScore={currentScore} highScore={highScore} />
            </div>
            {/* <div className="container"> */}
            <div className={styles.cards}>
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
            {/* </div> */}
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
