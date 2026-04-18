"use client";

import { FishObservation } from "@/types/fishing";
import {
  getFishBehaviorLabel,
  getBaitLabel,
  getSpeciesLabel,
  getDisturbanceLabel,
  getWeatherIcon,
  getWeatherLabel,
  getWindLabel,
} from "@/lib/fishing-utils";
import { AlertTriangle, Cloud, MapPin, Wind } from "lucide-react";

const PILL_STYLES = {
  cyan: "rounded-full bg-cyan-100 px-2.5 py-0.5 text-xs font-medium text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
  violet:
    "rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-medium text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
  amber:
    "rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
} as const;

export function SpeciesPills({ species }: { species: string[] }) {
  if (species.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {species.map((s) => (
        <span key={s} className={PILL_STYLES.cyan}>
          {getSpeciesLabel(s)}
        </span>
      ))}
    </div>
  );
}

export function FishBehaviorPills({ behaviors }: { behaviors: string[] }) {
  if (behaviors.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {behaviors.map((b) => (
        <span key={b} className={PILL_STYLES.violet}>
          {getFishBehaviorLabel(b)}
        </span>
      ))}
    </div>
  );
}

export function BaitPills({ baits }: { baits: string[] }) {
  if (baits.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {baits.map((b) => (
        <span key={b} className={PILL_STYLES.amber}>
          {getBaitLabel(b)}
        </span>
      ))}
    </div>
  );
}

export function CoordinatesDisplay({
  latitude,
  longitude,
}: {
  latitude: number | null;
  longitude: number | null;
}) {
  if (latitude == null || longitude == null) return null;
  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <MapPin className="h-3 w-3 text-cyan-500" />
      <span className="font-mono tabular-nums">
        {latitude.toFixed(5)}, {longitude.toFixed(5)}
      </span>
    </div>
  );
}

export function ConditionsDisplay({
  observation,
  size = "sm",
}: {
  observation: Pick<
    FishObservation,
    "weather" | "windCondition" | "disturbance"
  >;
  size?: "sm" | "md";
}) {
  const { weather, windCondition, disturbance } = observation;
  const hasDisturbance = disturbance && disturbance !== "none";
  if (!weather && !windCondition && !hasDisturbance) return null;

  const textClass = size === "sm" ? "text-xs" : "text-sm";

  return (
    <div
      className={`flex flex-wrap items-center gap-3 ${textClass} text-muted-foreground`}
    >
      {weather && (
        <span className="flex items-center gap-1">
          {size === "md" && (
            <Cloud className="h-3.5 w-3.5 text-muted-foreground" />
          )}
          {getWeatherIcon(weather)} {getWeatherLabel(weather)}
        </span>
      )}
      {windCondition && (
        <span className="flex items-center gap-1">
          {size === "md" && (
            <Wind className="h-3.5 w-3.5 text-muted-foreground" />
          )}
          {size === "sm" ? "Wind: " : ""}
          {getWindLabel(windCondition)}
        </span>
      )}
      {hasDisturbance && (
        <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
          {size === "md" && <AlertTriangle className="h-3.5 w-3.5" />}
          {size === "sm" ? "Disturbance: " : ""}
          {getDisturbanceLabel(disturbance)}
        </span>
      )}
    </div>
  );
}
