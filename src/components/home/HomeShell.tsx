import type { JSX } from "solid-js";

interface HomeShellProps {
  children: JSX.Element;
}

export function HomeShell(props: Readonly<HomeShellProps>) {
  return (
    <main class="min-h-full">
      <div class="mx-auto flex min-h-full w-full max-w-[min(96vw,2200px)] flex-col gap-4 px-4 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-6">
        {props.children}
      </div>
    </main>
  );
}
