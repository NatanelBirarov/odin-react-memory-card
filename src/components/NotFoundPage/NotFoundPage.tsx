import { useNavigate } from "react-router-dom";
import Button from "../Button/Button";
import Img from "../Img/Img";
import styles from "./NotFoundPage.module.css";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <Img src="/images/pokeball-main.png" alt="Pokéball" type="small" />
        <h1 className={styles.code}>404</h1>
        <h2 className={styles.title}>Page Not Found</h2>
        <p className={styles.description}>
          A wild 404 appeared! The page you are looking for might have been removed,
          had its name changed, or is temporarily unavailable.
        </p>
        <Button
          type="titlePage"
          onClick={() => {
            void navigate("/titlepage");
          }}
        >
          Return to Title Page
        </Button>
      </div>
    </div>
  );
}
