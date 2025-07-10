import Button from "./Button";

export default function Menu({
  onShowSettings,
  onShowHowTo,
  onReturnToSelection,
}) {
  return (
    <div className="menu-border">
      <Button className="menu-button settings-button" onClick={onShowSettings}>
        <img className="icon" src="/cog.svg" alt="Logo" />
      </Button>
      <Button className="menu-button how-to-button" onClick={onShowHowTo}>
        <img className="icon" src="/help-circle-outline.svg" alt="Logo" />
      </Button>
      <Button
        className="menu-button selection-button"
        onClick={onReturnToSelection}
      >
        <img className="icon" src="/cards-playing-outline.svg" alt="Logo" />
      </Button>
    </div>
  );
}
