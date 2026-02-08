import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding expenses...");

  // Get the first admin user, or create a test user if none exists
  let user = await prisma.user.findFirst({
    where: { isAdmin: true },
  });

  if (!user) {
    // Try to get any user
    user = await prisma.user.findFirst();
    
    if (!user) {
      console.log("❌ No users found. Please create a user first.");
      return;
    }
  }

  console.log(`✅ Using user: ${user.name} (${user.email})`);

  // Get current date for calculations
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  // Helper to create date
  const createDate = (year: number, month: number, day: number) => {
    return new Date(year, month, day);
  };

  // Dummy expenses data
  const expenses = [
    // Maintenance & Repairs
    {
      title: "Plumbing Repair - Kitchen Sink",
      description: "Fixed leaky faucet and replaced pipes under sink",
      cost: 450.0,
      date: createDate(currentYear, currentMonth - 2, 15),
      category: "maintenance",
      subcategory: "plumbing",
      isPlanned: false,
    },
    {
      title: "Electrical Panel Upgrade",
      description: "Upgraded electrical panel to 200 amp service",
      cost: 3200.0,
      date: createDate(currentYear, currentMonth - 1, 5),
      category: "maintenance",
      subcategory: "electrical",
      isPlanned: false,
    },
    {
      title: "HVAC System Maintenance",
      description: "Annual service and filter replacement",
      cost: 275.0,
      date: createDate(currentYear, currentMonth - 1, 20),
      category: "maintenance",
      subcategory: "hvac",
      isPlanned: false,
    },
    {
      title: "Roof Shingle Replacement",
      description: "Replaced damaged shingles on north side",
      cost: 850.0,
      date: createDate(currentYear, currentMonth - 3, 10),
      category: "maintenance",
      subcategory: "roofing",
      isPlanned: false,
    },
    {
      title: "Refrigerator Repair",
      description: "Fixed compressor and replaced door seal",
      cost: 425.0,
      date: createDate(currentYear, currentMonth, 3),
      category: "maintenance",
      subcategory: "appliances",
      isPlanned: false,
    },
    {
      title: "Foundation Crack Repair",
      description: "Sealed foundation cracks in basement",
      cost: 1200.0,
      date: createDate(currentYear, currentMonth - 4, 22),
      category: "maintenance",
      subcategory: "structural",
      isPlanned: false,
    },

    // Utilities & Services
    {
      title: "Electric Bill - January",
      description: "Monthly electricity usage",
      cost: 185.50,
      date: createDate(currentYear, currentMonth - 1, 15),
      category: "utilities",
      subcategory: "electricity",
      isPlanned: false,
    },
    {
      title: "Electric Bill - February",
      description: "Monthly electricity usage",
      cost: 192.75,
      date: createDate(currentYear, currentMonth, 15),
      category: "utilities",
      subcategory: "electricity",
      isPlanned: false,
    },
    {
      title: "Water & Sewer - Q1",
      description: "Quarterly water and sewer bill",
      cost: 245.0,
      date: createDate(currentYear, currentMonth - 1, 1),
      category: "utilities",
      subcategory: "water_sewer",
      isPlanned: false,
    },
    {
      title: "Internet Service - Annual",
      description: "Yearly internet subscription",
      cost: 1200.0,
      date: createDate(currentYear, currentMonth - 2, 1),
      category: "utilities",
      subcategory: "internet",
      isPlanned: false,
    },
    {
      title: "Propane Tank Refill",
      description: "Winter propane refill",
      cost: 450.0,
      date: createDate(currentYear, currentMonth - 1, 10),
      category: "utilities",
      subcategory: "propane",
      isPlanned: false,
    },
    {
      title: "Trash Service - Monthly",
      description: "Monthly waste collection",
      cost: 35.0,
      date: createDate(currentYear, currentMonth, 1),
      category: "utilities",
      subcategory: "trash",
      isPlanned: false,
    },

    // Landscaping & Outdoor
    {
      title: "Lawn Mowing Service - Spring",
      description: "Professional lawn care for spring season",
      cost: 600.0,
      date: createDate(currentYear, currentMonth - 2, 1),
      category: "landscaping",
      subcategory: "lawn_care",
      isPlanned: false,
    },
    {
      title: "Tree Removal - Dead Pine",
      description: "Removed dead pine tree near driveway",
      cost: 1200.0,
      date: createDate(currentYear, currentMonth - 3, 18),
      category: "landscaping",
      subcategory: "tree_removal",
      isPlanned: false,
    },
    {
      title: "Deck Staining",
      description: "Stained and sealed deck",
      cost: 350.0,
      date: createDate(currentYear, currentMonth - 1, 25),
      category: "landscaping",
      subcategory: "deck_patio",
      isPlanned: false,
    },
    {
      title: "Dock Repairs",
      description: "Replaced damaged dock boards",
      cost: 850.0,
      date: createDate(currentYear, currentMonth - 2, 12),
      category: "landscaping",
      subcategory: "dock",
      isPlanned: false,
    },
    {
      title: "Fire Pit Installation",
      description: "Installed new stone fire pit",
      cost: 1200.0,
      date: createDate(currentYear, currentMonth - 4, 5),
      category: "landscaping",
      subcategory: "fire_pit",
      isPlanned: false,
    },

    // Supplies & Materials
    {
      title: "Cleaning Supplies - Bulk Order",
      description: "Stocked up on cleaning supplies for season",
      cost: 125.0,
      date: createDate(currentYear, currentMonth - 1, 8),
      category: "supplies",
      subcategory: "cleaning_supplies",
      isPlanned: false,
    },
    {
      title: "Power Tools - Drill & Saw",
      description: "New cordless drill and circular saw",
      cost: 450.0,
      date: createDate(currentYear, currentMonth - 2, 20),
      category: "supplies",
      subcategory: "tools",
      isPlanned: false,
    },
    {
      title: "Hardware Store Run",
      description: "Various screws, nails, and hardware",
      cost: 85.0,
      date: createDate(currentYear, currentMonth, 5),
      category: "supplies",
      subcategory: "hardware",
      isPlanned: false,
    },
    {
      title: "Paint - Exterior",
      description: "Exterior paint for touch-ups",
      cost: 180.0,
      date: createDate(currentYear, currentMonth - 1, 12),
      category: "supplies",
      subcategory: "paint",
      isPlanned: false,
    },
    {
      title: "Lumber - Deck Project",
      description: "Pressure-treated lumber for deck repairs",
      cost: 425.0,
      date: createDate(currentYear, currentMonth - 2, 15),
      category: "supplies",
      subcategory: "lumber",
      isPlanned: false,
    },

    // Tax & Fees
    {
      title: "Property Tax - 2024",
      description: "Annual property tax payment",
      cost: 3500.0,
      date: createDate(currentYear, currentMonth - 3, 1),
      category: "tax_fees",
      subcategory: "property_tax",
      isPlanned: false,
    },
    {
      title: "HOA Fees - Q1",
      description: "Quarterly HOA assessment",
      cost: 450.0,
      date: createDate(currentYear, currentMonth - 2, 1),
      category: "tax_fees",
      subcategory: "hoa_fees",
      isPlanned: false,
    },
    {
      title: "Building Permit - Deck",
      description: "Permit for deck construction",
      cost: 150.0,
      date: createDate(currentYear, currentMonth - 4, 10),
      category: "tax_fees",
      subcategory: "permits",
      isPlanned: false,
    },

    // Insurance
    {
      title: "Property Insurance - Annual",
      description: "Annual property insurance premium",
      cost: 1800.0,
      date: createDate(currentYear, currentMonth - 2, 1),
      category: "insurance",
      subcategory: "property_insurance",
      isPlanned: false,
    },
    {
      title: "Liability Insurance",
      description: "Additional liability coverage",
      cost: 350.0,
      date: createDate(currentYear, currentMonth - 1, 1),
      category: "insurance",
      subcategory: "liability",
      isPlanned: false,
    },

    // Improvements & Upgrades
    {
      title: "Kitchen Renovation",
      description: "Complete kitchen remodel with new cabinets and countertops",
      cost: 15000.0,
      date: createDate(currentYear, currentMonth - 5, 1),
      category: "improvements",
      subcategory: "renovations",
      isPlanned: false,
    },
    {
      title: "New Refrigerator",
      description: "Energy-efficient French door refrigerator",
      cost: 2200.0,
      date: createDate(currentYear, currentMonth - 3, 20),
      category: "improvements",
      subcategory: "appliances",
      isPlanned: false,
    },
    {
      title: "Living Room Furniture Set",
      description: "New sofa, coffee table, and side tables",
      cost: 3500.0,
      date: createDate(currentYear, currentMonth - 2, 10),
      category: "improvements",
      subcategory: "furniture",
      isPlanned: false,
    },
    {
      title: "Solar Panel Installation",
      description: "Installed solar panels for energy efficiency",
      cost: 12000.0,
      date: createDate(currentYear, currentMonth - 6, 15),
      category: "improvements",
      subcategory: "energy_efficiency",
      isPlanned: false,
    },
    {
      title: "Bathroom Addition",
      description: "Added new bathroom to second floor",
      cost: 18000.0,
      date: createDate(currentYear, currentMonth - 8, 1),
      category: "improvements",
      subcategory: "additions",
      isPlanned: false,
    },

    // Emergency & Unexpected
    {
      title: "Storm Damage - Roof",
      description: "Repaired roof damage from severe storm",
      cost: 3500.0,
      date: createDate(currentYear, currentMonth - 1, 28),
      category: "emergency",
      subcategory: "storm_damage",
      isPlanned: false,
    },
    {
      title: "Emergency Plumbing - Burst Pipe",
      description: "Emergency repair for burst pipe in basement",
      cost: 850.0,
      date: createDate(currentYear, currentMonth - 2, 14),
      category: "emergency",
      subcategory: "emergency_repairs",
      isPlanned: false,
    },
    {
      title: "Water Heater Replacement",
      description: "Replaced failed water heater",
      cost: 1200.0,
      date: createDate(currentYear, currentMonth - 1, 5),
      category: "emergency",
      subcategory: "replacements",
      isPlanned: false,
    },

    // Other
    {
      title: "Miscellaneous Expenses",
      description: "Various small expenses",
      cost: 150.0,
      date: createDate(currentYear, currentMonth, 1),
      category: "other",
      subcategory: "general",
      isPlanned: false,
    },

    // Planned Expenses (Wishlist)
    {
      title: "Hot Tub Installation",
      description: "Would love to add a hot tub for year-round enjoyment",
      cost: 8000.0,
      date: null,
      category: "improvements",
      subcategory: "general_improvements",
      isPlanned: true,
    },
    {
      title: "New Deck Expansion",
      description: "Expand the deck to accommodate more seating",
      cost: 5000.0,
      date: null,
      category: "landscaping",
      subcategory: "deck_patio",
      isPlanned: true,
    },
    {
      title: "Smart Home System",
      description: "Install smart thermostats, lights, and security system",
      cost: 2500.0,
      date: null,
      category: "improvements",
      subcategory: "energy_efficiency",
      isPlanned: true,
    },
    {
      title: "New Washer & Dryer",
      description: "Upgrade to energy-efficient washer and dryer set",
      cost: 1800.0,
      date: null,
      category: "improvements",
      subcategory: "appliances",
      isPlanned: true,
    },
    {
      title: "Outdoor Kitchen",
      description: "Build outdoor kitchen with grill and prep area",
      cost: 6000.0,
      date: null,
      category: "improvements",
      subcategory: "additions",
      isPlanned: true,
    },
  ];

  // Delete existing expenses (optional - comment out if you want to keep existing data)
  const deleteCount = await prisma.expense.deleteMany({
    where: {
      userId: user.id,
    },
  });
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

  console.log(`✅ Created ${expenses.length} expenses`);
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
