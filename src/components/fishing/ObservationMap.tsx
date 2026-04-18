"use client";

import { useMemo } from "react";
import { FishObservation, SavedLocation } from "@/types/fishing";
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

const defaultIcon = makeIcon("violet", "sm");
const activeIcon = makeIcon("red", "md");
const cabinIcon = new L.DivIcon({
  html: `<div style="display:flex;flex-direction:column;align-items:center;pointer-events:auto;">
    <span style="font-size:28px;line-height:1;filter:drop-shadow(0 1px 2px rgba(0,0,0,.4));">🏠</span>
    <span style="font-size:10px;font-weight:700;color:#fff;background:#16a34a;padding:1px 5px;border-radius:4px;margin-top:2px;white-space:nowrap;box-shadow:0 1px 3px rgba(0,0,0,.3);">Cabin</span>
  </div>`,
  iconSize: [50, 50],
  iconAnchor: [25, 45],
  popupAnchor: [0, -40],
  className: "",
});

const CABIN_COORDS: [number, number] = [46.95939881662997, -94.29017871431405];

type LocationCluster = {
  lakeName: string;
  lakeArea: string | null;
  latitude: number;
  longitude: number;
  count: number;
  totalFish: number;
};

interface Props {
  observations: FishObservation[];
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
      const fish = obs.totalCount;

      if (existing) {
        existing.count++;
        existing.totalFish += fish;
      } else {
        map.set(key, {
          lakeName: obs.lakeName,
          lakeArea: obs.lakeArea,
          latitude: obs.latitude,
          longitude: obs.longitude,
          count: 1,
          totalFish: fish,
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
    return CABIN_COORDS;
  }, [savedLocations, clusters]);

  if (clusters.length === 0) return null;

  return (
    <div className="relative z-0 h-[250px] overflow-hidden rounded-lg border shadow-sm md:h-[420px]">
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

        <Marker position={CABIN_COORDS} icon={cabinIcon}>
          <Popup>
            <div className="text-xs font-semibold">The Cabin</div>
          </Popup>
        </Marker>

        {clusters.map((cluster, i) => {
          const isActive =
            filterLakeArea != null && cluster.lakeArea === filterLakeArea;

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
                        : cluster.lakeArea,
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
                    {cluster.count} report{cluster.count !== 1 ? "s" : ""}{" "}
                    &middot; {cluster.totalFish} fish
                  </div>
                  {cluster.lakeArea && (
                    <button
                      onClick={() =>
                        onSelectArea(
                          filterLakeArea === cluster.lakeArea
                            ? null
                            : cluster.lakeArea,
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
