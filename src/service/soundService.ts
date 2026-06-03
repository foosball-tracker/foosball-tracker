import { createSignal } from "solid-js";
import { requireSupabase, supabase } from "./supabaseService";
import type { Tables, TablesInsert } from "~/types/database";

export type SoundType = "goal" | "no-goal" | "win";
export type ManagedSoundType = Exclude<SoundType, "no-goal">;
export type SoundStatus = Tables<"sound_assets">["status"];
type SoundAssetRow = Tables<"sound_assets">;

const MUTE_STORAGE_KEY = "foosball-muted";
const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024;
const MAX_DURATION_MS: Record<ManagedSoundType, number> = {
  goal: 5_000,
  win: 10_000,
};
const LOCAL_FALLBACK_GOAL_TOTAL = 23;
const NO_GOAL_SOUND_TOTAL = 13;

export interface SoundAsset {
  checksum: string | null;
  contentType: string;
  createdAt: string;
  durationMs: number;
  id: string;
  isDefault: boolean;
  metadata: SoundAssetRow["metadata"];
  name: string;
  sizeBytes: number;
  status: SoundStatus;
  storageBucket: string;
  storagePath: string;
  type: ManagedSoundType;
  uploadedBy: string | null;
  url: string;
}

export interface SoundUploadValidationResult {
  durationMs: number;
  fileExtension: string;
  sizeBytes: number;
}

function loadMuteState(): boolean {
  try {
    return localStorage.getItem(MUTE_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

const [isMuted, setIsMuted] = createSignal(loadMuteState());
const [loadedSoundAssets, setLoadedSoundAssets] = createSignal<SoundAsset[]>([]);
const [soundAssetsLoaded, setSoundAssetsLoaded] = createSignal(false);

const recentGoalIds: string[] = [];
const recentLocalGoalIndices: number[] = [];
const recentNoGoalIndices: number[] = [];
const preloadedAudio = new Map<string, HTMLAudioElement>();

export { isMuted, soundAssetsLoaded };

export function toggleMute() {
  const next = !isMuted();
  setIsMuted(next);

  try {
    localStorage.setItem(MUTE_STORAGE_KEY, String(next));
  } catch {
    // localStorage may be unavailable in some environments
  }
}

function randomIndex(max: number) {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0] % max;
}

function mapSoundAsset(row: SoundAssetRow): SoundAsset {
  const url =
    supabase?.storage.from(row.storage_bucket).getPublicUrl(row.storage_path).data.publicUrl ?? "";

  return {
    checksum: row.checksum,
    contentType: row.content_type,
    createdAt: row.created_at,
    durationMs: row.duration_ms,
    id: row.id,
    isDefault: row.is_default,
    metadata: row.metadata,
    name: row.name,
    sizeBytes: row.size_bytes,
    status: row.status,
    storageBucket: row.storage_bucket,
    storagePath: row.storage_path,
    type: row.type,
    uploadedBy: row.uploaded_by,
    url,
  };
}

function primeAudio(url: string) {
  if (!url || preloadedAudio.has(url)) return;

  const audio = new Audio(url);
  audio.preload = "auto";
  audio.load();
  preloadedAudio.set(url, audio);
}

function playAudioUrl(url: string) {
  if (!url) return;

  const cached = preloadedAudio.get(url);
  const audio = cached ? (cached.cloneNode(true) as HTMLAudioElement) : new Audio(url);
  void audio.play().catch((error) => {
    console.error("Failed to play sound:", error);
  });
}

function getLocalNoGoalPath() {
  let available: number[] = [];

  for (let index = 0; index < NO_GOAL_SOUND_TOTAL; index += 1) {
    if (!recentNoGoalIndices.includes(index)) {
      available.push(index);
    }
  }

  if (available.length === 0) {
    available = Array.from({ length: NO_GOAL_SOUND_TOTAL }, (_, index) => index);
  }

  const chosenIndex = available[randomIndex(available.length)];
  recentNoGoalIndices.push(chosenIndex);

  if (recentNoGoalIndices.length > 5) {
    recentNoGoalIndices.shift();
  }

  return `/audio/no-goal/no-goal-${chosenIndex}.mp3`;
}

function getLocalGoalPath() {
  let available: number[] = [];

  for (let index = 0; index < LOCAL_FALLBACK_GOAL_TOTAL; index += 1) {
    if (!recentLocalGoalIndices.includes(index)) {
      available.push(index);
    }
  }

  if (available.length === 0) {
    available = Array.from({ length: LOCAL_FALLBACK_GOAL_TOTAL }, (_, index) => index);
  }

  const chosenIndex = available[randomIndex(available.length)];
  recentLocalGoalIndices.push(chosenIndex);

  if (recentLocalGoalIndices.length > 5) {
    recentLocalGoalIndices.shift();
  }

  return `/audio/goal/goal-${chosenIndex}.mp3`;
}

function getLocalWinPath() {
  return "/audio/win/win-1.mp3";
}

function pickGoalSound(pool: SoundAsset[]) {
  let available = pool.filter((asset) => !recentGoalIds.includes(asset.id));

  if (available.length === 0) {
    available = pool;
  }

  const chosen = available[randomIndex(available.length)];
  recentGoalIds.push(chosen.id);

  if (recentGoalIds.length > 5) {
    recentGoalIds.shift();
  }

  return chosen;
}

async function decodeDurationMs(file: File) {
  const AudioContextCtor = globalThis.AudioContext;
  if (!AudioContextCtor) {
    throw new Error("AudioContext is not available.");
  }

  const audioContext = new AudioContextCtor();

  try {
    const buffer = await file.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(buffer.slice(0));
    return Math.round(audioBuffer.duration * 1000);
  } finally {
    await audioContext.close();
  }
}

async function sha256(file: File) {
  const buffer = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return [...new Uint8Array(digest)].map((value) => value.toString(16).padStart(2, "0")).join("");
}

export function getLoadedSoundAssets() {
  return loadedSoundAssets();
}

export async function listSoundAssets(options?: {
  includeDisabled?: boolean;
  type?: ManagedSoundType;
}) {
  const client = requireSupabase();
  const includeDisabled = options?.includeDisabled ?? false;

  let query = client
    .from("sound_assets")
    .select("*")
    .order("type", { ascending: true })
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: true });

  if (!includeDisabled) {
    query = query.eq("status", "ready");
  }

  if (options?.type) {
    query = query.eq("type", options.type);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error listing sound assets:", error);
    throw new Error(error.message);
  }

  return (data ?? []).map(mapSoundAsset);
}

export async function refreshSoundAssets() {
  if (!supabase) {
    setLoadedSoundAssets([]);
    setSoundAssetsLoaded(true);
    return [];
  }

  try {
    const assets = await listSoundAssets();
    assets.forEach((asset) => primeAudio(asset.url));
    setLoadedSoundAssets(assets);
    return assets;
  } finally {
    setSoundAssetsLoaded(true);
  }
}

export async function validateSoundUpload(file: File, type: ManagedSoundType) {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";

  if (file.type !== "audio/mpeg") {
    throw new Error("Only MP3 files with MIME type audio/mpeg are supported.");
  }

  if (extension !== "mp3") {
    throw new Error("Only .mp3 files are supported.");
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error("Files larger than 2 MB are not allowed.");
  }

  let durationMs: number;

  try {
    durationMs = await decodeDurationMs(file);
  } catch (error) {
    console.error("Failed to decode uploaded audio:", error);
    throw new Error("Could not decode the selected MP3 file.");
  }

  if (durationMs > MAX_DURATION_MS[type]) {
    const seconds = (MAX_DURATION_MS[type] / 1000).toFixed(0);
    throw new Error(
      `${type === "goal" ? "Goal" : "Win"} sounds must be ${seconds} seconds or shorter.`
    );
  }

  return {
    durationMs,
    fileExtension: extension,
    sizeBytes: file.size,
  } satisfies SoundUploadValidationResult;
}

export async function createSoundAsset(params: {
  file: File;
  name: string;
  type: ManagedSoundType;
}) {
  const client = requireSupabase();
  const validation = await validateSoundUpload(params.file, params.type);
  const checksum = await sha256(params.file);
  const soundId = crypto.randomUUID();
  const storagePath = `ready/${soundId}/${checksum}.mp3`;

  const { error: uploadError } = await client.storage
    .from("sounds")
    .upload(storagePath, params.file, {
      contentType: "audio/mpeg",
      upsert: false,
    });

  if (uploadError) {
    console.error("Error uploading sound asset:", uploadError);
    throw new Error(uploadError.message);
  }

  const row: TablesInsert<"sound_assets"> = {
    checksum,
    content_type: "audio/mpeg",
    duration_ms: validation.durationMs,
    id: soundId,
    metadata: {
      original_filename: params.file.name,
      uploaded_via: "web",
    },
    name: params.name.trim(),
    size_bytes: validation.sizeBytes,
    status: "ready",
    storage_bucket: "sounds",
    storage_path: storagePath,
    type: params.type,
  };

  const { data, error } = await client.from("sound_assets").insert(row).select().single();

  if (error) {
    await client.storage.from("sounds").remove([storagePath]);
    console.error("Error inserting sound asset metadata:", error);
    throw new Error(error.message);
  }

  const asset = mapSoundAsset(data);
  primeAudio(asset.url);
  await refreshSoundAssets();
  return asset;
}

export async function updateSoundAssetStatus(id: string, status: SoundStatus) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("sound_assets")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating sound asset status:", error);
    throw new Error(error.message);
  }

  await refreshSoundAssets();
  return mapSoundAsset(data);
}

export function playSound(type: SoundType) {
  if (isMuted()) return;

  if (type === "no-goal") {
    playAudioUrl(getLocalNoGoalPath());
    return;
  }

  const pool = loadedSoundAssets().filter(
    (asset) => asset.type === type && asset.status === "ready"
  );

  if (pool.length === 0) {
    const fallbackUrl = type === "goal" ? getLocalGoalPath() : getLocalWinPath();
    console.warn(`No ready ${type} sounds are loaded. Falling back to bundled audio.`);
    playAudioUrl(fallbackUrl);
    return;
  }

  const selectedAsset = type === "goal" ? pickGoalSound(pool) : pool[randomIndex(pool.length)];
  playAudioUrl(selectedAsset.url);
}
