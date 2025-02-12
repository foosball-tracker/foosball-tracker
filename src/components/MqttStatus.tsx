import { createSignal, onCleanup, onMount } from "solid-js";
import { mqttService } from "../service/mqttService.ts";

export function MqttStatus() {
  const [status, setStatus] = createSignal("connecting");

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

  onMount(() => {
    const callback = (newStatus: string) => setStatus(newStatus);
    mqttService.on("mqtt_status", callback);
    onCleanup(() => mqttService.off("mqtt_status", callback));
  });

  return (
    <div class="flex items-center space-x-2" title={`MQTT ${status()}`}>
      <div class={`h-3 w-3 rounded-full ${dotClasses[status()]}`} />
      <span class={badgeClasses[status()]}>{status()}</span>
    </div>
  );
}
