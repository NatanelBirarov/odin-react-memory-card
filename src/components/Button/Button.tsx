import { useEffect, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import { ContextType, StateUpdater } from "../../scripts/types";
import styles from "./Button.module.css";

type ButtonProps = {
  children?: React.ReactNode;
  onClick?: StateUpdater<null>;
  type?: keyof typeof styles;
  animation?: keyof typeof styles;
  ref?: React.Ref<HTMLButtonElement>;
  submit?: boolean;
  disabled?: boolean;
};

export default function Button({
  children,
  onClick,
  type = "modal",
  animation,
  ref = null,
  submit = false,
  disabled = false,
}: ButtonProps) {
  const { sfxVolume } = useOutletContext<ContextType>();
  const selectAudioRef = useRef(new Audio("/audio/selectClick.mp3"));

  useEffect(() => {
    selectAudioRef.current.volume = sfxVolume;
  }, [sfxVolume]);

  function handleClick() {
    selectAudioRef.current.play();
    if (onClick) onClick();
  }

  function toggleButtonHover(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    animationClass?: keyof typeof styles
  ) {
    if (animationClass) {
      const targetSvg = e.currentTarget.querySelector("svg");
      if (targetSvg) targetSvg.classList.toggle(styles[animationClass]);
    }
  }

  return (
    <button
      className={styles[type]}
      onClick={handleClick}
      onMouseEnter={(e) => toggleButtonHover(e, animation)}
      onMouseLeave={(e) => toggleButtonHover(e, animation)}
      ref={ref}
      type={submit ? "submit" : "button"}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
