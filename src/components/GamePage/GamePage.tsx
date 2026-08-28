import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Card from "../Card/Card";
import Score from "../Scores/Scores";
import Modal, { ModalBlockRow, ModalText } from "../Modal/Modal";
import { useNavigate, useParams } from "react-router-dom";
import SettingsPage from "../SettingsPage/SettingsPage";
import Menu from "../Menu/Menu";
import HowToPlayPage from "../HowToPlayPage/HowToPlay";
import Button from "../Button/Button";
import { useQuery } from "@tanstack/react-query";
import { gamePageQuery } from "../../scripts/queries";
import { CardData } from "../../scripts/types";

import modalStyles from "../Modal/Modal.module.css";
import Img from "../Img/Img";
import styles from "./GamePage.module.css";
import {
  useGameData,
  useSaveGameDataMutation,
} from "../../scripts/gameDataHooks";
import { useSettingsContext } from "../../context/SettingsContext";

export default function GamePage() {
  const {
    showSettings,
    setShowSettings,
    showHowTo,
    setShowHowTo,
    musicVolume,
    sfxVolume,
  } = useSettingsContext();

  const { data: gameData = [], isError: isGameDataError } = useGameData();

  const params = useParams();

  type GamePageData = {
    data: CardData[] | undefined;
    isError: boolean;
    refetch: () => void;
  };
  const { data: pokemonData, isError: isPokemonError } = useQuery(
    gamePageQuery(params.setId || ""),
  ) as GamePageData;
  const navigate = useNavigate();

  function handleReloadPage() {
    window.location.reload();
  }

  function playAudioSafe(audio: HTMLAudioElement | null) {
    if (!audio) return;
    void audio.play().catch((error: unknown) => {
      console.error("Error playing audio:", error);
    });
  }

  // Durstenfeld shuffle algorithm
  function shuffle(array: CardData[]) {
    const shuffledArray = [...array];
    let currentIndex = shuffledArray.length;

    while (currentIndex !== 0) {
      const randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      [shuffledArray[currentIndex], shuffledArray[randomIndex]] = [
        shuffledArray[randomIndex],
        shuffledArray[currentIndex],
      ];
    }

    return shuffledArray;
  }

  // Card IDs contain set prefix (for example: "base1-4"); use it to match saved progress for this route.
  const setId = pokemonData?.[0]?.id?.split("-")[0] || params.setId;
  const setData = gameData.find((set) => set.id === setId);

  const [currentScore, setCurrentScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [currentLevelCards, setCurrentLevelCards] = useState<CardData[]>([]);
  const [isShuffling, setIsShuffling] = useState(false);
  const [showModal, setShowModal] = useState<-1 | 0 | 1>(0);
  const [currentLevel, setCurrentLevel] = useState(1);
  const saveGameDataMutation = useSaveGameDataMutation();
  const initializedSetRef = useRef<string | undefined>(undefined);

  // Normalize API card data into the card component shape and reset click state each load.
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
  const cardFlipAudioRef = useRef<HTMLAudioElement>(
    new Audio("/audio/cardFlip.mp3"),
  );

  const levels = setData?.levels || 1;

  useEffect(() => {
    if (!setData || !setId) return;
    if (initializedSetRef.current === setId) return;

    initializedSetRef.current = setId;
    setHighScore(setData.highScore || 0);
    setCurrentLevel(setData.completedLevels ? setData.completedLevels + 1 : 1);
  }, [setData, setId]);

  const updateLevel = useCallback(() => {
    // Each level uses up to 10 cards, but keeps the final chunk if fewer than 6 cards would remain.
    const start = (currentLevel - 1) * 10;
    const end =
      pokemonSetCards.length - ((currentLevel - 1) * 10 + 10) > 5
        ? (currentLevel - 1) * 10 + 10
        : pokemonSetCards.length;
    const newLevelCards = pokemonSetCards.slice(start, end);
    setCurrentLevelCards(newLevelCards);
  }, [currentLevel, pokemonSetCards]);

  useEffect(() => {
    // Keep background music volume in sync with the global settings slider.
    if (bgAudioRef.current) bgAudioRef.current.volume = musicVolume;
  }, [musicVolume]);

  useEffect(() => {
    // Entering a new level resets visible cards and current run score.
    updateLevel();
    setCurrentScore(0);
  }, [updateLevel]);

  useEffect(() => {
    // Swap game/result audio when a success/failure modal is shown.
    if (showModal !== 0) {
      if (bgAudioRef.current) {
        bgAudioRef.current.pause();
        bgAudioRef.current.currentTime = 0;
      }
      setTimeout(() => {
        playAudioSafe(resultAudioRef.current);
      }, 500);
    }
  }, [showModal]);

  function handleCardClick(cardName: string) {
    if (isShuffling) return;

    void (async () => {
      try {
        cardFlipAudioRef.current.volume = sfxVolume;
        await cardFlipAudioRef.current.play();
      } catch (error) {
        console.error("Error playing audio:", error);
      }
    })();

    const clickedCard = currentLevelCards.find((card) => card.name === cardName);
    if (!clickedCard) return;

    if (clickedCard.clicked) {
      setCurrentScore(0);
      if (currentScore > highScore) {
        setHighScore(currentScore);
      }
      setShowModal(-1);
    } else {
      const nextScore = currentScore + 1;
      setCurrentScore(nextScore);
      if (nextScore >= currentLevelCards.length) {
        setShowModal(1);
      } else {
        setIsShuffling(true);
        setTimeout(() => {
          const shuffledCards = shuffle(
            currentLevelCards.map((card: CardData) => {
              if (card.name === clickedCard.name) {
                return { ...card, clicked: true };
              }
              return card;
            }),
          );
          setCurrentLevelCards(shuffledCards);
        }, 400);
        setTimeout(() => {
          setIsShuffling(false);
        }, 800);
      }
    }
  }

  // Dedicated error state with retry to recover transient API failures.
  if (isPokemonError || isGameDataError || !pokemonData?.length) {
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
            <Button type="modal" onClick={handleReloadPage}>
              <div className={modalStyles.modalText}>Reload</div>
            </Button>
          </ModalBlockRow>
        </div>
        <Menu
          onShowSettings={() => setShowSettings(true)}
          onShowHowTo={() => setShowHowTo(true)}
          onReturnToSelection={() => {
            void navigate("/selectionpage");
          }}
        />
      </>
    );
  }

  function handleEndLevelScreen(state: number, isSuccess: boolean) {
    // Close modal first, then branch into progress updates and navigation/retry actions.
    setShowModal(0);
    if (isSuccess && setData) {
      setCurrentLevel(currentLevel + 1);
      // Persist the same set progress to the server so progress survives across devices/sessions.
      saveGameDataMutation.mutate({
        ...setData,
        completedLevels: currentLevel,
        completed: currentLevel === levels,
        highScore: highScore || 0,
      });
    }
    // state: -1 = leave to set selection, 0 = retry same level, 1 = continue to next level.
    if (state === -1) {
      void navigate("/selectionpage");
    } else if (state === 0) {
      resultAudioRef.current.pause();
      resultAudioRef.current.currentTime = 0;
      setTimeout(() => {
        playAudioSafe(bgAudioRef.current);
      }, 500);
      updateLevel();
    } else if (state === 1) {
      resultAudioRef.current.pause();
      resultAudioRef.current.currentTime = 0;
      setTimeout(() => {
        playAudioSafe(bgAudioRef.current);
      }, 500);
    }
  }

  return (
    <>
      <audio ref={bgAudioRef} src="/audio/gameBg.mp3" autoPlay loop />
      {showSettings && <SettingsPage onClose={() => setShowSettings(false)} />}
      {showHowTo && <HowToPlayPage onClose={() => setShowHowTo(false)} />}
      {/* Modal rendering is driven by tri-state showModal: -1 fail, 1 success, 0 hidden. */}
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
                onClick={() => handleCardClick(card.name)}
              />
            ))}
          </div>
          {/* </div> */}
        </>
      </>
      <Menu
        onShowSettings={() => setShowSettings(true)}
        onShowHowTo={() => setShowHowTo(true)}
        onReturnToSelection={() => {
          void navigate("/selectionpage");
        }}
      />
    </>
  );
}
