import Button from "../Button/Button";
import Modal, {
  ModalBlockColumn,
  ModalBlockRow,
  ModalText,
} from "../Modal/Modal";
import LocalStorageFactory from "../../scripts/localStorageFactory";
import { ChangeEvent, WheelEvent, useRef } from "react";
import { Volume2, VolumeX } from "lucide-react";

import styles from "./SettingsPage.module.css";
import modalStyles from "../Modal/Modal.module.css";
import { useSettingsContext } from "../../context/SettingsContext";

type SettingsPageProps = {
  onClose: () => void;
};

export default function SettingsPage({ onClose }: SettingsPageProps) {
  const { musicVolume, setMusicVolume, sfxVolume, setSfxVolume } =
    useSettingsContext();

  const isMusicMute = musicVolume === 0;
  const isSfxMute = sfxVolume === 0;
  const prevMusicVolumeRef = useRef(musicVolume > 0 ? musicVolume : 0.5);
  const prevSfxVolumeRef = useRef(sfxVolume > 0 ? sfxVolume : 0.5);

  function setVolume(newValue: number, type: number) {
    if (type === 1) {
      setMusicVolume(newValue / 100);
      LocalStorageFactory.set("volume", {
        musicVolume: newValue / 100,
        sfxVolume,
      });
    } else {
      setSfxVolume(newValue / 100);
      LocalStorageFactory.set("volume", {
        musicVolume,
        sfxVolume: newValue / 100,
      });
    }
  }

  function handleSliderWheel(e: WheelEvent<HTMLInputElement>, type: number) {
    e.preventDefault();
    const volume = type === 1 ? musicVolume : sfxVolume;
    const sign = Math.sign(e.deltaY);
    const newValue =
      sign === 1 ? Math.max(0, volume - 0.1) : Math.min(1, volume + 0.1);
    if (type === 1) {
      setVolume(newValue, 1);
    } else {
      setVolume(newValue, 2);
    }
  }

  function handleClearData() {
    LocalStorageFactory.clear();
    window.location.reload();
  }

  function toggleMute(type: number) {
    if (type === 1) {
      if (isMusicMute) {
        setVolume(prevMusicVolumeRef.current * 100, 1);
      } else {
        prevMusicVolumeRef.current = musicVolume;
        setVolume(0, 1);
      }
    } else {
      if (isSfxMute) {
        setVolume(prevSfxVolumeRef.current * 100, 2);
      } else {
        prevSfxVolumeRef.current = sfxVolume;
        setVolume(0, 2);
      }
    }
  }

  return (
    <Modal contentType="settingsModalContent">
      <ModalBlockColumn>
        <ModalText>
          <label htmlFor="music-volume">
            <p>Music volume</p>
          </label>
        </ModalText>
        <ModalBlockRow>
          <input
            id="music-volume"
            className={styles.volumeSlider}
            type="range"
            min="0"
            max="100"
            value={musicVolume * 100}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setVolume(+e.target.value, 1)
            }
            onWheel={(e: WheelEvent<HTMLInputElement>) =>
              handleSliderWheel(e, 1)
            }
          />
          <Button
            type="mute"
            onClick={() => toggleMute(1)}
          >
            {isMusicMute ? (
              <VolumeX color="black" size={24} />
            ) : (
              <Volume2 color="black" size={24} />
            )}
          </Button>
        </ModalBlockRow>
      </ModalBlockColumn>
      <ModalBlockColumn>
        <ModalText>
          <label htmlFor="music-volume" className={modalStyles.modalText}>
            <p>SFX volume</p>
          </label>
        </ModalText>
        <ModalBlockRow>
          <input
            id="sfx-volume"
            className={styles.volumeSlider}
            type="range"
            min="0"
            max="100"
            value={sfxVolume * 100}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setVolume(+e.target.value, 2)
            }
            onWheel={(e: WheelEvent<HTMLInputElement>) =>
              handleSliderWheel(e, 2)
            }
          />
          <Button
            type="mute"
            onClick={() => toggleMute(2)}
          >
            {isSfxMute ? (
              <VolumeX color="black" size={24} />
            ) : (
              <Volume2 color="black" size={24} />
            )}
          </Button>
        </ModalBlockRow>
      </ModalBlockColumn>
      <Button type="modal" onClick={() => handleClearData()}>
        <div className={modalStyles.modalText}>Clear game data</div>
      </Button>
      <Button type="modal" onClick={onClose}>
        <div className={modalStyles.modalText}>Close</div>
      </Button>
    </Modal>
  );
}
