import { AuthForm } from "~/components/auth/AuthForm.tsx";

interface AuthDialogProps {
  buttonClass?: string;
  buttonLabel?: string;
}

export function AuthDialog(props: Readonly<AuthDialogProps>) {
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
          <AuthForm />
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
