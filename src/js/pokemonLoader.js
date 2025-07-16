import queryClient from "./queryClient";

import {
  gameScreenQuery,
  selectionScreenQuery,
  titleScreenQuery,
} from "./queries";

export default async function pokemonLoader({ params, request }) {
  const url = new URL(request.url);

  if (url.pathname.includes("titlescreen")) {
    return queryClient.ensureQueryData(titleScreenQuery());
  } else if (url.pathname.includes("selectionscreen")) {
    return queryClient.ensureQueryData(selectionScreenQuery());
  } else if (url.pathname.includes("gamescreen")) {
    return queryClient.ensureQueryData(gameScreenQuery(params.setId));
  }
}
