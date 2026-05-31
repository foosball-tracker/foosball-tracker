/* @refresh reload */
import { render } from "solid-js/web";
import { Router } from "@solidjs/router";
import { AuthProvider } from "~/components/auth/AuthProvider.tsx";
import { MainLayout } from "./routes/MainLayout.tsx";
import "./App.css";
import { routes } from "./routes/routes.ts";

const wrapper = document.getElementById("root");

if (!wrapper) {
  throw new Error("Wrapper div not found");
}

render(
  () => (
    <AuthProvider>
      <Router root={MainLayout}>{routes}</Router>
    </AuthProvider>
  ),
  wrapper
);
