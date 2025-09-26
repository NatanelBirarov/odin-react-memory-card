import { useOutletContext } from "react-router-dom";
import Button from "./Button";
import Modal from "./Modal";
import LocalStorageFactory from "../scripts/localStorageFactory";
import { ContextType } from "../scripts/types";
import { ChangeEvent, WheelEvent } from "react";

type SettingsScreenProps = {
  onClose: () => void;
};

export default function SettingsScreen({ onClose }: SettingsScreenProps) {
  const { musicVolume, setMusicVolume, sfxVolume, setSfxVolume } =
    useOutletContext<ContextType>();

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

  return (
    <Modal className="settings-screen">
      <div className="modal-block">
        <label htmlFor="music-volume" className="modal-text">
          <p>Music volume</p>
        </label>
        <input
          id="music-volume"
          className="range-slider"
          type="range"
          min="0"
          max="100"
          value={musicVolume * 100}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setVolume(+e.target.value, 1)
          }
          onWheel={(e: WheelEvent<HTMLInputElement>) => handleSliderWheel(e, 1)}
        />
        <Button className="modal-button" onClick={() => setMusicVolume(0)}>
          <div className="modal-button-text">Mute</div>
        </Button>
      </div>
      <div className="modal-block">
        <label htmlFor="music-volume" className="modal-text">
          <p>SFX volume</p>
        </label>
        <input
          id="sfx-volume"
          className="range-slider"
          type="range"
          min="0"
          max="100"
          value={sfxVolume * 100}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setVolume(+e.target.value, 2)
          }
          onWheel={(e: WheelEvent<HTMLInputElement>) => handleSliderWheel(e, 2)}
        />
        <Button className="modal-button" onClick={() => setSfxVolume(0)}>
          <div className="modal-button-text">Mute</div>
        </Button>
      </div>
      <div className="modal-block">
        <Button className="modal-button" onClick={() => handleClearData()}>
          <div className="modal-button-text">Clear game date</div>
        </Button>
        <Button className="modal-button" onClick={onClose}>
          <div className="modal-button-text">Close</div>
        </Button>
      </div>
    </Modal>
  );
}
