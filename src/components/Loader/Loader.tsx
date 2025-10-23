import Img from "../Img/Img";
import styles from "./Loader.module.css";

export default function Loader() {
  return (
    <div className={styles.loader}>
      <Img type="loader" src="/images/pokeball-loader.png" alt="Loader" />
    </div>
  );
}
