"use client";

import dynamic from "next/dynamic";
import { SavedLocation } from "@/types/fishing";
import { MapPin } from "lucide-react";

const LocationPicker = dynamic(() => import("./LocationPicker"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[300px] items-center justify-center rounded-lg border bg-muted/30">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <MapPin className="h-4 w-4 animate-pulse" />
        Loading map...
      </div>
    </div>
  ),
});

interface Props {
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

export default function LocationPickerWrapper(props: Props) {
  return <LocationPicker {...props} />;
}
