import Tilt from "react-parallax-tilt";
import styles from "./Card.module.css";
import Img from "../Img/Img";

type CardProps = {
  name: string;
  image: string;
  isShuffling: boolean;
  onClick: () => void;
};

export default function Card({
  name,
  image,
  isShuffling,
  onClick,
}: CardProps) {
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
      <div
        className={`${styles.card} ${isShuffling ? styles.disabled : ""}`}
        onClick={onClick}
      >
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
