import { Auth } from "@supabase/auth-ui-solid";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { createSignal, onCleanup, onMount } from "solid-js";
import { getRedirectUrl } from "~/components/auth/authHelper.ts";
import { supabase } from "~/service/supabaseService.ts";

export function AuthForm() {
  const [isDarkAuthTheme, setIsDarkAuthTheme] = createSignal(false);

  onMount(() => {
    const html = document.documentElement;
    const updateAuthTheme = () => {
      setIsDarkAuthTheme(html.dataset.theme === "dim");
    };

    updateAuthTheme();

    const themeObserver = new MutationObserver(updateAuthTheme);
    themeObserver.observe(html, { attributes: true, attributeFilter: ["data-theme"] });

    onCleanup(() => {
      themeObserver.disconnect();
    });
  });

  return (
    <Auth
      supabaseClient={supabase!}
      appearance={{
        theme: ThemeSupa,
      }}
      providers={["google"]}
      socialLayout="horizontal"
      theme="default"
      dark={isDarkAuthTheme()}
      redirectTo={getRedirectUrl()}
    />
  );
}
