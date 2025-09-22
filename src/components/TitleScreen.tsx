import { useEffect, useMemo, useRef } from "react";
import Tilt from "react-parallax-tilt";
import Loader from "./Loader";
import SettingsScreen from "./SettingsScreen";
import {
  useLoaderData,
  useNavigate,
  useNavigation,
  useOutletContext,
} from "react-router-dom";
import HowToScreen from "./HowToScreen";
import Button from "./Button";
import { useQuery } from "@tanstack/react-query";
import { titleScreenQuery } from "../scripts/queries";

import { CardObject, ContextType, PokemonData } from "../scripts/types";

export default function TitleScreen() {
  const {
    showSettings,
    setShowSettings,
    showHowTo,
    setShowHowTo,
    musicVolume,
  } = useOutletContext<ContextType>();

  const bgAudioRef = useRef<HTMLAudioElement | null>(null);
  const backgroundCards = useRef<CardObject[]>([]);
  const firstLoad = useRef(true);
  const navigation = useNavigation();
  const navigate = useNavigate();

  let { data: pokemonData }: PokemonData = useQuery(titleScreenQuery());

  useEffect(() => {
    bgAudioRef.current.volume = musicVolume;
  }, [musicVolume]);

  backgroundCards.current = useMemo<CardObject[]>(() => {
    let transformedData: CardObject[] = [];
    if (pokemonData) {
      if (firstLoad.current) {
        transformedData = Array.from(Array(30).keys()).map(() => {
          const randomCard: CardObject =
            pokemonData[Math.floor(Math.random() * pokemonData.length)];
          pokemonData = pokemonData.filter(
            (card: CardObject) => card.id !== randomCard.id
          );
          return randomCard;
        });
        firstLoad.current = false;
      }
    }
    return transformedData;
  }, [pokemonData]);

  if (navigation.state === "loading") return <Loader />;

  return (
    <>
      <audio
        className="title-screen-audio"
        ref={bgAudioRef}
        src="/audio/titleBg.mp3"
        autoPlay
        loop
      />
      {showSettings && (
        <SettingsScreen onClose={() => setShowSettings(false)} />
      )}
      {showHowTo && <HowToScreen onClose={() => setShowHowTo(false)} />}
      <div className="title-screen">
        {/* <div className="title-screen-border border-left">
        <div className="title-screen-border-inner"></div>
      </div> */}
        <div className="title-screen-background">
          {backgroundCards.current.map((card: CardObject) => (
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
                <img
                  width={1691}
                  height={361}
                  src="/images/logo1.png"
                  alt="Logo"
                  className="logo1 logo-large"
                />
                <img
                  width={1691}
                  height={361}
                  src="/images/logo2.png"
                  alt="Logo"
                  className="logo2 logo-large"
                />
              </div>
              <div className="title-screen-buttons">
                <Button
                  className="title-screen-button"
                  onClick={() => navigate("/selectionscreen")}
                >
                  <div className="title-screen-button-text">Play Game</div>
                </Button>
                <Button
                  className="title-screen-button"
                  onClick={() => setShowHowTo(true)}
                >
                  <div className="title-screen-button-text">How to Play</div>
                </Button>
                <Button
                  className="title-screen-button"
                  onClick={() => setShowSettings(true)}
                >
                  <div className="title-screen-button-text">Settings</div>
                </Button>
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
