import Button from "../Button/Button";
import Modal, { ModalBlockRow } from "../Modal/Modal";

import { modalText } from "../Modal/Modal.module.css";

type HowToPageProps = {
  onClose: () => void;
};

export default function HowToPlayPage({ onClose }: HowToPageProps) {
  return (
    <Modal contentType="howToModalContent">
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
      <ModalBlockRow>
        <Button type="modal" onClick={onClose}>
          <div className={modalText}>Close</div>
        </Button>
      </ModalBlockRow>
    </Modal>
  );
}
