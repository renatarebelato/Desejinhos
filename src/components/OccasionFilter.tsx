import { OCCASIONS } from "@/lib/occasions";
import { cn } from "@/lib/utils";

export function OccasionFilter({ value, onChange, counts }: { value: string; onChange: (v: string) => void; counts: Record<string, number> }) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const opts = [{ value: "todas", label: "Todas", emoji: "🎁" }, ...OCCASIONS.filter((o) => counts[o.value])];
  return (
    <div className="flex flex-wrap gap-2">
      {opts.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all",
            value === o.value ? "border-transparent bg-gradient-primary text-primary-foreground shadow-pop" : "border-border bg-card hover:border-primary/50",
          )}
        >
          {o.emoji} {o.label} <span className="opacity-70">{o.value === "todas" ? total : counts[o.value]}</span>
        </button>
      ))}
    </div>
  );
}
