import { lazy, Suspense } from "solid-js";

const ProtectedApp = lazy(() => import("./components/ProtectedApp.tsx"));

export default function App() {
  return (
    <>
      <Suspense fallback={<div class="flex h-full items-center justify-center">Loading...</div>}>
        <ProtectedApp />
      </Suspense>
    </>
  );
}
