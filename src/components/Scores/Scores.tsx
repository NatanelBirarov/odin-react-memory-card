import styles from "./Scores.module.css";

type ScoreProps = {
  currentScore: number;
  highScore: number;
};

export default function Score({ currentScore, highScore }: ScoreProps) {
  return (
    <div className={styles.scores}>
      <h1 className={styles.score}>Score:{currentScore}</h1>
      <h2 className={styles.score}>High Score:{highScore}</h2>
    </div>
  );
}
