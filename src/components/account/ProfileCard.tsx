import { Calendar, Mail } from "lucide-react";
import { AccountCard } from "./AccountCard";
import type { AccountUser } from "@/types/account";

type Props = {
  user: AccountUser;
  createdDate: string;
};

export function ProfileCard({ user, createdDate }: Props) {
  return (
    <AccountCard
      gradientClassName="bg-gradient-to-br from-violet-50 via-background to-purple-50 dark:from-violet-950/30 dark:via-background dark:to-purple-950/20"
    >
      <div className="relative p-4 md:p-6">
        <div className="flex items-center gap-3  md:gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 bg-gradient-to-br from-violet-100 to-purple-100 text-lg font-bold text-violet-600 dark:from-violet-900/50 dark:to-purple-900/50 dark:text-violet-300 md:h-16 md:w-16 md:text-2xl">
            {user.name?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-lg font-semibold md:text-xl">
              {user.name}
            </h2>
            <div className="mt-1 space-y-0.5 md:mt-2 md:space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground md:text-sm">
                <Mail className="h-3.5 w-3.5 shrink-0 md:h-4 md:w-4" />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground md:text-sm">
                <Calendar className="h-3.5 w-3.5 shrink-0 md:h-4 md:w-4" />
                <span>Joined {createdDate}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AccountCard>
  );
}


