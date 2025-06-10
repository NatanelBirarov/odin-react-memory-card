import { useEffect } from "react";

import Tilt from "react-parallax-tilt";

export default function TitleScreen({ cards, onClick }) {
  return (
    <div className="title-screen">
      {/* <div className="title-screen-border border-left">
        <div className="title-screen-border-inner"></div>
      </div> */}
      <div className="title-screen-background">
        {cards.map((card) => (
          <Tilt
            key={card.id}
            className="background-stripes track-on-window"
            perspective={500}
            glareEnable={true}
            glareMaxOpacity={0.35}
            glarePosition="all"
            trackOnWindow={true}
            reset={false}
            tiltReverse={true}
            glareReverse={true}
            glareBorderRadius="20px"
          >
            <img
              key={card.image}
              src={card.image}
              alt="Background Card"
              className="title-screen-background-card"
            />
          </Tilt>
        ))}
        <div className="title-screen-text">
          <div className="title-screen-container">
            <div className="title-screen-logo">
              <img src="/logo1.png" alt="Logo" className="logo1 logo-large" />
              <img src="/logo2.png" alt="Logo" className="logo2 logo-large" />
            </div>
            <div className="title-screen-buttons">
              <button className="title-screen-button" onClick={onClick}>
                <div className="title-screen-button-text">Play Game</div>
              </button>
              <button className="title-screen-button">
                <div className="title-screen-button-text">How to Play</div>
              </button>
              <button className="title-screen-button">
                <div className="title-screen-button-text">Settings</div>
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* <div className="title-screen-border border-right">
        <div className="title-screen-border-inner"></div>
      </div> */}
    </div>
  );
}
