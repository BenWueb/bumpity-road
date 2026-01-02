"use client";

import { authClient } from "@/lib/auth-client";
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  Calendar,
  MapPin,
  Plus,
  X,
  Compass,
  Leaf,
  Sun,
  Snowflake,
  Flower2,
  Pencil,
  Trash2,
  Sparkles,
  Fish,
  Mountain,
  ShoppingBag,
  Bird,
  Ship,
  Tent,
  Waves,
  MoreHorizontal,
  ChevronDown,
} from "lucide-react";

type Adventure = {
  id: string;
  title: string;
  description: string;
  address: string;
  // New multi-season support
  seasons?: string[];
  // Legacy single season (older records)
  season?: string;
  category: string;
  headerImage: string;
  headerImagePublicId: string;
  userId: string;
  user: { id: string; name: string; image: string | null };
  createdAt: string;
};

type AddressSuggestion = { description: string; placeId: string };

const SEASONS = [
  {
    value: "all",
    label: "All Seasons",
    icon: Sparkles,
    color: "text-violet-500",
  },
  { value: "spring", label: "Spring", icon: Flower2, color: "text-pink-500" },
  { value: "summer", label: "Summer", icon: Sun, color: "text-amber-500" },
  { value: "fall", label: "Fall", icon: Leaf, color: "text-orange-500" },
  { value: "winter", label: "Winter", icon: Snowflake, color: "text-sky-500" },
];

const CATEGORIES = [
  { value: "fishing", label: "Fishing", icon: Fish, color: "text-blue-500" },
  { value: "hiking", label: "Hiking", icon: Mountain, color: "text-green-600" },
  {
    value: "shopping",
    label: "Shopping",
    icon: ShoppingBag,
    color: "text-pink-500",
  },
  { value: "wildlife", label: "Wildlife", icon: Bird, color: "text-amber-600" },
  { value: "boating", label: "Boating", icon: Ship, color: "text-cyan-500" },
  { value: "camping", label: "Camping", icon: Tent, color: "text-orange-500" },
  { value: "swimming", label: "Swimming", icon: Waves, color: "text-sky-500" },
  {
    value: "other",
    label: "Other",
    icon: MoreHorizontal,
    color: "text-gray-500",
  },
];

function getSeasonInfo(season: string) {
  return SEASONS.find((s) => s.value === season) || SEASONS[1];
}

function getCategoryInfo(category: string) {
  return CATEGORIES.find((c) => c.value === category) || CATEGORIES[7];
}

function getAdventureSeasons(a: Adventure): string[] {
  const seasons =
    Array.isArray(a.seasons) && a.seasons.length > 0 ? a.seasons : [];
  if (seasons.length > 0) return seasons;
  if (typeof a.season === "string" && a.season) return [a.season];
  return ["all"];
}

export default function AdventuresPage() {
  const { data: session } = authClient.useSession();
  const [adventures, setAdventures] = useState<Adventure[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expandedMapId, setExpandedMapId] = useState<string | null>(null);
  const [editingAdventure, setEditingAdventure] = useState<Adventure | null>(
    null
  );

  // Filters
  const [filterSeasons, setFilterSeasons] = useState<string[]>(["all"]);
  const [filterCategory, setFilterCategory] = useState<string>("all");

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [addressSuggestions, setAddressSuggestions] = useState<
    AddressSuggestion[]
  >([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string>("");
  const [placesSessionToken, setPlacesSessionToken] = useState<any>(null);
  const [isPlacesLoaded, setIsPlacesLoaded] = useState(false);
  const [placesLoadError, setPlacesLoadError] = useState<string | null>(null);
  const [placesLastStatus, setPlacesLastStatus] = useState<string | null>(null);
  const [isAddressLoading, setIsAddressLoading] = useState(false);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const [seasons, setSeasons] = useState<string[]>(["summer"]);
  const [category, setCategory] = useState("");
  const [headerImage, setHeaderImage] = useState("");
  const [headerImagePublicId, setHeaderImagePublicId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLoggedIn = !!session?.user;
  const userId = session?.user?.id;

  const loadAdventures = useCallback(async () => {
    try {
      const res = await fetch("/api/adventures");
      if (res.ok) {
        const data = await res.json();
        setAdventures(data.adventures ?? []);
      }
    } catch (error) {
      console.error("Error loading adventures:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdventures();
  }, [loadAdventures]);

  // Load Google Maps JS (Places library) for address autocomplete suggestions.
  useEffect(() => {
    if (!showForm) return;

    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!key) {
      setPlacesLoadError(
        "Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY (restart dev server after setting it)."
      );
      return;
    }

    // Already loaded
    if (
      typeof window !== "undefined" &&
      (window as any).google?.maps?.places?.AutocompleteService
    ) {
      setIsPlacesLoaded(true);
      setPlacesLoadError(null);
      return;
    }

    const scriptId = "google-maps-js";
    const existing = document.getElementById(
      scriptId
    ) as HTMLScriptElement | null;
    if (existing) {
      const onLoad = () => {
        const hasPlaces = !!(window as any).google?.maps?.places
          ?.AutocompleteService;
        if (hasPlaces) {
          setIsPlacesLoaded(true);
          setPlacesLoadError(null);
        } else {
          setPlacesLoadError(
            "Google Maps script loaded, but Places AutocompleteService is unavailable. Ensure Maps JavaScript API + Places API are enabled and your key allows localhost/your domain."
          );
        }
      };
      existing.addEventListener("load", onLoad, { once: true });
      return () => existing.removeEventListener("load", onLoad);
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      key
    )}&libraries=places`;
    script.onload = () => {
      const hasPlaces = !!(window as any).google?.maps?.places
        ?.AutocompleteService;
      if (hasPlaces) {
        setIsPlacesLoaded(true);
        setPlacesLoadError(null);
      } else {
        setPlacesLoadError(
          "Google Maps script loaded, but Places AutocompleteService is unavailable. Ensure Maps JavaScript API + Places API are enabled and your key allows localhost/your domain."
        );
      }
    };
    script.onerror = () => {
      setPlacesLoadError(
        "Failed to load Google Maps JS. Check your key and HTTP referrer restrictions (add http://localhost:3000/* for dev)."
      );
    };
    document.head.appendChild(script);
  }, [showForm]);

  useEffect(() => {
    if (!showForm) return;
    // Create a stable token per "new/edit adventure" session (recommended by Google Places).
    try {
      const g = (window as any).google;
      const token = g?.maps?.places?.AutocompleteSessionToken
        ? new g.maps.places.AutocompleteSessionToken()
        : null;
      setPlacesSessionToken(token);
    } catch {
      setPlacesSessionToken(null);
    }
    setSelectedPlaceId("");
  }, [showForm]);

  useEffect(() => {
    const q = address.trim();

    // Don’t spam the API while the modal is closed.
    if (!showForm) return;
    if (!isPlacesLoaded) return;

    if (q.length < 3) {
      setAddressSuggestions([]);
      setIsAddressLoading(false);
      setPlacesLastStatus(null);
      return;
    }

    const t = setTimeout(() => {
      try {
        setIsAddressLoading(true);
        const g = (window as any).google;
        const service = new g.maps.places.AutocompleteService();
        service.getPlacePredictions(
          {
            input: q,
            // Allow both addresses and places (parks, businesses, landmarks, etc.)
            // Google suggests using either no `types`, or broader types like geocode/establishment.
            types: ["geocode", "establishment"],
            componentRestrictions: { country: ["us", "ca"] },
            sessionToken: placesSessionToken ?? undefined,
          },
          (
            predictions: Array<{
              description: string;
              place_id: string;
            }> | null,
            status: string
          ) => {
            setPlacesLastStatus(status);
            setIsAddressLoading(false);

            if (status !== g.maps.places.PlacesServiceStatus.OK) {
              setAddressSuggestions([]);
              return;
            }

            setAddressSuggestions(
              (predictions ?? []).slice(0, 6).map((p) => ({
                description: p.description,
                placeId: p.place_id,
              }))
            );
          }
        );
      } catch (e) {
        // ignore aborts / transient errors
        setIsAddressLoading(false);
      } finally {
        // `getPlacePredictions` is callback-based; we end loading in the callback.
      }
    }, 250);

    return () => {
      clearTimeout(t);
    };
  }, [address, showForm, placesSessionToken, isPlacesLoaded]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setAddress("");
    setAddressSuggestions([]);
    setSelectedPlaceId("");
    setPlacesSessionToken(null);
    setShowAddressSuggestions(false);
    setPlacesLastStatus(null);
    setSeasons(["summer"]);
    setCategory("");
    setHeaderImage("");
    setHeaderImagePublicId("");
    setEditingAdventure(null);
    setShowForm(false);
  };

  const handleEdit = (adventure: Adventure) => {
    setEditingAdventure(adventure);
    setTitle(adventure.title);
    setDescription(adventure.description);
    setAddress(adventure.address);
    setSelectedPlaceId("");
    setPlacesLastStatus(null);
    setSeasons(getAdventureSeasons(adventure));
    setCategory(adventure.category);
    setHeaderImage(adventure.headerImage);
    setHeaderImagePublicId(adventure.headerImagePublicId);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !title.trim() ||
      !description.trim() ||
      !address.trim() ||
      seasons.length === 0 ||
      !category ||
      !headerImage
    )
      return;

    setIsSubmitting(true);
    try {
      const payload = {
        title,
        description,
        address,
        seasons,
        category,
        headerImage,
        headerImagePublicId,
        ...(editingAdventure ? { id: editingAdventure.id } : {}),
      };

      const res = await fetch("/api/adventures", {
        method: editingAdventure ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = (await res.json().catch(() => null)) as {
          newBadges?: string[];
        } | null;
        if (data?.newBadges && data.newBadges.length > 0) {
          window.dispatchEvent(
            new CustomEvent("badgesEarned", {
              detail: { badges: data.newBadges },
            })
          );
        }
        resetForm();
        loadAdventures();
      }
    } catch (error) {
      console.error("Error saving adventure:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this adventure?")) return;

    try {
      const res = await fetch(`/api/adventures?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setAdventures((prev) => prev.filter((a) => a.id !== id));
      }
    } catch (error) {
      console.error("Error deleting adventure:", error);
    }
  };

  const googleMapsEmbedKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const getGoogleMapEmbedSrc = (opts: {
    address: string;
    placeId?: string;
  }) => {
    const { address: a, placeId } = opts;
    // Prefer Embed API when key is available; otherwise fall back to the simple embed URL.
    if (googleMapsEmbedKey) {
      if (placeId) {
        return `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(
          googleMapsEmbedKey
        )}&q=${encodeURIComponent(`place_id:${placeId}`)}`;
      }
      return `https://www.google.com/maps/embed/v1/search?key=${encodeURIComponent(
        googleMapsEmbedKey
      )}&q=${encodeURIComponent(a)}`;
    }
    return `https://www.google.com/maps?q=${encodeURIComponent(
      a
    )}&output=embed`;
  };

  const filteredAdventures = adventures.filter((a) => {
    const aSeasons = getAdventureSeasons(a);
    const seasonOk =
      filterSeasons.includes("all") ||
      aSeasons.includes("all") ||
      aSeasons.some((s) => filterSeasons.includes(s));

    const categoryOk =
      filterCategory === "all" || a.category === filterCategory;

    return seasonOk && categoryOk;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50">
        <div className="mx-auto max-w-6xl px-4 py-4 md:px-6 md:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-lg md:h-12 md:w-12">
                <Compass className="h-5 w-5 md:h-6 md:w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold md:text-2xl">Adventures</h1>
                <p className="text-xs text-muted-foreground md:text-sm">
                  Activites for up north
                </p>
              </div>
            </div>

            {isLoggedIn ? (
              <button
                onClick={() => setShowForm(true)}
                className="hidden items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:from-emerald-600 hover:to-teal-600 md:flex"
              >
                <Plus className="h-4 w-4" />
                New Adventure
              </button>
            ) : (
              <Link
                href="/login"
                className="hidden items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:from-emerald-600 hover:to-teal-600 md:flex"
              >
                Sign in to share
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile action button */}
      <div className="border-b bg-card/30 px-4 py-3 md:hidden">
        {isLoggedIn ? (
          <button
            onClick={() => setShowForm(true)}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm"
          >
            <Plus className="h-4 w-4" />
            New Adventure
          </button>
        ) : (
          <Link
            href="/login"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm"
          >
            Sign in to share an adventure
          </Link>
        )}
      </div>

      {/* Adventures Grid */}
      <div className="mx-auto max-w-6xl p-4 md:p-6">
        {/* Filters */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Season
              </label>
              <div className="flex flex-wrap gap-2">
                {SEASONS.map((s) => {
                  const isSelected = filterSeasons.includes(s.value);
                  const Icon = s.icon;
                  return (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => {
                        setFilterSeasons((prev) => {
                          // "All Seasons" acts like a reset.
                          if (s.value === "all") return ["all"];

                          // Toggle individual season
                          const next = prev.includes(s.value)
                            ? prev.filter((v) => v !== s.value)
                            : [...prev.filter((v) => v !== "all"), s.value];

                          // If user deselects everything, fall back to "all"
                          return next.length === 0 ? ["all"] : next;
                        });
                      }}
                      className={`flex items-center gap-1 rounded-lg border px-2 py-2 text-xs transition-all ${
                        isSelected
                          ? "border-primary bg-primary/10"
                          : "border-muted hover:border-muted-foreground/50"
                      }`}
                      aria-pressed={isSelected}
                    >
                      <Icon className={`h-4 w-4 ${s.color}`} />
                      <span>{s.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Category
              </label>
              <div className="relative">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full appearance-none rounded-lg border bg-background px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="all">All Categories</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>
          </div>

          {(!filterSeasons.includes("all") || filterCategory !== "all") && (
            <button
              type="button"
              onClick={() => {
                setFilterSeasons(["all"]);
                setFilterCategory("all");
              }}
              className="rounded-lg border bg-background px-3 py-2 text-sm hover:bg-accent"
            >
              Clear filters
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-64 animate-pulse rounded-xl bg-accent"
              />
            ))}
          </div>
        ) : adventures.length === 0 ? (
          <div className="py-16 text-center">
            <Compass className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-lg font-medium text-muted-foreground">
              No adventures yet
            </p>
            <p className="text-sm text-muted-foreground">
              Be the first to share an adventure!
            </p>
          </div>
        ) : filteredAdventures.length === 0 ? (
          <div className="py-16 text-center">
            <Compass className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-lg font-medium text-muted-foreground">
              No matches
            </p>
            <p className="text-sm text-muted-foreground">
              Try adjusting your season/category filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setFilterSeasons(["all"]);
                setFilterCategory("all");
              }}
              className="mt-4 rounded-lg border bg-background px-4 py-2 text-sm hover:bg-accent"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredAdventures.map((adventure) => {
              const aSeasons = getAdventureSeasons(adventure);
              const categoryInfo = getCategoryInfo(adventure.category);
              const CategoryIcon = categoryInfo.icon;
              const isOwner = userId === adventure.userId;

              return (
                <div
                  key={adventure.id}
                  className="group relative overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:shadow-md"
                >
                  {/* Link overlay (keeps owner buttons working) */}
                  <Link
                    href={`/adventures/${adventure.id}`}
                    aria-label={`View adventure: ${adventure.title}`}
                    className="absolute inset-0 z-[1]"
                  />

                  {/* Header Image */}
                  <div className="relative h-40 overflow-hidden">
                    <Image
                      src={adventure.headerImage}
                      alt={adventure.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                    {/* Badges */}
                    <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                      {/* Season badge(s) */}
                      {aSeasons.includes("all")
                        ? (() => {
                            const sInfo = getSeasonInfo("all");
                            const SIcon = sInfo.icon;
                            return (
                              <div className="flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-xs font-medium backdrop-blur dark:bg-black/70">
                                <SIcon className={`h-3 w-3 ${sInfo.color}`} />
                                {sInfo.label}
                              </div>
                            );
                          })()
                        : aSeasons.slice(0, 2).map((sv) => {
                            const sInfo = getSeasonInfo(sv);
                            const SIcon = sInfo.icon;
                            return (
                              <div
                                key={sv}
                                className="flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-xs font-medium backdrop-blur dark:bg-black/70"
                              >
                                <SIcon className={`h-3 w-3 ${sInfo.color}`} />
                                {sInfo.label}
                              </div>
                            );
                          })}
                      {!aSeasons.includes("all") && aSeasons.length > 2 && (
                        <div className="rounded-full bg-white/90 px-2 py-1 text-xs font-medium backdrop-blur dark:bg-black/70">
                          +{aSeasons.length - 2}
                        </div>
                      )}
                      {/* Category badge */}
                      <div className="flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-xs font-medium backdrop-blur dark:bg-black/70">
                        <CategoryIcon
                          className={`h-3 w-3 ${categoryInfo.color}`}
                        />
                        {categoryInfo.label}
                      </div>
                    </div>

                    {/* Owner actions */}
                    {isOwner && (
                      <div className="pointer-events-auto absolute right-2 top-2 z-[2] flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          onClick={() => handleEdit(adventure)}
                          className="rounded-lg bg-white/90 p-1.5 text-muted-foreground backdrop-blur hover:text-foreground dark:bg-black/70"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(adventure.id)}
                          className="rounded-lg bg-white/90 p-1.5 text-muted-foreground backdrop-blur hover:text-destructive dark:bg-black/70"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}

                    {/* Title overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <h3 className="text-lg font-bold text-white drop-shadow">
                        {adventure.title}
                      </h3>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-3">
                    <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                      <span className="flex min-w-0 items-center gap-1">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{adventure.address}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedMapId((prev) =>
                            prev === adventure.id ? null : adventure.id
                          )
                        }
                        className="pointer-events-auto relative z-[2] shrink-0 rounded-md border bg-background px-2 py-1 text-xs hover:bg-accent"
                        aria-label={
                          expandedMapId === adventure.id
                            ? "Hide map"
                            : "Show map"
                        }
                      >
                        {expandedMapId === adventure.id ? "Hide map" : "Map"}
                      </button>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {adventure.description}
                    </p>
                    {expandedMapId === adventure.id && (
                      <div className="mt-3 overflow-hidden rounded-lg border bg-muted/20">
                        <iframe
                          title={`Map for ${adventure.title}`}
                          src={getGoogleMapEmbedSrc({
                            address: adventure.address,
                          })}
                          className="h-40 w-full"
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                        />
                        <div className="flex items-center justify-between px-3 py-2 text-xs">
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                              adventure.address
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary hover:underline"
                          >
                            Open in Google Maps
                          </a>
                          <span className="text-muted-foreground">
                            {adventure.address}
                          </span>
                        </div>
                      </div>
                    )}
                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                      <span>by {adventure.user.name}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(adventure.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border bg-card p-4 shadow-xl md:p-6">
            <button
              onClick={resetForm}
              className="absolute right-3 top-3 rounded-full p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-lg font-bold md:text-xl">
              {editingAdventure ? "Edit Adventure" : "New Adventure"}
            </h2>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {/* Header Image Upload */}
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Header Image *
                </label>
                {headerImage ? (
                  <div className="relative h-40 overflow-hidden rounded-lg">
                    <Image
                      src={headerImage}
                      alt="Header preview"
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setHeaderImage("");
                        setHeaderImagePublicId("");
                      }}
                      className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <CldUploadWidget
                    uploadPreset="bumpity-road"
                    options={{ maxFiles: 1 }}
                    onSuccess={(result) => {
                      if (
                        typeof result.info === "object" &&
                        result.info !== null
                      ) {
                        const info = result.info as {
                          secure_url: string;
                          public_id: string;
                        };
                        setHeaderImage(info.secure_url);
                        setHeaderImagePublicId(info.public_id);
                      }
                    }}
                  >
                    {({ open }) => (
                      <button
                        type="button"
                        onClick={() => open()}
                        className="flex h-40 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/30 bg-accent/30 text-muted-foreground transition-colors hover:border-muted-foreground/50 hover:bg-accent/50"
                      >
                        <Compass className="h-8 w-8" />
                        <span className="text-sm">Upload header image</span>
                      </button>
                    )}
                  </CldUploadWidget>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Morning Kayak on the Lake"
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
              </div>

              {/* Address */}
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Address *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      setSelectedPlaceId("");
                      setShowAddressSuggestions(true);
                    }}
                    onFocus={() => setShowAddressSuggestions(true)}
                    onBlur={() => {
                      // allow clicking a suggestion before closing
                      setTimeout(() => setShowAddressSuggestions(false), 120);
                    }}
                    placeholder="Start typing an address..."
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                    autoComplete="off"
                  />

                  {!isPlacesLoaded && placesLoadError && (
                    <div className="mt-2 rounded-lg border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                      {placesLoadError}
                    </div>
                  )}
                  {isPlacesLoaded &&
                    placesLastStatus &&
                    placesLastStatus !== "OK" &&
                    placesLastStatus !== "ZERO_RESULTS" && (
                      <div className="mt-2 rounded-lg border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                        Places status: {placesLastStatus}. This usually means
                        the key is blocked by referrer restrictions or the
                        Places API / billing isn’t enabled.
                      </div>
                    )}

                  {showAddressSuggestions &&
                    (isAddressLoading || addressSuggestions.length > 0) && (
                      <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border bg-popover shadow-lg">
                        {isAddressLoading && (
                          <div className="px-3 py-2 text-xs text-muted-foreground">
                            Searching…
                          </div>
                        )}
                        {addressSuggestions.map((s) => (
                          <button
                            key={s.placeId}
                            type="button"
                            onMouseDown={(e) => {
                              // prevent input blur before we set the value
                              e.preventDefault();
                              setAddress(s.description);
                              setSelectedPlaceId(s.placeId);
                              setShowAddressSuggestions(false);
                            }}
                            className="block w-full px-3 py-2 text-left text-sm hover:bg-accent"
                          >
                            {s.description}
                          </button>
                        ))}
                      </div>
                    )}
                </div>
                {!!address.trim() && (
                  <div className="mt-3 overflow-hidden rounded-lg border bg-muted/20">
                    <iframe
                      title="Map preview"
                      src={getGoogleMapEmbedSrc({
                        address: address.trim(),
                        placeId: selectedPlaceId || undefined,
                      })}
                      className="h-44 w-full"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                    <div className="flex items-center justify-between px-3 py-2 text-xs">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          address.trim()
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline"
                      >
                        Open in Google Maps
                      </a>
                      <span className="text-muted-foreground">
                        {address.trim()}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Seasons */}
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Seasons *
                </label>
                <div className="flex flex-wrap gap-2">
                  {SEASONS.map((s) => {
                    const Icon = s.icon;
                    const isSelected = seasons.includes(s.value);
                    return (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => {
                          setSeasons((prev) => {
                            // "All Seasons" acts like a reset.
                            if (s.value === "all") return ["all"];

                            // Toggle individual season
                            const next = prev.includes(s.value)
                              ? prev.filter((v) => v !== s.value)
                              : [...prev.filter((v) => v !== "all"), s.value];

                            // If user deselects everything, fall back to "all"
                            return next.length === 0 ? ["all"] : next;
                          });
                        }}
                        className={`flex items-center gap-1 rounded-lg border px-2 py-2 text-xs transition-all ${
                          isSelected
                            ? "border-primary bg-primary/10"
                            : "border-muted hover:border-muted-foreground/50"
                        }`}
                        aria-pressed={isSelected}
                      >
                        <Icon className={`h-4 w-4 ${s.color}`} />
                        <span>{s.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Category *
                </label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full appearance-none rounded-lg border bg-background px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                  >
                    <option value="">Select a category...</option>
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Description *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell us about this adventure..."
                  rows={4}
                  className="w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg px-4 py-2 text-sm text-muted-foreground hover:bg-accent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    !title.trim() ||
                    !description.trim() ||
                    !address.trim() ||
                    !category ||
                    !headerImage
                  }
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {isSubmitting
                    ? "Saving..."
                    : editingAdventure
                    ? "Save Changes"
                    : "Create Adventure"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
