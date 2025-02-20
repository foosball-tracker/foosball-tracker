import mqtt, { IClientOptions } from "mqtt";
import mitt from "mitt";

type MqttEvents = {
  [topic: string]: string; // Each topic event contains a string message
};

function getOrCreateClientSuffix() {
  const key = "mqtt-client-suffix";
  let clientId = localStorage.getItem(key);

  if (!clientId) {
    clientId = `client-${crypto.randomUUID()}`;
    localStorage.setItem(key, clientId);
  }

  return clientId;
}

const MAX_RETRIES = 5; // Maximum number of retry attempts
const RETRY_INTERVAL = 3000; // 3 seconds between retries

const options: IClientOptions = {
  clientId: `${import.meta.env.VITE_MQTT_CLIENT_ID}_${getOrCreateClientSuffix()}`,
  username: import.meta.env.VITE_MQTT_USERNAME,
  password: import.meta.env.VITE_MQTT_PASSWORD,
  rejectUnauthorized: false,
  reconnectPeriod: 0, // Disable automatic reconnection, we handle it manually
  connectTimeout: 10000, // Give up connecting after 10s
};

class MQTTService {
  private client: mqtt.MqttClient;
  private emitter = mitt<MqttEvents>(); // Use mitt as an event bus
  private retryCount = 0;
  private isStopping = false;

  constructor() {
    this.connect();
  }

  private connect() {
    if (this.isStopping) return;

    console.debug(
      `Attempting to connect to MQTT broker... (Attempt ${this.retryCount + 1}/${MAX_RETRIES})`
    );

    this.client = mqtt.connect(`wss://${import.meta.env.VITE_MQTT_BROKER}:8884/mqtt`, options);

    this.client.on("connect", () => {
      console.debug("Connected to MQTT broker");
      this.retryCount = 0; // Reset retry counter
      this.emitter.emit("mqtt_status", "connected");
    });

    this.client.on("reconnect", () => {
      console.log("Reconnecting to MQTT broker...");
      this.emitter.emit("mqtt_status", "reconnecting");
    });

    this.client.on("close", () => {
      console.log("MQTT connection closed");
      this.emitter.emit("mqtt_status", "disconnected");

      if (!this.isStopping && this.retryCount < MAX_RETRIES) {
        this.retryCount++;
        setTimeout(() => this.connect(), RETRY_INTERVAL);
      } else {
        console.warn("Max retry limit reached. Stopping reconnection attempts.");
      }
    });

    this.client.on("error", (err) => {
      console.error("MQTT error", err);
      this.emitter.emit("mqtt_status", "error");
    });

    this.client.on("message", (topic, payload) => {
      console.log(`Received message on ${topic}: ${payload.toString()}`);
      this.emitter.emit(topic, payload.toString()); // Emit event for the topic
    });
  }

  disconnect() {
    console.log("Disconnecting MQTT client...");
    this.isStopping = true;
    this.client.end();
  }

  subscribe(topic: string) {
    this.client.subscribe(topic, (err) => {
      if (err) console.error(`Failed to subscribe to ${topic}`, err);
    });
  }

  unsubscribe(topic: string) {
    this.client.unsubscribe(topic);
  }

  on(topic: string, callback: (message: string) => void) {
    this.emitter.on(topic, callback);
  }

  off(topic: string, callback: (message: string) => void) {
    this.emitter.off(topic, callback);
  }
}

export const mqttService = new MQTTService();
