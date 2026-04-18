"use client";

import { useState } from "react";
import { FishObservation, SavedLocation } from "@/types/fishing";
import {
  formatFishDate,
  getWeatherIcon,
  getSpeciesLabel,
} from "@/lib/fishing-utils";
import {
  Camera,
  ChevronDown,
  ChevronUp,
  Edit2,
  MapPin,
  Trash2,
  User,
  Fish,
  Calendar,
  Clock,
  FileText,
  X,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useFishDelete } from "@/hooks/use-fish-delete";
import FishingForm from "./FishingForm";
import FishPhotoGrid from "./FishPhotoGrid";
import {
  SpeciesPills,
  FishBehaviorPills,
  BaitPills,
  CoordinatesDisplay,
  ConditionsDisplay,
} from "./FishObservationDetails";

type SortField = "date" | "lakeName" | "totalCount" | "user";
type SortDir = "asc" | "desc";

interface Props {
  observations: FishObservation[];
  savedLocations: SavedLocation[];
  currentUserId?: string | null;
  isAdmin: boolean;
  onUpdated: (observation: FishObservation) => void;
  onDeleted: (id: string) => void;
}

export default function FishDetailsView({
  observations,
  savedLocations,
  currentUserId,
  isAdmin,
  onUpdated,
  onDeleted,
}: Props) {
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selectedObs, setSelectedObs] = useState<FishObservation | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const {
    deleteTarget,
    isDeleting,
    requestDelete,
    confirmDelete,
    cancelDelete,
  } = useFishDelete((id) => {
    onDeleted(id);
    if (selectedObs?.id === id) setSelectedObs(null);
  });

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir(field === "date" ? "desc" : "asc");
    }
  }

  const sorted = [...observations].sort((a, b) => {
    const dir = sortDir === "asc" ? 1 : -1;
    switch (sortField) {
      case "date":
        return (new Date(a.date).getTime() - new Date(b.date).getTime()) * dir;
      case "lakeName":
        return a.lakeName.localeCompare(b.lakeName) * dir;
      case "totalCount":
        return (a.totalCount - b.totalCount) * dir;
      case "user":
        return a.user.name.localeCompare(b.user.name) * dir;
      default:
        return 0;
    }
  });

  function SortHeader({
    field,
    label,
    className = "",
  }: {
    field: SortField;
    label: string;
    className?: string;
  }) {
    const active = sortField === field;
    return (
      <th
        className={`cursor-pointer select-none px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground ${className}`}
        onClick={() => toggleSort(field)}
      >
        <span className="flex items-center gap-1">
          {label}
          {active &&
            (sortDir === "asc" ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            ))}
        </span>
      </th>
    );
  }

  if (editingId) {
    const obs = observations.find((o) => o.id === editingId);
    if (obs) {
      return (
        <FishingForm
          observation={obs}
          savedLocations={savedLocations}
          onUpdated={(updated) => {
            onUpdated(updated);
            setEditingId(null);
            setSelectedObs(null);
          }}
          onCancel={() => setEditingId(null)}
        />
      );
    }
  }

  const modalObs = selectedObs;
  const modalIsOwner = modalObs ? currentUserId === modalObs.userId : false;

  return (
    <>
      <div className="overflow-x-auto rounded-lg border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <SortHeader field="date" label="Date" />
              <SortHeader field="lakeName" label="Location" />
              <SortHeader field="totalCount" label="Total" />
              <th className="hidden px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground md:table-cell">
                Species
              </th>
              <th className="hidden px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground lg:table-cell">
                Bait
              </th>
              <th className="hidden px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground lg:table-cell">
                Notable
              </th>
              <SortHeader
                field="user"
                label="Angler"
                className="hidden sm:table-cell"
              />
              <th className="px-3 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {sorted.map((obs) => {
              const isOwner = currentUserId === obs.userId;

              return (
                <tr
                  key={obs.id}
                  className="cursor-pointer transition-colors hover:bg-muted/30"
                  onClick={() => setSelectedObs(obs)}
                >
                  <td className="whitespace-nowrap px-3 py-2.5 text-sm">
                    <div className="flex items-center gap-1">
                      {obs.weather && (
                        <span className="text-xs">
                          {getWeatherIcon(obs.weather)}
                        </span>
                      )}
                      {formatFishDate(obs.date)}
                      {obs.imageUrls.length > 0 && (
                        <Camera className="ml-0.5 h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    {obs.time && (
                      <div className="text-[10px] text-muted-foreground">
                        {obs.time}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 shrink-0 text-cyan-500" />
                      <span className="truncate">{obs.lakeName}</span>
                    </div>
                    {obs.lakeArea && (
                      <div className="truncate text-[10px] text-muted-foreground">
                        {obs.lakeArea}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="inline-flex items-center gap-1 rounded-full bg-cyan-100 px-2 py-0.5 text-xs font-semibold text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300">
                      <Fish className="h-3 w-3" />
                      {obs.totalCount}
                    </span>
                  </td>
                  <td className="hidden px-3 py-2.5 md:table-cell">
                    {obs.species.length > 0 ? (
                      <span className="text-xs">
                        {obs.species
                          .slice(0, 2)
                          .map(getSpeciesLabel)
                          .join(", ")}
                        {obs.species.length > 2 &&
                          ` +${obs.species.length - 2}`}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="hidden px-3 py-2.5 lg:table-cell">
                    {obs.baits.length > 0 ? (
                      <span className="text-xs text-muted-foreground">
                        {obs.baits.length}{" "}
                        {obs.baits.length === 1 ? "type" : "types"}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="hidden max-w-[200px] truncate px-3 py-2.5 text-xs text-muted-foreground lg:table-cell">
                    {obs.notableCatches || "—"}
                  </td>
                  <td className="hidden px-3 py-2.5 sm:table-cell">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <User className="h-3 w-3" />
                      {obs.user.name}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {isOwner && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingId(obs.id);
                          }}
                          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {(isOwner || isAdmin) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            requestDelete(obs);
                          }}
                          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Detail modal */}
      <Modal
        isOpen={!!modalObs}
        onClose={() => setSelectedObs(null)}
        panelClassName="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-xl border bg-background p-5 shadow-xl md:p-6"
      >
        {modalObs && (
          <div className="space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Fishing Report</h2>
                <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatFishDate(modalObs.date)}
                  {modalObs.time && (
                    <>
                      <Clock className="ml-1 h-3.5 w-3.5" />
                      {modalObs.time}
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                {modalIsOwner && (
                  <button
                    onClick={() => setEditingId(modalObs.id)}
                    className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                )}
                {(modalIsOwner || isAdmin) && (
                  <button
                    onClick={() => requestDelete(modalObs)}
                    className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => setSelectedObs(null)}
                  className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Location */}
            <div className="rounded-lg border bg-muted/30 p-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <MapPin className="h-4 w-4 text-cyan-500" />
                {modalObs.lakeName}
                {modalObs.lakeArea && (
                  <span className="text-muted-foreground">
                    — {modalObs.lakeArea}
                  </span>
                )}
              </div>
              {modalObs.latitude != null && modalObs.longitude != null && (
                <div className="mt-1 pl-6">
                  <CoordinatesDisplay
                    latitude={modalObs.latitude}
                    longitude={modalObs.longitude}
                  />
                </div>
              )}
            </div>

            {/* Total */}
            <div className="rounded-lg border bg-muted/30 p-3 text-center">
              <Fish className="mx-auto mb-1 h-5 w-5 text-cyan-500" />
              <div className="text-2xl font-bold">{modalObs.totalCount}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Fish Caught
              </div>
            </div>

            {/* Species */}
            {modalObs.species.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Species
                </div>
                <SpeciesPills species={modalObs.species} />
              </div>
            )}

            {/* Baits */}
            {modalObs.baits.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Bait / Lures
                </div>
                <BaitPills baits={modalObs.baits} />
              </div>
            )}

            {/* Behaviors */}
            {modalObs.behaviors.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Fish Activity
                </div>
                <FishBehaviorPills behaviors={modalObs.behaviors} />
              </div>
            )}

            {/* Notable catches */}
            {modalObs.notableCatches && (
              <div className="space-y-1.5">
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Notable Catches
                </div>
                <p className="text-sm">{modalObs.notableCatches}</p>
              </div>
            )}

            {/* Weather / Wind / Disturbance */}
            <ConditionsDisplay observation={modalObs} size="md" />

            {/* Notes */}
            {modalObs.notes && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <FileText className="h-3 w-3" />
                  Notes
                </div>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                  {modalObs.notes}
                </p>
              </div>
            )}

            {/* Photos */}
            <FishPhotoGrid imageUrls={modalObs.imageUrls} />

            {/* Observer */}
            <div className="flex items-center gap-2 border-t pt-3 text-xs text-muted-foreground">
              <User className="h-3.5 w-3.5" />
              Logged by {modalObs.user.name}
            </div>
          </div>
        )}
      </Modal>

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete fishing report"
        message="Are you sure you want to delete this fishing report? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  );
}
