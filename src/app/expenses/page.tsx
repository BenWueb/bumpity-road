import { getExpensesServer } from "@/lib/expenses-server";
import { auth } from "@/utils/auth";
import { prisma } from "@/utils/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import ExpensesContent from "./ExpensesContent";
import { Suspense } from "react";

function ExpensesLoading() {
  return (
    <div className="flex h-full items-center justify-center p-4 md:p-8">
      <div className="text-sm text-muted-foreground md:text-base">
        Loading expenses...
      </div>
    </div>
  );
}

async function ExpensesPageContent() {
  const session = await auth.api.getSession({
    headers: await headers(),
    asResponse: false,
  });

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Check if user is admin
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isAdmin: true },
  });

  if (!user?.isAdmin) {
    redirect("/");
  }

  const expenses = await getExpensesServer();

  // Enrich with user-specific vote info
  const userId = session.user.id;
  const enriched = expenses.map((e) => ({
    ...e,
    userVote: userId
      ? e.votes.find((v) => v.userId === userId)?.value ?? null
      : null,
  }));

  return (
    <ExpensesContent initialExpenses={enriched} currentUserId={userId} />
  );
}

export default function ExpensesPage() {
  return (
    <Suspense fallback={<ExpensesLoading />}>
      <ExpensesPageContent />
    </Suspense>
  );
}
