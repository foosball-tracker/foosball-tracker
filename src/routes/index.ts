import { lazy } from "solid-js";

export const routes = [
  {
    path: "/",
    component: lazy(() => import("../App.tsx")),
  },
  {
    path: "/players",
    component: lazy(() => import("../components/players/Players.tsx")),
  },
];
