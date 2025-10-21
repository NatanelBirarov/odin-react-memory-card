import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import queryClient from "./scripts/queryClient.js";
import pokemonLoader from "./scripts/pokemonLoader.js";

import App from "./components/App.tsx";
import TitleScreen from "./components/TitleScreen.tsx";
import SelectionScreen from "./components/SelectionScreen.jsx";
import GameScreen from "./components/GameScreen.tsx";
import Loader from "./components/Loader/Loader.js";
import StartScreen from "./components/StartScreen.jsx";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route
      path="/"
      element={<App />}
      hydrateFallbackElement={<Loader />}
      errorElement={<Loader />}
    >
      <Route index element={<StartScreen />}></Route>
      <Route
        path="titlescreen"
        element={<TitleScreen />}
        loader={pokemonLoader}
      />
      <Route
        path="selectionscreen"
        element={<SelectionScreen />}
        loader={pokemonLoader}
        hydrateFallbackElement={<Loader />}
      />
      <Route
        path="gamescreen/:setId"
        element={<GameScreen />}
        loader={pokemonLoader}
      />
      <Route path="*" element={<div>404</div>} />
    </Route>
  )
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>
);
