import { Shield } from "lucide-solid";

interface TeamScoreProps {
  team: "black" | "yellow";
  teamName: string;
}

export function TeamScore(props: Readonly<TeamScoreProps>) {
  const displayName = () => {
    const trimmedName = props.teamName.trim();
    if (!trimmedName.endsWith(")")) return trimmedName;

    const suffixStart = trimmedName.lastIndexOf(" (");
    return suffixStart > -1 ? trimmedName.slice(0, suffixStart).trim() : trimmedName;
  };
  const initials = () =>
    displayName()
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("")
      .slice(0, 2);

  const avatarClasses = () =>
    props.team === "black"
      ? "border-neutral text-neutral [html[data-theme=dim]_&]:bg-neutral-content bg-base-100"
      : "border-warning text-warning-content bg-base-100 [html[data-theme=dim]_&]:bg-neutral-content";

  return (
    <div class="flex min-w-0 flex-col items-center gap-2 text-center">
      <div class="relative">
        <div class="avatar placeholder">
          <div
            class={`ring-success/45 ring-offset-base-300 flex aspect-square w-20 items-center justify-center rounded-full border-[3px] shadow-sm ring-4 ring-offset-2 sm:w-24 ${avatarClasses()}`}
          >
            <span class="block max-w-full px-2 text-center text-2xl leading-none font-black sm:text-3xl">
              {initials() || "?"}
            </span>
          </div>
        </div>
        <div class="border-base-300 bg-base-100 text-base-content absolute -right-1 -bottom-1 flex h-7 w-7 items-center justify-center rounded-full border shadow-sm">
          <Shield size={14} strokeWidth={2.5} />
        </div>
      </div>

      <div class="pt-1">
        <div class="text-base-content/70 [html[data-theme=dim]_&]:text-neutral-content/75 text-[0.62rem] font-black tracking-[0.18em] uppercase">
          {props.team === "yellow" ? "Home Team" : "Away Team"}
        </div>
        <h3
          class="line-clamp-2 min-h-[1.75rem] overflow-hidden text-sm leading-tight font-black sm:text-base"
          style={{ display: "-webkit-box", "-webkit-box-orient": "vertical" }}
        >
          {displayName()}
        </h3>
      </div>
    </div>
  );
}
