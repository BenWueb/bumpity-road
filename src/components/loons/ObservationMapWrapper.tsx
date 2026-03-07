"use client";

import dynamic from "next/dynamic";
import { LoonObservation, SavedLocation } from "@/types/loon";
import { MapPin } from "lucide-react";

const ObservationMap = dynamic(() => import("./ObservationMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[250px] items-center justify-center rounded-lg border bg-muted/30 md:h-[420px]">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <MapPin className="h-4 w-4 animate-pulse" />
        Loading map...
      </div>
    </div>
  ),
});

interface Props {
  observations: LoonObservation[];
  savedLocations: SavedLocation[];
  filterLakeArea: string | null;
  onSelectArea: (lakeArea: string | null) => void;
}

export default function ObservationMapWrapper(props: Props) {
  return <ObservationMap {...props} />;
}
