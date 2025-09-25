import { useEffect, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import { ContextType, StateUpdater } from "../scripts/types";

type ButtonProps = {
  children: React.ReactNode;
  onClick: StateUpdater<null>;
  className?: string;
};

export default function Button({ children, onClick, className }: ButtonProps) {
  const { sfxVolume } = useOutletContext<ContextType>();
  const selectAudioRef = useRef(new Audio("/audio/selectClick.mp3"));

  useEffect(() => {
    selectAudioRef.current.volume = sfxVolume;
  }, [sfxVolume]);

  function handleClick() {
    selectAudioRef.current.play();
    onClick();
  }

  return (
    <button className={className} onClick={handleClick}>
      {children}
    </button>
  );
}
