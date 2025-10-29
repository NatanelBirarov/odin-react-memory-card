import { useEffect } from "react";
import styles from "./Modal.module.css";

type ModalProps = {
  contentType?: string;
  children: React.ReactNode;
};
export default function Modal({ contentType = "", children }: ModalProps) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    // document.body.style.paddingRight = "0px";
    return () => {
      document.body.style.overflow = "auto";
      // document.body.style.paddingRight = "10px";
    };
  }, []);

  return (
    <div className={`${styles.modal}`}>
      <div className={styles[contentType]}>{children}</div>
    </div>
  );
}

export function ModalText({ children }: { children: React.ReactNode }) {
  return <div className={styles.modalText}>{children}</div>;
}

export function ModalBlockColumn({ children }: { children: React.ReactNode }) {
  return <div className={styles.modalBlockCol}>{children}</div>;
}

export function ModalBlockRow({ children }: { children: React.ReactNode }) {
  return <div className={styles.modalBlockRow}>{children}</div>;
}
