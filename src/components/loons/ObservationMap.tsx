"use client";

import { useMemo } from "react";
import { LoonObservation, SavedLocation } from "@/types/loon";
import { getTotalLoons } from "@/lib/loon-utils";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

function makeIcon(color: string, size: "sm" | "md") {
  const [w, h] = size === "sm" ? [20, 33] : [25, 41];
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    iconSize: [w, h],
    iconAnchor: [w / 2, h],
    popupAnchor: [1, -h + 7],
    shadowSize: [h, h],
  });
}

const defaultIcon = makeIcon("blue", "sm");
const activeIcon = makeIcon("red", "md");

type LocationCluster = {
  lakeName: string;
  lakeArea: string | null;
  latitude: number;
  longitude: number;
  count: number;
  totalLoons: number;
};

interface Props {
  observations: LoonObservation[];
  savedLocations: SavedLocation[];
  filterLakeArea: string | null;
  onSelectArea: (lakeArea: string | null) => void;
}

export default function ObservationMap({
  observations,
  savedLocations,
  filterLakeArea,
  onSelectArea,
}: Props) {
  const clusters = useMemo(() => {
    const map = new Map<string, LocationCluster>();

    for (const obs of observations) {
      if (obs.latitude == null || obs.longitude == null) continue;

      const key = `${obs.lakeName}|${obs.lakeArea ?? ""}|${obs.latitude.toFixed(4)}|${obs.longitude.toFixed(4)}`;
      const existing = map.get(key);
      const loons = getTotalLoons(obs);

      if (existing) {
        existing.count++;
        existing.totalLoons += loons;
      } else {
        map.set(key, {
          lakeName: obs.lakeName,
          lakeArea: obs.lakeArea,
          latitude: obs.latitude,
          longitude: obs.longitude,
          count: 1,
          totalLoons: loons,
        });
      }
    }

    return Array.from(map.values());
  }, [observations]);

  const center = useMemo<[number, number]>(() => {
    if (savedLocations.length > 0)
      return [savedLocations[0].latitude, savedLocations[0].longitude];
    if (clusters.length > 0)
      return [clusters[0].latitude, clusters[0].longitude];
    return [47.1536, -94.1033];
  }, [savedLocations, clusters]);

  if (clusters.length === 0) return null;

  return (
    <div
      className="relative z-0 overflow-hidden rounded-lg border shadow-sm"
      style={{ height: 420 }}
    >
      <div
        className="pointer-events-none absolute bottom-2 left-2 rounded-md bg-black/50 px-2.5 py-1 text-[11px] text-white backdrop-blur-sm"
        style={{ zIndex: 1000 }}
      >
        Click a marker to filter by location
      </div>
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {clusters.map((cluster, i) => {
          const isActive = filterLakeArea != null && cluster.lakeArea === filterLakeArea;

          return (
            <Marker
              key={i}
              position={[cluster.latitude, cluster.longitude]}
              icon={isActive ? activeIcon : defaultIcon}
              eventHandlers={{
                click: () => {
                  if (cluster.lakeArea) {
                    onSelectArea(
                      filterLakeArea === cluster.lakeArea
                        ? null
                        : cluster.lakeArea
                    );
                  }
                },
              }}
            >
              <Popup>
                <div className="text-xs">
                  <div className="font-semibold">{cluster.lakeName}</div>
                  {cluster.lakeArea && (
                    <div className="text-muted-foreground">
                      {cluster.lakeArea}
                    </div>
                  )}
                  <div className="mt-1 text-muted-foreground">
                    {cluster.count} observation{cluster.count !== 1 ? "s" : ""}{" "}
                    &middot; {cluster.totalLoons} loon
                    {cluster.totalLoons !== 1 ? "s" : ""}
                  </div>
                  {cluster.lakeArea && (
                    <button
                      onClick={() =>
                        onSelectArea(
                          filterLakeArea === cluster.lakeArea
                            ? null
                            : cluster.lakeArea
                        )
                      }
                      className="mt-1.5 rounded bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground hover:bg-primary/90"
                    >
                      {filterLakeArea === cluster.lakeArea
                        ? "Clear filter"
                        : "Filter to this area"}
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
