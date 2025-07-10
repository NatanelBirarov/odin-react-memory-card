import { useRef } from "react";

export default function Button({ children, onClick, className }) {
  const selectAudioRef = useRef(new Audio("/selectClick.mp3"));

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
