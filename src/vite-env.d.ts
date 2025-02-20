/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_MQTT_USERNAME: string;
  readonly VITE_MQTT_PASSWORD: string;
  readonly VITE_MQTT_BROKER: string;
  readonly VITE_MQTT_CLIENT_ID: string;
  readonly VITE_AUTH_PASSWORD: string;
  readonly VITE_AUTH_USERNAME: string;
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
