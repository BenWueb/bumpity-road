import { useState, useCallback } from "react";
import { LoonObservation } from "@/types/loon";

export function useLoonDelete(onDeleted: (id: string) => void) {
  const [deleteTarget, setDeleteTarget] = useState<LoonObservation | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/loons?id=${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      onDeleted(deleteTarget.id);
    } catch {
      alert("Failed to delete observation");
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
