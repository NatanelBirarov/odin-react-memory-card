export default function Menu({ onShowSettings, onShowHowTo }) {
  return (
    <div className="menu-border">
      <button className="menu-button settings-button" onClick={onShowSettings}>
        <img className="icon" src="/cog.svg" alt="Logo" />
      </button>
      <button className="menu-button how-to-button" onClick={onShowHowTo}>
        <img className="icon" src="/help-circle-outline.svg" alt="Logo" />
      </button>
    </div>
  );
}
