import { getInspectServerStatus } from "./ui-inspect-server.mjs";

const status = await getInspectServerStatus();

console.log(`URL: ${status.url}`);
console.log(`Reachable: ${status.reachable ? "yes" : "no"}`);
console.log(`Foosball app: ${status.isFoosballApp ? "yes" : "no"}`);
console.log(`PID: ${status.pid ?? "none"}`);
console.log(`PID running: ${status.pidRunning ? "yes" : "no"}`);
console.log(`Log: ${status.logPath}`);
