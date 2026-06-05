import { createMemo, createResource, createSignal, Match, onCleanup, Show, Switch } from "solid-js";
import { AudioLines, Upload, Volume2, VolumeX } from "lucide-solid";
import { HomeShell } from "~/components/home/HomeShell.tsx";
import Spinner from "~/components/shared/Spinner.tsx";
import { getCurrentProfile } from "~/service/profileService.ts";
import {
  createSoundAsset,
  listSoundAssets,
  type SoundAsset,
  type ManagedSoundType,
  updateSoundAssetStatus,
  validateSoundUpload,
} from "~/service/soundService.ts";
import { DataTable } from "~/components/shared/table/DataTable.tsx";
import { TableSection } from "~/components/shared/table/TableSection.tsx";
import { type ColumnDef } from "@tanstack/solid-table";

const EMPTY_CAPTIONS_TRACK =
  "data:text/vtt;charset=utf-8,WEBVTT%0A%0A00:00:00.000%20--%3E%2000:00:00.001%0A%20";

function formatBytes(sizeBytes: number) {
  if (sizeBytes < 1024) return `${sizeBytes} B`;
  if (sizeBytes < 1024 * 1024) return `${(sizeBytes / 1024).toFixed(1)} KB`;
  return `${(sizeBytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDuration(durationMs: number) {
  return `${(durationMs / 1000).toFixed(2)}s`;
}

function getSoundInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function getAssetToggleLabel(isUpdating: boolean, status: SoundAsset["status"]) {
  if (isUpdating) {
    return "Saving...";
  }

  return status === "ready" ? "Disable" : "Enable";
}

export default function SoundsPage() {
  const [profile] = createResource(getCurrentProfile);
  const [soundAssets, { refetch }] = createResource(
    () => profile()?.is_admin ?? false,
    async (isAdmin) => (isAdmin ? listSoundAssets({ includeDisabled: true }) : [])
  );

  const [type, setType] = createSignal<ManagedSoundType>("goal");
  const [name, setName] = createSignal("");
  const [selectedFile, setSelectedFile] = createSignal<File | null>(null);
  const [previewUrl, setPreviewUrl] = createSignal<string | null>(null);
  const [previewDurationMs, setPreviewDurationMs] = createSignal<number | null>(null);
  const [submitError, setSubmitError] = createSignal<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = createSignal<string | null>(null);
  const [isSubmitting, setIsSubmitting] = createSignal(false);
  const [updatingIds, setUpdatingIds] = createSignal<string[]>([]);
  let fileInput: HTMLInputElement | undefined;

  const typeLimitLabel = createMemo(() => (type() === "goal" ? "Max 5s" : "Max 10s"));
  const selectedFileSizeLabel = createMemo(() => {
    const file = selectedFile();
    return file ? formatBytes(file.size) : "n/a";
  });
  const previewDurationLabel = createMemo(() => {
    const durationMs = previewDurationMs();
    if (durationMs === null) {
      return "Pending validation";
    }

    return formatDuration(durationMs);
  });

  const clearPreview = () => {
    const url = previewUrl();
    if (url) {
      URL.revokeObjectURL(url);
    }
    setPreviewUrl(null);
    setPreviewDurationMs(null);
  };

  onCleanup(() => clearPreview());

  const handleFileChange = async (event: Event) => {
    const file =
      event.currentTarget instanceof HTMLInputElement ? event.currentTarget.files?.[0] : null;
    clearPreview();
    setSelectedFile(file ?? null);
    setSubmitError(null);
    setSubmitSuccess(null);

    if (!file) return;

    setPreviewUrl(URL.createObjectURL(file));

    try {
      const validation = await validateSoundUpload(file, type());
      setPreviewDurationMs(validation.durationMs);
      if (!name().trim()) {
        const baseName = file.name.replace(/\.mp3$/i, "");
        setName(baseName);
      }
    } catch (error) {
      setPreviewDurationMs(null);
      setSubmitError(
        error instanceof Error ? error.message : "Could not validate the selected file."
      );
    }
  };

  const handleTypeChange = async (event: Event) => {
    const value =
      event.currentTarget instanceof HTMLSelectElement ? event.currentTarget.value : "goal";
    const nextType = value === "win" ? "win" : "goal";
    setType(nextType);
    setSubmitError(null);
    setSubmitSuccess(null);

    const file = selectedFile();
    if (!file) return;

    try {
      const validation = await validateSoundUpload(file, nextType);
      setPreviewDurationMs(validation.durationMs);
    } catch (error) {
      setPreviewDurationMs(null);
      setSubmitError(
        error instanceof Error ? error.message : "Could not validate the selected file."
      );
    }
  };

  const resetForm = () => {
    setName("");
    setSelectedFile(null);
    setSubmitError(null);
    setSubmitSuccess(null);
    clearPreview();
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleUpload = async (event: Event) => {
    event.preventDefault();
    const file = selectedFile();

    if (!file) {
      setSubmitError("Select an MP3 file before uploading.");
      return;
    }

    if (!name().trim()) {
      setSubmitError("Enter a display name before uploading.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      await createSoundAsset({
        file,
        name: name().trim(),
        type: type(),
      });
      await refetch();
      resetForm();
      setSubmitSuccess("Sound uploaded successfully.");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Could not upload the sound.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: "ready" | "disabled") => {
    setUpdatingIds((ids) => [...ids, id]);

    try {
      await updateSoundAssetStatus(id, currentStatus === "ready" ? "disabled" : "ready");
      await refetch();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Could not update the sound status.");
    } finally {
      setUpdatingIds((ids) => ids.filter((value) => value !== id));
    }
  };

  const columns: ColumnDef<SoundAsset>[] = [
    {
      accessorKey: "name",
      header: "Sound",
      cell: (info) => {
        const asset = info.row.original;
        const isUpdating = () => updatingIds().includes(asset.id);

        return (
          <div class="min-w-0 space-y-3">
            <div class="flex min-w-0 items-center gap-3">
              <div class="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold">
                {getSoundInitials(asset.name)}
              </div>
              <div class="min-w-0">
                <p class="truncate font-semibold">{asset.name}</p>
                <div class="mt-1 flex flex-wrap gap-1.5">
                  <span
                    class={`badge badge-outline badge-sm capitalize ${
                      asset.type === "goal" ? "badge-primary" : "badge-secondary"
                    }`}
                  >
                    {asset.type}
                  </span>
                  <span
                    class={`badge badge-sm capitalize ${
                      asset.status === "ready" ? "badge-success" : "badge-warning"
                    }`}
                  >
                    {asset.status}
                  </span>
                  <Show when={asset.isDefault}>
                    <span class="badge badge-outline badge-sm">Default</span>
                  </Show>
                </div>
              </div>
            </div>

            <div class="grid gap-2 text-sm lg:hidden">
              <div class="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                <span class="text-base-content/70">
                  Duration {formatDuration(asset.durationMs)}
                </span>
                <span class="text-base-content/70">Size {formatBytes(asset.sizeBytes)}</span>
              </div>
              <div class="text-base-content/70 truncate text-sm">Source {asset.storagePath}</div>
              <div class="md:hidden">
                <audio class="w-full" controls preload="metadata" src={asset.url}>
                  <track
                    default
                    kind="captions"
                    label="No captions available"
                    src={EMPTY_CAPTIONS_TRACK}
                    srclang="en"
                  />
                </audio>
              </div>
              <div class="md:flex md:justify-start">
                <button
                  class={`btn btn-xs min-w-28 ${
                    asset.status === "ready" ? "btn-soft btn-error" : "btn-outline"
                  } md:btn-sm`}
                  disabled={isUpdating()}
                  onClick={() => void toggleStatus(asset.id, asset.status)}
                  type="button"
                >
                  {getAssetToggleLabel(isUpdating(), asset.status)}
                </button>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      header: "Details",
      meta: {
        headerClass: "hidden lg:table-cell",
        cellClass: "hidden lg:table-cell",
      },
      cell: (info) => {
        const asset = info.row.original;

        return (
          <div class="text-base-content/70 grid gap-2 text-sm">
            <div>
              <div class="text-base-content/60 text-[0.68rem] font-semibold tracking-[0.16em] uppercase">
                Duration
              </div>
              <div>{formatDuration(asset.durationMs)}</div>
            </div>
            <div>
              <div class="text-base-content/60 text-[0.68rem] font-semibold tracking-[0.16em] uppercase">
                Size
              </div>
              <div>{formatBytes(asset.sizeBytes)}</div>
            </div>
            <div>
              <div class="text-base-content/60 text-[0.68rem] font-semibold tracking-[0.16em] uppercase">
                Source
              </div>
              <div class="max-w-52 truncate">{asset.storagePath}</div>
            </div>
          </div>
        );
      },
    },
    {
      id: "preview",
      header: "Preview",
      meta: {
        headerClass: "hidden lg:table-cell",
        cellClass: "hidden lg:table-cell lg:min-w-64",
      },
      cell: (info) => {
        const asset = info.row.original;

        return (
          <audio class="w-full min-w-52" controls preload="metadata" src={asset.url}>
            <track
              default
              kind="captions"
              label="No captions available"
              src={EMPTY_CAPTIONS_TRACK}
              srclang="en"
            />
          </audio>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      meta: {
        headerClass: "hidden text-right lg:table-cell",
        cellClass: "hidden w-0 text-right lg:table-cell",
      },
      cell: (info) => {
        const asset = info.row.original;
        const isUpdating = () => updatingIds().includes(asset.id);

        return (
          <button
            class={`btn btn-sm min-w-28 gap-2 ${
              asset.status === "ready" ? "btn-soft btn-error" : "btn-outline"
            }`}
            disabled={isUpdating()}
            onClick={() => void toggleStatus(asset.id, asset.status)}
            type="button"
          >
            {asset.status === "ready" ? <VolumeX class="h-4 w-4" /> : <Volume2 class="h-4 w-4" />}
            {getAssetToggleLabel(isUpdating(), asset.status)}
          </button>
        );
      },
    },
  ];

  return (
    <HomeShell>
      <Switch>
        <Match when={profile.loading}>
          <div class="flex min-h-[40vh] items-center justify-center">
            <Spinner />
          </div>
        </Match>
        <Match when={!profile()}>
          <div class="alert alert-error">
            <span>Could not load your profile.</span>
          </div>
        </Match>
        <Match when={!profile()?.is_admin}>
          <div class="alert alert-warning">
            <span>Only admins can manage public goal and win sounds.</span>
          </div>
        </Match>
        <Match when={true}>
          <section class="mx-auto flex w-full max-w-6xl flex-col gap-6">
            <div class="card card-border border-base-300 bg-base-100 shadow-sm">
              <div class="card-body gap-5">
                <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p class="text-base-content/60 text-xs font-semibold tracking-[0.24em] uppercase">
                      Admin
                    </p>
                    <h1 class="card-title text-2xl">Public sound library</h1>
                  </div>
                  <div class="text-base-content/70 flex items-center gap-2 text-sm font-medium">
                    <AudioLines class="h-4 w-4" />
                    <span>MP3 only</span>
                    <span class="opacity-50">•</span>
                    <span>2 MB max</span>
                    <span class="opacity-50">•</span>
                    <span>{typeLimitLabel()}</span>
                  </div>
                </div>

                <form
                  class="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]"
                  onSubmit={(event) => void handleUpload(event)}
                >
                  <div class="rounded-box bg-base-200 flex flex-col gap-4 p-4">
                    <div class="grid gap-4 sm:grid-cols-2">
                      <fieldset class="fieldset">
                        <legend class="fieldset-legend">Sound type</legend>
                        <select
                          class="select select-bordered w-full"
                          value={type()}
                          onChange={(event) => void handleTypeChange(event)}
                        >
                          <option value="goal">Goal</option>
                          <option value="win">Win</option>
                        </select>
                      </fieldset>

                      <fieldset class="fieldset">
                        <legend class="fieldset-legend">Display name</legend>
                        <input
                          class="input input-bordered w-full"
                          maxLength={80}
                          onInput={(event) => setName(event.currentTarget.value)}
                          placeholder={type() === "goal" ? "Crowd pop" : "Final whistle"}
                          value={name()}
                        />
                      </fieldset>
                    </div>

                    <fieldset class="fieldset">
                      <legend class="fieldset-legend">MP3 file</legend>
                      <input
                        accept=".mp3,audio/mpeg"
                        class="file-input file-input-bordered w-full"
                        onChange={(event) => void handleFileChange(event)}
                        ref={fileInput}
                        type="file"
                      />
                    </fieldset>

                    <div class="text-base-content/70 grid gap-2 text-sm sm:grid-cols-3">
                      <div class="rounded-box bg-base-100 p-3">
                        <div class="font-semibold">Type</div>
                        <div class="capitalize">{type()}</div>
                      </div>
                      <div class="rounded-box bg-base-100 p-3">
                        <div class="font-semibold">Limit</div>
                        <div>{typeLimitLabel()}</div>
                      </div>
                      <div class="rounded-box bg-base-100 p-3">
                        <div class="font-semibold">Max size</div>
                        <div>2.00 MB</div>
                      </div>
                    </div>
                  </div>

                  <div class="rounded-box bg-base-200 flex flex-col gap-4 p-4">
                    <div class="flex items-center justify-between gap-3">
                      <h2 class="text-lg font-semibold">Preview</h2>
                      <div class="badge badge-outline">
                        {selectedFile() ? "Ready to review" : "No file selected"}
                      </div>
                    </div>

                    <Show
                      when={previewUrl()}
                      fallback={
                        <div class="border-base-300 rounded-box bg-base-100 text-base-content/70 flex min-h-36 items-center justify-center border border-dashed text-sm">
                          Choose an MP3 file to preview it here.
                        </div>
                      }
                    >
                      {(url) => (
                        <div class="rounded-box bg-base-100 flex flex-col gap-4 p-4">
                          <audio class="w-full" controls preload="metadata" src={url()}>
                            <track
                              default
                              kind="captions"
                              label="No captions available"
                              src={EMPTY_CAPTIONS_TRACK}
                              srclang="en"
                            />
                          </audio>
                          <div class="grid gap-3 sm:grid-cols-3">
                            <div>
                              <div class="text-base-content/60 text-xs font-semibold uppercase">
                                File
                              </div>
                              <div class="truncate text-sm font-medium">{selectedFile()?.name}</div>
                            </div>
                            <div>
                              <div class="text-base-content/60 text-xs font-semibold uppercase">
                                Size
                              </div>
                              <div class="text-sm font-medium">{selectedFileSizeLabel()}</div>
                            </div>
                            <div>
                              <div class="text-base-content/60 text-xs font-semibold uppercase">
                                Duration
                              </div>
                              <div class="text-sm font-medium">{previewDurationLabel()}</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </Show>

                    <Show when={submitError()}>
                      {(message) => (
                        <div class="alert alert-error">
                          <span>{message()}</span>
                        </div>
                      )}
                    </Show>

                    <Show when={submitSuccess()}>
                      {(message) => (
                        <div class="alert alert-success">
                          <span>{message()}</span>
                        </div>
                      )}
                    </Show>

                    <div class="flex flex-col gap-3 sm:flex-row sm:justify-end">
                      <button class="btn btn-ghost" onClick={() => resetForm()} type="button">
                        Clear
                      </button>
                      <button class="btn btn-primary gap-2" disabled={isSubmitting()} type="submit">
                        <Upload class="h-4 w-4" />
                        {isSubmitting() ? "Uploading..." : "Upload sound"}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            <Show
              when={soundAssets()}
              fallback={
                <div class="card card-border border-base-300 bg-base-100 shadow-sm">
                  <div class="card-body">
                    <div class="flex min-h-32 items-center justify-center">
                      <Spinner />
                    </div>
                  </div>
                </div>
              }
            >
              {(assets) => (
                <TableSection
                  eyebrow="Library"
                  title="Existing sounds"
                  stats={
                    <>
                      <span class="badge badge-outline badge-sm gap-2 px-3 py-3">
                        <AudioLines class="h-3.5 w-3.5" />
                        {assets().length} assets
                      </span>
                      <span class="badge badge-outline badge-sm px-3 py-3">
                        {assets().filter((asset) => asset.status === "ready").length} ready
                      </span>
                    </>
                  }
                  actions={
                    <button
                      class="btn btn-outline btn-sm sm:btn-md min-w-28"
                      onClick={refetch}
                      type="button"
                    >
                      Refresh
                    </button>
                  }
                >
                  <DataTable
                    columns={columns}
                    data={assets()}
                    emptyTitle="No sounds in the library"
                    emptyDescription="Upload a goal or win sound to populate the shared library."
                  />
                </TableSection>
              )}
            </Show>
          </section>
        </Match>
      </Switch>
    </HomeShell>
  );
}
