import { Component, For, JSX, Show, splitProps } from "solid-js";

export interface Option {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<JSX.SelectHTMLAttributes<HTMLSelectElement>, "onChange" | "value"> {
  options: Option[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  class?: string; // additional classes
  legend?: string; // fieldset legend
  label?: string; // fieldset label (optional helper text)
}

/**
 * A reusable Select component based on DaisyUI.
 *
 * @example
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
 *   onChange={setSelectedValue}
 * />
 */
const Select: Component<SelectProps> = (props) => {
  // Use splitProps to extract local props while preserving reactivity
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
    console.log("handleChange", e.target, e.currentTarget);
    local.onChange?.(e.currentTarget.value);
  };

  const selectElement = (
    <select
      {...others}
      class={`select ${local.class || ""}`}
      value={local.value}
      onChange={handleChange}
    >
      <Show when={local.placeholder && (local.value === undefined || local.value === "")}>
        <option value="" disabled>
          {local.placeholder}
        </option>
      </Show>
      <For each={local.options}>
        {(option) => (
          <option value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        )}
      </For>
    </select>
  );

  // Wrap the select element inside a fieldset if legend or label is provided
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
