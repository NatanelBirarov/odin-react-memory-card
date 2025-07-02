import { useEffect } from "react";

export default function Modal({ className, children }) {
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
