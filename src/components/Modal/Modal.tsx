import { useEffect } from "react";
import styles from "./Modal.module.css";

type ModalProps = {
  type?: string;
  children: React.ReactNode;
};
export default function Modal({ type, children }: ModalProps) {
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
      <div className={styles[type]}>{children}</div>
    </div>
  );
}
