"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SavedLocation } from "@/types/loon";
import { MapPin, Navigation, X, ChevronDown } from "lucide-react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const selectedIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const savedIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [20, 33],
  iconAnchor: [10, 33],
  popupAnchor: [1, -28],
  shadowSize: [33, 33],
});

interface LocationPickerProps {
  latitude: number | null;
  longitude: number | null;
  lakeName: string;
  lakeArea: string;
  savedLocations: SavedLocation[];
  onLocationChange: (data: {
    latitude: number;
    longitude: number;
    lakeName: string;
    lakeArea: string;
  }) => void;
  onLakeNameChange: (name: string) => void;
  onLakeAreaChange: (area: string) => void;
}

function ClickHandler({
  onClick,
}: {
  onClick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function FlyToLocation({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], Math.max(map.getZoom(), 14), { duration: 0.8 });
  }, [map, lat, lng]);
  return null;
}

export default function LocationPicker({
  latitude,
  longitude,
  lakeName,
  lakeArea,
  savedLocations,
  onLocationChange,
  onLakeNameChange,
  onLakeAreaChange,
}: LocationPickerProps) {
  const [showSavedList, setShowSavedList] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [flyTarget, setFlyTarget] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const savedListRef = useRef<HTMLDivElement>(null);

  const defaultCenter = useMemo<[number, number]>(() => {
    if (latitude != null && longitude != null) return [latitude, longitude];
    if (savedLocations.length > 0)
      return [savedLocations[0].latitude, savedLocations[0].longitude];
    return [47.1536, -94.1033];
  }, [latitude, longitude, savedLocations]);

  const defaultZoom = latitude != null ? 14 : 10;

  const handleMapClick = useCallback(
    (lat: number, lng: number) => {
      onLocationChange({ latitude: lat, longitude: lng, lakeName, lakeArea });
      setFlyTarget(null);
    },
    [lakeName, lakeArea, onLocationChange]
  );

  function handleSelectSaved(loc: SavedLocation) {
    onLocationChange({
      latitude: loc.latitude,
      longitude: loc.longitude,
      lakeName: loc.lakeName,
      lakeArea: loc.lakeArea ?? "",
    });
    setFlyTarget({ lat: loc.latitude, lng: loc.longitude });
    setShowSavedList(false);
  }

  function handleUseMyLocation() {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        onLocationChange({ latitude: lat, longitude: lng, lakeName, lakeArea });
        setFlyTarget({ lat, lng });
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
        alert("Could not get your location. Please allow location access.");
      },
      { enableHighAccuracy: true }
    );
  }

  function handleClear() {
    onLocationChange({
      latitude: 0,
      longitude: 0,
      lakeName: "",
      lakeArea: "",
    });
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        savedListRef.current &&
        !savedListRef.current.contains(e.target as Node)
      ) {
        setShowSavedList(false);
      }
    }
    if (showSavedList) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showSavedList]);

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleUseMyLocation}
          disabled={isLocating}
          className="flex items-center gap-1.5 rounded-md bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary/80 disabled:opacity-50"
        >
          <Navigation className="h-3.5 w-3.5" />
          {isLocating ? "Locating..." : "Use my location"}
        </button>

        {savedLocations.length > 0 && (
          <div className="relative" ref={savedListRef}>
            <button
              type="button"
              onClick={() => setShowSavedList(!showSavedList)}
              className="flex items-center gap-1.5 rounded-md bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
            >
              <MapPin className="h-3.5 w-3.5" />
              Saved locations
              <ChevronDown className="h-3 w-3" />
            </button>

            {showSavedList && (
              <div className="absolute left-0 top-full z-[1000] mt-1 max-h-64 w-72 overflow-y-auto rounded-lg border bg-background p-1 shadow-lg">
                {savedLocations.map((loc, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelectSaved(loc)}
                    className="flex w-full items-start gap-2 rounded-md px-2.5 py-2 text-left text-sm transition-colors hover:bg-accent"
                  >
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-500" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">
                        {loc.lakeName}
                      </div>
                      {loc.lakeArea && (
                        <div className="truncate text-xs text-muted-foreground">
                          {loc.lakeArea}
                        </div>
                      )}
                      <div className="text-[10px] text-muted-foreground">
                        {loc.latitude.toFixed(5)}, {loc.longitude.toFixed(5)} ·{" "}
                        {loc.count} obs
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {latitude != null && longitude != null && latitude !== 0 && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-mono tabular-nums">
              {latitude.toFixed(5)}, {longitude.toFixed(5)}
            </span>
            <button
              type="button"
              onClick={handleClear}
              className="rounded p-0.5 hover:text-destructive"
              title="Clear location"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>

      {/* Map */}
      <div className="relative z-0 overflow-hidden rounded-lg border" style={{ height: 300 }}>
        <MapContainer
          center={defaultCenter}
          zoom={defaultZoom}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onClick={handleMapClick} />

          {flyTarget && (
            <FlyToLocation lat={flyTarget.lat} lng={flyTarget.lng} />
          )}

          {latitude != null &&
            longitude != null &&
            latitude !== 0 &&
            longitude !== 0 && (
              <Marker position={[latitude, longitude]} icon={selectedIcon}>
                <Popup>
                  <span className="text-xs font-medium">
                    {lakeName || "Selected location"}
                  </span>
                </Popup>
              </Marker>
            )}

          {savedLocations.map((loc, i) => {
            if (
              latitude != null &&
              longitude != null &&
              Math.abs(loc.latitude - latitude) < 0.0001 &&
              Math.abs(loc.longitude - longitude) < 0.0001
            )
              return null;
            return (
              <Marker
                key={i}
                position={[loc.latitude, loc.longitude]}
                icon={savedIcon}
                eventHandlers={{
                  click: () => handleSelectSaved(loc),
                }}
              >
                <Popup>
                  <div className="text-xs">
                    <div className="font-medium">{loc.lakeName}</div>
                    {loc.lakeArea && (
                      <div className="text-muted-foreground">
                        {loc.lakeArea}
                      </div>
                    )}
                    <div className="text-muted-foreground">
                      {loc.count} observation{loc.count !== 1 ? "s" : ""}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Name fields */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="locLakeName" className="text-sm font-medium">
            Location Name *
          </label>
          <input
            id="locLakeName"
            type="text"
            value={lakeName}
            onChange={(e) => onLakeNameChange(e.target.value)}
            placeholder="e.g. Mirror Lake"
            required
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="locLakeArea" className="text-sm font-medium">
            Area / Description
          </label>
          <input
            id="locLakeArea"
            type="text"
            value={lakeArea}
            onChange={(e) => onLakeAreaChange(e.target.value)}
            placeholder="e.g. North cove, near dock"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Click the map to set precise coordinates, use your GPS location, or
        select a previously used spot.
      </p>
    </div>
  );
}
