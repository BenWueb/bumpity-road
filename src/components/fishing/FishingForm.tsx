"use client";

import { useState, useEffect } from "react";
import { FishObservation, SavedLocation } from "@/types/fishing";
import type { WeatherCondition, WindCondition } from "@/types/fishing";
import {
  FISH_SPECIES,
  FISH_BEHAVIORS,
  BAIT_TYPES,
  WEATHER_CONDITIONS,
  WIND_CONDITIONS,
  DISTURBANCES,
} from "@/types/fishing";
import { CldUploadButton, CldImage } from "next-cloudinary";
import { ImagePlus, X } from "lucide-react";
import { emitBadgesEarned } from "@/utils/badges-client";
import LocationPickerWrapper from "./LocationPickerWrapper";

function mapWeatherMain(main: string): WeatherCondition | "" {
  const m = main.toLowerCase();
  if (m === "clear") return "clear";
  if (m === "clouds") return "partly_cloudy";
  if (m === "drizzle") return "light_rain";
  if (m === "rain" || m === "thunderstorm") return "rain";
  if (m === "snow") return "snow";
  if (m === "mist" || m === "fog" || m === "haze" || m === "smoke") return "fog";
  return "";
}

function mapWindSpeed(mph: number): WindCondition {
  if (mph <= 3) return "calm";
  if (mph <= 7) return "light";
  if (mph <= 18) return "moderate";
  if (mph <= 30) return "strong";
  return "gusty";
}

interface FishingFormProps {
  observation?: FishObservation;
  savedLocations: SavedLocation[];
  onCreated?: (observation: FishObservation) => void;
  onUpdated?: (observation: FishObservation) => void;
  onCancel: () => void;
}

export default function FishingForm({
  observation,
  savedLocations,
  onCreated,
  onUpdated,
  onCancel,
}: FishingFormProps) {
  const today = new Date().toISOString().split("T")[0];
  const nowTime = new Date().toTimeString().slice(0, 5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<{ url: string; publicId: string }[]>(
    () => {
      if (!observation) return [];
      return observation.imageUrls.map((url, i) => ({
        url,
        publicId: observation.imagePublicIds[i] ?? "",
      }));
    }
  );
  const [removedPublicIds, setRemovedPublicIds] = useState<string[]>([]);

  const [latitude, setLatitude] = useState<number | null>(
    observation?.latitude ?? null
  );
  const [longitude, setLongitude] = useState<number | null>(
    observation?.longitude ?? null
  );

  const [formData, setFormData] = useState({
    date: observation?.date
      ? new Date(observation.date).toISOString().split("T")[0]
      : today,
    time: observation?.time ?? (!observation ? nowTime : ""),
    lakeName: observation?.lakeName || "",
    lakeArea: observation?.lakeArea || "",
    species: observation?.species || ([] as string[]),
    totalCount: observation?.totalCount?.toString() || "0",
    notableCatches: observation?.notableCatches || "",
    behaviors: observation?.behaviors || ([] as string[]),
    baits: observation?.baits || ([] as string[]),
    weather: observation?.weather || "",
    windCondition: observation?.windCondition || "",
    disturbance: observation?.disturbance || "",
    notes: observation?.notes || "",
  });

  useEffect(() => {
    if (observation) return;
    fetch("/api/weather")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        setFormData((prev) => {
          const updates: Partial<typeof prev> = {};
          if (!prev.weather && data.weatherMain) {
            updates.weather = mapWeatherMain(data.weatherMain);
          }
          if (!prev.windCondition && data.windSpeed != null) {
            updates.windCondition = mapWindSpeed(data.windSpeed);
          }
          return Object.keys(updates).length ? { ...prev, ...updates } : prev;
        });
      })
      .catch(() => {});
  }, [observation]);

  function toggleSpecies(species: string) {
    setFormData((prev) => ({
      ...prev,
      species: prev.species.includes(species)
        ? prev.species.filter((s) => s !== species)
        : [...prev.species, species],
    }));
  }

  function toggleBehavior(behavior: string) {
    setFormData((prev) => ({
      ...prev,
      behaviors: prev.behaviors.includes(behavior)
        ? prev.behaviors.filter((b) => b !== behavior)
        : [...prev.behaviors, behavior],
    }));
  }

  function toggleBait(bait: string) {
    setFormData((prev) => ({
      ...prev,
      baits: prev.baits.includes(bait)
        ? prev.baits.filter((b) => b !== bait)
        : [...prev.baits, bait],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.lakeName.trim() || !formData.date || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const method = observation ? "PATCH" : "POST";
      const body = {
        ...(observation ? { id: observation.id } : {}),
        ...formData,
        latitude,
        longitude,
        imageUrls: images.map((img) => img.url),
        imagePublicIds: images.map((img) => img.publicId),
        removedImagePublicIds: observation ? removedPublicIds : undefined,
      };

      const res = await fetch("/api/fishing", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save fishing report");
      }

      const data = await res.json();
      if (observation && onUpdated) {
        onUpdated(data.observation);
      } else if (onCreated) {
        onCreated(data.observation);
        emitBadgesEarned(data.newBadges);
      }
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Failed to save fishing report"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Location (map picker) */}
        <LocationPickerWrapper
          latitude={latitude}
          longitude={longitude}
          lakeName={formData.lakeName}
          lakeArea={formData.lakeArea}
          savedLocations={savedLocations}
          onLocationChange={(loc) => {
            setLatitude(loc.latitude || null);
            setLongitude(loc.longitude || null);
            if (loc.lakeName)
              setFormData((prev) => ({
                ...prev,
                lakeName: loc.lakeName,
                lakeArea: loc.lakeArea,
              }));
          }}
          onLakeNameChange={(name) =>
            setFormData((prev) => ({ ...prev, lakeName: name }))
          }
          onLakeAreaChange={(area) =>
            setFormData((prev) => ({ ...prev, lakeArea: area }))
          }
        />

        {/* Date, Time & Total Count */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <label htmlFor="fishDate" className="text-sm font-medium">
              Date *
            </label>
            <input
              id="fishDate"
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, date: e.target.value }))
              }
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="fishTime" className="text-sm font-medium">
              Time
            </label>
            <input
              id="fishTime"
              type="time"
              value={formData.time}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, time: e.target.value }))
              }
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="totalCount" className="text-sm font-medium">
              Total Fish
            </label>
            <input
              id="totalCount"
              type="number"
              min="0"
              value={formData.totalCount}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  totalCount: e.target.value,
                }))
              }
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {/* Species */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Species Caught</label>
          <div className="flex flex-wrap gap-1.5">
            {FISH_SPECIES.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => toggleSpecies(s.value)}
                className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                  formData.species.includes(s.value)
                    ? "bg-cyan-500 text-white"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Baits / Lures */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Bait / Lures Used</label>
          <div className="flex flex-wrap gap-1.5">
            {BAIT_TYPES.map((b) => (
              <button
                key={b.value}
                type="button"
                onClick={() => toggleBait(b.value)}
                className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                  formData.baits.includes(b.value)
                    ? "bg-amber-500 text-white"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        {/* Fish Behavior */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Fish Activity</label>
          <div className="flex flex-wrap gap-1.5">
            {FISH_BEHAVIORS.map((b) => (
              <button
                key={b.value}
                type="button"
                onClick={() => toggleBehavior(b.value)}
                className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                  formData.behaviors.includes(b.value)
                    ? "bg-violet-500 text-white"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notable Catches */}
        <div className="space-y-2">
          <label htmlFor="notableCatches" className="text-sm font-medium">
            Notable Catches
          </label>
          <textarea
            id="notableCatches"
            value={formData.notableCatches}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                notableCatches: e.target.value,
              }))
            }
            placeholder="e.g. 24&quot; walleye, biggest bass of the season..."
            rows={2}
            className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Disturbance & Weather */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="fishWeather" className="text-sm font-medium">
              Weather
            </label>
            <select
              id="fishWeather"
              value={formData.weather}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, weather: e.target.value }))
              }
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Select weather</option>
              {WEATHER_CONDITIONS.map((w) => (
                <option key={w.value} value={w.value}>
                  {w.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="fishWindCondition" className="text-sm font-medium">
              Wind
            </label>
            <select
              id="fishWindCondition"
              value={formData.windCondition}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  windCondition: e.target.value,
                }))
              }
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Select wind condition</option>
              {WIND_CONDITIONS.map((w) => (
                <option key={w.value} value={w.value}>
                  {w.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="fishDisturbance" className="text-sm font-medium">
            Disturbance
          </label>
          <select
            id="fishDisturbance"
            value={formData.disturbance}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                disturbance: e.target.value,
              }))
            }
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Select disturbance</option>
            {DISTURBANCES.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <label htmlFor="fishNotes" className="text-sm font-medium">
            Notes
          </label>
          <textarea
            id="fishNotes"
            value={formData.notes}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, notes: e.target.value }))
            }
            placeholder="Additional details about the trip..."
            rows={3}
            className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Photos */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Photos</label>
          {images.length > 0 && (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {images.map((img, idx) => (
                <div key={img.publicId || idx} className="group relative">
                  <div className="relative h-32 w-full overflow-hidden rounded-md border">
                    <CldImage
                      src={img.publicId}
                      alt={`Fishing photo ${idx + 1}`}
                      width={400}
                      height={300}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (img.publicId) {
                        setRemovedPublicIds((prev) => [...prev, img.publicId]);
                      }
                      setImages((prev) => prev.filter((_, i) => i !== idx));
                    }}
                    className="absolute right-1 top-1 rounded-full bg-destructive p-1 text-destructive-foreground opacity-0 shadow-sm transition-opacity hover:bg-destructive/90 group-hover:opacity-100"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <CldUploadButton
            uploadPreset="bumpity-road"
            onSuccess={(result) => {
              const info = result.info as {
                secure_url: string;
                public_id: string;
              };
              setImages((prev) => [
                ...prev,
                { url: info.secure_url, publicId: info.public_id },
              ]);
            }}
            options={{ multiple: true }}
            className="flex w-full items-center justify-center gap-2 rounded-md border-2 border-dashed bg-background px-4 py-4 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
          >
            <ImagePlus className="h-5 w-5" />
            {images.length > 0 ? "Add More Photos" : "Upload Photos"}
          </CldUploadButton>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={
              isSubmitting || !formData.lakeName.trim() || !formData.date
            }
            className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {isSubmitting
              ? "Saving..."
              : observation
                ? "Update Report"
                : "Log Report"}
          </button>
        </div>
      </form>
    </div>
  );
}
