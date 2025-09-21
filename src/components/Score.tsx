type ScoreProps = {
  currentScore: number;
  highScore: number;
};

export default function Score({ currentScore, highScore }: ScoreProps) {
  return (
    <div className="scores-container">
      <h1 className="score">Score:{currentScore}</h1>
      <h2 className="score">High Score:{highScore}</h2>
    </div>
  );
}
