import { Accessor, createEffect, createSignal, onMount, Setter } from "solid-js";

export function createLocalStorageSignal<T>(
  key: string,
  initialValue: T
): [Accessor<T>, Setter<T>] {
  const [value, setValue] = createSignal<T>(initialValue);

  onMount(() => {
    const stored = localStorage.getItem(key);
    if (stored !== null) {
      try {
        setValue(JSON.parse(stored));
      } catch (error) {
        console.error(`Error parsing localStorage value for key "${key}":`, error);
      }
    }
  });

  createEffect(() => {
    localStorage.setItem(key, JSON.stringify(value()));
  });

  return [value, setValue];
}
