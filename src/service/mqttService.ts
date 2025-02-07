import mqtt, { IClientOptions } from "mqtt";
import mitt from "mitt";

type MqttEvents = {
  [topic: string]: string; // Each topic event contains a string message
};

const options: IClientOptions = {
  username: import.meta.env.VITE_MQTT_USERNAME,
  password: import.meta.env.VITE_MQTT_PASSWORD,
  rejectUnauthorized: false,
};

class MQTTService {
  private client: mqtt.MqttClient;
  private emitter = mitt<MqttEvents>(); // Use mitt as an event bus

  constructor() {
    this.client = mqtt.connect(`wss://${import.meta.env.VITE_MQTT_BROKER}:8884/mqtt`, options);

    this.client.on("connect", () => {
      console.log("Connected to MQTT broker");
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
