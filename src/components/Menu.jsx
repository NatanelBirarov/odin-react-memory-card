export default function Menu({ onShowSettings }) {
  return (
    <div className="menu-border">
      <button className="menu-button settings-button" onClick={onShowSettings}>
        <img className="icon" src="/cog.svg" alt="Logo" />
      </button>
    </div>
  );
}
