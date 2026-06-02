import { parseArgs, resolveHostedViteEnv, spawnViteDevServer } from "./lib/utils.mjs";

const args = parseArgs(process.argv.slice(2));
const port = args.port ?? process.env.PORT ?? "5173";
const host = args.host ?? process.env.LOCAL_UI_HOST;
const hostedEnv = resolveHostedViteEnv();

spawnViteDevServer({ port, host, viteEnv: hostedEnv });
