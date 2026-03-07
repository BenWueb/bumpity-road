import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ENTRIES = [
  {
    name: "The Bumpity Road Team",
    message:
      "Welcome to Bumpity Road! These posts are from the Guestbook — a place where anyone can leave a message. No account needed, just pick a color and say hello!",
    color: "amber",
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
  },
  {
    name: "The Bumpity Road Team",
    message:
      "Head over to the Gallery to share your favorite cabin photos, or check out Adventures to pin the best spots on a map!",
    color: "sky",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    name: "The Bumpity Road Team",
    message:
      "Got a puzzle going at the cabin? Track your progress on the Puzzles page — snap a photo, log who helped, and see how long it took!",
    color: "violet",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    name: "The Bumpity Road Team",
    message:
      "Spotted any loons on the lake? Log your sightings on the Loon page — track adults, chicks, nesting activity, and more over time.",
    color: "emerald",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    name: "The Bumpity Road Team",
    message:
      "This carousel shows the 5 most recent guestbook entries. Tap here to visit the full Guestbook and leave your own message!",
    color: "rose",
    createdAt: new Date(),
  },
];

async function main() {
  console.log("Seeding guestbook entries...");

  for (const entry of ENTRIES) {
    await prisma.guestbookEntry.create({ data: entry });
    console.log(`  Created: "${entry.message.slice(0, 50)}..."`);
  }

  console.log(`\nDone! Seeded ${ENTRIES.length} guestbook entries.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
