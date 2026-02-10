import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding expenses from 2025 CSV data...");

  // Get the first admin user, or any user if none exists
  let user = await prisma.user.findFirst({
    where: { isAdmin: true },
  });

  if (!user) {
    user = await prisma.user.findFirst();
    if (!user) {
      console.log("❌ No users found. Please create a user first.");
      return;
    }
  }

  console.log(`✅ Using user: ${user.name} (${user.email})`);

  // Helper to create a date in 2025
  const d = (month: number, day: number) => new Date(2025, month - 1, day);

  // ── All 2025 expenses from the CSV ──────────────────────────────────

  const expenses: Array<{
    title: string;
    description: string | null;
    cost: number;
    date: Date | null;
    category: string;
    subcategory: string | null;
    isPlanned: boolean;
  }> = [
    // ═══════════════════════════════════════════════════════════════════
    //  OVERHEAD / RECURRING
    // ═══════════════════════════════════════════════════════════════════

    // ── Adams Pest Control ────────────────────────────────────────────
    {
      title: "Pest Control Service",
      description: "Adams Pest Control; fixing holes where mice are getting in",
      cost: 150.72,
      date: d(5, 15),
      category: "maintenance",
      subcategory: "pest_control",
      isPlanned: false,
    },
    {
      title: "Pest Control Service",
      description: "Adams Pest Control; fixing holes where mice are getting in",
      cost: 150.72,
      date: d(8, 15),
      category: "maintenance",
      subcategory: "pest_control",
      isPlanned: false,
    },
    {
      title: "Pest Control Service",
      description: "Adams Pest Control; fixing holes where mice are getting in",
      cost: 150.72,
      date: d(11, 15),
      category: "maintenance",
      subcategory: "pest_control",
      isPlanned: false,
    },

    // ── Garbage Service ──────────────────────────────────────────────
    {
      title: "Trash Pickup",
      description: "Garbage service",
      cost: 124.13,
      date: d(8, 1),
      category: "utilities",
      subcategory: "trash",
      isPlanned: false,
    },
    {
      title: "Trash Pickup",
      description: "Garbage service",
      cost: 19.10,
      date: d(9, 1),
      category: "utilities",
      subcategory: "trash",
      isPlanned: false,
    },

    // ── Electricity – Crow Wing Power (monthly) ──────────────────────
    {
      title: "Electric Bill",
      description: "Crow Wing Power monthly electricity",
      cost: 325.00,
      date: d(1, 15),
      category: "utilities",
      subcategory: "electricity",
      isPlanned: false,
    },
    {
      title: "Electric Bill",
      description: "Crow Wing Power monthly electricity",
      cost: 325.00,
      date: d(2, 15),
      category: "utilities",
      subcategory: "electricity",
      isPlanned: false,
    },
    {
      title: "Electric Bill",
      description: "Crow Wing Power monthly electricity",
      cost: 404.00,
      date: d(3, 15),
      category: "utilities",
      subcategory: "electricity",
      isPlanned: false,
    },
    {
      title: "Electric Bill",
      description: "Crow Wing Power monthly electricity",
      cost: 208.00,
      date: d(5, 15),
      category: "utilities",
      subcategory: "electricity",
      isPlanned: false,
    },
    {
      title: "Electric Bill",
      description: "Crow Wing Power monthly electricity",
      cost: 151.00,
      date: d(6, 15),
      category: "utilities",
      subcategory: "electricity",
      isPlanned: false,
    },
    {
      title: "Electric Bill",
      description: "Crow Wing Power monthly electricity",
      cost: 144.00,
      date: d(7, 15),
      category: "utilities",
      subcategory: "electricity",
      isPlanned: false,
    },
    {
      title: "Electric Bill",
      description: "Crow Wing Power monthly electricity",
      cost: 154.00,
      date: d(8, 15),
      category: "utilities",
      subcategory: "electricity",
      isPlanned: false,
    },
    {
      title: "Electric Bill",
      description: "Crow Wing Power monthly electricity",
      cost: 152.00,
      date: d(9, 15),
      category: "utilities",
      subcategory: "electricity",
      isPlanned: false,
    },
    {
      title: "Electric Bill",
      description: "Crow Wing Power monthly electricity",
      cost: 194.00,
      date: d(10, 15),
      category: "utilities",
      subcategory: "electricity",
      isPlanned: false,
    },
    {
      title: "Electric Bill",
      description: "Crow Wing Power monthly electricity",
      cost: 114.00,
      date: d(11, 15),
      category: "utilities",
      subcategory: "electricity",
      isPlanned: false,
    },
    {
      title: "Electric Bill",
      description: "Crow Wing Power monthly electricity",
      cost: 148.00,
      date: d(12, 15),
      category: "utilities",
      subcategory: "electricity",
      isPlanned: false,
    },

    // ── Ferrel Gas – Propane ─────────────────────────────────────────
    {
      title: "Propane Refill",
      description: "Ferrel Gas",
      cost: 278.60,
      date: d(8, 15),
      category: "utilities",
      subcategory: "propane",
      isPlanned: false,
    },
    {
      title: "Propane Refill",
      description: "Ferrel Gas",
      cost: 347.50,
      date: d(11, 15),
      category: "utilities",
      subcategory: "propane",
      isPlanned: false,
    },

    // ── Lakes Area Dock and Lift (Shane) ─────────────────────────────
    {
      title: "Dock Installation",
      description: "Lakes Area Dock and Lift (Shane)",
      cost: 525.00,
      date: d(5, 1),
      category: "marine",
      subcategory: "dock",
      isPlanned: false,
    },
    {
      title: "Dock Service",
      description: "Lakes Area Dock and Lift (Shane)",
      cost: 550.00,
      date: d(7, 1),
      category: "marine",
      subcategory: "dock",
      isPlanned: false,
    },

    // ── Marriott Vacation Club ──────────────────────────────────────
    {
      title: "Annual Maintenance Fee",
      description: "Marriott Vacation Club",
      cost: 3995.70,
      date: d(1, 15),
      category: "other",
      subcategory: "vacation_club",
      isPlanned: false,
    },

    // ── Woodland Insurance – Auto Owners ─────────────────────────────
    {
      title: "Property Insurance Premium",
      description: "Woodland Insurance (Auto Owners), includes umbrella policy",
      cost: 3519.48,
      date: d(10, 1),
      category: "insurance",
      subcategory: "property_insurance",
      isPlanned: false,
    },

    // ── Abound by Marriott – Club Dues ──────────────────────────────
    {
      title: "Club Dues",
      description: "Abound by Marriott annual dues",
      cost: 250.00,
      date: d(1, 15),
      category: "other",
      subcategory: "vacation_club",
      isPlanned: false,
    },

    // ── Bruce L Hoffarber CPA – Tax Prep ─────────────────────────────
    {
      title: "Tax Preparation",
      description: "Bruce L Hoffarber CPA annual trust tax preparation",
      cost: 700.00,
      date: d(5, 1),
      category: "tax_fees",
      subcategory: "tax_preparation",
      isPlanned: false,
    },

    // ── TDS Communications – Phone/Internet (monthly) ────────────────
    {
      title: "Monthly Service Bill",
      description: "TDS Communications phone/internet",
      cost: 135.00,
      date: d(1, 1),
      category: "utilities",
      subcategory: "internet",
      isPlanned: false,
    },
    {
      title: "Monthly Service Bill",
      description: "TDS Communications phone/internet",
      cost: 135.00,
      date: d(2, 1),
      category: "utilities",
      subcategory: "internet",
      isPlanned: false,
    },
    {
      title: "Monthly Service Bill",
      description: "TDS Communications phone/internet",
      cost: 135.00,
      date: d(3, 1),
      category: "utilities",
      subcategory: "internet",
      isPlanned: false,
    },
    {
      title: "Monthly Service Bill",
      description: "TDS Communications phone/internet",
      cost: 135.00,
      date: d(4, 1),
      category: "utilities",
      subcategory: "internet",
      isPlanned: false,
    },
    {
      title: "Monthly Service Bill",
      description: "TDS Communications phone/internet",
      cost: 134.17,
      date: d(5, 1),
      category: "utilities",
      subcategory: "internet",
      isPlanned: false,
    },
    {
      title: "Monthly Service Bill",
      description: "TDS Communications phone/internet",
      cost: 134.17,
      date: d(6, 1),
      category: "utilities",
      subcategory: "internet",
      isPlanned: false,
    },
    {
      title: "Monthly Service Bill",
      description: "TDS Communications phone/internet",
      cost: 135.00,
      date: d(7, 1),
      category: "utilities",
      subcategory: "internet",
      isPlanned: false,
    },
    {
      title: "Monthly Service Bill",
      description: "TDS Communications phone/internet",
      cost: 134.97,
      date: d(8, 1),
      category: "utilities",
      subcategory: "internet",
      isPlanned: false,
    },
    {
      title: "Monthly Service Bill",
      description: "TDS Communications phone/internet",
      cost: 135.00,
      date: d(9, 1),
      category: "utilities",
      subcategory: "internet",
      isPlanned: false,
    },
    {
      title: "Monthly Service Bill",
      description: "TDS Communications phone/internet",
      cost: 134.97,
      date: d(10, 1),
      category: "utilities",
      subcategory: "internet",
      isPlanned: false,
    },
    {
      title: "Monthly Service Bill",
      description: "TDS Communications phone/internet",
      cost: 135.20,
      date: d(11, 1),
      category: "utilities",
      subcategory: "internet",
      isPlanned: false,
    },
    {
      title: "Monthly Service Bill",
      description: "TDS Communications phone/internet",
      cost: 135.20,
      date: d(12, 1),
      category: "utilities",
      subcategory: "internet",
      isPlanned: false,
    },

    // ── Towerview Services – Snow Plowing ────────────────────────────
    {
      title: "Snow Plowing",
      description: "Towerview Services",
      cost: 119.00,
      date: d(2, 15),
      category: "landscaping",
      subcategory: "snow_removal",
      isPlanned: false,
    },
    {
      title: "Snow Plowing",
      description: "Towerview Services",
      cost: 104.00,
      date: d(4, 15),
      category: "landscaping",
      subcategory: "snow_removal",
      isPlanned: false,
    },

    // ── Cabin Check Inc. (Rick Craig) ────────────────────────────────
    {
      title: "Cabin Check Visit",
      description: "Cabin Check Inc. (Rick Craig)",
      cost: 140.00,
      date: d(10, 15),
      category: "maintenance",
      subcategory: "cabin_check",
      isPlanned: false,
    },

    // ── Property Taxes ───────────────────────────────────────────────
    {
      title: "Property Taxes - 1st Half",
      description: "Semi-annual property tax payment",
      cost: 1881.00,
      date: d(5, 15),
      category: "tax_fees",
      subcategory: "property_tax",
      isPlanned: false,
    },
    {
      title: "Property Taxes - 2nd Half",
      description: "Semi-annual property tax payment",
      cost: 1881.00,
      date: d(10, 15),
      category: "tax_fees",
      subcategory: "property_tax",
      isPlanned: false,
    },

    // ── Wheeler Marine – Boat Storage ────────────────────────────────
    {
      title: "Boat Storage",
      description: "Wheeler Marine seasonal storage",
      cost: 291.95,
      date: d(10, 1),
      category: "marine",
      subcategory: "boat_storage",
      isPlanned: false,
    },

    // ── Wheeler Marine – Boat Service ────────────────────────────────
    {
      title: "Boat Maintenance",
      description: "Wheeler Marine annual service",
      cost: 1717.78,
      date: d(6, 15),
      category: "marine",
      subcategory: "boat_service",
      isPlanned: false,
    },

    // ── MN Dept of Revenue – Trust Taxes ─────────────────────────────
    {
      title: "State Trust Tax",
      description: "MN Dept of Revenue",
      cost: 152.00,
      date: d(4, 15),
      category: "tax_fees",
      subcategory: "trust_tax",
      isPlanned: false,
    },

    // ── Tortuga fees ─────────────────────────────────────────────────
    {
      title: "Timeshare Fees",
      description: "Tortuga unit 480 maintenance fees",
      cost: 59.52,
      date: d(1, 15),
      category: "other",
      subcategory: "vacation_club",
      isPlanned: false,
    },
    {
      title: "Timeshare Fees",
      description: "Tortuga unit 481 maintenance fees",
      cost: 59.52,
      date: d(1, 15),
      category: "other",
      subcategory: "vacation_club",
      isPlanned: false,
    },

    // ── CJ Services – Window Cleaning ────────────────────────────────
    {
      title: "Window Cleaning",
      description: "CJ Services",
      cost: 450.00,
      date: d(9, 15),
      category: "maintenance",
      subcategory: "cleaning",
      isPlanned: false,
    },

    // ── Zaffke Plumbing (Northland Septic) ───────────────────────────
    {
      title: "Plumbing Service",
      description: "Zaffke Plumbing (part of Northland Septic)",
      cost: 855.00,
      date: d(11, 15),
      category: "maintenance",
      subcategory: "plumbing",
      isPlanned: false,
    },

    // ── CJ Chem Dry – Rug Cleaning ──────────────────────────────────
    {
      title: "Rug Cleaning",
      description: "CJ Chem Dry",
      cost: 77.00,
      date: d(2, 15),
      category: "maintenance",
      subcategory: "cleaning",
      isPlanned: false,
    },

    // ═══════════════════════════════════════════════════════════════════
    //  EXTRAORDINARY EXPENSES (reimbursements & one-off purchases)
    // ═══════════════════════════════════════════════════════════════════

    // ── Ben – Supplies ───────────────────────────────────────────────
    {
      title: "Supplies Reimbursement",
      description: "Ben - cabin supplies purchase",
      cost: 72.89,
      date: d(1, 15),
      category: "supplies",
      subcategory: "general_supplies",
      isPlanned: false,
    },

    // ── Teri Wuebker ─────────────────────────────────────────────────
    {
      title: "Supplies Reimbursement",
      description: "Teri Wuebker - cabin supplies purchase",
      cost: 391.33,
      date: d(7, 15),
      category: "supplies",
      subcategory: "general_supplies",
      isPlanned: false,
    },

    // ── Jenny Wuebker (multiple months) ──────────────────────────────
    {
      title: "Supplies Reimbursement",
      description: "Jenny Wuebker - cabin supplies and purchases",
      cost: 1094.51,
      date: d(2, 15),
      category: "supplies",
      subcategory: "general_supplies",
      isPlanned: false,
    },
    {
      title: "Supplies Reimbursement",
      description: "Jenny Wuebker - cabin supplies and purchases",
      cost: 870.32,
      date: d(3, 15),
      category: "supplies",
      subcategory: "general_supplies",
      isPlanned: false,
    },
    {
      title: "Supplies Reimbursement",
      description: "Jenny Wuebker - cabin supplies and purchases",
      cost: 268.85,
      date: d(6, 15),
      category: "supplies",
      subcategory: "general_supplies",
      isPlanned: false,
    },
    {
      title: "Supplies Reimbursement",
      description: "Jenny Wuebker - cabin supplies and purchases",
      cost: 446.34,
      date: d(7, 15),
      category: "supplies",
      subcategory: "general_supplies",
      isPlanned: false,
    },
    {
      title: "Supplies Reimbursement",
      description: "Jenny Wuebker - cabin supplies and purchases",
      cost: 336.53,
      date: d(9, 15),
      category: "supplies",
      subcategory: "general_supplies",
      isPlanned: false,
    },

    // ── Lisa and Lou Malice ──────────────────────────────────────────
    {
      title: "Supplies Reimbursement",
      description: "Lisa and Lou Malice - cabin supplies purchase",
      cost: 252.00,
      date: d(12, 15),
      category: "supplies",
      subcategory: "general_supplies",
      isPlanned: false,
    },

    // ── Lake Life Inc. ───────────────────────────────────────────────
    {
      title: "Improvement Project",
      description: "Lake Life Inc. (Tristan, 218-547-6200) - cabin improvement project",
      cost: 6400.00,
      date: d(10, 15),
      category: "improvements",
      subcategory: "general_improvements",
      isPlanned: false,
    },

    // ── Erin Wuebker ─────────────────────────────────────────────────
    {
      title: "Supplies Reimbursement",
      description: "Erin Wuebker - cabin supplies purchase",
      cost: 133.31,
      date: d(5, 15),
      category: "supplies",
      subcategory: "general_supplies",
      isPlanned: false,
    },

    // ── Charley Wagner – Tree Removal ────────────────────────────────
    {
      title: "Tree Removal",
      description: "Charley Wagner tree removal service, 303-917-1497",
      cost: 3400.00,
      date: d(5, 15),
      category: "landscaping",
      subcategory: "tree_removal",
      isPlanned: false,
    },
  ];

  // Delete ALL existing expenses (both dummy and real)
  const deleteVotes = await prisma.expenseVote.deleteMany({});
  console.log(`🗑️  Deleted ${deleteVotes.count} expense votes`);

  const deleteComments = await prisma.expenseComment.deleteMany({});
  console.log(`🗑️  Deleted ${deleteComments.count} expense comments`);

  const deleteCount = await prisma.expense.deleteMany({});
  console.log(`🗑️  Deleted ${deleteCount.count} existing expenses`);

  // Create expenses
  for (const expense of expenses) {
    await prisma.expense.create({
      data: {
        ...expense,
        userId: user.id,
      },
    });
  }

  console.log(`✅ Created ${expenses.length} expenses from 2025 CSV data`);

  // Print summary by category
  const byCategory: Record<string, { count: number; total: number }> = {};
  for (const e of expenses) {
    if (!byCategory[e.category]) byCategory[e.category] = { count: 0, total: 0 };
    byCategory[e.category].count++;
    byCategory[e.category].total += e.cost;
  }

  console.log("\n📊 Summary by category:");
  let grandTotal = 0;
  for (const [cat, data] of Object.entries(byCategory).sort((a, b) => b[1].total - a[1].total)) {
    console.log(`   ${cat}: ${data.count} items, $${data.total.toFixed(2)}`);
    grandTotal += data.total;
  }
  console.log(`\n💰 Grand total: $${grandTotal.toFixed(2)}`);
  console.log("🎉 Seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding expenses:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
