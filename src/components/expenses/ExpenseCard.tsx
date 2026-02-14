"use client";

import { useState } from "react";
import { Expense, ExpenseComment } from "@/types/expense";
import {
  Edit2,
  Trash2,
  User,
  ChevronDown,
  ChevronUp,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Send,
  X,
  Lightbulb,
} from "lucide-react";
import { getCategoryGradient, formatExpenseDate, getCategoryLabel, getSubcategoryLabel, getCategoryIcon } from "@/lib/expense-utils";
import { ExpenseCategoryBadge } from "./ExpenseCategoryBadge";
import { useExpenseVoting } from "@/hooks/useExpenseVoting";
import { useExpenseComments } from "@/hooks/useExpenseComments";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import ExpenseForm from "./ExpenseForm";
import { CldImage } from "next-cloudinary";

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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { localVoteScore, localUserVote, isVoting, handleVote } = useExpenseVoting({
    expenseId: expense.id,
    initialVoteScore: expense.voteScore,
    initialUserVote: expense.userVote,
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
    initialComments: expense.comments,
    currentUserId,
  });

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


  if (isEditing) {
    return (
      <ExpenseForm
        expense={expense}
        onExpenseUpdated={handleExpenseUpdated}
        onCancel={handleCancelEdit}
      />
    );
  }

  const CategoryIcon = getCategoryIcon(expense.category);

  return (
    <div
      className={`w-full rounded-lg border shadow-sm flex flex-col ${getCategoryGradient(
        expense.category
      )}`}
    >
      {/* Collapsed view - always visible */}
      <div
        className="cursor-pointer p-3 transition-colors hover:bg-muted/50 flex-1 flex flex-col"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2">
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
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-1.5">
                {expense.isPlanned && (
                  <Lightbulb className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                )}
                <h4 className="truncate text-sm font-medium text-foreground">
                  {expense.title}
                </h4>
              </div>
              <ExpenseCategoryBadge
                category={expense.category}
                variant="default"
                className="w-fit text-[10px]"
              />
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-0.5">
            <span className="whitespace-nowrap text-xs font-semibold text-foreground">
              {expense.isPlanned && "~"}${expense.cost.toLocaleString()}
            </span>
            {expense.date && (
              <span className="whitespace-nowrap text-[10px] text-muted-foreground">
                {formatExpenseDate(expense.date)}
              </span>
            )}
          </div>
        </div>

        {/* Vote score & comment count (always visible for planned, hidden on mobile) */}
        {expense.isPlanned && (
          <div className="mt-1.5 hidden items-center gap-3 pl-7 text-[10px] text-muted-foreground md:flex">
            <span className="flex items-center gap-0.5">
              <ThumbsUp className="h-2.5 w-2.5" />
              {localVoteScore}
            </span>
            <span className="flex items-center gap-0.5">
              <MessageCircle className="h-2.5 w-2.5" />
              {localComments.length}
            </span>
          </div>
        )}
      </div>

      {/* Expanded view */}
      {isExpanded && (
        <div className="space-y-3 border-t p-4">
          {/* Category and Subcategory */}
          <ExpenseCategoryBadge
            category={expense.category}
            subcategory={expense.subcategory}
            variant="default"
          />

          {expense.description && (
            <p className="text-sm text-muted-foreground">
              {expense.description}
            </p>
          )}

          {/* Check number & paid status (only for incurred expenses) */}
          {!expense.isPlanned && (
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium ${
                  expense.isPaid
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                    : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                }`}
              >
                {expense.isPaid ? "Paid" : "Unpaid"}
              </span>
              {expense.checkNumber && (
                <span className="text-muted-foreground">
                  Check #{expense.checkNumber}
                </span>
              )}
            </div>
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
                            {formatExpenseDate(comment.createdAt)}
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
