"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { LoonObservation, SavedLocation } from "@/types/loon";
import type { WeatherCondition, WindCondition } from "@/types/loon";
import {
  NESTING_ACTIVITIES,
  WEATHER_CONDITIONS,
  WIND_CONDITIONS,
  DISTURBANCES,
  LOON_BEHAVIORS,
} from "@/types/loon";
import { CldUploadButton, CldImage } from "next-cloudinary";
import { ImagePlus, X, Plus, ChevronDown, ChevronUp } from "lucide-react";
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

interface LoonFormProps {
  observation?: LoonObservation;
  savedLocations: SavedLocation[];
  knownLoonIds?: string[];
  onCreated?: (observation: LoonObservation) => void;
  onUpdated?: (observation: LoonObservation) => void;
  onCancel: () => void;
}

export default function LoonForm({
  observation,
  savedLocations,
  knownLoonIds = [],
  onCreated,
  onUpdated,
  onCancel,
}: LoonFormProps) {
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
  const [loonIdInput, setLoonIdInput] = useState("");
  const [showLoonIdDropdown, setShowLoonIdDropdown] = useState(false);
  const [showPairedBreakdown, setShowPairedBreakdown] = useState(
    () => observation?.pairedAdultsCount != null || observation?.unpairedAdultsCount != null
  );
  const loonIdWrapperRef = useRef<HTMLDivElement>(null);

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
    adultsCount: observation?.adultsCount?.toString() || "0",
    pairedAdultsCount: observation?.pairedAdultsCount?.toString() || "",
    unpairedAdultsCount: observation?.unpairedAdultsCount?.toString() || "",
    chicksCount: observation?.chicksCount?.toString() || "0",
    juvenilesCount: observation?.juvenilesCount?.toString() || "0",
    duration: observation?.duration?.toString() || "",
    loonIds: observation?.loonIds || ([] as string[]),
    nestingActivity: observation?.nestingActivity || "",
    behaviors: observation?.behaviors || ([] as string[]),
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

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (loonIdWrapperRef.current && !loonIdWrapperRef.current.contains(e.target as Node)) {
        setShowLoonIdDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredLoonIds = useMemo(() => {
    const input = loonIdInput.trim().toUpperCase();
    return knownLoonIds.filter(
      (id) => !formData.loonIds.includes(id) && (!input || id.toUpperCase().includes(input))
    );
  }, [knownLoonIds, loonIdInput, formData.loonIds]);

  function addLoonId() {
    const id = loonIdInput.trim().toUpperCase();
    if (id && !formData.loonIds.includes(id)) {
      setFormData((prev) => ({ ...prev, loonIds: [...prev.loonIds, id] }));
    }
    setLoonIdInput("");
  }

  function removeLoonId(id: string) {
    setFormData((prev) => ({
      ...prev,
      loonIds: prev.loonIds.filter((i) => i !== id),
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

  const pairedSum =
    (parseInt(formData.pairedAdultsCount) || 0) +
    (parseInt(formData.unpairedAdultsCount) || 0);
  const adultsTotal = parseInt(formData.adultsCount) || 0;
  const pairedExceedsAdults =
    (formData.pairedAdultsCount || formData.unpairedAdultsCount) &&
    pairedSum > adultsTotal;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.lakeName.trim() || !formData.date || isSubmitting) return;
    if (pairedExceedsAdults) return;

    setIsSubmitting(true);
    try {
      const method = observation ? "PATCH" : "POST";
      const body = {
        ...(observation ? { id: observation.id } : {}),
        ...formData,
        pairedAdultsCount: formData.pairedAdultsCount || null,
        unpairedAdultsCount: formData.unpairedAdultsCount || null,
        duration: formData.duration || null,
        latitude,
        longitude,
        imageUrls: images.map((img) => img.url),
        imagePublicIds: images.map((img) => img.publicId),
        removedImagePublicIds: observation ? removedPublicIds : undefined,
      };

      const res = await fetch("/api/loons", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save observation");
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
        error instanceof Error ? error.message : "Failed to save observation"
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

        {/* Date, Time & Duration */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <label htmlFor="date" className="text-sm font-medium">
              Date *
            </label>
            <input
              id="date"
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
            <label htmlFor="time" className="text-sm font-medium">
              Time
            </label>
            <input
              id="time"
              type="time"
              value={formData.time}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, time: e.target.value }))
              }
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="duration" className="text-sm font-medium">
              Duration (min)
            </label>
            <input
              id="duration"
              type="number"
              min="1"
              placeholder="e.g. 30"
              value={formData.duration}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, duration: e.target.value }))
              }
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {/* Loon Counts */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <label htmlFor="adultsCount" className="text-sm font-medium">
              Adults
            </label>
            <input
              id="adultsCount"
              type="number"
              min="0"
              value={formData.adultsCount}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  adultsCount: e.target.value,
                }))
              }
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="chicksCount" className="text-sm font-medium">
              Chicks
            </label>
            <input
              id="chicksCount"
              type="number"
              min="0"
              value={formData.chicksCount}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  chicksCount: e.target.value,
                }))
              }
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="juvenilesCount" className="text-sm font-medium">
              Juveniles
            </label>
            <input
              id="juvenilesCount"
              type="number"
              min="0"
              value={formData.juvenilesCount}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  juvenilesCount: e.target.value,
                }))
              }
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {/* Paired / Unpaired Breakdown */}
        <div>
          <button
            type="button"
            onClick={() => setShowPairedBreakdown((v) => !v)}
            className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            {showPairedBreakdown ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
            Paired / Unpaired breakdown
          </button>
          {showPairedBreakdown && (() => {
            const adults = parseInt(formData.adultsCount) || 0;
            const paired = parseInt(formData.pairedAdultsCount) || 0;
            const unpaired = parseInt(formData.unpairedAdultsCount) || 0;
            const overTotal = paired + unpaired > adults;
            return (
              <div className="mt-2 space-y-1.5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="pairedAdultsCount" className="text-sm font-medium">
                      Paired Adults
                    </label>
                    <input
                      id="pairedAdultsCount"
                      type="number"
                      min="0"
                      max={adults}
                      placeholder="0"
                      value={formData.pairedAdultsCount}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          pairedAdultsCount: e.target.value,
                        }))
                      }
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="unpairedAdultsCount" className="text-sm font-medium">
                      Unpaired Adults
                    </label>
                    <input
                      id="unpairedAdultsCount"
                      type="number"
                      min="0"
                      max={adults}
                      placeholder="0"
                      value={formData.unpairedAdultsCount}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          unpairedAdultsCount: e.target.value,
                        }))
                      }
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>
                {overTotal && (
                  <p className="text-xs text-destructive">
                    Paired ({paired}) + Unpaired ({unpaired}) exceeds total adults ({adults})
                  </p>
                )}
              </div>
            );
          })()}
        </div>

        {/* Individual Loon IDs */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Individual Loon IDs</label>
          <div className="relative flex gap-2" ref={loonIdWrapperRef}>
            <div className="relative flex-1">
              <input
                type="text"
                value={loonIdInput}
                onChange={(e) => setLoonIdInput(e.target.value)}
                onFocus={() => setShowLoonIdDropdown(true)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addLoonId();
                  }
                  if (e.key === "Escape") {
                    setShowLoonIdDropdown(false);
                  }
                }}
                placeholder="e.g. L1, L2, BANDED-R"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {showLoonIdDropdown && filteredLoonIds.length > 0 && (
                <ul className="absolute z-20 mt-1 max-h-40 w-full overflow-auto rounded-md border bg-background shadow-lg">
                  {filteredLoonIds.map((id) => (
                    <li key={id}>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          if (!formData.loonIds.includes(id)) {
                            setFormData((prev) => ({
                              ...prev,
                              loonIds: [...prev.loonIds, id],
                            }));
                          }
                          setLoonIdInput("");
                        }}
                        className="w-full px-3 py-1.5 text-left text-sm hover:bg-accent"
                      >
                        {id}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button
              type="button"
              onClick={addLoonId}
              disabled={!loonIdInput.trim()}
              className="flex items-center gap-1 rounded-md bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80 disabled:opacity-50"
            >
              <Plus className="h-3.5 w-3.5" />
              Add
            </button>
          </div>
          {formData.loonIds.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {formData.loonIds.map((id) => (
                <span
                  key={id}
                  className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2.5 py-1 text-xs font-medium text-sky-700 dark:bg-sky-900/30 dark:text-sky-300"
                >
                  {id}
                  <button
                    type="button"
                    onClick={() => removeLoonId(id)}
                    className="rounded-full hover:text-sky-900 dark:hover:text-sky-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Assign IDs to track individual loons across observations (e.g. band
            colors, nicknames)
          </p>
        </div>

        {/* Nesting & Disturbance */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="nestingActivity" className="text-sm font-medium">
              Nesting Activity
            </label>
            <select
              id="nestingActivity"
              value={formData.nestingActivity}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  nestingActivity: e.target.value,
                }))
              }
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Select nesting activity</option>
              {NESTING_ACTIVITIES.map((n) => (
                <option key={n.value} value={n.value}>
                  {n.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="disturbance" className="text-sm font-medium">
              Disturbance
            </label>
            <select
              id="disturbance"
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
        </div>

        {/* Weather */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="weather" className="text-sm font-medium">
              Weather
            </label>
            <select
              id="weather"
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
            <label htmlFor="windCondition" className="text-sm font-medium">
              Wind
            </label>
            <select
              id="windCondition"
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

        {/* Behaviors */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Observed Behaviors</label>
          <div className="flex flex-wrap gap-1.5">
            {LOON_BEHAVIORS.map((b) => (
              <button
                key={b.value}
                type="button"
                onClick={() => toggleBehavior(b.value)}
                className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                  formData.behaviors.includes(b.value)
                    ? "bg-sky-500 text-white"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <label htmlFor="notes" className="text-sm font-medium">
            Notes
          </label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, notes: e.target.value }))
            }
            placeholder="Additional observations, conditions, or details..."
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
                      alt={`Observation photo ${idx + 1}`}
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
              isSubmitting || !formData.lakeName.trim() || !formData.date || !!pairedExceedsAdults
            }
            className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {isSubmitting
              ? "Saving..."
              : observation
                ? "Update Observation"
                : "Log Observation"}
          </button>
        </div>
      </form>
    </div>
  );
}
