"use client";

import { useState, useMemo } from "react";
import { Expense, ExpenseComment } from "@/types/expense";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Edit2,
  Trash2,
  UtensilsCrossed,
  Droplet,
  Home,
  Sofa,
  Wrench,
  TreePine,
  MoreHorizontal,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Lightbulb,
  Send,
  X,
  ChevronDown,
  ChevronUp,
  type LucideIcon,
} from "lucide-react";
import ExpenseForm from "./ExpenseForm";

interface ExpenseDetailsViewProps {
  expenses: Expense[];
  currentUserId?: string;
  isWishlist?: boolean;
  onExpenseUpdated: (expense: Expense) => void;
  onExpenseDeleted: (expenseId: string) => void;
}

type SortField =
  | "title"
  | "category"
  | "date"
  | "cost"
  | "user"
  | "votes"
  | "comments";
type SortDir = "asc" | "desc";

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

const formatDate = (dateString: string | null) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatDateShort = (dateString: string | null) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

export default function ExpenseDetailsView({
  expenses,
  currentUserId,
  isWishlist = false,
  onExpenseUpdated,
  onExpenseDeleted,
}: ExpenseDetailsViewProps) {
  const [sortField, setSortField] = useState<SortField>(
    isWishlist ? "votes" : "date"
  );
  const [sortDir, setSortDir] = useState<SortDir>(
    isWishlist ? "desc" : "asc"
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const totalColumns = isWishlist ? 9 : 7;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir(
        field === "cost" || field === "votes" || field === "comments"
          ? "desc"
          : "asc"
      );
    }
  };

  const sorted = useMemo(() => {
    return [...expenses].sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;

      switch (sortField) {
        case "title":
          return dir * a.title.localeCompare(b.title);
        case "category":
          return dir * a.category.localeCompare(b.category);
        case "date": {
          const da = a.date ? new Date(a.date).getTime() : 0;
          const db = b.date ? new Date(b.date).getTime() : 0;
          return dir * (da - db);
        }
        case "cost":
          return dir * (a.cost - b.cost);
        case "user":
          return dir * a.user.name.localeCompare(b.user.name);
        case "votes":
          return dir * (a.voteScore - b.voteScore);
        case "comments":
          return dir * (a.comments.length - b.comments.length);
        default:
          return 0;
      }
    });
  }, [expenses, sortField, sortDir]);

  const handleDelete = async (expense: Expense) => {
    if (!confirm(`Are you sure you want to delete "${expense.title}"?`)) return;

    try {
      const res = await fetch(`/api/expenses?id=${expense.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      onExpenseDeleted(expense.id);
    } catch (error) {
      console.error("Error deleting expense:", error);
      alert("Failed to delete expense");
    }
  };

  const handleExpenseUpdated = (updated: Expense) => {
    onExpenseUpdated(updated);
    setEditingId(null);
  };

  const toggleRow = (id: string) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const SortHeader = ({
    field,
    label,
    className = "",
  }: {
    field: SortField;
    label: string;
    className?: string;
  }) => {
    const isActive = sortField === field;
    return (
      <th
        className={`cursor-pointer select-none whitespace-nowrap px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground ${className}`}
        onClick={() => handleSort(field)}
      >
        <span className="inline-flex items-center gap-1">
          {label}
          {isActive ? (
            sortDir === "asc" ? (
              <ArrowUp className="h-3 w-3" />
            ) : (
              <ArrowDown className="h-3 w-3" />
            )
          ) : (
            <ArrowUpDown className="h-3 w-3 opacity-30" />
          )}
        </span>
      </th>
    );
  };

  const total = expenses.reduce((sum, e) => sum + e.cost, 0);

  if (editingId) {
    const editing = expenses.find((e) => e.id === editingId);
    if (editing) {
      return (
        <ExpenseForm
          expense={editing}
          onExpenseUpdated={handleExpenseUpdated}
          onCancel={() => setEditingId(null)}
        />
      );
    }
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              {/* Checkbox - hidden on mobile */}
              <th className="hidden w-8 px-3 py-2 md:table-cell" />
              <SortHeader field="title" label="Name" className="min-w-[120px] md:min-w-[200px]" />
              {/* Category - hidden on mobile */}
              <SortHeader field="category" label="Category" className="hidden md:table-cell" />
              <SortHeader field="date" label="Date" />
              <SortHeader
                field="cost"
                label={isWishlist ? "Est." : "Cost"}
                className="text-right"
              />
              {/* Added by - hidden on mobile */}
              <SortHeader field="user" label="Added by" className="hidden lg:table-cell" />
              {isWishlist && (
                <>
                  {/* Votes - hidden on mobile */}
                  <SortHeader field="votes" label="Votes" className="hidden md:table-cell" />
                  {/* Comments - hidden on mobile */}
                  <SortHeader field="comments" label="Comments" className="hidden md:table-cell" />
                </>
              )}
              {/* Actions - hidden on mobile, tap row instead */}
              <th className="hidden w-20 px-3 py-2 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground md:table-cell">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {sorted.map((expense) => {
              const CategoryIcon = getCategoryIcon(expense.category);
              const isSelected = selectedRows.has(expense.id);

              return (
                <WishlistRowWrapper
                  key={expense.id}
                  expense={expense}
                  currentUserId={currentUserId}
                  isWishlist={isWishlist}
                  isSelected={isSelected}
                  colSpan={totalColumns}
                  onToggleRow={() => toggleRow(expense.id)}
                  onEdit={() => setEditingId(expense.id)}
                  onDelete={() => handleDelete(expense)}
                  onExpenseUpdated={onExpenseUpdated}
                  CategoryIcon={CategoryIcon}
                />
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t bg-muted/30">
              {/* Checkbox spacer - hidden on mobile */}
              <td className="hidden md:table-cell" />
              <td className="px-3 py-2 text-xs font-medium text-muted-foreground">
                {sorted.length} expense{sorted.length !== 1 ? "s" : ""}
              </td>
              {/* Category spacer - hidden on mobile */}
              <td className="hidden md:table-cell" />
              <td />
              <td className="whitespace-nowrap px-3 py-2 text-right text-sm font-semibold tabular-nums text-foreground">
                {isWishlist && "~"}$
                {total.toLocaleString(undefined, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                })}
              </td>
              {/* Added by spacer - hidden on mobile */}
              <td className="hidden lg:table-cell" />
              {isWishlist && (
                <>
                  <td className="hidden md:table-cell" />
                  <td className="hidden md:table-cell" />
                </>
              )}
              {/* Actions spacer - hidden on mobile */}
              <td className="hidden md:table-cell" />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

// --- Wrapper to handle per-row state for wishlist actions + expansion ---
function WishlistRowWrapper({
  expense,
  currentUserId,
  isWishlist,
  isSelected,
  colSpan,
  onToggleRow,
  onEdit,
  onDelete,
  onExpenseUpdated,
  CategoryIcon,
}: {
  expense: Expense;
  currentUserId?: string;
  isWishlist: boolean;
  isSelected: boolean;
  colSpan: number;
  onToggleRow: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onExpenseUpdated: (expense: Expense) => void;
  CategoryIcon: LucideIcon;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localVoteScore, setLocalVoteScore] = useState(expense.voteScore);
  const [localUserVote, setLocalUserVote] = useState(expense.userVote);
  const [localComments, setLocalComments] = useState<ExpenseComment[]>(
    expense.comments
  );
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async (value: 1 | -1) => {
    if (!currentUserId || isVoting) return;
    setIsVoting(true);

    const prevScore = localVoteScore;
    const prevVote = localUserVote;

    if (localUserVote === value) {
      setLocalVoteScore(localVoteScore - value);
      setLocalUserVote(null);
    } else if (localUserVote !== null) {
      setLocalVoteScore(localVoteScore - localUserVote + value);
      setLocalUserVote(value);
    } else {
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

  return (
    <>
      <tr
        className={`group transition-colors ${
          isSelected ? "bg-primary/5" : "hover:bg-muted/30"
        }`}
        onClick={onToggleRow}
      >
        {/* Checkbox - hidden on mobile */}
        <td className="hidden px-3 py-2 md:table-cell">
          <div
            className={`h-4 w-4 rounded border transition-colors ${
              isSelected
                ? "border-primary bg-primary"
                : "border-muted-foreground/30"
            }`}
          >
            {isSelected && (
              <svg
                viewBox="0 0 16 16"
                fill="none"
                className="h-4 w-4 text-primary-foreground"
              >
                <path
                  d="M4 8l3 3 5-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
        </td>

        {/* Name */}
        <td className="px-3 py-2">
          <div className="flex items-center gap-2">
            {expense.isPlanned && (
              <Lightbulb className="h-3.5 w-3.5 shrink-0 text-amber-500" />
            )}
            <span className="font-medium text-foreground truncate max-w-[150px] sm:max-w-none">
              {expense.title}
            </span>
          </div>
          {expense.description && (
            <p className="mt-0.5 max-w-[150px] truncate text-xs text-muted-foreground sm:max-w-[300px]">
              {expense.description}
            </p>
          )}
          {/* Mobile-only: show category inline under name */}
          <div className="mt-1 flex items-center gap-1.5 md:hidden">
            <CategoryIcon className="h-3 w-3 text-muted-foreground" />
            <span className="text-[11px] text-muted-foreground">
              {getCategoryLabel(expense.category)}
            </span>
          </div>
        </td>

        {/* Category - hidden on mobile */}
        <td className="hidden px-3 py-2 md:table-cell">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
            <CategoryIcon className="h-3 w-3" />
            {getCategoryLabel(expense.category)}
          </span>
        </td>

        {/* Date */}
        <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">
          <span className="hidden sm:inline">{formatDate(expense.date)}</span>
          <span className="sm:hidden">{formatDateShort(expense.date)}</span>
        </td>

        {/* Cost */}
        <td className="whitespace-nowrap px-3 py-2 text-right font-medium tabular-nums text-foreground">
          {expense.isPlanned && "~"}$
          {expense.cost.toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}
        </td>

        {/* Added by - hidden on mobile */}
        <td className="hidden whitespace-nowrap px-3 py-2 text-muted-foreground lg:table-cell">
          {expense.user.name}
        </td>

        {/* Votes (wishlist only) — hidden on mobile */}
        {isWishlist && (
          <td className="hidden px-3 py-2 md:table-cell">
            <div className="flex items-center gap-0.5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleVote(1);
                }}
                disabled={isVoting || !currentUserId}
                className={`rounded p-1 transition-colors ${
                  localUserVote === 1
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400"
                }`}
                title="Upvote"
              >
                <ThumbsUp className="h-3.5 w-3.5" />
              </button>
              <span className="min-w-[1.5rem] text-center text-xs font-semibold tabular-nums">
                {localVoteScore}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleVote(-1);
                }}
                disabled={isVoting || !currentUserId}
                className={`rounded p-1 transition-colors ${
                  localUserVote === -1
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400"
                }`}
                title="Downvote"
              >
                <ThumbsDown className="h-3.5 w-3.5" />
              </button>
            </div>
          </td>
        )}

        {/* Comments (wishlist only) — hidden on mobile */}
        {isWishlist && (
          <td className="hidden px-3 py-2 md:table-cell">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              title={isExpanded ? "Hide comments" : "Show comments"}
            >
              <MessageCircle className="h-3 w-3" />
              <span className="tabular-nums">{localComments.length}</span>
              {isExpanded ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </button>
          </td>
        )}

        {/* Actions - hidden on mobile */}
        <td className="hidden px-3 py-2 text-right md:table-cell">
          <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              title="Edit"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              title="Delete"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </td>
      </tr>

      {/* Mobile action row — visible only on small screens when row is selected */}
      {isSelected && (
        <tr className="border-b bg-muted/20 md:hidden">
          <td colSpan={3} className="px-3 py-2">
            <div className="flex items-center gap-2">
              {isWishlist && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVote(1);
                    }}
                    disabled={isVoting || !currentUserId}
                    className={`rounded p-1.5 transition-colors ${
                      localUserVote === 1
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-muted-foreground"
                    }`}
                  >
                    <ThumbsUp className="h-4 w-4" />
                  </button>
                  <span className="min-w-[1.5rem] text-center text-xs font-semibold tabular-nums">
                    {localVoteScore}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVote(-1);
                    }}
                    disabled={isVoting || !currentUserId}
                    className={`rounded p-1.5 transition-colors ${
                      localUserVote === -1
                        ? "text-rose-600 dark:text-rose-400"
                        : "text-muted-foreground"
                    }`}
                  >
                    <ThumbsDown className="h-4 w-4" />
                  </button>
                  <div className="mx-1 h-4 w-px bg-border" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsExpanded(!isExpanded);
                    }}
                    className="inline-flex items-center gap-1 rounded p-1.5 text-muted-foreground"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-xs tabular-nums">
                      {localComments.length}
                    </span>
                  </button>
                  <div className="mx-1 h-4 w-px bg-border" />
                </>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="rounded p-1.5 text-muted-foreground transition-colors hover:text-foreground"
                title="Edit"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="rounded p-1.5 text-muted-foreground transition-colors hover:text-destructive"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </td>
        </tr>
      )}

      {/* Expanded comments row */}
      {isWishlist && isExpanded && (
        <tr className="bg-muted/20">
          <td colSpan={colSpan} className="px-4 py-3 sm:px-6">
            <div className="max-w-2xl space-y-3">
              <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Comments
              </h4>

              {localComments.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No comments yet. Be the first to share your thoughts.
                </p>
              ) : (
                <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
                  {localComments.map((comment) => (
                    <div
                      key={comment.id}
                      className="group/comment flex items-start gap-2 rounded-md bg-background p-2"
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
                          className="shrink-0 rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover/comment:opacity-100"
                          title="Delete comment"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

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
                    title="Post comment"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
