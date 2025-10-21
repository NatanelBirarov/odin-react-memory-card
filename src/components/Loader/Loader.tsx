import styles from "./Loader.module.css";

export default function Loader() {
  return (
    <div className={styles.loader}>
      <img
        className={styles.loaderImg}
        src="/images/pokeball-loader.png"
        alt="Loader"
      />
    </div>
  );
}
