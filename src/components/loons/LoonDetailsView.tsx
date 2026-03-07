"use client";

import { useState } from "react";
import { LoonObservation, SavedLocation } from "@/types/loon";
import {
  formatLoonDate,
  getNestingLabel,
  getWeatherIcon,
  getTotalLoons,
} from "@/lib/loon-utils";
import {
  Camera,
  ChevronDown,
  ChevronUp,
  Edit2,
  MapPin,
  Trash2,
  User,
  Origami,
  Baby,
  Calendar,
  Clock,
  FileText,
  X,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useLoonDelete } from "@/hooks/use-loon-delete";
import LoonForm from "./LoonForm";
import LoonPhotoGrid from "./LoonPhotoGrid";
import {
  LoonIdPills,
  BehaviorPills,
  CoordinatesDisplay,
  ConditionsDisplay,
} from "./LoonObservationDetails";

type SortField =
  | "date"
  | "lakeName"
  | "totalLoons"
  | "adultsCount"
  | "chicksCount"
  | "user";
type SortDir = "asc" | "desc";

interface Props {
  observations: LoonObservation[];
  savedLocations: SavedLocation[];
  currentUserId?: string | null;
  isAdmin: boolean;
  onUpdated: (observation: LoonObservation) => void;
  onDeleted: (id: string) => void;
}

export default function LoonDetailsView({
  observations,
  savedLocations,
  currentUserId,
  isAdmin,
  onUpdated,
  onDeleted,
}: Props) {
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selectedObs, setSelectedObs] = useState<LoonObservation | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const {
    deleteTarget,
    isDeleting,
    requestDelete,
    confirmDelete,
    cancelDelete,
  } = useLoonDelete((id) => {
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
      case "totalLoons":
        return (getTotalLoons(a) - getTotalLoons(b)) * dir;
      case "adultsCount":
        return (a.adultsCount - b.adultsCount) * dir;
      case "chicksCount":
        return (a.chicksCount - b.chicksCount) * dir;
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
        <LoonForm
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
  const modalTotal = modalObs ? getTotalLoons(modalObs) : 0;

  return (
    <>
      <div className="overflow-x-auto rounded-lg border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <SortHeader field="date" label="Date" />
              <SortHeader field="lakeName" label="Location" />
              <SortHeader field="totalLoons" label="Total" />
              <SortHeader
                field="adultsCount"
                label="Adults"
                className="hidden md:table-cell"
              />
              <SortHeader
                field="chicksCount"
                label="Chicks"
                className="hidden md:table-cell"
              />
              <th className="hidden px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground lg:table-cell">
                Nesting
              </th>
              <SortHeader
                field="user"
                label="Observer"
                className="hidden sm:table-cell"
              />
              <th className="px-3 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {sorted.map((obs) => {
              const total = getTotalLoons(obs);
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
                      {formatLoonDate(obs.date)}
                      {obs.imageUrls.length > 0 && (
                        <Camera className="ml-0.5 h-3 w-3 text-muted-foreground" />
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
                      <MapPin className="h-3 w-3 shrink-0 text-sky-500" />
                      <span className="truncate">{obs.lakeName}</span>
                    </div>
                    {obs.lakeArea && (
                      <div className="truncate text-[10px] text-muted-foreground">
                        {obs.lakeArea}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="inline-flex items-center rounded-full bg-sky-100 px-2 py-0.5 text-xs font-semibold text-sky-700 dark:bg-sky-900/30 dark:text-sky-300">
                      {total}
                    </span>
                  </td>
                  <td className="hidden px-3 py-2.5 md:table-cell">
                    {obs.adultsCount}
                  </td>
                  <td className="hidden px-3 py-2.5 md:table-cell">
                    {obs.chicksCount > 0 ? (
                      <span className="font-medium text-emerald-600 dark:text-emerald-400">
                        {obs.chicksCount}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </td>
                  <td className="hidden px-3 py-2.5 lg:table-cell">
                    {obs.nestingActivity && obs.nestingActivity !== "none" ? (
                      <span className="text-xs">
                        {getNestingLabel(obs.nestingActivity)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
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

      {/* Observation detail modal */}
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
                <h2 className="text-lg font-semibold">Loon Observation</h2>
                <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatLoonDate(modalObs.date)}
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
                <MapPin className="h-4 w-4 text-sky-500" />
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

            {/* Loon counts */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg border bg-muted/30 p-3 text-center">
                <Origami className="mx-auto mb-1 h-4 w-4 text-sky-500" />
                <div className="text-xl font-bold">{modalObs.adultsCount}</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Adults
                </div>
              </div>
              <div className="rounded-lg border bg-muted/30 p-3 text-center">
                <Baby className="mx-auto mb-1 h-4 w-4 text-emerald-500" />
                <div className="text-xl font-bold">{modalObs.chicksCount}</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Chicks
                </div>
              </div>
              <div className="rounded-lg border bg-muted/30 p-3 text-center">
                <Origami className="mx-auto mb-1 h-4 w-4 text-amber-500" />
                <div className="text-xl font-bold">
                  {modalObs.juvenilesCount}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Juveniles
                </div>
              </div>
            </div>

            {/* Total */}
            <div className="flex items-center justify-center">
              <span className="rounded-full bg-sky-100 px-3 py-1 text-sm font-semibold text-sky-700 dark:bg-sky-900/30 dark:text-sky-300">
                {modalTotal} total loon{modalTotal !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Loon IDs */}
            {modalObs.loonIds.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Loon IDs
                </div>
                <LoonIdPills ids={modalObs.loonIds} />
              </div>
            )}

            {/* Nesting */}
            {modalObs.nestingActivity &&
              modalObs.nestingActivity !== "none" && (
                <div className="space-y-1.5">
                  <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Nesting Activity
                  </div>
                  <div className="text-sm">
                    {getNestingLabel(modalObs.nestingActivity)}
                  </div>
                </div>
              )}

            {/* Behaviors */}
            {modalObs.behaviors.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Behaviors
                </div>
                <BehaviorPills behaviors={modalObs.behaviors} />
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
            <LoonPhotoGrid imageUrls={modalObs.imageUrls} />

            {/* Observer */}
            <div className="flex items-center gap-2 border-t pt-3 text-xs text-muted-foreground">
              <User className="h-3.5 w-3.5" />
              Observed by {modalObs.user.name}
            </div>
          </div>
        )}
      </Modal>

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete observation"
        message="Are you sure you want to delete this loon observation? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  );
}
