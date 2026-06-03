import { createHash, randomUUID } from "node:crypto";
import { spawnSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { getMp3DurationMs } from "./lib/mp3-duration.mjs";

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SOUND_BUCKET = "sounds";
const FILE_BIN = "/usr/bin/file";

if (!supabaseUrl?.includes("127.0.0.1") && !supabaseUrl?.includes("localhost")) {
  console.error("Error: Refusing to seed sounds outside local Supabase.");
  console.error(`  SUPABASE_URL="${supabaseUrl ?? "(not set)"}"`);
  process.exit(1);
}

if (!serviceRoleKey) {
  console.error("Error: Missing SUPABASE_SERVICE_ROLE_KEY environment variable.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function getSeedFiles(type) {
  const directory = join(process.cwd(), "public", "audio", type);

  return readdirSync(directory)
    .filter((name) => name.endsWith(".mp3"))
    .sort()
    .map((name) => ({ name, path: join(directory, name) }));
}

function getDisplayName(type, index) {
  const prefix = type === "goal" ? "Goal" : "Win";
  return `${prefix} ${index + 1}`;
}

function checksumFor(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

function getDurationFromFileCommand(filePath, sizeBytes) {
  const result = spawnSync(FILE_BIN, [filePath], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });

  if (result.status !== 0) {
    throw new Error(`file command failed for ${filePath}: ${result.stderr}`);
  }

  const match = result.stdout.match(/,\s+(\d+)\s+kbps,/i);
  if (!match) {
    throw new Error(`Could not parse bitrate from file output for ${filePath}.`);
  }

  const bitrate = Number.parseInt(match[1], 10) * 1000;
  return Math.round((sizeBytes * 8 * 1000) / bitrate);
}

async function seedType(type) {
  const files = getSeedFiles(type);

  for (const [index, file] of files.entries()) {
    const buffer = readFileSync(file.path);
    const checksum = checksumFor(buffer);
    const soundId = randomUUID();
    const storagePath = `ready/${soundId}/${checksum}.mp3`;
    let durationMs;

    try {
      durationMs = getMp3DurationMs(buffer);
    } catch {
      durationMs = getDurationFromFileCommand(file.path, buffer.byteLength);
    }

    const { error: uploadError } = await supabase.storage
      .from(SOUND_BUCKET)
      .upload(storagePath, buffer, {
        contentType: "audio/mpeg",
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
    }

    const { error: insertError } = await supabase.from("sound_assets").insert({
      id: soundId,
      type,
      status: "ready",
      name: getDisplayName(type, index),
      storage_bucket: SOUND_BUCKET,
      storage_path: storagePath,
      content_type: "audio/mpeg",
      size_bytes: buffer.byteLength,
      duration_ms: durationMs,
      checksum,
      is_default: true,
      metadata: {
        seeded: true,
        source_file: `public/audio/${type}/${file.name}`,
      },
    });

    if (insertError) {
      throw new Error(`Failed to insert ${file.name}: ${insertError.message}`);
    }
  }
}

console.log(`Seeding local sound assets on ${supabaseUrl} ...`);

const { error: deleteSeededError } = await supabase
  .from("sound_assets")
  .delete()
  .contains("metadata", { seeded: true });

if (deleteSeededError) {
  throw new Error(`Failed to clear seeded sound rows: ${deleteSeededError.message}`);
}

await seedType("goal");
await seedType("win");

console.log("Done. Seeded goal and win sound assets.");
