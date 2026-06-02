import { createMemo, createSignal, For, onCleanup, onMount, Show, splitProps } from "solid-js";

export interface Option<T extends string | number = string | number> {
  value: T;
  label: string;
  disabled?: boolean;
  highlighted?: boolean;
}

export interface SelectProps<T extends string | number = string | number> {
  options: Option<T>[];
  value?: T;
  onChange?: (value: T, option: Option<T>) => void;
  placeholder?: string;
  class?: string;
  legend?: string;
  label?: string;
  "aria-label"?: string;
}

function Select<T extends string | number>(props: Readonly<SelectProps<T>>) {
  const [local] = splitProps(props, [
    "options",
    "onChange",
    "value",
    "placeholder",
    "class",
    "legend",
    "label",
    "aria-label",
  ]);
  const [open, setOpen] = createSignal(false);
  let ref: HTMLDivElement | undefined;

  const selectedOption = createMemo(() => local.options.find((o) => o.value === local.value));

  onMount(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref && !ref.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handleClick);
    onCleanup(() => document.removeEventListener("click", handleClick));
  });

  const handleSelect = (opt: Option<T>) => {
    if (opt.disabled) return;
    local.onChange?.(opt.value, opt);
    setOpen(false);
  };

  const trigger = (
    <button
      aria-label={local["aria-label"]}
      aria-haspopup="listbox"
      aria-expanded={open()}
      class={`btn select-bordered flex w-full items-center justify-between gap-2 font-normal ${local.class ?? ""}`}
      onClick={() => setOpen((prev) => !prev)}
      type="button"
    >
      <span class={selectedOption() ? "" : "text-base-content/50"}>
        {selectedOption()?.label || local.placeholder || ""}
      </span>
      <svg
        class={`h-4 w-4 shrink-0 transition-transform ${open() ? "rotate-180" : ""}`}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>
  );

  const menu = (
    <Show when={open()}>
      <ul
        class="bg-base-100 rounded-box border-base-300 absolute z-10 mt-1 w-full border shadow-md"
        role="listbox"
      >
        <For each={local.options}>
          {(option) => (
            <li
              role="option"
              aria-selected={option.value === local.value}
              aria-disabled={option.disabled}
            >
              <button
                class={`hover:bg-base-200 flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${option.highlighted ? "font-bold" : ""} ${option.value === local.value ? "text-primary font-semibold" : ""} ${option.disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}
                disabled={option.disabled}
                onClick={() => handleSelect(option)}
                type="button"
              >
                <Show when={option.highlighted}>
                  <span class="badge badge-primary badge-xs shrink-0" />
                </Show>
                <span class="truncate">{option.label}</span>
              </button>
            </li>
          )}
        </For>
      </ul>
    </Show>
  );

  const content = (
    <div ref={ref} class="relative">
      {trigger}
      {menu}
    </div>
  );

  return (
    <Show when={local.legend || local.label} fallback={content}>
      <fieldset class="fieldset">
        <Show when={local.legend}>
          <legend class="fieldset-legend">{local.legend}</legend>
        </Show>
        {content}
        <Show when={local.label}>
          <span class="fieldset-label">{local.label}</span>
        </Show>
      </fieldset>
    </Show>
  );
}

export default Select;
