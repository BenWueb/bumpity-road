"use client";

import { LoonObservation } from "@/types/loon";
import {
  getBehaviorLabel,
  getDisturbanceLabel,
  getWeatherIcon,
  getWeatherLabel,
  getWindLabel,
} from "@/lib/loon-utils";
import { AlertTriangle, Cloud, MapPin, Wind } from "lucide-react";

const PILL_STYLES = {
  sky: "rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-medium text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",
  violet:
    "rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-medium text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
} as const;

export function LoonIdPills({ ids }: { ids: string[] }) {
  if (ids.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {ids.map((id) => (
        <span key={id} className={PILL_STYLES.sky}>
          {id}
        </span>
      ))}
    </div>
  );
}

export function BehaviorPills({ behaviors }: { behaviors: string[] }) {
  if (behaviors.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {behaviors.map((b) => (
        <span key={b} className={PILL_STYLES.violet}>
          {getBehaviorLabel(b)}
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
      <MapPin className="h-3 w-3 text-sky-500" />
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
    LoonObservation,
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
