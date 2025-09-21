import { useEffect } from "react";

type ModalProps = {
  className?: string;
  children: React.ReactNode;
};
export default function Modal({ className, children }: ModalProps) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    // document.body.style.paddingRight = "0px";
    return () => {
      document.body.style.overflow = "auto";
      // document.body.style.paddingRight = "10px";
    };
  }, []);

  return (
    <div className={`modal ${className}`}>
      <div className="modal-content">{children}</div>
    </div>
  );
}
