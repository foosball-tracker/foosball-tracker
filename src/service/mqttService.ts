import mqtt, { IClientOptions } from "mqtt";
import mitt from "mitt";

type MqttEvents = {
  [topic: string]: string; // Each topic event contains a string message
};

const options: IClientOptions = {
  clientId: import.meta.env.VITE_MQTT_CLIENT_ID,
  username: import.meta.env.VITE_MQTT_USERNAME,
  password: import.meta.env.VITE_MQTT_PASSWORD,
  rejectUnauthorized: false,
  clean: false,
  reconnectPeriod: 3000, // Try reconnecting every 2s
  connectTimeout: 10000, // Give up connecting after 5s
};

class MQTTService {
  private client: mqtt.MqttClient;
  private emitter = mitt<MqttEvents>(); // Use mitt as an event bus

  constructor() {
    this.client = mqtt.connect(`wss://${import.meta.env.VITE_MQTT_BROKER}:8884/mqtt`, options);

    this.client.on("connect", () => {
      console.log("Connected to MQTT broker");
      this.emitter.emit("mqtt_status", "connected");
    });

    this.client.on("reconnect", () => {
      console.log("Reconnecting to MQTT broker");
      this.emitter.emit("mqtt_status", "reconnecting");
    });

    this.client.on("close", () => {
      console.log("MQTT connection closed");
      this.emitter.emit("mqtt_status", "disconnected");
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
