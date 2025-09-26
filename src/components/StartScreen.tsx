import { useNavigate } from "react-router-dom";

export default function StartScreen() {
  const navigate = useNavigate();

  window.addEventListener(
    "click",
    () => {
      navigate("/titlescreen", { replace: true });
    },
    { once: true }
  );

  return (
    <div className="start-screen">
      <h1>Click anywhere to start</h1>
    </div>
  );
}
