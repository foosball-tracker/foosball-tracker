import { For, JSX, Show, splitProps } from "solid-js";

export interface Option<T extends string | number = string | number> {
  value: T;
  label: string;
  disabled?: boolean;
}

export interface SelectProps<T extends string | number = string | number>
  extends Omit<JSX.SelectHTMLAttributes<HTMLSelectElement>, "onChange" | "value"> {
  options: Option<T>[];
  value?: T;
  /**
   * Fires when an option is selected. The callback receives the new value
   * and the fully matched option object. (The second argument is guaranteed
   * to be a valid Option, never undefined.)
   */
  onChange?: (value: T, option: Option<T>) => void;
  placeholder?: string;
  class?: string;
  legend?: string;
  label?: string;
}

/**
 * A reusable Select component based on DaisyUI.
 *
 * @example
 * ```tsx
 * const options = [
 *   { value: "crimson", label: "Crimson" },
 *   { value: "amber", label: "Amber" },
 *   { value: "velvet", label: "Velvet" },
 * ];
 *
 * <Select
 *   options={options}
 *   placeholder="Pick a color"
 *   value={selectedValue}
 *   onChange={(newValue, matchedOption) => {
 *     setSelectedValue(newValue);
 *     console.log("Selected Option:", matchedOption);
 *   }}
 * />
 * ```
 */
const Select = <T extends string | number = string>(props: SelectProps<T>) => {
  const [local, others] = splitProps(props, [
    "options",
    "onChange",
    "value",
    "placeholder",
    "class",
    "legend",
    "label",
  ]);

  const handleChange: JSX.EventHandler<HTMLSelectElement, Event> = (e) => {
    const rawValue = e.currentTarget.value;

    // If rawValue is empty (e.g. a placeholder was selected), we skip calling onChange.
    if (!rawValue) {
      return;
    }

    // Convert if the first option is numeric
    const convertedValue =
      typeof local.options[0]?.value === "number" ? (Number(rawValue) as T) : (rawValue as T);

    // Find the matching option
    const matchedOption = local.options.find((o) => o.value.toString() === rawValue);

    // Only call onChange if we found a valid matching option.
    // This ensures that when onChange fires, the second argument is never undefined.
    if (matchedOption) {
      local.onChange?.(convertedValue, matchedOption);
    }
  };

  const selectElement = (
    <select
      {...others}
      class={`select ${local.class ?? ""}`}
      value={local.value?.toString() ?? ""}
      onChange={handleChange}
    >
      <Show when={local.placeholder && (local.value === undefined || local.value === "")}>
        <option value="" disabled>
          {local.placeholder}
        </option>
      </Show>
      <For each={local.options}>
        {(option) => (
          <option value={option.value.toString()} disabled={option.disabled}>
            {option.label}
          </option>
        )}
      </For>
    </select>
  );

  return (
    <Show when={local.legend || local.label} fallback={selectElement}>
      <fieldset class="fieldset">
        <Show when={local.legend}>
          <legend class="fieldset-legend">{local.legend}</legend>
        </Show>
        {selectElement}
        <Show when={local.label}>
          <span class="fieldset-label">{local.label}</span>
        </Show>
      </fieldset>
    </Show>
  );
};

export default Select;
