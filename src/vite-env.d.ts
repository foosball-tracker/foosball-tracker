/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_MQTT_USERNAME: string;
  readonly VITE_MQTT_PASSWORD: string;
  readonly VITE_MQTT_BROKER: string;
  readonly VITE_MQTT_CLIENT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
