"use client";

import { Award } from "lucide-react";
import { useEffect, useState } from "react";
import {
  OG_BADGE_QUESTION,
  PENDING_BADGE_ANSWER_KEY,
  savePendingBadgeAnswer,
} from "@/lib/og-badge-client";

export function useOgBadgeAnswer() {
  const [secretAnswer, setSecretAnswer] = useState("");
  const [showSecretField, setShowSecretField] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(PENDING_BADGE_ANSWER_KEY);
    if (stored) {
      setSecretAnswer(stored);
      setShowSecretField(true);
    }
  }, []);

  function persistPendingAnswer() {
    savePendingBadgeAnswer(secretAnswer);
  }

  return {
    secretAnswer,
    setSecretAnswer,
    showSecretField,
    setShowSecretField,
    persistPendingAnswer,
  };
}

type Props = {
  secretAnswer: string;
  onSecretAnswerChange: (value: string) => void;
  showSecretField: boolean;
  onToggleShow: () => void;
  className?: string;
};

export function OgBadgeQuestionSection({
  secretAnswer,
  onSecretAnswerChange,
  showSecretField,
  onToggleShow,
  className = "mt-4",
}: Props) {
  return (
    <div
      className={`rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/30 ${className}`}
    >
      <button
        type="button"
        onClick={onToggleShow}
        className="flex w-full items-center gap-2 text-left text-sm font-medium text-amber-800 dark:text-amber-200"
      >
        <Award className="h-4 w-4" />
        <span>Earn the OG Badge</span>
        <span className="ml-auto text-xs text-amber-600 dark:text-amber-400">
          {showSecretField ? "▲" : "▼"}
        </span>
      </button>
      {showSecretField && (
        <div className="mt-3">
          <label className="block text-xs text-amber-700 dark:text-amber-300">
            {OG_BADGE_QUESTION}
          </label>
          <input
            type="text"
            value={secretAnswer}
            onChange={(e) => onSecretAnswerChange(e.target.value)}
            placeholder="Your answer..."
            className="mt-1 w-full rounded-md border border-amber-300 bg-white px-3 py-2 text-sm placeholder:text-amber-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-amber-700 dark:bg-amber-900/30 dark:placeholder:text-amber-600"
          />
        </div>
      )}
    </div>
  );
}
