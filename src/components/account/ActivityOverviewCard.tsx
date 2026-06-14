"use client";

import {
  Origami,
  Camera,
  CheckCircle2,
  Circle,
  Clock,
  Fish,
  ListTodo,
  NotebookPen,
  Puzzle,
  TentTree,
} from "lucide-react";
import { AccountCard } from "./AccountCard";
import { CARD_GRADIENTS } from "@/lib/ui-gradients";
import type { ActivityNavTarget } from "@/lib/account-tabs";

type Props = {
  postsCount: number;
  adventuresCount: number;
  photosCount: number;
  loonObservationsCount: number;
  fishObservationsCount: number;
  puzzlesCount: number;
  todoCount: number;
  inProgressCount: number;
  doneCount: number;
  onNavigate: (target: ActivityNavTarget) => void;
};

function StatButton({
  onClick,
  count,
  label,
  icon,
  countClassName,
}: {
  onClick: () => void;
  count: number | string;
  label: string;
  icon: React.ReactNode;
  countClassName: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg p-1 text-center transition-colors hover:bg-accent/60"
    >
      <div className={`text-2xl font-bold md:text-3xl ${countClassName}`}>
        {count}
      </div>
      <div className="mt-0.5 flex items-center justify-center gap-1 text-[10px] text-muted-foreground md:mt-1 md:text-xs">
        {icon}
        {label}
      </div>
    </button>
  );
}

export function ActivityOverviewCard({
  postsCount,
  adventuresCount,
  photosCount,
  loonObservationsCount,
  fishObservationsCount,
  puzzlesCount,
  todoCount,
  inProgressCount,
  doneCount,
  onNavigate,
}: Props) {
  return (
    <AccountCard gradientClassName={CARD_GRADIENTS.emerald}>
      <div className="relative p-4 md:p-6">
        <div className="flex items-center gap-2">
          <ListTodo className="h-4 w-4 text-muted-foreground md:h-5 md:w-5" />
          <h3 className="text-sm font-semibold md:text-lg">
            Activity Overview
          </h3>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-1 md:mt-4 md:gap-2">
          <StatButton
            onClick={() => onNavigate("content")}
            count={postsCount}
            label="Blog Posts"
            icon={<NotebookPen className="h-3 w-3" />}
            countClassName="text-violet-600 dark:text-violet-400"
          />
          <StatButton
            onClick={() => onNavigate("content")}
            count={adventuresCount}
            label="Adventures"
            icon={<TentTree className="h-3 w-3" />}
            countClassName="text-emerald-600 dark:text-emerald-400"
          />
          <StatButton
            onClick={() => onNavigate("content")}
            count={photosCount}
            label="Photos"
            icon={<Camera className="h-3 w-3" />}
            countClassName="text-rose-600 dark:text-rose-400"
          />
          <StatButton
            onClick={() => onNavigate("wildlife")}
            count={loonObservationsCount}
            label="Loons"
            icon={<Origami className="h-3 w-3" />}
            countClassName="text-sky-600 dark:text-sky-400"
          />
          <StatButton
            onClick={() => onNavigate("wildlife")}
            count={fishObservationsCount}
            label="Fish"
            icon={<Fish className="h-3 w-3" />}
            countClassName="text-cyan-600 dark:text-cyan-400"
          />
          <StatButton
            onClick={() => onNavigate("puzzles")}
            count={puzzlesCount}
            label="Puzzles"
            icon={<Puzzle className="h-3 w-3" />}
            countClassName="text-amber-600 dark:text-amber-400"
          />
        </div>
        <div className="mt-3 border-t pt-3 md:mt-4 md:pt-4">
          <div className="grid grid-cols-3 gap-1 md:gap-2">
            <StatButton
              onClick={() => onNavigate("tasks")}
              count={todoCount}
              label="To Do"
              icon={<Circle className="h-2.5 w-2.5 md:h-3 md:w-3" />}
              countClassName="text-lg text-slate-600 dark:text-slate-400 md:text-xl"
            />
            <StatButton
              onClick={() => onNavigate("tasks")}
              count={inProgressCount}
              label="In Progress"
              icon={<Clock className="h-2.5 w-2.5 md:h-3 md:w-3" />}
              countClassName="text-lg text-blue-600 dark:text-blue-400 md:text-xl"
            />
            <StatButton
              onClick={() => onNavigate("tasks")}
              count={doneCount}
              label="Done"
              icon={<CheckCircle2 className="h-2.5 w-2.5 md:h-3 md:w-3" />}
              countClassName="text-lg text-emerald-600 dark:text-emerald-400 md:text-xl"
            />
          </div>
        </div>
      </div>
    </AccountCard>
  );
}
