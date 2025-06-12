import { useState } from "react";

export default function GameScreen({ currentSetCards, currentLevel }) {
  const [currentScore, setCurrentScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [currentLevelCards, setCurrentLevelCards] = useState([]);
  const [isShuffling, setIsShuffling] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
}
