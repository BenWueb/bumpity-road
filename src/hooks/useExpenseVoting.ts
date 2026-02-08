import { useState } from "react";

interface UseExpenseVotingProps {
  expenseId: string;
  initialVoteScore: number;
  initialUserVote: number | null;
  currentUserId?: string;
}

export function useExpenseVoting({
  expenseId,
  initialVoteScore,
  initialUserVote,
  currentUserId,
}: UseExpenseVotingProps) {
  const [localVoteScore, setLocalVoteScore] = useState(initialVoteScore);
  const [localUserVote, setLocalUserVote] = useState(initialUserVote);
  const [isVoting, setIsVoting] = useState(false);

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
        body: JSON.stringify({ expenseId, value }),
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

  return {
    localVoteScore,
    localUserVote,
    isVoting,
    handleVote,
  };
}
