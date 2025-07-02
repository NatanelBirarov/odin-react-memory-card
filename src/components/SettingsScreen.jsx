import Modal from "./Modal";

export default function SettingsScreen({ onClose }) {
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
          value="50"
        />
        <button className="modal-button" onClick={() => handleMuteMusic(1)}>
          <div className="modal-button-text">Mute</div>
        </button>
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
          value="50"
        />
        <button className="modal-button" onClick={() => handleMuteMusic(2)}>
          <div className="modal-button-text">Mute</div>
        </button>
      </div>
      <div className="modal-block">
        <button className="modal-button" onClick={() => handleClearData()}>
          <div className="modal-button-text">Clear game date</div>
        </button>
        <button className="modal-button" onClick={onClose}>
          <div className="modal-button-text">Close</div>
        </button>
      </div>
    </Modal>
  );
}
