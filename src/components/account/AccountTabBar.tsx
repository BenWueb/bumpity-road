"use client";

import { ACCOUNT_TABS, type AccountTab } from "@/lib/account-tabs";

type Props = {
  activeTab: AccountTab;
  onTabChange: (tab: AccountTab) => void;
};

export function AccountTabBar({ activeTab, onTabChange }: Props) {
  return (
    <div className="overflow-x-auto pb-1">
      <div
        className="flex min-w-max gap-1 rounded-lg border bg-muted/40 p-1"
        role="tablist"
        aria-label="Account sections"
      >
        {ACCOUNT_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onTabChange(tab.id)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors md:px-4 md:py-2 md:text-sm ${
                isActive
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-background/60 hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
