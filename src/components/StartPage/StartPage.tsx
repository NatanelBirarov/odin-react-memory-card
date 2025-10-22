import { useNavigate } from "react-router-dom";

import styles from "./StartPage.module.css";

export default function StartPage() {
  const navigate = useNavigate();

  window.addEventListener(
    "click",
    () => {
      navigate("/titlescreen", { replace: true });
    },
    { once: true }
  );

  return (
    <div className={styles.startScreen}>
      <h1>Click anywhere to start</h1>
    </div>
  );
}
