import Button from "./Button";
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
        <Button
          className="menu-button settings-button"
          onClick={onShowSettings}
        >
          <Settings color="black" size={30} strokeWidth={2.5} />
        </Button>
        <Button className="menu-button how-to-button" onClick={onShowHowTo}>
          <CircleQuestionMark color="black" size={30} strokeWidth={2} />
        </Button>
        <Button
          className="menu-button selection-button"
          onClick={onReturnToSelection}
        >
          <BookCopy color="black" size={30} strokeWidth={2} />
        </Button>
      </div>
    </div>
  );
}
