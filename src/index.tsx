/* @refresh reload */
import { render } from "solid-js/web";
import { Router } from "@solidjs/router";
import { routes } from "./routes/index.ts";
import { MainLayout } from "./routes/MainLayout.tsx";
import "./App.css";

const wrapper = document.getElementById("root");

if (!wrapper) {
  throw new Error("Wrapper div not found");
}

render(() => <Router root={MainLayout}>{routes}</Router>, wrapper);
