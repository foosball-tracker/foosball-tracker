/* @refresh reload */
import { render } from "solid-js/web";
import { Router } from "@solidjs/router";
import { MainLayout } from "./routes/MainLayout.tsx";
import "./App.css";
import { routes } from "./routes/routes.ts";
import { inject } from "@vercel/analytics";

inject();

const wrapper = document.getElementById("root");

if (!wrapper) {
  throw new Error("Wrapper div not found");
}

render(() => <Router root={MainLayout}>{routes}</Router>, wrapper);
