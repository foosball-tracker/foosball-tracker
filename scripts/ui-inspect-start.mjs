import { ensureInspectServer } from "./ui-inspect-server.mjs";

const status = await ensureInspectServer();
console.log(`UI inspect server ready at ${status.url}`);
console.log(`Log: ${status.logPath}`);
