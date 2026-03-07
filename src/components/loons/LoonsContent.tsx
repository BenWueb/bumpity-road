"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { LoonObservation, SavedLocation } from "@/types/loon";
import { PageHeader } from "@/components/PageHeader";
import { ToggleGroup } from "@/components/ui/ToggleGroup";
import { Modal } from "@/components/ui/Modal";
import { type LoonNotice } from "@/lib/loon-server";
import LoonForm from "./LoonForm";
import LoonCard from "./LoonCard";
import LoonDetailsView from "./LoonDetailsView";
import LoonNoticeBar from "./LoonNoticeBar";
import ObservationMapWrapper from "./ObservationMapWrapper";
import { useLoginModal } from "@/components/LoginModal";
import {
  LoonIdPills,
  BehaviorPills,
  CoordinatesDisplay,
  ConditionsDisplay,
} from "./LoonObservationDetails";
import LoonPhotoGrid from "./LoonPhotoGrid";
import {
  Binoculars,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  List,
  Calendar,
  Clock,
  LogIn,
  Download,
  ImageDown,
  MapPin,
  Tag,
  Origami,
  Baby,
  Egg,
  Eye,
  FileText,
  User,
  Plus,
} from "lucide-react";
import { SuggestionPicker } from "@/components/ui/SuggestionPicker";

import * as XLSX from "xlsx";
import JSZip from "jszip";
import {
  formatLoonDate,
  getBehaviorLabel,
  getDisturbanceLabel,
  getNestingLabel,
  getWeatherLabel,
  getWindLabel,
  getTotalLoons,
  sanitizeFilename,
  deriveSavedLocations,
} from "@/lib/loon-utils";

type ViewMode = "cards" | "details";

interface LoonsContentProps {
  initialObservations: LoonObservation[];
  initialSavedLocations: SavedLocation[];
  currentUserId: string | null;
  isAdmin: boolean;
  isLoonAdmin: boolean;
  initialNotice: LoonNotice;
}

export default function LoonsContent({
  initialObservations,
  initialSavedLocations,
  currentUserId,
  isAdmin,
  isLoonAdmin,
  initialNotice,
}: LoonsContentProps) {
  const { openLoginModal } = useLoginModal();
  const searchParams = useSearchParams();
  const router = useRouter();

  // --- Core data state ---
  const [observations, setObservations] =
    useState<LoonObservation[]>(initialObservations);
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>(
    initialSavedLocations,
  );

  // --- UI state ---
  const [showForm, setShowForm] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("details");
  const [showFilters, setShowFilters] = useState(false);
  const [isDownloadingPhotos, setIsDownloadingPhotos] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [highlightedObs, setHighlightedObs] = useState<LoonObservation | null>(
    null,
  );

  // Open observation modal when ?obs=<id> is in the URL
  useEffect(() => {
    const obsId = searchParams.get("obs");
    if (obsId) {
      const found = observations.find((o) => o.id === obsId);
      if (found) setHighlightedObs(found);
      router.replace("/loon", { scroll: false });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // --- Filter state ---
  const [filterLake, setFilterLake] = useState<string | null>(null);
  const [filterLakeArea, setFilterLakeArea] = useState<string | null>(null);
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [filterLoonId, setFilterLoonId] = useState("");
  const [filterHasChicks, setFilterHasChicks] = useState(false);

  const isLoggedIn = !!currentUserId;

  // --- Derived data ---
  const uniqueLakes = useMemo(
    () => Array.from(new Set(observations.map((o) => o.lakeName))).sort(),
    [observations],
  );

  const uniqueLakeAreas = useMemo(
    () =>
      Array.from(
        new Set(
          observations
            .filter(
              (o) => o.lakeArea && (!filterLake || o.lakeName === filterLake),
            )
            .map((o) => o.lakeArea!),
        ),
      ).sort(),
    [observations, filterLake],
  );

  const uniqueLoonIds = useMemo(
    () => Array.from(new Set(observations.flatMap((o) => o.loonIds))).sort(),
    [observations],
  );

  const hasActiveFilters =
    !!filterLake ||
    !!filterLakeArea ||
    !!filterDateFrom ||
    !!filterDateTo ||
    !!filterLoonId ||
    filterHasChicks;

  const activeFilterCount = [
    filterLake,
    filterLakeArea,
    filterDateFrom || filterDateTo ? "date" : null,
    filterLoonId || null,
    filterHasChicks ? "chicks" : null,
  ].filter(Boolean).length;

  const filteredObservations = useMemo(() => {
    return observations.filter((o) => {
      if (filterLake && o.lakeName !== filterLake) return false;
      if (filterLakeArea && o.lakeArea !== filterLakeArea) return false;
      if (filterDateFrom && new Date(o.date) < new Date(filterDateFrom))
        return false;
      if (filterDateTo) {
        const toEnd = new Date(filterDateTo);
        toEnd.setHours(23, 59, 59, 999);
        if (new Date(o.date) > toEnd) return false;
      }
      if (filterLoonId) {
        const search = filterLoonId.toUpperCase();
        if (!o.loonIds.some((id) => id.toUpperCase().includes(search)))
          return false;
      }
      if (filterHasChicks && o.chicksCount === 0) return false;
      return true;
    });
  }, [
    observations,
    filterLake,
    filterLakeArea,
    filterDateFrom,
    filterDateTo,
    filterLoonId,
    filterHasChicks,
  ]);

  const sortedObservations = useMemo(
    () =>
      [...filteredObservations].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      ),
    [filteredObservations],
  );

  const totalLoons = useMemo(() => {
    const latest = new Map<string, LoonObservation>();
    for (const obs of observations) {
      const existing = latest.get(obs.lakeName);
      if (!existing || new Date(obs.date) > new Date(existing.date)) {
        latest.set(obs.lakeName, obs);
      }
    }
    return Array.from(latest.values()).reduce(
      (sum, o) => sum + getTotalLoons(o),
      0,
    );
  }, [observations]);

  const totalChicks = useMemo(
    () => observations.reduce((sum, o) => sum + o.chicksCount, 0),
    [observations],
  );

  const uniqueLoonCount = useMemo(
    () => new Set(observations.flatMap((o) => o.loonIds)).size,
    [observations],
  );

  const activeNestingCount = useMemo(
    () =>
      observations.filter(
        (o) =>
          o.nestingActivity &&
          o.nestingActivity !== "none" &&
          o.nestingActivity !== "failed",
      ).length,
    [observations],
  );

  const filteredPhotoCount = useMemo(
    () => sortedObservations.reduce((sum, o) => sum + o.imageUrls.length, 0),
    [sortedObservations],
  );

  const observationsByMonth = useMemo(() => {
    const grouped: Record<string, LoonObservation[]> = {};
    for (const obs of sortedObservations) {
      const d = new Date(obs.date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(obs);
    }
    return grouped;
  }, [sortedObservations]);

  const sortedMonthKeys = useMemo(
    () =>
      Object.keys(observationsByMonth).sort((a, b) => {
        const [ya, ma] = a.split("-").map(Number);
        const [yb, mb] = b.split("-").map(Number);
        return yb * 12 + mb - (ya * 12 + ma);
      }),
    [observationsByMonth],
  );

  // --- Actions ---
  function toggleForm() {
    setShowForm((prev) => {
      if (!prev) {
        requestAnimationFrame(() => {
          scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
        });
      }
      return !prev;
    });
  }

  function clearAllFilters() {
    setFilterLake(null);
    setFilterLakeArea(null);
    setFilterDateFrom("");
    setFilterDateTo("");
    setFilterLoonId("");
    setFilterHasChicks(false);
  }

  function updateObservations(next: LoonObservation[]) {
    setObservations(next);
    setSavedLocations(deriveSavedLocations(next));
  }

  function handleCreated(obs: LoonObservation) {
    updateObservations([obs, ...observations]);
    setShowForm(false);
  }

  function handleUpdated(obs: LoonObservation) {
    updateObservations(observations.map((o) => (o.id === obs.id ? obs : o)));
  }

  function handleDeleted(id: string) {
    updateObservations(observations.filter((o) => o.id !== id));
  }

  const handleExportExcel = useCallback(() => {
    const rows = sortedObservations.map((o) => ({
      Date: formatLoonDate(o.date),
      Time: o.time || "",
      Lake: o.lakeName,
      Area: o.lakeArea || "",
      Latitude: o.latitude ?? "",
      Longitude: o.longitude ?? "",
      Adults: o.adultsCount,
      Chicks: o.chicksCount,
      Juveniles: o.juvenilesCount,
      "Loon IDs": o.loonIds.join(", "),
      Nesting: getNestingLabel(o.nestingActivity),
      Behaviors: o.behaviors.map(getBehaviorLabel).join(", "),
      Weather: getWeatherLabel(o.weather),
      Wind: getWindLabel(o.windCondition),
      Disturbance: getDisturbanceLabel(o.disturbance),
      Notes: o.notes || "",
      Observer: o.user.name,
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const colWidths = Object.keys(rows[0] || {}).map((key) => ({
      wch:
        Math.max(
          key.length,
          ...rows.map(
            (r) => String((r as Record<string, unknown>)[key] ?? "").length,
          ),
        ) + 2,
    }));
    worksheet["!cols"] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Loon Observations");
    XLSX.writeFile(
      workbook,
      `loon-observations-${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
  }, [sortedObservations]);

  const handleDownloadPhotos = useCallback(async () => {
    const photos: { url: string; name: string }[] = [];
    for (const obs of sortedObservations) {
      if (obs.imageUrls.length === 0) continue;
      const dateStr = new Date(obs.date).toISOString().slice(0, 10);
      const area = obs.lakeArea ? sanitizeFilename(obs.lakeArea) : "unknown";
      const loonTag = obs.loonIds.length > 0 ? `_${obs.loonIds.join("-")}` : "";
      for (let i = 0; i < obs.imageUrls.length; i++) {
        const suffix = obs.imageUrls.length > 1 ? `_${i + 1}` : "";
        photos.push({
          url: obs.imageUrls[i],
          name: `${dateStr}_${area}${loonTag}${suffix}.jpg`,
        });
      }
    }

    if (photos.length === 0) return;

    setIsDownloadingPhotos(true);
    try {
      const zip = new JSZip();

      await Promise.all(
        photos.map(async (photo) => {
          try {
            const res = await fetch(photo.url);
            if (!res.ok) return;
            const blob = await res.blob();
            zip.file(photo.name, blob);
          } catch {
            // skip failed downloads
          }
        }),
      );

      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;

      let label = "loon-photos";
      if (filterLakeArea) label = sanitizeFilename(filterLakeArea);
      else if (filterLoonId) label = `loon-${filterLoonId}`;
      else if (filterLake) label = sanitizeFilename(filterLake);
      a.download = `${label}-${new Date().toISOString().slice(0, 10)}.zip`;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert("Failed to download photos");
    } finally {
      setIsDownloadingPhotos(false);
    }
  }, [sortedObservations, filterLake, filterLakeArea, filterLoonId]);

  // --- Render helpers ---
  function getMonthLabel(key: string) {
    const [year, month] = key.split("-").map(Number);
    return new Date(year, month, 1).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  }

  return (
    <div className="flex h-full flex-col">
      <div
        ref={scrollRef}
        className="flex-1 overflow-x-hidden overflow-y-scroll"
      >
        <PageHeader
          icon={<Binoculars className="h-6 w-6" />}
          title="Loon Observations"
          subtitle={`Tracking loons across ${uniqueLakes.length} lake${uniqueLakes.length !== 1 ? "s" : ""}`}
          iconWrapperClassName="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-sky-500 to-blue-600 text-white shadow-lg md:h-12 md:w-12"
          innerClassName="mx-auto max-w-6xl px-4 py-4 md:px-6 md:py-6"
          mobileActionClassName="sticky top-0 z-10 border-b bg-card/80 px-4 py-3 backdrop-blur-sm md:hidden"
          desktopAction={
            <div className="hidden items-center gap-2 md:flex">
              {filteredPhotoCount > 0 && (
                <button
                  onClick={handleDownloadPhotos}
                  disabled={isDownloadingPhotos}
                  className="flex items-center gap-2 rounded-md bg-linear-to-br from-sky-500 to-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:from-sky-600 hover:to-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  title={`Download ${filteredPhotoCount} photo${filteredPhotoCount !== 1 ? "s" : ""} as ZIP`}
                >
                  <ImageDown className="h-4 w-4" />
                  {isDownloadingPhotos
                    ? "Zipping..."
                    : `Photos (${filteredPhotoCount})`}
                </button>
              )}
              <button
                onClick={handleExportExcel}
                disabled={sortedObservations.length === 0}
                className="flex items-center gap-2 rounded-md bg-linear-to-br from-emerald-500 to-teal-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:from-emerald-600 hover:to-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
                title="Export to Excel"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
              {isLoggedIn ? (
                <button
                  onClick={toggleForm}
                  className="hidden items-center gap-2 rounded-lg bg-linear-to-r from-emerald-500 to-teal-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:from-emerald-600 hover:to-teal-600 md:flex"
                >
                  <Plus className="h-4 w-4" />
                  {showForm ? "Cancel" : "Log Observation"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={openLoginModal}
                  className="hidden items-center gap-2 rounded-lg bg-linear-to-r from-emerald-500 to-teal-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:from-emerald-600 hover:to-teal-600 md:flex"
                >
                  <LogIn className="h-4 w-4" />
                  Sign in to log
                </button>
              )}
            </div>
          }
          mobileAction={
            <div className="flex w-full flex-col gap-2">
              {filteredPhotoCount > 0 && (
                <button
                  onClick={handleDownloadPhotos}
                  disabled={isDownloadingPhotos}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-linear-to-br from-sky-500 to-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:from-sky-600 hover:to-blue-700 disabled:opacity-50"
                >
                  <ImageDown className="h-4 w-4" />
                  {isDownloadingPhotos
                    ? "Zipping..."
                    : `Download Photos (${filteredPhotoCount})`}
                </button>
              )}
              {isLoggedIn ? (
                <button
                  onClick={toggleForm}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-linear-to-r from-emerald-500 to-teal-500 px-3 py-2 text-sm font-medium text-white shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  {showForm ? "Cancel" : "Log Observation"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={openLoginModal}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-linear-to-r from-emerald-500 to-teal-500 px-3 py-2 text-sm font-medium text-white shadow-sm"
                >
                  <LogIn className="h-4 w-4" />
                  Sign in to log
                </button>
              )}
            </div>
          }
        />

        <div className="mx-auto max-w-6xl p-4 md:p-6">
          {showForm && (
            <div className="mb-6">
              <LoonForm
                savedLocations={savedLocations}
                onCreated={handleCreated}
                onCancel={() => setShowForm(false)}
              />
            </div>
          )}

          {/* Notice bar */}
          <div className="mb-6">
            <LoonNoticeBar
              notice={initialNotice}
              isLoonAdmin={isLoonAdmin || isAdmin}
            />
          </div>

          {/* Summary stats */}
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg border bg-card p-3 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-900/30">
                  <Eye className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                </div>
                <div>
                  <div className="text-xl font-bold tabular-nums">
                    {observations.length}
                  </div>
                  <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Observations
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-lg border bg-card p-3 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Origami className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="text-xl font-bold tabular-nums">
                    {uniqueLoonCount > 0 ? uniqueLoonCount : `~${totalLoons}`}
                  </div>
                  <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    {uniqueLoonCount > 0 ? "Loons Tracked" : "Loons (latest)"}
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-lg border bg-card p-3 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                  <Baby className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <div className="text-xl font-bold tabular-nums">
                    {totalChicks}
                  </div>
                  <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Chick Sightings
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-lg border bg-card p-3 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                  <Egg className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <div className="text-xl font-bold tabular-nums">
                    {activeNestingCount}
                  </div>
                  <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Nesting Reports
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Observation map */}
          <div className="mb-6">
            <ObservationMapWrapper
              observations={observations}
              savedLocations={savedLocations}
              filterLakeArea={filterLakeArea}
              onSelectArea={setFilterLakeArea}
            />
          </div>

          {/* View toggle */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <ToggleGroup
              options={[
                {
                  value: "cards",
                  label: "Cards",
                  icon: <LayoutGrid className="h-4 w-4" />,
                },
                {
                  value: "details",
                  label: "Details",
                  icon: <List className="h-4 w-4" />,
                },
              ]}
              value={viewMode}
              onChange={(v) => setViewMode(v as ViewMode)}
            />
          </div>

          {/* Filters */}
          <div className="mb-6 rounded-lg border bg-card shadow-sm">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium transition-colors hover:bg-accent/50"
            >
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span>Filters</span>
                {hasActiveFilters && (
                  <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {hasActiveFilters && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      clearAllFilters();
                    }}
                    className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                    Clear all
                  </span>
                )}
                {showFilters ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </button>

            {showFilters && (
              <div className="space-y-4 border-t px-4 py-4">
                {/* Lake filter */}
                {uniqueLakes.length > 1 && (
                  <div className="space-y-2">
                    <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Lake
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() => {
                          setFilterLake(null);
                          setFilterLakeArea(null);
                        }}
                        className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                          filterLake === null
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                        }`}
                      >
                        All
                      </button>
                      {uniqueLakes.map((lake) => (
                        <button
                          key={lake}
                          onClick={() => {
                            setFilterLake(filterLake === lake ? null : lake);
                            setFilterLakeArea(null);
                          }}
                          className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                            filterLake === lake
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                          }`}
                        >
                          {lake}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Lake area filter */}
                {uniqueLakeAreas.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Location / Area
                    </label>
                    <div className="max-w-xs">
                      <SuggestionPicker
                        value={filterLakeArea}
                        onChange={setFilterLakeArea}
                        suggestions={uniqueLakeAreas}
                        placeholder="Filter by area..."
                        icon={
                          <MapPin className="h-3.5 w-3.5 shrink-0 opacity-60" />
                        }
                      />
                    </div>
                  </div>
                )}

                {/* Has chicks toggle */}
                <div className="space-y-2">
                  <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Chick sightings
                  </label>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setFilterHasChicks(false)}
                      className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                        !filterHasChicks
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setFilterHasChicks(true)}
                      className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                        filterHasChicks
                          ? "bg-emerald-500 text-white"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                    >
                      With chicks only
                    </button>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Date range */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      Date range
                    </label>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <input
                        type="date"
                        value={filterDateFrom}
                        onChange={(e) => setFilterDateFrom(e.target.value)}
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      <span className="hidden text-xs text-muted-foreground sm:inline">
                        to
                      </span>
                      <input
                        type="date"
                        value={filterDateTo}
                        onChange={(e) => setFilterDateTo(e.target.value)}
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  </div>

                  {/* Loon ID filter */}
                  {uniqueLoonIds.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Loon ID
                      </label>
                      <SuggestionPicker
                        value={filterLoonId || null}
                        onChange={(v) => setFilterLoonId(v ?? "")}
                        suggestions={uniqueLoonIds}
                        placeholder="Filter by loon ID..."
                        icon={
                          <Tag className="h-3.5 w-3.5 shrink-0 opacity-60" />
                        }
                        activeClassName="bg-sky-500 text-white"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Result count when filtered */}
          {hasActiveFilters && sortedObservations.length > 0 && (
            <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Showing{" "}
                <span className="font-semibold text-foreground">
                  {sortedObservations.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-foreground">
                  {observations.length}
                </span>{" "}
                observation{observations.length !== 1 ? "s" : ""}
              </span>
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors hover:bg-accent hover:text-foreground"
              >
                <X className="h-3 w-3" />
                Clear filters
              </button>
            </div>
          )}

          {/* Content */}
          {sortedObservations.length === 0 ? (
            <div className="rounded-lg border border-dashed border-muted-foreground/25 p-12 text-center">
              <Binoculars className="mx-auto mb-3 h-12 w-12 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                {hasActiveFilters
                  ? "No observations match your filters."
                  : "No loon observations yet. Log your first sighting!"}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="mt-3 rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : viewMode === "details" ? (
            <LoonDetailsView
              observations={sortedObservations}
              savedLocations={savedLocations}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
              onUpdated={handleUpdated}
              onDeleted={handleDeleted}
            />
          ) : editingCardId ? (
            (() => {
              const obs = observations.find((o) => o.id === editingCardId);
              if (!obs) return null;
              return (
                <LoonForm
                  observation={obs}
                  savedLocations={savedLocations}
                  onUpdated={(updated) => {
                    handleUpdated(updated);
                    setEditingCardId(null);
                  }}
                  onCancel={() => setEditingCardId(null)}
                />
              );
            })()
          ) : (
            <div className="space-y-8">
              {sortedMonthKeys.map((key) => {
                const monthObs = observationsByMonth[key];
                const monthTotal = monthObs.reduce(
                  (sum, o) => sum + getTotalLoons(o),
                  0,
                );

                return (
                  <div key={key} className="space-y-3">
                    <div className="flex items-center justify-between pb-1">
                      <h3 className="text-lg font-semibold text-foreground">
                        {getMonthLabel(key)}
                      </h3>
                      <span className="text-sm text-muted-foreground">
                        {monthObs.length} obs · {monthTotal} loon
                        {monthTotal !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 items-start gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {monthObs.map((obs) => (
                        <LoonCard
                          key={obs.id}
                          observation={obs}
                          isOwner={currentUserId === obs.userId}
                          isAdmin={isAdmin}
                          onEdit={() => setEditingCardId(obs.id)}
                          onDeleted={handleDeleted}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Observation detail modal (opened via ?obs= param from homepage) */}
      <Modal
        isOpen={!!highlightedObs}
        onClose={() => setHighlightedObs(null)}
        panelClassName="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-xl border bg-background p-5 shadow-xl md:p-6"
      >
        {highlightedObs && (
          <HighlightedObservationModal observation={highlightedObs} />
        )}
      </Modal>
    </div>
  );
}

function HighlightedObservationModal({
  observation,
}: {
  observation: LoonObservation;
}) {
  const total = getTotalLoons(observation);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold">Loon Observation</h2>
        <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          {formatLoonDate(observation.date)}
          {observation.time && (
            <>
              <Clock className="ml-1 h-3.5 w-3.5" />
              {observation.time}
            </>
          )}
        </div>
      </div>

      <div className="rounded-lg border bg-muted/30 p-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <MapPin className="h-4 w-4 text-sky-500" />
          {observation.lakeName}
          {observation.lakeArea && (
            <span className="text-muted-foreground">
              — {observation.lakeArea}
            </span>
          )}
        </div>
        {observation.latitude != null && observation.longitude != null && (
          <div className="mt-1 pl-6">
            <CoordinatesDisplay
              latitude={observation.latitude}
              longitude={observation.longitude}
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border bg-muted/30 p-3 text-center">
          <Origami className="mx-auto mb-1 h-4 w-4 text-sky-500" />
          <div className="text-xl font-bold">{observation.adultsCount}</div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Adults
          </div>
        </div>
        <div className="rounded-lg border bg-muted/30 p-3 text-center">
          <Baby className="mx-auto mb-1 h-4 w-4 text-emerald-500" />
          <div className="text-xl font-bold">{observation.chicksCount}</div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Chicks
          </div>
        </div>
        <div className="rounded-lg border bg-muted/30 p-3 text-center">
          <Origami className="mx-auto mb-1 h-4 w-4 text-amber-500" />
          <div className="text-xl font-bold">{observation.juvenilesCount}</div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Juveniles
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center">
        <span className="rounded-full bg-sky-100 px-3 py-1 text-sm font-semibold text-sky-700 dark:bg-sky-900/30 dark:text-sky-300">
          {total} total loon{total !== 1 ? "s" : ""}
        </span>
      </div>

      {observation.loonIds.length > 0 && (
        <div className="space-y-1.5">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Loon IDs
          </div>
          <LoonIdPills ids={observation.loonIds} />
        </div>
      )}

      {observation.nestingActivity &&
        observation.nestingActivity !== "none" && (
          <div className="space-y-1.5">
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Nesting Activity
            </div>
            <div className="text-sm">
              {getNestingLabel(observation.nestingActivity)}
            </div>
          </div>
        )}

      {observation.behaviors.length > 0 && (
        <div className="space-y-1.5">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Behaviors
          </div>
          <BehaviorPills behaviors={observation.behaviors} />
        </div>
      )}

      <ConditionsDisplay observation={observation} size="md" />

      {observation.notes && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <FileText className="h-3 w-3" />
            Notes
          </div>
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">
            {observation.notes}
          </p>
        </div>
      )}

      <LoonPhotoGrid imageUrls={observation.imageUrls} />

      {observation.user?.name && (
        <div className="flex items-center gap-2 border-t pt-3 text-xs text-muted-foreground">
          <User className="h-3.5 w-3.5" />
          Observed by {observation.user.name}
        </div>
      )}
    </div>
  );
}
