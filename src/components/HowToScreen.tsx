import Button from "./Button/Button";
import Modal from "./Modal/Modal";

import { modalText } from "./Modal/Modal.module.css";

type HowToScreenProps = {
  onClose: () => void;
};

export default function HowToScreen({ onClose }: HowToScreenProps) {
  return (
    <Modal type="howToModalContent">
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
      <Button type="modal" onClick={onClose}>
        <div className={modalText}>Close</div>
      </Button>
    </Modal>
  );
}
