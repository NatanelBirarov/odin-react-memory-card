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
import TitlePage from "./components/TitlePage/TitlePage.js";
import SetSelectionPage from "./components/SetSelectionPage/SetSelectionPage.js";
import GamePage from "./components/GamePage/GamePage.js";
import Loader from "./components/Loader/Loader.js";
import StartPage from "./components/StartPage/StartPage.js";
import SignInPage from "./components/SignInPage/SignInPage.js";
import SignUpPage from "./components/SignUpPage/SignUpPage.js";
import EmailVerificationPage from "./components/emailVerificationPage/EmailVerificationPage.js";
import ResetPasswordRequestPage from "./components/ResetPasswordRequestPage/ResetPasswordRequestPage.js";
import ResetPasswordPage from "./components/ResetPasswordPage/ResetPasswordPage.js";
import UserProfile from "./components/UserProfile/UserProfile.js";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route
      path="/"
      element={<App />}
      hydrateFallbackElement={<Loader />}
      errorElement={<Loader />}
    >
      <Route index element={<StartPage />}></Route>
      <Route path="titlepage" element={<TitlePage />} loader={pokemonLoader} />
      <Route path="signin" element={<SignInPage />} />
      <Route path="signup" element={<SignUpPage />} />
      <Route path="verify" element={<EmailVerificationPage />} />
      <Route path="forgot-password" element={<ResetPasswordRequestPage />} />
      <Route path="reset-password" element={<ResetPasswordPage />} />
      <Route path="profile" element={<UserProfile />} />
      <Route
        path="selectionpage"
        element={<SetSelectionPage />}
        loader={pokemonLoader}
        hydrateFallbackElement={<Loader />}
      />
      <Route
        path="gamepage/:setId"
        element={<GamePage />}
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
