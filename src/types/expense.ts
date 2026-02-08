export type ExpenseCategory = 
  | "maintenance" 
  | "utilities" 
  | "landscaping" 
  | "supplies" 
  | "tax_fees" 
  | "insurance" 
  | "improvements" 
  | "emergency" 
  | "other";

export type ExpenseSubcategory = 
  // Maintenance
  | "plumbing" | "electrical" | "hvac" | "roofing" | "structural" | "appliances" | "general_maintenance"
  // Utilities
  | "electricity" | "water_sewer" | "internet" | "phone" | "propane" | "trash" | "other_utilities"
  // Landscaping
  | "lawn_care" | "tree_removal" | "deck_patio" | "dock" | "fire_pit" | "general_landscaping"
  // Supplies
  | "cleaning_supplies" | "tools" | "hardware" | "paint" | "lumber" | "general_supplies"
  // Tax & Fees
  | "property_tax" | "hoa_fees" | "permits" | "licenses" | "other_fees"
  // Insurance
  | "property_insurance" | "liability" | "other_insurance"
  // Improvements
  | "renovations" | "additions" | "energy_efficiency" | "appliances" | "furniture" | "general_improvements"
  // Emergency
  | "storm_damage" | "emergency_repairs" | "replacements" | "other_emergency"
  // Other
  | "general";

export interface ExpenseComment {
  id: string;
  content: string;
  expenseId: string;
  userId: string;
  user: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseVote {
  id: string;
  value: number; // 1 = upvote, -1 = downvote
  expenseId: string;
  userId: string;
  user: {
    id: string;
    name: string;
  };
  createdAt: string;
}

export interface Expense {
  id: string;
  title: string;
  description: string | null;
  cost: number;
  date: string | null; // ISO string, null for planned expenses without a date
  category: ExpenseCategory;
  subcategory: ExpenseSubcategory | null;
  isPlanned: boolean;
  receiptImageUrl: string | null; // Cloudinary URL for receipt image (only for incurred expenses)
  receiptImagePublicId: string | null; // Cloudinary public ID for receipt deletion
  userId: string;
  user: {
    id: string;
    name: string;
  };
  comments: ExpenseComment[];
  votes: ExpenseVote[];
  voteScore: number; // computed: sum of vote values
  userVote: number | null; // current user's vote value (1, -1, or null)
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export const EXPENSE_CATEGORIES = [
  { value: "maintenance", label: "Maintenance & Repairs" },
  { value: "utilities", label: "Utilities & Services" },
  { value: "landscaping", label: "Landscaping & Outdoor" },
  { value: "supplies", label: "Supplies & Materials" },
  { value: "tax_fees", label: "Tax & Fees" },
  { value: "insurance", label: "Insurance" },
  { value: "improvements", label: "Improvements & Upgrades" },
  { value: "emergency", label: "Emergency & Unexpected" },
  { value: "other", label: "Other" },
] as const;

export const EXPENSE_SUBCATEGORIES: Record<ExpenseCategory, Array<{ value: ExpenseSubcategory; label: string }>> = {
  maintenance: [
    { value: "plumbing", label: "Plumbing" },
    { value: "electrical", label: "Electrical" },
    { value: "hvac", label: "HVAC" },
    { value: "roofing", label: "Roofing" },
    { value: "structural", label: "Structural" },
    { value: "appliances", label: "Appliances" },
    { value: "general_maintenance", label: "General Maintenance" },
  ],
  utilities: [
    { value: "electricity", label: "Electricity" },
    { value: "water_sewer", label: "Water & Sewer" },
    { value: "internet", label: "Internet" },
    { value: "phone", label: "Phone" },
    { value: "propane", label: "Propane" },
    { value: "trash", label: "Trash" },
    { value: "other_utilities", label: "Other Utilities" },
  ],
  landscaping: [
    { value: "lawn_care", label: "Lawn Care" },
    { value: "tree_removal", label: "Tree Removal" },
    { value: "deck_patio", label: "Deck & Patio" },
    { value: "dock", label: "Dock" },
    { value: "fire_pit", label: "Fire Pit" },
    { value: "general_landscaping", label: "General Landscaping" },
  ],
  supplies: [
    { value: "cleaning_supplies", label: "Cleaning Supplies" },
    { value: "tools", label: "Tools" },
    { value: "hardware", label: "Hardware" },
    { value: "paint", label: "Paint" },
    { value: "lumber", label: "Lumber" },
    { value: "general_supplies", label: "General Supplies" },
  ],
  tax_fees: [
    { value: "property_tax", label: "Property Tax" },
    { value: "hoa_fees", label: "HOA Fees" },
    { value: "permits", label: "Permits" },
    { value: "licenses", label: "Licenses" },
    { value: "other_fees", label: "Other Fees" },
  ],
  insurance: [
    { value: "property_insurance", label: "Property Insurance" },
    { value: "liability", label: "Liability" },
    { value: "other_insurance", label: "Other Insurance" },
  ],
  improvements: [
    { value: "renovations", label: "Renovations" },
    { value: "additions", label: "Additions" },
    { value: "energy_efficiency", label: "Energy Efficiency" },
    { value: "appliances", label: "Appliances" },
    { value: "furniture", label: "Furniture" },
    { value: "general_improvements", label: "General Improvements" },
  ],
  emergency: [
    { value: "storm_damage", label: "Storm Damage" },
    { value: "emergency_repairs", label: "Emergency Repairs" },
    { value: "replacements", label: "Replacements" },
    { value: "other_emergency", label: "Other Emergency" },
  ],
  other: [
    { value: "general", label: "General" },
  ],
};
