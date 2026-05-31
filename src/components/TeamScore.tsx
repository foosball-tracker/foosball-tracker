import { Shield } from "lucide-solid";

interface TeamScoreProps {
  team: "black" | "yellow";
  teamName: string;
}

export function TeamScore(props: Readonly<TeamScoreProps>) {
  const initials = () =>
    props.teamName
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("");

  const avatarClasses = () =>
    props.team === "black"
      ? "border-success bg-neutral text-neutral-content"
      : "border-success bg-warning text-warning-content";

  return (
    <div class="flex min-w-0 flex-col items-center gap-3 text-center">
      <div class="relative">
        <div class="avatar placeholder">
          <div class={`w-24 rounded-full border-4 shadow-sm sm:w-28 ${avatarClasses()}`}>
            <span class="text-2xl font-black sm:text-3xl">{initials()}</span>
          </div>
        </div>
        <div class="border-base-300 bg-base-100 text-base-content absolute -bottom-1 left-1/2 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full border shadow-sm">
          <Shield size={16} strokeWidth={2.5} />
        </div>
      </div>

      <div class="pt-2">
        <div class="text-[0.65rem] font-black tracking-[0.24em] uppercase opacity-60">
          {props.team === "yellow" ? "Home Team" : "Away Team"}
        </div>
        <h3
          class="line-clamp-2 min-h-[2rem] overflow-hidden text-base leading-tight font-black sm:text-xl"
          style={{ display: "-webkit-box", "-webkit-box-orient": "vertical" }}
        >
          {props.teamName}
        </h3>
      </div>
    </div>
  );
}
