import type { JSX } from "solid-js";

interface HomeShellProps {
  children: JSX.Element;
}

export function HomeShell(props: Readonly<HomeShellProps>) {
  return (
    <main class="min-h-full">
      <div class="mx-auto flex min-h-full w-full max-w-[1600px] flex-col gap-6 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        {props.children}
      </div>
    </main>
  );
}
