import { lazy } from "solid-js";

/**
 * Renders nothing. Used as the index (default) child of layout routes
 * so the parent layout still mounts when visiting the exact path.
 */
const EmptyOutlet = () => null;

export const routes = [
  {
    path: "/",
    component: lazy(() => import("../App.tsx")),
  },
  {
    path: "/players",
    component: lazy(() => import("../components/players/Players.tsx")),
    children: [
      {
        path: "",
        component: EmptyOutlet,
      },
      {
        path: "/new",
        component: lazy(() => import("../components/players/PlayerForm.tsx")),
      },
    ],
  },
  {
    path: "/teams",
    component: lazy(() => import("../components/teams/Teams.tsx")),
    children: [
      {
        path: "",
        component: EmptyOutlet,
      },
      {
        path: "/new",
        component: lazy(() => import("../components/teams/TeamForm.tsx")),
      },
      {
        path: "/edit/:id",
        component: lazy(() => import("../components/teams/TeamForm.tsx")),
      },
    ],
  },
];
