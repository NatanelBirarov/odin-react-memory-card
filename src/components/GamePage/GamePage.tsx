import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Card from "../Card/Card";
import Score from "../Scores/Scores";
import Modal, { ModalBlockRow, ModalText } from "../Modal/Modal";
import LocalStorageFactory from "../../scripts/localStorageFactory";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import SettingsPage from "../SettingsPage/SettingsPage";
import Menu from "../Menu/Menu";
import HowToPlayPage from "../HowToPlayPage/HowToPlay";
import Button from "../Button/Button";
import { useQuery } from "@tanstack/react-query";
import { gamePageQuery } from "../../scripts/queries";
import { CardData, SetDataType, ContextType } from "../../scripts/types";

import modalStyles from "../Modal/Modal.module.css";
import Img from "../Img/Img";
import styles from "./GamePage.module.css";
import ApiClient from "../../scripts/apiClient";
import { authClient } from "../../scripts/authClient";

type GameDataType = SetDataType[];

export default function GamePage() {
  const {
    showSettings,
    setShowSettings,
    showHowTo,
    setShowHowTo,
    musicVolume,
  } = useOutletContext<ContextType>();

  const gameData: GameDataType = LocalStorageFactory.get("gameData") || [];

  // const pokemonData = useLoaderData();
  const params = useParams();

  type GamePageData = {
    data: CardData[] | undefined;
    isError: boolean;
    refetch: () => void;
  };
  const {
    data: pokemonData,
    isError: isPokemonError,
    refetch,
  } = useQuery(gamePageQuery(params.setId || "")) as GamePageData;
  const navigate = useNavigate();

  const setId = pokemonData?.[0]?.id?.split("-")[0] || params.setId;
  const setData = gameData.find((set) => set.id === setId);

  const [currentScore, setCurrentScore] = useState(0);
  const [highScore, setHighScore] = useState(setData?.highScore || 0);
  const [currentLevelCards, setCurrentLevelCards] = useState<CardData[]>([]);
  const [isShuffling, setIsShuffling] = useState(false);
  const [showModal, setShowModal] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(
    setData?.completedLevels ? setData.completedLevels + 1 : 1,
  );
  const userSession = authClient.useSession();

  const pokemonSetCards = useMemo(() => {
    if (!pokemonData) return [];

    return pokemonData.map((card) => {
      return {
        id: card.id,
        name: card.name,
        image: card.images ? card.images.large : "",
        clicked: false,
      };
    });
  }, [pokemonData]);
  const bgAudioRef = useRef<HTMLAudioElement>(null);
  const resultAudioRef = useRef<HTMLAudioElement>(
    new Audio("/audio/result.mp3"),
  );

  const levels = setData?.levels || 1;

  const updateLevel = useCallback(() => {
    const start = (currentLevel - 1) * 10;
    const end =
      pokemonSetCards.length - ((currentLevel - 1) * 10 + 10) > 5
        ? (currentLevel - 1) * 10 + 10
        : pokemonSetCards.length;
    const newLevelCards = pokemonSetCards.slice(start, end);
    setCurrentLevelCards(newLevelCards);
  }, [currentLevel, pokemonSetCards]);

  useEffect(() => {
    if (bgAudioRef.current) bgAudioRef.current.volume = musicVolume;
  }, [musicVolume]);

  useEffect(() => {
    updateLevel();
    setCurrentScore(0);
    // setHighScore(0);
  }, [updateLevel]);

  if (isPokemonError) {
    return (
      <>
        <audio ref={bgAudioRef} src="/audio/gameBg.mp3" autoPlay loop />
        {showSettings && (
          <SettingsPage onClose={() => setShowSettings(false)} />
        )}
        {showHowTo && <HowToPlayPage onClose={() => setShowHowTo(false)} />}
        <div className={styles.gameState}>
          <span className={styles.level}>Could not load cards.</span>
          <ModalBlockRow>
            <Button type="modal" onClick={() => refetch()}>
              <div className={modalStyles.modalText}>Retry</div>
            </Button>
            <Button type="modal" onClick={() => navigate("/selectionpage")}>
              <div className={modalStyles.modalText}>Select set</div>
            </Button>
          </ModalBlockRow>
        </div>
        <Menu
          onShowSettings={() => setShowSettings(true)}
          onShowHowTo={() => setShowHowTo(true)}
          onReturnToSelection={() => navigate("/selectionpage")}
        />
      </>
    );
  }

  if (!pokemonData?.length) {
    return (
      <>
        <audio ref={bgAudioRef} src="/audio/gameBg.mp3" autoPlay loop />
        {showSettings && (
          <SettingsPage onClose={() => setShowSettings(false)} />
        )}
        {showHowTo && <HowToPlayPage onClose={() => setShowHowTo(false)} />}
        <div className={styles.gameState}>
          <span className={styles.level}>No cards found for this set.</span>
          <ModalBlockRow>
            <Button type="modal" onClick={() => navigate("/selectionpage")}>
              <div className={modalStyles.modalText}>Back to sets</div>
            </Button>
          </ModalBlockRow>
        </div>
        <Menu
          onShowSettings={() => setShowSettings(true)}
          onShowHowTo={() => setShowHowTo(true)}
          onReturnToSelection={() => navigate("/selectionpage")}
        />
      </>
    );
  }

  function handleEndLevelScreen(state: number, isSuccess: boolean) {
    setShowModal(0);
    if (isSuccess && setData) {
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
      ApiClient.saveGameData(userSession.data?.user.id || "local-user", {
        ...setData,
        completedLevels: currentLevel,
        completed: currentLevel === levels,
        highScore: highScore || 0,
      });
      LocalStorageFactory.set("gameData", newGameDataArray);
    }
    if (state === -1) {
      navigate("/selectionpage");
    } else if (state === 0) {
      resultAudioRef.current.pause();
      resultAudioRef.current.currentTime = 0;
      setTimeout(() => {
        if (bgAudioRef.current) bgAudioRef.current.play();
      }, 500);
      updateLevel();
    } else if (state === 1) {
      resultAudioRef.current.pause();
      resultAudioRef.current.currentTime = 0;
      setTimeout(() => {
        if (bgAudioRef.current) bgAudioRef.current.play();
      }, 500);
    }
  }

  useEffect(() => {
    if (showModal !== 0) {
      if (bgAudioRef.current) {
        bgAudioRef.current.pause();
        bgAudioRef.current.currentTime = 0;
      }
      setTimeout(() => {
        resultAudioRef.current.play();
      }, 500);
    }
  }, [showModal]);

  return (
    <>
      <audio ref={bgAudioRef} src="/audio/gameBg.mp3" autoPlay loop />
      {showSettings && <SettingsPage onClose={() => setShowSettings(false)} />}
      {showHowTo && <HowToPlayPage onClose={() => setShowHowTo(false)} />}
      {showModal === -1 ? (
        <Modal contentType="gamePageModalContent">
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
          <Modal contentType="gamePageModalContent">
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
          <Modal contentType="gamePageModalContent">
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
            <Score currentScore={currentScore} highScore={highScore || 0} />
          </div>
          {/* <div className="container"> */}
          <div className={styles.cards}>
            {currentLevelCards.map((card) => (
              <Card
                key={card.id}
                name={card.name}
                image={card.image || ""}
                isShuffling={isShuffling}
                setIsShuffling={setIsShuffling}
                currentScore={currentScore}
                setCurrentScore={setCurrentScore}
                highScore={highScore || 0}
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
      <Menu
        onShowSettings={() => setShowSettings(true)}
        onShowHowTo={() => setShowHowTo(true)}
        onReturnToSelection={() => navigate("/selectionpage")}
      />
    </>
  );
}
