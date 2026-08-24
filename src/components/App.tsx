import Loader from "./Loader/Loader";
import { Outlet, useNavigation } from "react-router-dom";

import "../styles/global.css";

function App() {
  const navigation = useNavigation();

  if (navigation.state === "loading") return <Loader />;

  return <Outlet />;
}

export default App;
