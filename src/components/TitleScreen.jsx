import { useRef, useState } from "react";
import Tilt from "react-parallax-tilt";
import Loader from "./Loader";
import SettingsScreen from "./SettingsScreen";
import { useLoaderData, useNavigate, useNavigation } from "react-router-dom";

export default function TitleScreen() {
  const [showSettings, setShowSettings] = useState(false);

  const backgroundCards = useRef([]);
  const navigation = useNavigation();
  const navigate = useNavigate();

  let pokemonData = useLoaderData();

  if (navigation.state === "loading") return <Loader />;

  backgroundCards.current = Array.from(Array(30).keys()).map(() => {
    const randomCard =
      pokemonData[Math.floor(Math.random() * pokemonData.length)];
    pokemonData = pokemonData.filter((card) => card.id !== randomCard.id);
    return randomCard;
  });

  return (
    <>
      {showSettings && (
        <SettingsScreen onClose={() => setShowSettings(false)} />
      )}
      <div className="title-screen">
        {/* <div className="title-screen-border border-left">
        <div className="title-screen-border-inner"></div>
      </div> */}
        <div className="title-screen-background">
          {backgroundCards.current.map((card) => (
            <Tilt
              key={card.id}
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
                // key={card.image}
                src={card.images.large}
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
                <button
                  className="title-screen-button"
                  onClick={() => navigate("/selectionscreen")}
                >
                  <div className="title-screen-button-text">Play Game</div>
                </button>
                <button className="title-screen-button">
                  <div className="title-screen-button-text">How to Play</div>
                </button>
                <button
                  className="title-screen-button"
                  onClick={() => setShowSettings(true)}
                >
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
    </>
  );
}
