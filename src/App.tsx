import { lazy, Suspense } from "solid-js";
import PasswordGate from "./components/PasswordGate";

// Lazy-load the protected UI
const ProtectedApp = lazy(() => import("./components/ProtectedApp.tsx"));

export default function App() {
  return (
    <PasswordGate>
      <Suspense
        fallback={<div class="flex min-h-screen items-center justify-center">Loading...</div>}
      >
        <ProtectedApp />
      </Suspense>
    </PasswordGate>
  );
}
