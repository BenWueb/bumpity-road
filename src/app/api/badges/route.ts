import { auth } from "@/utils/auth";
import { prisma } from "@/utils/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// Normalize answer: uppercase, remove punctuation and spaces
function normalizeAnswer(answer: string): string {
  return answer.toUpperCase().replace(/[^A-Z0-9]/g, ""); // Keep only letters and numbers
}

// Secret questions and their normalized answers
// Add more questions/badges here as needed
const BADGE_SECRETS: Record<string, { question: string; answer: string }> = {
  OG: {
    question: "What are you supposed to yell when turning off of Cty Rd 5?",
    answer: normalizeAnswer("BUMPITYROAD"), // Change this to your actual answer
  },
};

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
    asResponse: false,
  });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { badge, answer } = await req.json();

  if (!badge || !answer) {
    return NextResponse.json(
      { error: "Badge and answer are required" },
      { status: 400 }
    );
  }

  const badgeConfig = BADGE_SECRETS[badge];
  if (!badgeConfig) {
    return NextResponse.json({ error: "Invalid badge" }, { status: 400 });
  }

  // Check if answer is correct
  const normalizedUserAnswer = normalizeAnswer(answer);
  if (normalizedUserAnswer !== badgeConfig.answer) {
    return NextResponse.json({ error: "Incorrect answer" }, { status: 400 });
  }

  // Check if user already has this badge
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { badges: true },
  });

  if (user?.badges?.includes(badge)) {
    return NextResponse.json({ message: "Badge already earned", badge });
  }

  // Assign the badge
  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      badges: {
        push: badge,
      },
    },
  });

  return NextResponse.json({ message: "Badge earned!", badge });
}

// Get badge question (without revealing the answer)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const badge = searchParams.get("badge");

  if (!badge) {
    // Return all available badges and their questions
    const badges = Object.entries(BADGE_SECRETS).map(([key, value]) => ({
      badge: key,
      question: value.question,
    }));
    return NextResponse.json({ badges });
  }

  const badgeConfig = BADGE_SECRETS[badge];
  if (!badgeConfig) {
    return NextResponse.json({ error: "Invalid badge" }, { status: 400 });
  }

  return NextResponse.json({ badge, question: badgeConfig.question });
}

export const dynamic = "force-dynamic";
