import { createStore, SetStoreFunction } from "solid-js/store";
import { createEffect, onMount } from "solid-js";

export function createLocalStorageStore<T extends object>(
  key: string,
  initialValue: T
): [T, SetStoreFunction<T>] {
  const [store, setStore] = createStore<T>(initialValue);

  onMount(() => {
    const stored = localStorage.getItem(key);
    if (stored !== null) {
      try {
        setStore(JSON.parse(stored));
      } catch (error) {
        console.error(`Error parsing localStorage key "${key}":`, error);
      }
    }
  });

  createEffect(() => {
    localStorage.setItem(key, JSON.stringify(store));
  });

  return [store, setStore];
}
