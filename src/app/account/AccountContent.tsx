"use client";

import { authClient } from "@/lib/auth-client";
import { Todo } from "@/types/todo";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { emitBadgesEarned } from "@/utils/badges-client";
import type {
  AccountAdventure,
  AccountFeedback,
  AccountFishObservation,
  AccountGalleryImage,
  AccountLoonObservation,
  AccountPost,
  AccountUser,
} from "@/types/account";
import type { BadgeProgressStats } from "@/lib/badge-progress";
import type { AccountTab } from "@/lib/account-tabs";
import { FeedbackAdminCard } from "@/components/account/FeedbackAdminCard";
import { ProfileCard } from "@/components/account/ProfileCard";
import { ActivityOverviewCard } from "@/components/account/ActivityOverviewCard";
import { TasksCard } from "@/components/account/TasksCard";
import { BlogPostsCard } from "@/components/account/BlogPostsCard";
import { AdventuresCard } from "@/components/account/AdventuresCard";
import { GalleryPhotosCard } from "@/components/account/GalleryPhotosCard";
import { PuzzlesCard } from "@/components/account/PuzzlesCard";
import { LoonObservationsCard } from "@/components/account/LoonObservationsCard";
import { FishObservationsCard } from "@/components/account/FishObservationsCard";
import { BadgesSection } from "@/components/account/BadgesSection";
import { MyFeedbackCard } from "@/components/account/MyFeedbackCard";
import { AccountTabBar } from "@/components/account/AccountTabBar";

type Props = {
  user: AccountUser;
  todos: Todo[];
  posts: AccountPost[];
  adventures: AccountAdventure[];
  galleryImages: AccountGalleryImage[];
  loonObservations: AccountLoonObservation[];
  fishObservations: AccountFishObservation[];
  userFeedback: AccountFeedback[];
  feedback: AccountFeedback[];
  badgeProgress: BadgeProgressStats;
  puzzlesCount: number;
  newMembershipBadges?: string[];
};

export function AccountContent({
  user: initialUser,
  todos: initialTodos,
  posts,
  adventures,
  galleryImages,
  loonObservations,
  fishObservations,
  userFeedback,
  feedback: initialFeedback,
  badgeProgress,
  puzzlesCount,
  newMembershipBadges,
}: Props) {
  const router = useRouter();
  const [user, setUser] = useState(initialUser);
  const [loggingOut, setLoggingOut] = useState(false);
  const [feedback, setFeedback] = useState(initialFeedback);
  const [activeTab, setActiveTab] = useState<AccountTab>("overview");
  const [createdExpanded, setCreatedExpanded] = useState(false);
  const [assignedExpanded, setAssignedExpanded] = useState(false);

  useEffect(() => {
    emitBadgesEarned(newMembershipBadges);
  }, [newMembershipBadges]);

  const tasksCreated = initialTodos.filter((t) => t.userId === user.id);
  const tasksAssigned = initialTodos.filter(
    (t) => t.assignedTo?.id === user.id && t.userId !== user.id,
  );

  const todosByStatus = {
    todo: initialTodos.filter((t) => t.status === "todo"),
    in_progress: initialTodos.filter((t) => t.status === "in_progress"),
    done: initialTodos.filter((t) => t.status === "done"),
  };

  const createdDate = new Date(user.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await authClient.signOut();
      router.push("/");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  function handleUserUpdate(updates: { name?: string; image?: string | null }) {
    setUser((prev) => ({
      ...prev,
      ...updates,
    }));
    router.refresh();
  }

  function handleNavigateTab(tab: AccountTab) {
    setActiveTab(tab);
  }

  async function handleUpdateFeedbackStatus(id: string, status: string) {
    const prev = feedback;
    setFeedback((f) =>
      f.map((item) => (item.id === id ? { ...item, status } : item)),
    );

    try {
      const res = await fetch("/api/feedback", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) {
        setFeedback(prev);
      }
    } catch {
      setFeedback(prev);
    }
  }

  async function handleDeleteFeedback(id: string) {
    if (!confirm("Delete this feedback?")) return;

    const prev = feedback;
    setFeedback((f) => f.filter((item) => item.id !== id));

    try {
      const res = await fetch(`/api/feedback?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        setFeedback(prev);
      }
    } catch {
      setFeedback(prev);
    }
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mx-auto max-w-4xl space-y-6 md:space-y-8">
        <div>
          <h1 className="text-xl font-bold md:text-2xl">Account</h1>
          <p className="text-sm text-muted-foreground md:text-base">
            Your profile, activity, and cabin contributions
          </p>
        </div>

        <AccountTabBar activeTab={activeTab} onTabChange={setActiveTab} />

        <BadgesSection
          badges={user.badges ?? []}
          progressStats={badgeProgress}
        />

        {activeTab === "overview" && (
          <div className="space-y-6 md:space-y-8">
            <div className="grid gap-4 md:grid-cols-2 md:gap-6">
              <ProfileCard
                user={user}
                createdDate={createdDate}
                loggingOut={loggingOut}
                onLogout={handleLogout}
                onUserUpdate={handleUserUpdate}
              />
              <ActivityOverviewCard
                postsCount={posts.length}
                adventuresCount={adventures.length}
                photosCount={galleryImages.length}
                loonObservationsCount={loonObservations.length}
                fishObservationsCount={fishObservations.length}
                puzzlesCount={puzzlesCount}
                todoCount={todosByStatus.todo.length}
                inProgressCount={todosByStatus.in_progress.length}
                doneCount={todosByStatus.done.length}
                onNavigate={handleNavigateTab}
              />
            </div>

            <MyFeedbackCard feedback={userFeedback} />

            {user.isBugAdmin && (
              <FeedbackAdminCard
                feedback={feedback}
                onUpdateStatus={handleUpdateFeedbackStatus}
                onDelete={handleDeleteFeedback}
              />
            )}
          </div>
        )}

        {activeTab === "tasks" && (
          <TasksCard
            todos={initialTodos}
            tasksCreated={tasksCreated}
            tasksAssigned={tasksAssigned}
            createdExpanded={createdExpanded}
            assignedExpanded={assignedExpanded}
            onToggleCreated={() => setCreatedExpanded(!createdExpanded)}
            onToggleAssigned={() => setAssignedExpanded(!assignedExpanded)}
            userId={user.id}
          />
        )}

        {activeTab === "content" && (
          <div className="space-y-6 md:space-y-8">
            <BlogPostsCard posts={posts} />
            <AdventuresCard adventures={adventures} />
            <GalleryPhotosCard galleryImages={galleryImages} />
          </div>
        )}

        {activeTab === "wildlife" && (
          <div className="space-y-6 md:space-y-8">
            <LoonObservationsCard loonObservations={loonObservations} />
            <FishObservationsCard fishObservations={fishObservations} />
          </div>
        )}

        {activeTab === "puzzles" && <PuzzlesCard />}
      </div>
    </div>
  );
}
