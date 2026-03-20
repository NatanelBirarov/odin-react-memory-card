import { useNavigate } from "react-router-dom";

import styles from "./StartPage.module.css";

export default function StartPage() {
  const navigate = useNavigate();

  window.addEventListener(
    "click",
    () => {
      void navigate("/titlepage", { replace: true });
    },
    { once: true },
  );

  return (
    <div className={styles.startPage}>
      <h1>Click anywhere to start</h1>
    </div>
  );
}
