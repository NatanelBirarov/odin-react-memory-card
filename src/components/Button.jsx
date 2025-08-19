import { useEffect, useRef } from "react";
import { useOutletContext } from "react-router-dom";

export default function Button({ children, onClick, className }) {
  const { sfxVolume } = useOutletContext();
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
