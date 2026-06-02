import { parseArgs, resolveLocalViteEnv, spawnViteDevServer } from "./lib/utils.mjs";

const args = parseArgs(process.argv.slice(2));
const port = args.port ?? process.env.UI_INSPECT_PORT ?? process.env.PLAYWRIGHT_PORT ?? "4174";
const host = args.host ?? process.env.LOCAL_UI_HOST;
const localEnv = resolveLocalViteEnv();

spawnViteDevServer({ port, host, viteEnv: localEnv });
