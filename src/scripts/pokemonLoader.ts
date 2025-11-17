import queryClient from "./queryClient";

import { gamePageQuery, selectionPageQuery, titlePageQuery } from "./queries";
import { LoaderFunctionArgs } from "react-router-dom";

export default async function pokemonLoader({
  params,
  request,
}: LoaderFunctionArgs) {
  const url = new URL(request.url);

  if (url.pathname.includes("titlepage")) {
    return queryClient.ensureQueryData(titlePageQuery());
  } else if (url.pathname.includes("selectionpage")) {
    return queryClient.ensureQueryData(selectionPageQuery());
  } else if (url.pathname.includes("gamepage")) {
    return queryClient.ensureQueryData(gamePageQuery(params.setId!));
  }
}
