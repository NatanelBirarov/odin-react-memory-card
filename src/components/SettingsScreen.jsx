import { useOutletContext } from "react-router-dom";
import Button from "./Button";
import Modal from "./Modal";

export default function SettingsScreen({ onClose }) {
  const { musicVolume, setMusicVolume, sfxVolume, setSfxVolume } =
    useOutletContext();

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
          onChange={(e) => setMusicVolume(+e.target.value / 100)}
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
          onChange={(e) => setSfxVolume(+e.target.value / 100)}
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
