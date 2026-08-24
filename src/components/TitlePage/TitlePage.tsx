import { useEffect, useMemo, useRef } from "react";
import Tilt from "react-parallax-tilt";
import SettingsPage from "../SettingsPage/SettingsPage";
import { useNavigate } from "react-router-dom";
import HowToPlayPage from "../HowToPlayPage/HowToPlay";
import Button from "../Button/Button";
import { useQuery } from "@tanstack/react-query";
import { titlePageQuery } from "../../scripts/queries";
import { CardData } from "../../scripts/types";

import styles from "./TitlePage.module.css";
import Img from "../Img/Img";
import { useSettingsContext } from "../../context/SettingsContext";
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
  } = useSettingsContext();

  const bgAudioRef = useRef<HTMLAudioElement | null>(null);
  const navigate = useNavigate();
  const userSession = authClient.useSession();

  const isLogged = userSession.data?.user ? true : false;

  type TitlePageData = {
    data: CardData[] | undefined;
  };
  const { data: pokemonData } = useQuery(titlePageQuery()) as TitlePageData;

  const backgroundCards = useMemo<CardData[]>(() => {
    if (!pokemonData?.length) return [];

    const pool = [...pokemonData];
    const selectedCards: CardData[] = [];
    const cardCount = Math.min(30, pool.length);

    for (let i = 0; i < cardCount; i += 1) {
      const randomIndex = Math.floor(Math.random() * pool.length);
      const [randomCard] = pool.splice(randomIndex, 1);
      selectedCards.push(randomCard);
    }

    return selectedCards;
  }, [pokemonData]);

  useEffect(() => {
    if (bgAudioRef.current) bgAudioRef.current.volume = musicVolume;
  }, [musicVolume]);

  useEffect(() => {
    async function loadSettings() {
      try {
        const local = LocalStorageFactory.get(
          "settings",
        ) as SettingsType | null;
        if (local) return;

        const remote = (await ApiClient.getSettings()) as SettingsType;
        LocalStorageFactory.set("settings", {
          musicVolume: remote.musicVolume,
          sfxVolume: remote.sfxVolume,
        });
      } catch (error: unknown) {
        console.log("Error loading settings:", error);
        // Non-blocking fallback
        LocalStorageFactory.set("settings", {
          musicVolume: 0.5,
          sfxVolume: 0.5,
        });
      }
    }

    if (isLogged) {
      void loadSettings();
    }
  }, [isLogged]);

  async function handleSignOut() {
    await authClient.signOut();
    LocalStorageFactory.clear();
  }

  return (
    <>
      <audio ref={bgAudioRef} src="/audio/titleBg.mp3" autoPlay loop />
      {showSettings && <SettingsPage onClose={() => setShowSettings(false)} />}
      {showHowTo && <HowToPlayPage onClose={() => setShowHowTo(false)} />}
      <div className={styles.main}>
        <div className={styles.background}>
          {backgroundCards.map((card: CardData) => (
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
                      void navigate("/selectionpage");
                    }}
                  >
                    <div className={styles.buttonText}>Play Game</div>
                  </Button>
                ) : (
                  <Button
                    type="titlePage"
                    onClick={() => {
                      void navigate("/signin?redirectTo=titlepage");
                    }}
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
                    if (isLogged) {
                      void navigate("/profile");
                    } else {
                      void navigate("/signin?redirectTo=titlepage");
                    }
                  }}
                >
                  <div className={styles.buttonText}>Settings</div>
                </Button>
                {isLogged && (
                  <Button
                    type="titlePage"
                    onClick={() => {
                      void handleSignOut();
                    }}
                  >
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
