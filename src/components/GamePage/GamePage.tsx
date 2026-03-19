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
import {
  useGameDataQuery,
  useSaveGameDataMutation,
} from "../../scripts/gameDataHooks";

export default function GamePage() {
  const {
    showSettings,
    setShowSettings,
    showHowTo,
    setShowHowTo,
    musicVolume,
  } = useOutletContext<ContextType>();

  const [localGameData] = useState(
    () => LocalStorageFactory.get("gameData") as SetDataType[] | null,
  );

  const { data: gameData = [], isError: isGameDataError } = useGameDataQuery(
    localGameData || undefined,
  );

  // const pokemonData = useLoaderData();
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

  // Card IDs contain set prefix (for example: "base1-4"); use it to match saved progress for this route.
  const setId = pokemonData?.[0]?.id?.split("-")[0] || params.setId;
  const setData = gameData.find((set) => set.id === setId);

  const [currentScore, setCurrentScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [currentLevelCards, setCurrentLevelCards] = useState<CardData[]>([]);
  const [isShuffling, setIsShuffling] = useState(false);
  const [showModal, setShowModal] = useState(0);
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

  const levels = setData?.levels || 1;

  useEffect(() => {
    if (!setData || !setId) return;
    if (initializedSetRef.current === setId) return;

    initializedSetRef.current = setId;
    setHighScore(setData.highScore || 0);
    setCurrentLevel(setData.completedLevels ? setData.completedLevels + 1 : 1);
  }, [setData, setId]);

  useEffect(() => {
    if (!gameData.length) return;
    LocalStorageFactory.set("gameData", gameData);
  }, [gameData]);

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
    // setHighScore(0);
  }, [updateLevel]);

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
          onReturnToSelection={() => navigate("/selectionpage")}
        />
      </>
    );
  }

  function handleEndLevelScreen(state: number, isSuccess: boolean) {
    // Close modal first, then branch into progress updates and navigation/retry actions.
    setShowModal(0);
    if (isSuccess && setData) {
      setCurrentLevel(currentLevel + 1);
      // Build the next local progress snapshot by replacing only the active set entry.
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
      // Persist the same set progress to the server so progress survives across devices/sessions.
      saveGameDataMutation.mutate({
        ...setData,
        completedLevels: currentLevel,
        completed: currentLevel === levels,
        highScore: highScore || 0,
      });
      // Keep browser cache aligned with the mutation result for immediate UI consistency.
      LocalStorageFactory.set("gameData", newGameDataArray);
    }
    // state: -1 = leave to set selection, 0 = retry same level, 1 = continue to next level.
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
    // Swap game/result audio when a success/failure modal is shown.
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
