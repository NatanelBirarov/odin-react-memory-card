import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

import styles from "./StartPage.module.css";

export default function StartPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleNavigate = () => {
      void navigate("/titlepage", { replace: true });
    };

    window.addEventListener("click", handleNavigate, { once: true });

    return () => {
      window.removeEventListener("click", handleNavigate);
    };
  }, [navigate]);

  return (
    <div className={styles.startPage}>
      <h1>Click anywhere to start</h1>
    </div>
  );
}
