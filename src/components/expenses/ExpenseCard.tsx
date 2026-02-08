"use client";

import { useState } from "react";
import { Expense, ExpenseComment } from "@/types/expense";
import {
  Edit2,
  Trash2,
  User,
  UtensilsCrossed,
  Droplet,
  Home,
  Sofa,
  Wrench,
  TreePine,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Send,
  X,
  Lightbulb,
  type LucideIcon,
} from "lucide-react";
import { CARD_GRADIENTS } from "@/lib/ui-gradients";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import ExpenseForm from "./ExpenseForm";

interface ExpenseCardProps {
  expense: Expense;
  currentUserId?: string;
  onExpenseUpdated: (expense: Expense) => void;
  onExpenseDeleted: (expenseId: string) => void;
}

export default function ExpenseCard({
  expense,
  currentUserId,
  onExpenseUpdated,
  onExpenseDeleted,
}: ExpenseCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [localVoteScore, setLocalVoteScore] = useState(expense.voteScore);
  const [localUserVote, setLocalUserVote] = useState(expense.userVote);
  const [localComments, setLocalComments] = useState<ExpenseComment[]>(
    expense.comments
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleExpenseUpdated = (updatedExpense: Expense) => {
    onExpenseUpdated(updatedExpense);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/expenses?id=${expense.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete expense");
      }

      onExpenseDeleted(expense.id);
    } catch (error) {
      console.error("Error deleting expense:", error);
      alert("Failed to delete expense");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleVote = async (value: 1 | -1) => {
    if (!currentUserId || isVoting) return;
    setIsVoting(true);

    // Optimistic update
    const prevScore = localVoteScore;
    const prevVote = localUserVote;

    if (localUserVote === value) {
      // Toggle off
      setLocalVoteScore(localVoteScore - value);
      setLocalUserVote(null);
    } else if (localUserVote !== null) {
      // Flip
      setLocalVoteScore(localVoteScore - localUserVote + value);
      setLocalUserVote(value);
    } else {
      // New vote
      setLocalVoteScore(localVoteScore + value);
      setLocalUserVote(value);
    }

    try {
      const res = await fetch("/api/expenses/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expenseId: expense.id, value }),
      });

      if (!res.ok) throw new Error("Vote failed");

      const data = await res.json();
      setLocalVoteScore(data.voteScore);
      setLocalUserVote(data.userVote);
    } catch {
      // Revert on error
      setLocalVoteScore(prevScore);
      setLocalUserVote(prevVote);
    } finally {
      setIsVoting(false);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || isSubmittingComment) return;
    setIsSubmittingComment(true);

    try {
      const res = await fetch("/api/expenses/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expenseId: expense.id, content: commentText }),
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

  if (isEditing) {
    return (
      <ExpenseForm
        expense={expense}
        onExpenseUpdated={handleExpenseUpdated}
        onCancel={handleCancelEdit}
      />
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getCategoryLabel = (category: string) => {
    const categoryMap: Record<string, string> = {
      kitchen: "Kitchen",
      bathroom: "Bathroom",
      exterior: "Exterior",
      interior: "Interior",
      utilities: "Utilities",
      landscaping: "Landscaping",
      other: "Other",
    };
    return categoryMap[category] || category;
  };

  const getCategoryIcon = (category: string): LucideIcon => {
    const iconMap: Record<string, LucideIcon> = {
      kitchen: UtensilsCrossed,
      bathroom: Droplet,
      exterior: Home,
      interior: Sofa,
      utilities: Wrench,
      landscaping: TreePine,
      other: MoreHorizontal,
    };
    return iconMap[category] || MoreHorizontal;
  };

  const getCategoryGradient = (category: string) => {
    const gradientMap: Record<string, string> = {
      kitchen: CARD_GRADIENTS.amber,
      bathroom: CARD_GRADIENTS.sky,
      exterior: CARD_GRADIENTS.slate,
      interior: CARD_GRADIENTS.violet,
      utilities: CARD_GRADIENTS.emerald,
      landscaping: CARD_GRADIENTS.rose,
      other: CARD_GRADIENTS.slate,
    };
    return gradientMap[category] || CARD_GRADIENTS.slate;
  };

  const CategoryIcon = getCategoryIcon(expense.category);

  return (
    <div
      className={`w-full rounded-lg border shadow-sm ${getCategoryGradient(
        expense.category
      )}`}
    >
      {/* Collapsed view - always visible */}
      <div
        className="cursor-pointer p-4 transition-colors hover:bg-muted/50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-center gap-2">
                {expense.isPlanned && (
                  <Lightbulb className="h-4 w-4 shrink-0 text-amber-500" />
                )}
                <h4 className="truncate font-medium text-foreground">
                  {expense.title}
                </h4>
              </div>
              <span className="flex w-fit items-center gap-1.5 rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                <CategoryIcon className="h-3 w-3" />
                {getCategoryLabel(expense.category)}
              </span>
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <span className="whitespace-nowrap text-sm font-semibold text-foreground">
              {expense.isPlanned && "~"}${expense.cost.toLocaleString()}
            </span>
            {expense.date && (
              <span className="whitespace-nowrap text-xs text-muted-foreground">
                {formatDate(expense.date)}
              </span>
            )}
          </div>
        </div>

        {/* Vote score & comment count (always visible for planned) */}
        {expense.isPlanned && (
          <div className="mt-2 flex items-center gap-4 pl-9 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <ThumbsUp className="h-3 w-3" />
              {localVoteScore}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="h-3 w-3" />
              {localComments.length}
            </span>
          </div>
        )}
      </div>

      {/* Expanded view */}
      {isExpanded && (
        <div className="space-y-3 border-t p-4">
          {expense.description && (
            <p className="text-sm text-muted-foreground">
              {expense.description}
            </p>
          )}

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <User className="h-3 w-3" />
            <span>{expense.user.name}</span>
          </div>

          {/* Voting (only for planned expenses) */}
          {expense.isPlanned && currentUserId && (
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleVote(1);
                }}
                disabled={isVoting}
                className={`flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  localUserVote === 1
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                <ThumbsUp className="h-3.5 w-3.5" />
                Upvote
              </button>
              <span className="min-w-[2rem] text-center text-sm font-semibold">
                {localVoteScore}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleVote(-1);
                }}
                disabled={isVoting}
                className={`flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  localUserVote === -1
                    ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                <ThumbsDown className="h-3.5 w-3.5" />
                Downvote
              </button>
            </div>
          )}

          {/* Comments section (only for planned expenses) */}
          {expense.isPlanned && (
            <div className="pt-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowComments(!showComments);
                }}
                className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                {localComments.length > 0
                  ? `${localComments.length} comment${localComments.length !== 1 ? "s" : ""}`
                  : "Add a comment"}
              </button>

              {showComments && (
                <div className="mt-2 space-y-2">
                  {/* Existing comments */}
                  {localComments.map((comment) => (
                    <div
                      key={comment.id}
                      className="group flex items-start gap-2 rounded-md bg-muted/50 p-2"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-foreground">
                            {comment.user.name}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {comment.content}
                        </p>
                      </div>
                      {currentUserId === comment.userId && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteComment(comment.id);
                          }}
                          className="shrink-0 rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  ))}

                  {/* Add comment form */}
                  {currentUserId && (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddComment();
                          }
                        }}
                        placeholder="Write a comment..."
                        className="flex-1 rounded-md border bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddComment();
                        }}
                        disabled={!commentText.trim() || isSubmittingComment}
                        className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
                      >
                        <Send className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 border-t pt-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEdit();
              }}
              className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteConfirm(true);
              }}
              className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete expense"
        message={`Are you sure you want to delete "${expense.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
