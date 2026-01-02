import {
  Camera,
  CheckCircle2,
  Circle,
  Clock,
  ListTodo,
  NotebookPen,
  TentTree,
} from "lucide-react";
import { AccountCard } from "./AccountCard";

type Props = {
  postsCount: number;
  adventuresCount: number;
  photosCount: number;
  todoCount: number;
  inProgressCount: number;
  doneCount: number;
};

export function ActivityOverviewCard({
  postsCount,
  adventuresCount,
  photosCount,
  todoCount,
  inProgressCount,
  doneCount,
}: Props) {
  return (
    <AccountCard
      gradientClassName="bg-gradient-to-br from-emerald-50 via-background to-teal-50 dark:from-emerald-950/30 dark:via-background dark:to-teal-950/20"
    >
      <div className="relative p-4 md:p-6">
        <div className="flex items-center gap-2">
          <ListTodo className="h-4 w-4 text-muted-foreground md:h-5 md:w-5" />
          <h3 className="text-sm font-semibold md:text-base">
            Activity Overview
          </h3>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-3  md:mt-4 md:gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-violet-600 dark:text-violet-400 md:text-3xl">
              {postsCount}
            </div>
            <div className="mt-0.5 flex items-center justify-center gap-1 text-[10px] text-muted-foreground md:mt-1 md:text-xs">
              <NotebookPen className="h-3 w-3" />
              Blog Posts
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 md:text-3xl">
              {adventuresCount}
            </div>
            <div className="mt-0.5 flex items-center justify-center gap-1 text-[10px] text-muted-foreground md:mt-1 md:text-xs">
              <TentTree className="h-3 w-3" />
              Adventures
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 md:text-3xl">
              {photosCount}
            </div>
            <div className="mt-0.5 flex items-center justify-center gap-1 text-[10px] text-muted-foreground md:mt-1 md:text-xs">
              <Camera className="h-3 w-3" />
              Photos
            </div>
          </div>
        </div>
        <div className="mt-3 border-t pt-3 md:mt-4 md:pt-4">
          <div className="grid grid-cols-3 gap-1 md:gap-2">
            <div className="text-center">
              <div className="text-lg font-bold text-slate-600 dark:text-slate-400 md:text-xl">
                {todoCount}
              </div>
              <div className="mt-0.5 flex items-center justify-center gap-0.5 text-[10px] text-muted-foreground md:gap-1 md:text-xs">
                <Circle className="h-2.5 w-2.5 md:h-3 md:w-3" />
                To Do
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400 md:text-xl">
                {inProgressCount}
              </div>
              <div className="mt-0.5 flex items-center justify-center gap-0.5 text-[10px] text-muted-foreground md:gap-1 md:text-xs">
                <Clock className="h-2.5 w-2.5 md:h-3 md:w-3" />
                In Progress
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 md:text-xl">
                {doneCount}
              </div>
              <div className="mt-0.5 flex items-center justify-center gap-0.5 text-[10px] text-muted-foreground md:gap-1 md:text-xs">
                <CheckCircle2 className="h-2.5 w-2.5 md:h-3 md:w-3" />
                Done
              </div>
            </div>
          </div>
        </div>
      </div>
    </AccountCard>
  );
}


