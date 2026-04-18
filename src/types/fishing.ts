export type FishObservation = {
  id: string;
  date: string;
  time: string | null;
  lakeName: string;
  lakeArea: string | null;
  latitude: number | null;
  longitude: number | null;
  species: string[];
  totalCount: number;
  notableCatches: string | null;
  behaviors: string[];
  baits: string[];
  weather: string | null;
  windCondition: string | null;
  disturbance: string | null;
  notes: string | null;
  imageUrls: string[];
  imagePublicIds: string[];
  userId: string;
  user: { id: string; name: string };
  createdAt: string;
};

export type SavedLocation = {
  lakeName: string;
  lakeArea: string | null;
  latitude: number;
  longitude: number;
  count: number;
};

export type FishSpecies =
  | "walleye"
  | "northern_pike"
  | "smallmouth_bass"
  | "largemouth_bass"
  | "muskie"
  | "lake_trout"
  | "perch"
  | "crappie"
  | "bluegill"
  | "rock_bass"
  | "whitefish"
  | "other";

export type FishBehavior =
  | "biting"
  | "schooling"
  | "surfacing"
  | "jumping"
  | "chasing_bait"
  | "spawning"
  | "feeding"
  | "slow_day";

export type BaitType =
  | "live_worm"
  | "leech"
  | "minnow"
  | "crawfish"
  | "power_bait"
  | "jig"
  | "spinner"
  | "spoon"
  | "crankbait"
  | "soft_plastic"
  | "topwater"
  | "fly"
  | "trolling_lure"
  | "other";

export type WeatherCondition =
  | "clear"
  | "partly_cloudy"
  | "overcast"
  | "light_rain"
  | "rain"
  | "fog"
  | "snow";

export type WindCondition = "calm" | "light" | "moderate" | "strong" | "gusty";

export type Disturbance =
  | "none"
  | "boat_traffic"
  | "jet_ski"
  | "swimming"
  | "construction"
  | "eagle_predator"
  | "other_wildlife"
  | "shoreline_activity";

export const FISH_SPECIES: { value: FishSpecies; label: string }[] = [
  { value: "walleye", label: "Walleye" },
  { value: "northern_pike", label: "Northern pike" },
  { value: "smallmouth_bass", label: "Smallmouth bass" },
  { value: "largemouth_bass", label: "Largemouth bass" },
  { value: "muskie", label: "Muskie" },
  { value: "lake_trout", label: "Lake trout" },
  { value: "perch", label: "Yellow perch" },
  { value: "crappie", label: "Crappie" },
  { value: "bluegill", label: "Bluegill" },
  { value: "rock_bass", label: "Rock bass" },
  { value: "whitefish", label: "Whitefish" },
  { value: "other", label: "Other" },
];

export const FISH_BEHAVIORS: { value: FishBehavior; label: string }[] = [
  { value: "biting", label: "Biting / active" },
  { value: "schooling", label: "Schooling" },
  { value: "surfacing", label: "Surfacing" },
  { value: "jumping", label: "Jumping" },
  { value: "chasing_bait", label: "Chasing bait" },
  { value: "spawning", label: "Spawning" },
  { value: "feeding", label: "Feeding" },
  { value: "slow_day", label: "Slow day / no bites" },
];

export const BAIT_TYPES: { value: BaitType; label: string }[] = [
  { value: "live_worm", label: "Live worm / nightcrawler" },
  { value: "leech", label: "Leech" },
  { value: "minnow", label: "Minnow" },
  { value: "crawfish", label: "Crawfish" },
  { value: "power_bait", label: "Power bait / dough" },
  { value: "jig", label: "Jig" },
  { value: "spinner", label: "Spinner" },
  { value: "spoon", label: "Spoon" },
  { value: "crankbait", label: "Crankbait" },
  { value: "soft_plastic", label: "Soft plastic" },
  { value: "topwater", label: "Topwater" },
  { value: "fly", label: "Fly" },
  { value: "trolling_lure", label: "Trolling lure" },
  { value: "other", label: "Other" },
];

export const WEATHER_CONDITIONS: { value: WeatherCondition; label: string }[] =
  [
    { value: "clear", label: "Clear / Sunny" },
    { value: "partly_cloudy", label: "Partly cloudy" },
    { value: "overcast", label: "Overcast" },
    { value: "light_rain", label: "Light rain / drizzle" },
    { value: "rain", label: "Rain" },
    { value: "fog", label: "Fog / mist" },
    { value: "snow", label: "Snow" },
  ];

export const WIND_CONDITIONS: { value: WindCondition; label: string }[] = [
  { value: "calm", label: "Calm" },
  { value: "light", label: "Light breeze" },
  { value: "moderate", label: "Moderate wind" },
  { value: "strong", label: "Strong wind" },
  { value: "gusty", label: "Gusty" },
];

export const DISTURBANCES: { value: Disturbance; label: string }[] = [
  { value: "none", label: "None" },
  { value: "boat_traffic", label: "Boat traffic" },
  { value: "jet_ski", label: "Jet ski / PWC" },
  { value: "swimming", label: "Swimming" },
  { value: "construction", label: "Shoreline construction" },
  { value: "eagle_predator", label: "Eagle / predator" },
  { value: "other_wildlife", label: "Other wildlife" },
  { value: "shoreline_activity", label: "Shoreline activity" },
];
