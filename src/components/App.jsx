import Loader from "./Loader";
import { Outlet, useNavigation } from "react-router-dom";

import "./styles.css";

function App() {
  const navigation = useNavigation();

  // if (pokemonData.isError) return <div>Error</div>;
  if (navigation.state === "loading") return <Loader />;

  return (
    <Outlet />
    // <>
    //   {/* {isLoading && <Loader />} */}
    //   {showTitleScreen && (
    //     <TitleScreen onShowSelectionScreen={handleShowSelectionScreen} />
    //   )}
    //   {showSelectionScreen && (
    //     <SelectionScreen
    //       onSelectSet={handleSelectSet}
    //       pokemonSets={pokemonSets.current}
    //     />
    //   )}
    //   {showGameScreen && (
    //     <GameScreen
    //       currentSetCards={pokemonSetCards.current}
    //       onShowSelectionScreen={handleShowSelectionScreen}
    //       gameData={gameData.current}
    //     />
    //   )}
    // </>
  );
}

export default App;
