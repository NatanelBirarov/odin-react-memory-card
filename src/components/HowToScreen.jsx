import Modal from "./Modal";

export default function HowToScreen({ onClose }) {
  return (
    <Modal className="how-to-screen">
      <p>
        <strong>1. </strong> Select the next available set.
      </p>
      <p>
        <strong>2. </strong> Each level, try to click each card only once!
      </p>
      <p>
        <strong>3. </strong> If you click on the same card twice, you will have
        to start over.
      </p>
      <p>
        <strong>4. </strong> Clear all levels to unlock the next set!
      </p>
      <button className="modal-button" onClick={onClose}>
        <div className="modal-button-text">Close</div>
      </button>
    </Modal>
  );
}
