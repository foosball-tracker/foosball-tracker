import { SetStoreFunction } from "solid-js/store";
import { ISettings } from "../types/Settings.ts";
import { Suspense } from "solid-js";
import Spinner from "~/components/shared/Spinner.tsx";
import SettingsForm from "~/components/settings/SettingsForm.tsx";

export interface SettingsProps {
  settings: ISettings;
  setSettings: SetStoreFunction<ISettings>;
}

// The parent renders the card and header immediately.
export function Settings(props: SettingsProps) {
  return (
    <div class="card card-border bg-base-300">
      <div class="card-body">
        <h2 class="card-title text-2xl">Settings</h2>
        {/* Only the content that needs the resource is wrapped in Suspense */}
        <Suspense fallback={<Spinner />}>
          <SettingsForm {...props} />
        </Suspense>
      </div>
    </div>
  );
}
