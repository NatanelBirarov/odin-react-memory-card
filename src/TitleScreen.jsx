import { useEffect, useRef, useState } from "react";
import Tilt from "react-parallax-tilt";
import Loader from "./Loader";

export default function TitleScreen({ onClick, pokemonApi }) {
  const [isLoading, setIsLoading] = useState(true);
  const backgroundCards = useRef([]);

  useEffect(() => {
    const createNewCards = async () => {
      setIsLoading(true);
      const pokemonSet = await pokemonApi.card.all({
        q: "set.name:Prismatic supertype:Pokémon",
        orderBy: "-tcgplayer.prices.holofoil.mid",
      });
      let pokemonSetCardsImages = pokemonSet.map((card) => {
        return { image: card.images.large, id: card.id };
      });

      backgroundCards.current = Array.from(Array(30).keys()).map(() => {
        const randomCard =
          pokemonSetCardsImages[
            Math.floor(Math.random() * pokemonSetCardsImages.length)
          ];
        pokemonSetCardsImages = pokemonSetCardsImages.filter(
          (card) => card.id !== randomCard.id
        );
        return randomCard;
      });
      setIsLoading(false);
    };
    createNewCards();
  }, []);

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
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
                  <img
                    src="/logo1.png"
                    alt="Logo"
                    className="logo1 logo-large"
                  />
                  <img
                    src="/logo2.png"
                    alt="Logo"
                    className="logo2 logo-large"
                  />
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
      )}
    </>
  );
}
