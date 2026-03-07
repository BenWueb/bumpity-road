"use client";

import { useState } from "react";
import { LoonObservation } from "@/types/loon";
import {
  formatLoonDate,
  getNestingLabel,
  getWeatherIcon,
  getNestingGradient,
  getTotalLoons,
} from "@/lib/loon-utils";
import {
  Camera,
  ChevronDown,
  ChevronUp,
  Edit2,
  Trash2,
  MapPin,
  User,
  Clock,
} from "lucide-react";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useLoonDelete } from "@/hooks/use-loon-delete";
import LoonPhotoGrid from "./LoonPhotoGrid";
import {
  LoonIdPills,
  BehaviorPills,
  CoordinatesDisplay,
  ConditionsDisplay,
} from "./LoonObservationDetails";

interface LoonCardProps {
  observation: LoonObservation;
  isOwner: boolean;
  isAdmin: boolean;
  onEdit: () => void;
  onDeleted: (id: string) => void;
}

export default function LoonCard({
  observation,
  isOwner,
  isAdmin,
  onEdit,
  onDeleted,
}: LoonCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { deleteTarget, isDeleting, requestDelete, confirmDelete, cancelDelete } =
    useLoonDelete(onDeleted);

  const totalLoons = getTotalLoons(observation);
  const canEdit = isOwner;
  const canDelete = isOwner || isAdmin;

  return (
    <div className="w-full rounded-lg border shadow-sm">
      {/* Collapsed view */}
      <div
        className={`cursor-pointer rounded-lg p-3 transition-colors hover:bg-muted/50 bg-linear-to-br ${getNestingGradient(observation.nestingActivity)}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="mt-0.5 shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-sky-500" />
              <h4 className="truncate text-sm font-medium text-foreground">
                {observation.lakeName}
                {observation.lakeArea && (
                  <span className="text-muted-foreground">
                    {" "}
                    &middot; {observation.lakeArea}
                  </span>
                )}
              </h4>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                {observation.weather && getWeatherIcon(observation.weather)}
                {formatLoonDate(observation.date)}
              </span>
              {observation.time && (
                <span className="flex items-center gap-0.5">
                  <Clock className="h-2.5 w-2.5" />
                  {observation.time}
                </span>
              )}
              {observation.imageUrls.length > 0 && (
                <Camera className="h-3 w-3" />
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[10px]">
              <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2 py-0.5 font-semibold text-sky-700 dark:bg-sky-900/30 dark:text-sky-300">
                {totalLoons} loon{totalLoons !== 1 ? "s" : ""}
              </span>
              {observation.chicksCount > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                  {observation.chicksCount} chick
                  {observation.chicksCount !== 1 ? "s" : ""}
                </span>
              )}
              {observation.nestingActivity &&
                observation.nestingActivity !== "none" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                    {getNestingLabel(observation.nestingActivity)}
                  </span>
                )}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded view */}
      {isExpanded && (
        <div className="space-y-3 border-t p-4">
          {/* Counts breakdown */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-md bg-muted/50 p-2 text-center">
              <div className="text-lg font-bold text-foreground">
                {observation.adultsCount}
              </div>
              <div className="text-[10px] font-medium text-muted-foreground">
                Adults
              </div>
            </div>
            <div className="rounded-md bg-muted/50 p-2 text-center">
              <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {observation.chicksCount}
              </div>
              <div className="text-[10px] font-medium text-muted-foreground">
                Chicks
              </div>
            </div>
            <div className="rounded-md bg-muted/50 p-2 text-center">
              <div className="text-lg font-bold text-foreground">
                {observation.juvenilesCount}
              </div>
              <div className="text-[10px] font-medium text-muted-foreground">
                Juveniles
              </div>
            </div>
          </div>

          {/* Loon IDs */}
          {observation.loonIds.length > 0 && (
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">
                Individual IDs
              </span>
              <LoonIdPills ids={observation.loonIds} />
            </div>
          )}

          {/* Behaviors */}
          {observation.behaviors.length > 0 && (
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">
                Behaviors
              </span>
              <BehaviorPills behaviors={observation.behaviors} />
            </div>
          )}

          <CoordinatesDisplay
            latitude={observation.latitude}
            longitude={observation.longitude}
          />

          <ConditionsDisplay observation={observation} />

          <LoonPhotoGrid imageUrls={observation.imageUrls} />

          {/* Notes */}
          {observation.notes && (
            <p className="text-sm text-muted-foreground">
              {observation.notes}
            </p>
          )}

          {/* Observer */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <User className="h-3 w-3" />
            <span>{observation.user.name}</span>
          </div>

          {/* Actions */}
          {(canEdit || canDelete) && (
            <div className="flex items-center justify-end gap-2 border-t pt-2">
              {canEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                  className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              )}
              {canDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    requestDelete(observation);
                  }}
                  className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        </div>
      )}

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
    </div>
  );
}
