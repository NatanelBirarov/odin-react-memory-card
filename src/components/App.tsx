import Loader from "./Loader/Loader";
import { Outlet, useNavigation } from "react-router-dom";
import { SettingsProvider } from "../context/SettingsContext";

import "../styles/global.css";

function App() {
  const navigation = useNavigation();

  if (navigation.state === "loading") return <Loader />;

  return (
    <SettingsProvider>
      <Outlet />
    </SettingsProvider>
  );
}

export default App;
