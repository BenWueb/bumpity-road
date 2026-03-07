import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const COLORS = ["amber", "rose", "sky", "violet", "emerald", "slate"];

const PUZZLE_DATA = [
  {
    completedBy: "Grandma & Grandpa",
    completedDate: new Date(2025, 11, 25),
    notes: "Christmas Day puzzle! 1000 pieces of a snowy mountain cabin. Took all afternoon with hot cocoa.",
    color: "sky",
  },
  {
    completedBy: "The Kids",
    completedDate: new Date(2025, 6, 4),
    notes: "Fourth of July fireworks puzzle - 500 pieces. Only lost one piece under the couch!",
    color: "rose",
  },
  {
    completedBy: "Mom & Dad",
    completedDate: new Date(2025, 7, 15),
    notes: "Beautiful lakeside sunset. This one was tricky with all the water reflections. 750 pieces.",
    color: "amber",
  },
  {
    completedBy: "Uncle Dave",
    completedDate: new Date(2025, 5, 20),
    notes: "Finished this wildlife puzzle solo during a rainy weekend. 1000 pieces of forest animals.",
    color: "emerald",
  },
  {
    completedBy: "The Whole Family",
    completedDate: new Date(2025, 8, 1),
    notes: "Labor Day weekend project! A huge 2000-piece map of the national parks. Everyone helped!",
    color: "violet",
  },
  {
    completedBy: "Aunt Sarah & Cousin Emma",
    completedDate: new Date(2025, 9, 31),
    notes: "Spooky Halloween puzzle with a haunted house. 500 pieces, perfect for a fall evening.",
    color: "slate",
  },
  {
    completedBy: "Grandpa",
    completedDate: new Date(2025, 3, 12),
    notes: "Classic car collection puzzle. 750 pieces. Grandpa's favorite subject!",
    color: "amber",
  },
  {
    completedBy: "The Cousins",
    completedDate: new Date(2025, 5, 15),
    notes: "Ocean life puzzle with dolphins and coral reefs. 500 pieces done in one afternoon!",
    color: "sky",
  },
  {
    completedBy: "Mom",
    completedDate: new Date(2026, 0, 10),
    notes: "New Year's puzzle tradition! A cozy bookshop scene with cats. 1000 pieces over the long weekend.",
    color: "rose",
  },
  {
    completedBy: "Dad & Uncle Dave",
    completedDate: new Date(2026, 1, 14),
    notes: "Winter cabin puzzle - how meta! 750 pieces. The sky was the hardest part by far.",
    color: "emerald",
  },
];

const PLACEHOLDER_IMAGES = [
  { url: "https://images.unsplash.com/photo-1494059980473-813e73ee784b?w=800&q=80", width: 800, height: 600 },
  { url: "https://images.unsplash.com/photo-1611329532992-0b7ba27d85fb?w=800&q=80", width: 800, height: 600 },
  { url: "https://images.unsplash.com/photo-1606503153255-59d5e417c4ed?w=800&q=80", width: 800, height: 600 },
  { url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80", width: 800, height: 600 },
  { url: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80", width: 800, height: 600 },
  { url: "https://images.unsplash.com/photo-1518173946687-a1e0e2a4e99c?w=800&q=80", width: 800, height: 600 },
  { url: "https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?w=800&q=80", width: 800, height: 600 },
  { url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80", width: 800, height: 600 },
  { url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80", width: 800, height: 600 },
  { url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80", width: 800, height: 600 },
];

async function main() {
  console.log("Seeding 10 dummy puzzle entries...");

  const firstUser = await prisma.user.findFirst();
  if (!firstUser) {
    console.error("No users found in the database. Create a user first.");
    process.exit(1);
  }
  console.log(`Using user "${firstUser.name}" (${firstUser.id}) as owner.`);

  const deleted = await prisma.puzzleEntry.deleteMany();
  console.log(`Cleared ${deleted.count} existing puzzle entries.`);

  for (let i = 0; i < PUZZLE_DATA.length; i++) {
    const puzzle = PUZZLE_DATA[i];
    const image = PLACEHOLDER_IMAGES[i];

    await prisma.puzzleEntry.create({
      data: {
        completedBy: puzzle.completedBy,
        completedDate: puzzle.completedDate,
        notes: puzzle.notes,
        imageUrl: image.url,
        imagePublicId: `seed-puzzle-${i}`,
        color: puzzle.color,
        userId: firstUser.id,
      },
    });

    console.log(`  Created: "${puzzle.completedBy}" - ${puzzle.notes?.slice(0, 50)}...`);
  }

  console.log("\nDone! 10 puzzle entries seeded.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
