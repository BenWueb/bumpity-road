import { Suspense } from "react";
import { getPuzzleData } from "@/lib/puzzle-server";
import { PuzzleList } from "@/components/puzzles";

function PuzzleSkeleton() {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="text-muted-foreground">Loading puzzles...</div>
    </div>
  );
}

async function PuzzleContent() {
  const { entries, isAdmin, currentUserId } = await getPuzzleData();
  return (
    <PuzzleList
      initialEntries={entries}
      initialIsAdmin={isAdmin}
      currentUserId={currentUserId}
    />
  );
}

export default function PuzzlePage() {
  return (
    <Suspense fallback={<PuzzleSkeleton />}>
      <PuzzleContent />
    </Suspense>
  );
}
