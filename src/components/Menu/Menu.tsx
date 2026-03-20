import Button from "../Button/Button";
import { BookCopy, CircleQuestionMark, Settings } from "lucide-react";
import { useRef } from "react";
import styles from "./Menu.module.css";

type MenuProps = {
  onShowSettings: () => void;
  onShowHowTo: () => void;
  onReturnToSelection: () => void;
};

export default function Menu({
  onShowSettings,
  onShowHowTo,
  onReturnToSelection,
}: MenuProps) {
  const menuElement = useRef<HTMLDivElement | null>(null);
  const menuToggleButton = useRef<HTMLButtonElement | null>(null);

  function handlePinMenu() {
    if (menuElement.current) {
      menuElement.current.classList.toggle(styles.pinned);
    }
  }

  return (
    <div className={styles.menu} ref={menuElement}>
      <Button type="menuToggle" onClick={handlePinMenu} ref={menuToggleButton}>
        ...
      </Button>
      <div className={styles.menuContent}>
        <Button type="menu" onClick={onShowSettings} animation="halfSpin">
          <Settings color="black" size={30} strokeWidth={2.5} />
        </Button>
        <Button type="menu" onClick={onShowHowTo} animation="boing">
          <CircleQuestionMark color="black" size={30} strokeWidth={2} />
        </Button>
        <Button type="menu" onClick={onReturnToSelection} animation="flip">
          <BookCopy color="black" size={30} strokeWidth={2} />
        </Button>
      </div>
    </div>
  );
}
