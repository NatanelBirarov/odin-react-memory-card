import { useEffect, useMemo, useRef } from "react";
import Tilt from "react-parallax-tilt";
import Loader from "../Loader/Loader";
import SettingsPage from "../SettingsPage/SettingsPage";
import { useNavigate, useNavigation, useOutletContext } from "react-router-dom";
import HowToPlayPage from "../HowToPlayPage/HowToPlay";
import Button from "../Button/Button";
import { useQuery } from "@tanstack/react-query";
import { titleScreenQuery } from "../../scripts/queries";
import { CardData, ContextType } from "../../scripts/types";

import styles from "./TitlePage.module.css";
import Img from "../Img/Img";

export default function TitlePage() {
  const {
    isLogged,
    showSettings,
    setShowSettings,
    showHowTo,
    setShowHowTo,
    musicVolume,
  } = useOutletContext<ContextType>();

  const bgAudioRef = useRef<HTMLAudioElement | null>(null);
  const backgroundCards = useRef<CardData[]>([]);
  const firstLoad = useRef(true);
  const navigation = useNavigation();
  const navigate = useNavigate();

  type TitleScreenData = { data: CardData[] };
  let { data: pokemonData } = useQuery(titleScreenQuery()) as TitleScreenData;

  useEffect(() => {
    bgAudioRef.current.volume = musicVolume;
  }, [musicVolume]);

  backgroundCards.current = useMemo<CardData[]>(() => {
    let transformedData: CardData[] = [];
    if (pokemonData) {
      if (firstLoad.current) {
        transformedData = Array.from(Array(30).keys()).map(() => {
          const randomCard: CardData =
            pokemonData[Math.floor(Math.random() * pokemonData.length)];
          pokemonData = pokemonData.filter(
            (card: CardData) => card.id !== randomCard.id
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
      <audio ref={bgAudioRef} src="/audio/titleBg.mp3" autoPlay loop />
      {showSettings && <SettingsPage onClose={() => setShowSettings(false)} />}
      {showHowTo && <HowToPlayPage onClose={() => setShowHowTo(false)} />}
      <div className={styles.main}>
        {/* <div className="title-screen-border border-left">
        <div className="title-screen-border-inner"></div>
      </div> */}
        <div className={styles.background}>
          {backgroundCards.current.map((card: CardData) => (
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
              <Img
                // key={card.image}
                src={card.images.large}
                alt="Background Card"
                type="backgroundCard"
              />
            </Tilt>
          ))}
          <div className={styles.container}>
            <div className={styles.content}>
              <div className={styles.logo}>
                <Img src="/images/logo1.png" alt="Logo" type="large" />
                <Img src="/images/logo2.png" alt="Logo" type="large" />
              </div>
              <div className={styles.buttons}>
                <Button
                  type="titleScreen"
                  onClick={() => {
                    isLogged
                      ? navigate("/selectionscreen")
                      : navigate("/login?redirectTo=selectionscreen");
                  }}
                >
                  <div className={styles.buttonText}>Play Game</div>
                </Button>
                <Button type="titleScreen" onClick={() => setShowHowTo(true)}>
                  <div className={styles.buttonText}>How to Play</div>
                </Button>
                <Button
                  type="titleScreen"
                  onClick={() => {
                    isLogged
                      ? setShowSettings(true)
                      : navigate("/login?redirectTo=titlescreen");
                  }}
                >
                  <div className={styles.buttonText}>Settings</div>
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
