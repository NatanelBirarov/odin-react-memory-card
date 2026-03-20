import React, { useRef } from "react";
import Tilt from "react-parallax-tilt";
import { CardData } from "../../scripts/types";

import styles from "./Card.module.css";
import Img from "../Img/Img";

type CardProps = {
  name: string;
  image: string;
  isShuffling: boolean;
  setIsShuffling: React.Dispatch<React.SetStateAction<boolean>>;
  currentScore: number;
  setCurrentScore: React.Dispatch<React.SetStateAction<number>>;
  highScore: number;
  setHighScore: React.Dispatch<React.SetStateAction<number>>;
  currentLevelCards: CardData[];
  setCurrentLevelCards: React.Dispatch<React.SetStateAction<CardData[]>>;
  setShowModal: React.Dispatch<React.SetStateAction<-1 | 0 | 1>>;
};

// Durstenfeld shuffle algorithm
function shuffle(array: CardData[]) {
  const shuffledArray = [...array];
  let currentIndex = shuffledArray.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    const randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [shuffledArray[currentIndex], shuffledArray[randomIndex]] = [
      shuffledArray[randomIndex],
      shuffledArray[currentIndex],
    ];
  }

  return shuffledArray;
}

export default function Card({
  name,
  image,
  isShuffling,
  setIsShuffling,
  currentScore,
  setCurrentScore,
  highScore,
  setHighScore,
  currentLevelCards,
  setCurrentLevelCards,
  setShowModal,
}: CardProps) {
  const selectAudioRef = useRef(new Audio("/audio/cardFlip.mp3"));

  function handleClick() {
    void (async () => {
      try {
        await selectAudioRef.current.play();
      } catch (error) {
        console.error("Error playing audio:", error);
      }
    })();
    const clickedCard = currentLevelCards.find((card) => card.name === name);
    if (!clickedCard) return;
    if (clickedCard.clicked) {
      setCurrentScore(0);
      if (currentScore > highScore) {
        setHighScore(currentScore);
      }
      setShowModal(-1);
    } else {
      setCurrentScore((curr) => curr + 1);
      if (currentScore + 1 >= currentLevelCards.length) {
        setShowModal(1);
      } else {
        document.body.style.pointerEvents = "none";
        setIsShuffling(true);
        setTimeout(() => {
          const shuffledCards = shuffle(
            currentLevelCards.map((card: CardData) => {
              if (card.name === clickedCard.name) {
                return { ...card, clicked: true };
              } else {
                return card;
              }
            }),
          );
          setCurrentLevelCards(shuffledCards);
        }, 400);
        setTimeout(() => {
          setIsShuffling(false);
          document.body.style.pointerEvents = "";
        }, 800);
      }
    }
  }

  return (
    <Tilt
      glareEnable={true}
      glareMaxOpacity={0.35}
      glareColor="white"
      glarePosition="all"
      glareBorderRadius="5px"
      transitionSpeed={1500}
      tiltReverse={true}
    >
      <div className={styles.card} onClick={handleClick}>
        <div
          className={`${styles.cardContent} ${
            isShuffling ? styles.cardFlip : ""
          }`}
        >
          <Img type="cardFace" src={image} alt={name + "-front"} />
          <Img
            type="cardFaceBack"
            src="/images/card-back.png"
            alt={name + "-back"}
          />
        </div>
      </div>
    </Tilt>
  );
}
