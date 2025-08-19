import Button from "./Button";

export default function Menu({
  onShowSettings,
  onShowHowTo,
  onReturnToSelection,
}) {
  return (
    <div className="menu">
      <button className="menu-toggle">...</button>
      <div className="menu-content">
        <Button
          className="menu-button settings-button"
          onClick={onShowSettings}
        >
          <img className="icon" src="/images/cog.svg" alt="Logo" />
        </Button>
        <Button className="menu-button how-to-button" onClick={onShowHowTo}>
          <img
            className="icon"
            src="/images/help-circle-outline.svg"
            alt="Logo"
          />
        </Button>
        <Button
          className="menu-button selection-button"
          onClick={onReturnToSelection}
        >
          <img
            className="icon"
            src="/images/cards-playing-outline.svg"
            alt="Logo"
          />
        </Button>
      </div>
    </div>
  );
}
