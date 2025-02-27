import { children, createSignal, onMount, ParentComponent, Show } from "solid-js";
import { createLocalStorageSignal } from "../hooks/createLocalStorageSignal";

// Helper to hash a string using SHA‑256 via the Web Crypto API
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  // Convert bytes to hex string
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

const PasswordGate: ParentComponent = (props) => {
  const resolvedChildren = children(() => props.children);

  // Single localStorage-based signal to store the hashed password
  const [authHash, setAuthHash] = createLocalStorageSignal<string>("auth_hash", "");
  // Signal for the user input (plain text)
  const [inputPassword, setInputPassword] = createSignal("");
  const [error, setError] = createSignal(false);
  const [correctHash, setCorrectHash] = createSignal<string>("");

  // Get the correct password from Vite env and compute its hash
  const CORRECT_PASSWORD = import.meta.env.VITE_AUTH_PASSWORD;

  onMount(async () => {
    const hash = await hashPassword(CORRECT_PASSWORD);
    setCorrectHash(hash);
  });

  const isAuthorized = () => authHash() === correctHash();

  const checkPassword = async () => {
    const inputHash = await hashPassword(inputPassword());
    if (inputHash === correctHash()) {
      setAuthHash(inputHash);
      location.reload(); // reloads the page to unlock the app
    } else {
      setError(true);
      setInputPassword("");
    }
  };

  return (
    <Show
      when={isAuthorized()}
      fallback={
        <div class="fixed inset-0 flex items-center justify-center bg-gray-900 text-white">
          <div class="w-80 rounded bg-gray-800 p-6 text-center shadow-lg">
            <h2 class="mb-4 text-2xl font-bold">Enter Password</h2>
            <input
              type="password"
              placeholder="Password"
              class="input input-bordered mb-4 w-full"
              value={inputPassword()}
              onInput={(e) => setInputPassword(e.currentTarget.value)}
            />
            {error() && <p class="text-error mb-2">Wrong password, try again.</p>}
            <button class="btn btn-primary w-full" onClick={checkPassword}>
              Login
            </button>
          </div>
        </div>
      }
    >
      {resolvedChildren()}
    </Show>
  );
};

export default PasswordGate;
