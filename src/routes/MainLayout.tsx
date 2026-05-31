import { ParentComponent } from "solid-js";
import { AppHeader } from "~/components/AppHeader.tsx";
import { SupabaseBanner } from "../components/SupabaseBanner.tsx";

export const MainLayout: ParentComponent = (props) => {
  return (
    <div class="bg-base-200 text-base-content flex h-screen flex-col">
      <SupabaseBanner />
      <AppHeader />
      <div class="bg-base-200 flex-1 overflow-y-auto">{props.children}</div>
    </div>
  );
};
