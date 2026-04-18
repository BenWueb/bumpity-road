import { useState, useCallback } from "react";
import { FishObservation } from "@/types/fishing";

export function useFishDelete(onDeleted: (id: string) => void) {
  const [deleteTarget, setDeleteTarget] = useState<FishObservation | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/fishing?id=${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      onDeleted(deleteTarget.id);
    } catch {
      alert("Failed to delete fishing report");
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  }, [deleteTarget, onDeleted]);

  return {
    deleteTarget,
    isDeleting,
    requestDelete: setDeleteTarget,
    confirmDelete,
    cancelDelete: useCallback(() => setDeleteTarget(null), []),
  };
}
