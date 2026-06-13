"use client";

import { FishObservation, SpeciesCount } from "@/types/fishing";
import {
  getFishBehaviorLabel,
  getBaitLabel,
  getSpeciesLabel,
  getDisturbanceLabel,
  getWeatherIcon,
  getWeatherLabel,
  getWindLabel,
  formatWeight,
  formatSize,
  normalizeSpeciesCounts,
} from "@/lib/fishing-utils";
import { AlertTriangle, Cloud, Map, MapPin, Ruler, Scale, Wind } from "lucide-react";

const PILL_STYLES = {
  cyan: "rounded-full bg-cyan-100 px-2.5 py-0.5 text-xs font-medium text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
  violet:
    "rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-medium text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
  amber:
    "rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
} as const;

export function SpeciesPills({
  species,
  speciesCounts,
}: {
  species: string[];
  speciesCounts?: SpeciesCount[];
}) {
  const items = normalizeSpeciesCounts(speciesCounts, species);
  if (items.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((sc) => (
        <span key={sc.species} className={PILL_STYLES.cyan}>
          {getSpeciesLabel(sc.species)}
          {sc.count > 1 ? ` (${sc.count})` : ""}
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

export function CatchSizeDisplay({
  weight,
  size,
}: {
  weight: number | null;
  size: number | null;
}) {
  if (weight == null && size == null) return null;
  return (
    <div className="grid grid-cols-2 gap-2">
      {weight != null && (
        <div className="flex items-center gap-2 rounded-md bg-muted/50 p-2">
          <Scale className="h-4 w-4 shrink-0 text-cyan-500" />
          <div>
            <div className="text-sm font-semibold text-foreground">
              {formatWeight(weight)}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Weight
            </div>
          </div>
        </div>
      )}
      {size != null && (
        <div className="flex items-center gap-2 rounded-md bg-muted/50 p-2">
          <Ruler className="h-4 w-4 shrink-0 text-teal-500" />
          <div>
            <div className="text-sm font-semibold text-foreground">
              {formatSize(size)}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Size
            </div>
          </div>
        </div>
      )}
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

export function ViewOnMapButton({
  latitude,
  longitude,
  onClick,
  className = "",
}: {
  latitude: number | null;
  longitude: number | null;
  onClick: () => void;
  className?: string;
}) {
  const hasCoords = latitude != null && longitude != null;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!hasCoords}
      title={
        hasCoords
          ? "View this report on the map"
          : "No map coordinates for this report"
      }
      className={`inline-flex items-center gap-1.5 rounded-md border bg-background px-3 py-1.5 text-xs font-medium text-foreground shadow-sm transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      <Map className="h-3.5 w-3.5" />
      View on map
    </button>
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
