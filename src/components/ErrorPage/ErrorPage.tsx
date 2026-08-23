import { useNavigate, useRouteError } from "react-router-dom";
import Modal, { ModalBlockColumn, ModalText } from "../Modal/Modal";
import Button from "../Button/Button";

export default function ErrorPage() {
  const navigate = useNavigate();
  const error = useRouteError();
  console.error("Router error:", error);

  return (
    <Modal contentType="modalContent">
      <ModalBlockColumn>
        <ModalText>
          <h2>Oops! Something went wrong.</h2>
          <p>We're sorry, but an unexpected error occurred.</p>
        </ModalText>
        <Button onClick={() => void navigate("/")} type="modal">
          Return to Start
        </Button>
      </ModalBlockColumn>
    </Modal>
  );
}
