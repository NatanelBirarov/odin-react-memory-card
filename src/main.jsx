import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import fetchPokemon from "./js/pokemonFactory.js";
import App from "./components/App.jsx";
import TitleScreen from "./components/TitleScreen.jsx";
import SelectionScreen from "./components/SelectionScreen.jsx";
import GameScreen from "./components/GameScreen.jsx";
import Loader from "./components/Loader.jsx";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />} hydrateFallbackElement={<Loader />}>
      <Route
        index
        element={<TitleScreen />}
        loader={() =>
          fetchPokemon("card", {
            q: "set.name:Prismatic supertype:Pokémon",
            orderBy: "-tcgplayer.prices.holofoil.mid",
            select: "id,images",
          })
        }
      />
      <Route
        path="selectionscreen"
        element={<SelectionScreen />}
        loader={() => fetchPokemon("set", { orderBy: "releaseDate" })}
        hydrateFallbackElement={<Loader />}
      />
      <Route
        path="gamescreen/:setId"
        element={<GameScreen />}
        loader={({ params }) =>
          fetchPokemon("card", {
            q: `set.id:${params.setId} supertype:Pokémon`,
            orderBy: "tcgplayer.prices.holofoil.mid",
            select: "id,name,images",
          })
        }
      />
      <Route path="*" element={<div>404</div>} />
    </Route>
  )
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
