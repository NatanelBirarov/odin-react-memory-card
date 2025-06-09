export default function TitleScreen() {
  return (
    <div className="title-screen">
      <div className="title-screen-border border-left">
        <div className="title-screen-border-inner"></div>
      </div>
      <div className="title-screen-container">
        <div className="title-screen-logo">
          <img src="/logo1.png" alt="Logo" className="logo1 logo-large" />
          <img src="/logo2.png" alt="Logo" className="logo2 logo-large" />
        </div>
      </div>
      <div className="title-screen-border border-right">
        <div className="title-screen-border-inner"></div>
      </div>
    </div>
  );
}
