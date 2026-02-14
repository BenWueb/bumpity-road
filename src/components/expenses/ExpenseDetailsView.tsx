"use client";

import { useState, useMemo } from "react";
import { Expense, ExpenseComment } from "@/types/expense";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Edit2,
  Trash2,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Lightbulb,
  Send,
  X,
  ChevronUp,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { formatExpenseDate, formatExpenseDateShort, getCategoryLabel, getSubcategoryLabel, getCategoryIcon } from "@/lib/expense-utils";
import type { LucideIcon } from "lucide-react";
import { ExpenseCategoryBadge } from "./ExpenseCategoryBadge";
import { useExpenseVoting } from "@/hooks/useExpenseVoting";
import { useExpenseComments } from "@/hooks/useExpenseComments";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Modal } from "@/components/ui/Modal";
import ExpenseForm from "./ExpenseForm";
import { CldImage } from "next-cloudinary";

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

  // Column count: Name, Category, Date, Cost, [Receipt for incurred], Added by, [Votes/Comments for wishlist], Actions
  const totalColumns = isWishlist ? 8 : 7;

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
          return dir * ((a.voteScore ?? 0) - (b.voteScore ?? 0));
        case "comments":
          return dir * ((a.comments?.length ?? 0) - (b.comments?.length ?? 0));
        default:
          return 0;
      }
    });
  }, [expenses, sortField, sortDir]);

  const handleDelete = async (expense: Expense) => {
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
              <SortHeader field="title" label="Name" className="min-w-[120px] md:min-w-[200px]" />
              {/* Category - hidden on mobile */}
              <SortHeader field="category" label="Category" className="hidden md:table-cell" />
              <SortHeader field="date" label="Date" />
              <SortHeader
                field="cost"
                label={isWishlist ? "Est." : "Cost"}
                className="text-right"
              />
              {/* Receipt - only for incurred expenses, hidden on mobile */}
              {!isWishlist && (
                <th className="hidden w-16 px-3 py-2 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground md:table-cell">
                  Receipt
                </th>
              )}
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
              {/* Actions - hidden on mobile */}
              <th className="hidden w-20 px-3 py-2 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground md:table-cell">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {sorted.map((expense) => {
              const CategoryIcon = getCategoryIcon(expense.category);

              return (
                <ExpenseRow
                  key={expense.id}
                  expense={expense}
                  currentUserId={currentUserId}
                  isWishlist={isWishlist}
                  colSpan={totalColumns}
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

// --- Row component with per-row state for wishlist voting/comments ---
function ExpenseRow({
  expense,
  currentUserId,
  isWishlist,
  colSpan,
  onEdit,
  onDelete,
  onExpenseUpdated,
  CategoryIcon,
}: {
  expense: Expense;
  currentUserId?: string;
  isWishlist: boolean;
  colSpan: number;
  onEdit: () => void;
  onDelete: () => void;
  onExpenseUpdated: (expense: Expense) => void;
  CategoryIcon: LucideIcon;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMobileModal, setShowMobileModal] = useState(false);

  const { localVoteScore, localUserVote, isVoting, handleVote } = useExpenseVoting({
    expenseId: expense.id,
    initialVoteScore: expense.voteScore ?? 0,
    initialUserVote: expense.userVote ?? null,
    currentUserId,
  });

  const {
    localComments,
    commentText,
    setCommentText,
    isSubmittingComment,
    handleAddComment,
    handleDeleteComment,
  } = useExpenseComments({
    expenseId: expense.id,
    initialComments: expense.comments ?? [],
    currentUserId,
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteWithConfirm = async () => {
    setIsDeleting(true);
    try {
      await onDelete();
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };


  const [isDesktopExpanded, setIsDesktopExpanded] = useState(false);

  return (
    <>
      <tr
        className="group cursor-pointer transition-colors hover:bg-muted/30"
        onClick={(e) => {
          if (window.innerWidth < 768) {
            e.stopPropagation();
            setShowMobileModal(true);
          } else {
            // Toggle expand on desktop
            setIsDesktopExpanded((prev) => !prev);
          }
        }}
      >
        {/* Name */}
        <td className="px-3 py-2">
          <div className="flex items-center gap-2">
            <ChevronRight
              className={`hidden h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-200 md:block ${
                isDesktopExpanded ? "rotate-90" : ""
              }`}
            />
            {expense.isPlanned && (
              <Lightbulb className="h-3.5 w-3.5 shrink-0 text-amber-500" />
            )}
            <span className="max-w-[150px] truncate font-medium text-foreground sm:max-w-none">
              {expense.title}
            </span>
          </div>
        </td>

        {/* Category - hidden on mobile */}
        <td className="hidden px-3 py-2 md:table-cell">
          <div className="flex flex-wrap items-center gap-1.5">
            <ExpenseCategoryBadge
              category={expense.category}
              subcategory={expense.subcategory}
              variant="default"
            />
          </div>
        </td>

        {/* Date */}
        <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">
          <span className="hidden sm:inline">{formatExpenseDate(expense.date)}</span>
          <span className="sm:hidden">{formatExpenseDateShort(expense.date)}</span>
        </td>

        {/* Cost */}
        <td className="whitespace-nowrap px-3 py-2 text-right font-medium tabular-nums text-foreground">
          {expense.isPlanned && "~"}$
          {expense.cost.toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}
        </td>

        {/* Receipt - only for incurred expenses, hidden on mobile */}
        {!expense.isPlanned && (
          <td className="hidden px-3 py-2 text-center md:table-cell">
            {expense.receiptImageUrl && expense.receiptImagePublicId ? (
              <div className="relative inline-block">
                <CldImage
                  src={expense.receiptImagePublicId}
                  alt="Receipt"
                  width={100}
                  height={100}
                  className="h-12 w-12 cursor-pointer rounded border object-cover transition-opacity hover:opacity-80"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Open receipt in new tab/window
                    window.open(expense.receiptImageUrl || "", "_blank");
                  }}
                />
              </div>
            ) : (
              <span className="text-muted-foreground/50">—</span>
            )}
          </td>
        )}

        {/* Added by - hidden on mobile */}
        <td className="hidden whitespace-nowrap px-3 py-2 text-muted-foreground lg:table-cell">
          {expense.user.name}
        </td>

        {/* Votes (wishlist only) — hidden on mobile */}
        {isWishlist && (
          <td className="hidden px-3 py-2 md:table-cell">
            <div className="flex items-center gap-0.5">
              <button
                onClick={(e) => { e.stopPropagation(); handleVote(1); }}
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
              <span className="min-w-6 text-center text-xs font-semibold tabular-nums">
                {localVoteScore}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); handleVote(-1); }}
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
              onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
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
                setShowDeleteConfirm(true);
              }}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              title="Delete"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </td>
      </tr>

      {/* Desktop expanded details */}
      {isDesktopExpanded && (
        <tr className="hidden border-t border-dashed border-border/50 bg-muted/20 md:table-row">
          <td colSpan={colSpan} className="px-6 py-4">
            <div className="flex gap-6">
              {/* Left: Description & details */}
              <div className="min-w-0 flex-1 space-y-3">
                {expense.description && (
                  <div>
                    <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      Description
                    </span>
                    <p className="mt-1 text-sm text-foreground">
                      {expense.description}
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                  <div>
                    <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      Added by
                    </span>
                    <p className="mt-0.5 font-medium text-foreground">{expense.user.name}</p>
                  </div>
                  <div>
                    <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      Date
                    </span>
                    <p className="mt-0.5 font-medium text-foreground">
                      {formatExpenseDate(expense.date)}
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      Cost
                    </span>
                    <p className="mt-0.5 font-medium text-foreground">
                      {expense.isPlanned && "~"}$
                      {expense.cost.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  {!expense.isPlanned && (
                    <div>
                      <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                        Status
                      </span>
                      <p className="mt-0.5">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            expense.isPaid
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                              : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                          }`}
                        >
                          {expense.isPaid ? "Paid" : "Unpaid"}
                        </span>
                      </p>
                    </div>
                  )}
                  {!expense.isPlanned && expense.checkNumber && (
                    <div>
                      <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                        Check #
                      </span>
                      <p className="mt-0.5 font-medium text-foreground">{expense.checkNumber}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit();
                    }}
                    className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteConfirm(true);
                    }}
                    className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </div>

              {/* Right: Receipt thumbnail */}
              {!expense.isPlanned && expense.receiptImageUrl && expense.receiptImagePublicId && (
                <div className="shrink-0">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Receipt
                  </span>
                  <div className="mt-1">
                    <CldImage
                      src={expense.receiptImagePublicId}
                      alt="Receipt"
                      width={200}
                      height={200}
                      className="h-24 w-24 cursor-pointer rounded-md border object-cover transition-opacity hover:opacity-80"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(expense.receiptImageUrl || "", "_blank");
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}

      {/* Mobile Modal */}
      <Modal
        isOpen={showMobileModal}
        onClose={() => setShowMobileModal(false)}
        title={expense.title}
        panelClassName="w-full max-w-md rounded-xl border bg-background p-4 shadow-xl md:p-6 max-h-[90vh] overflow-y-auto"
      >
        <div className="space-y-4">
          {/* Category and Subcategory */}
          <div className="flex flex-wrap items-center gap-1.5">
            <ExpenseCategoryBadge
              category={expense.category}
              subcategory={expense.subcategory}
              variant="default"
            />
          </div>

          {/* Description */}
          {expense.description && (
            <p className="text-sm text-muted-foreground">
              {expense.description}
            </p>
          )}

          {/* Receipt image (only for incurred expenses) */}
          {!expense.isPlanned && expense.receiptImageUrl && expense.receiptImagePublicId && (
            <div className="relative rounded-md border bg-muted/30 p-2">
              <CldImage
                src={expense.receiptImagePublicId}
                alt="Receipt"
                width={800}
                height={600}
                className="h-auto w-full rounded-md object-contain"
              />
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 border-t pt-4">
            <div>
              <span className="text-xs text-muted-foreground">Date</span>
              <p className="text-sm font-medium">
                {expense.date ? formatExpenseDate(expense.date) : "—"}
              </p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Cost</span>
              <p className="text-sm font-medium">
                {expense.isPlanned && "~"}${expense.cost.toLocaleString(undefined, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Added by</span>
              <p className="text-sm font-medium">{expense.user.name}</p>
            </div>
            {!expense.isPlanned && (
              <div>
                <span className="text-xs text-muted-foreground">Status</span>
                <p className="text-sm font-medium">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      expense.isPaid
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                    }`}
                  >
                    {expense.isPaid ? "Paid" : "Unpaid"}
                  </span>
                </p>
              </div>
            )}
            {!expense.isPlanned && expense.checkNumber && (
              <div>
                <span className="text-xs text-muted-foreground">Check #</span>
                <p className="text-sm font-medium">{expense.checkNumber}</p>
              </div>
            )}
            {isWishlist && (
              <>
                <div>
                  <span className="text-xs text-muted-foreground">Votes</span>
                  <p className="text-sm font-medium">{localVoteScore}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Comments</span>
                  <p className="text-sm font-medium">{localComments.length}</p>
                </div>
              </>
            )}
          </div>

          {/* Voting (only for planned expenses) */}
          {isWishlist && currentUserId && (
            <div className="flex items-center justify-center gap-2 border-t pt-4">
              <button
                onClick={() => handleVote(1)}
                disabled={isVoting}
                className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  localUserVote === 1
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                <ThumbsUp className="h-3.5 w-3.5" />
                Upvote
              </button>
              <span className="min-w-6 text-center text-sm font-semibold">
                {localVoteScore}
              </span>
              <button
                onClick={() => handleVote(-1)}
                disabled={isVoting}
                className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
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
          {isWishlist && (
            <div className="border-t pt-4">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Comments ({localComments.length})
                </h4>
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  {isExpanded ? "Hide" : "Show"}
                </button>
              </div>

              {isExpanded && (
                <div className="space-y-2">
                  {localComments.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      No comments yet. Be the first to share your thoughts.
                    </p>
                  ) : (
                    <div className="max-h-48 space-y-2 overflow-y-auto">
                      {localComments.map((comment) => (
                        <div
                          key={comment.id}
                          className="group/comment flex items-start gap-2 rounded-md bg-muted/50 p-2"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-foreground">
                                {comment.user.name}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                {formatExpenseDate(comment.createdAt)}
                              </span>
                            </div>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {comment.content}
                            </p>
                          </div>
                          {currentUserId === comment.userId && (
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="shrink-0 rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover/comment:opacity-100"
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
                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="text"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
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
                        onClick={handleAddComment}
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

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 border-t pt-4">
            <button
              onClick={() => {
                setShowMobileModal(false);
                onEdit();
              }}
              className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <Edit2 className="h-4 w-4" />
              Edit
            </button>
            <button
              onClick={() => {
                setShowMobileModal(false);
                setShowDeleteConfirm(true);
              }}
              className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        </div>
      </Modal>

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
                                {formatExpenseDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {comment.content}
                        </p>
                      </div>
                      {currentUserId === comment.userId && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
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
                    onClick={handleAddComment}
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

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteWithConfirm}
        title="Delete expense"
        message={`Are you sure you want to delete "${expense.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  );
}
