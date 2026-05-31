import { Auth } from "@supabase/auth-ui-solid";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { createSignal, onCleanup, onMount } from "solid-js";
import { getRedirectUrl } from "~/components/auth/authHelper.ts";
import { supabase } from "~/service/supabaseService.ts";

interface AuthDialogProps {
  buttonClass?: string;
  buttonLabel?: string;
}

export function AuthDialog(props: Readonly<AuthDialogProps>) {
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
    <>
      <button
        class={props.buttonClass ?? "btn btn-outline btn-sm sm:btn-md px-3"}
        onClick={() => {
          const modal = document.getElementById("login-modal");
          if (modal instanceof HTMLDialogElement) {
            modal.showModal();
          }
        }}
      >
        {props.buttonLabel ?? "Sign in"}
      </button>
      <dialog id="login-modal" class="modal">
        <div class="modal-box">
          <h3 class="text-lg font-bold">Sign in</h3>
          <Auth
            supabaseClient={supabase!}
            appearance={{
              theme: ThemeSupa,
            }}
            providers={["google"]}
            socialLayout={"horizontal"}
            theme="default"
            dark={isDarkAuthTheme()}
            redirectTo={getRedirectUrl()}
          />
          <div class="modal-action">
            <form method="dialog">
              <button class="btn btn-ghost btn-sm sm:btn-md">Close</button>
            </form>
          </div>
        </div>
      </dialog>
    </>
  );
}
