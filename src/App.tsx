import { lazy, Suspense } from "solid-js";
import Spinner from "~/components/shared/Spinner.tsx";

const ProtectedApp = lazy(() => import("./components/ProtectedApp.tsx"));

export default function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <ProtectedApp />
    </Suspense>
  );
}
