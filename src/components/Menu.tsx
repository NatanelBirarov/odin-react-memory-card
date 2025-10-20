import Button from "./Button/Button";
import { StateUpdater } from "../scripts/types";
import { BookCopy, CircleQuestionMark, Settings } from "lucide-react";

type MenuProps = {
  onShowSettings: StateUpdater<null>;
  onShowHowTo: StateUpdater<null>;
  onReturnToSelection: StateUpdater<null>;
};

export default function Menu({
  onShowSettings,
  onShowHowTo,
  onReturnToSelection,
}: MenuProps) {
  return (
    <div className="menu">
      <button className="menu-toggle">...</button>
      <div className="menu-content">
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
