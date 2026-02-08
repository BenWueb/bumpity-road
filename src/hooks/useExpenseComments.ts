import { useState } from "react";
import { ExpenseComment } from "@/types/expense";

interface UseExpenseCommentsProps {
  expenseId: string;
  initialComments: ExpenseComment[];
  currentUserId?: string;
}

export function useExpenseComments({
  expenseId,
  initialComments,
  currentUserId,
}: UseExpenseCommentsProps) {
  const [localComments, setLocalComments] = useState(initialComments);
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const handleAddComment = async () => {
    if (!commentText.trim() || isSubmittingComment || !currentUserId) return;
    setIsSubmittingComment(true);

    try {
      const res = await fetch("/api/expenses/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expenseId, content: commentText }),
      });

      if (!res.ok) throw new Error("Failed to add comment");

      const { comment } = await res.json();
      setLocalComments((prev) => [...prev, comment]);
      setCommentText("");
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Failed to add comment");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const res = await fetch(`/api/expenses/comments?id=${commentId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete comment");

      setLocalComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  return {
    localComments,
    commentText,
    setCommentText,
    isSubmittingComment,
    handleAddComment,
    handleDeleteComment,
  };
}
