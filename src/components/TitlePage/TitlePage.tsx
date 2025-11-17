import { useEffect, useMemo, useRef } from "react";
import Tilt from "react-parallax-tilt";
import Loader from "../Loader/Loader";
import SettingsPage from "../SettingsPage/SettingsPage";
import { useNavigate, useNavigation, useOutletContext } from "react-router-dom";
import HowToPlayPage from "../HowToPlayPage/HowToPlay";
import Button from "../Button/Button";
import { useQuery } from "@tanstack/react-query";
import { titlePageQuery } from "../../scripts/queries";
import { CardData, ContextType } from "../../scripts/types";

import styles from "./TitlePage.module.css";
import Img from "../Img/Img";
import { authClient } from "../../scripts/authClient";
import LocalStorageFactory from "../../scripts/localStorageFactory";
import ApiClient from "../../scripts/apiClient";

type SettingsType = {
  musicVolume: number;
  sfxVolume: number;
};

export default function TitlePage() {
  const {
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
  const userSession = authClient.useSession();

  const isLogged = userSession.data?.user ? true : false;

  type TitlePageData = { data: CardData[] };
  let { data: pokemonData } = useQuery(titlePageQuery()) as TitlePageData;

  useEffect(() => {
    if (bgAudioRef.current) bgAudioRef.current.volume = musicVolume;
  }, [musicVolume]);

  useEffect(() => {
    async function loadSettings() {
      let settings: SettingsType = LocalStorageFactory.get("settings");
      if (!settings) {
        settings = await ApiClient.getSettings();
        LocalStorageFactory.set("settings", {
          musicVolumeInit: settings.musicVolume,
          sfxVolumeInit: settings.sfxVolume,
        });
      }
    }
    if (isLogged) loadSettings();
  }, []);

  async function handleSignOut() {
    await authClient.signOut();
    LocalStorageFactory.clear();
  }

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
                src={card.images ? card.images.large : ""}
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
                {isLogged ? (
                  <Button
                    type="titlePage"
                    onClick={() => {
                      navigate("/selectionpage");
                    }}
                  >
                    <div className={styles.buttonText}>Play Game</div>
                  </Button>
                ) : (
                  <Button
                    type="titlePage"
                    onClick={() => navigate("/signin?redirectTo=titlepage")}
                  >
                    <div className={styles.buttonText}>Sign In</div>
                  </Button>
                )}
                <Button type="titlePage" onClick={() => setShowHowTo(true)}>
                  <div className={styles.buttonText}>How to Play</div>
                </Button>
                <Button
                  type="titlePage"
                  onClick={() => {
                    isLogged
                      ? setShowSettings(true)
                      : navigate("/signin?redirectTo=titlepage");
                  }}
                >
                  <div className={styles.buttonText}>Settings</div>
                </Button>
                {isLogged && (
                  <Button type="titlePage" onClick={handleSignOut}>
                    <div className={styles.buttonText}>Sign Out</div>
                  </Button>
                )}
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
