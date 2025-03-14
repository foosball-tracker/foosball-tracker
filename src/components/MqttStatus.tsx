import { createSignal } from "solid-js";

export function MqttStatus() {
  const [status] = createSignal("disconnected");

  // Tailwind CSS classes for the status dot
  const dotClasses: Record<string, string> = {
    connected: "bg-green-500",
    reconnecting: "bg-yellow-500",
    disconnected: "bg-red-500",
    error: "bg-gray-500",
    connecting: "bg-blue-500",
  };

  // DaisyUI badge classes for the label
  const badgeClasses: Record<string, string> = {
    connected: "badge badge-success",
    reconnecting: "badge badge-warning",
    disconnected: "badge badge-error",
    error: "badge badge-secondary",
    connecting: "badge badge-info",
  };

  return (
    <div class="flex items-center space-x-2" title={`MQTT ${status()}`}>
      <div class={`h-3 w-3 rounded-full ${dotClasses[status()]}`} />
      <span class={badgeClasses[status()]}>{status()}</span>
    </div>
  );
}
