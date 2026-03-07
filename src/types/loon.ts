export type LoonObservation = {
  id: string;
  date: string;
  time: string | null;
  lakeName: string;
  lakeArea: string | null;
  latitude: number | null;
  longitude: number | null;
  adultsCount: number;
  chicksCount: number;
  juvenilesCount: number;
  loonIds: string[];
  nestingActivity: string | null;
  behaviors: string[];
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

export type NestingActivity =
  | "none"
  | "territory_established"
  | "nest_building"
  | "incubating"
  | "hatched"
  | "chicks_riding"
  | "failed";

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
  | "fishing"
  | "swimming"
  | "construction"
  | "eagle_predator"
  | "other_wildlife"
  | "shoreline_activity";

export type LoonBehavior =
  | "feeding"
  | "diving"
  | "tremolo_call"
  | "wail_call"
  | "yodel_call"
  | "hoot_call"
  | "territorial_display"
  | "penguin_dance"
  | "preening"
  | "resting"
  | "flying"
  | "nest_sitting"
  | "chick_carrying"
  | "foot_waggle";

export const NESTING_ACTIVITIES: { value: NestingActivity; label: string }[] = [
  { value: "none", label: "No nesting observed" },
  { value: "territory_established", label: "Territory established" },
  { value: "nest_building", label: "Nest building" },
  { value: "incubating", label: "Incubating eggs" },
  { value: "hatched", label: "Eggs hatched" },
  { value: "chicks_riding", label: "Chicks riding on back" },
  { value: "failed", label: "Nest failed / abandoned" },
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
  { value: "fishing", label: "Fishing activity" },
  { value: "swimming", label: "Swimming" },
  { value: "construction", label: "Shoreline construction" },
  { value: "eagle_predator", label: "Eagle / predator" },
  { value: "other_wildlife", label: "Other wildlife" },
  { value: "shoreline_activity", label: "Shoreline activity" },
];

export const LOON_BEHAVIORS: { value: LoonBehavior; label: string }[] = [
  { value: "feeding", label: "Feeding" },
  { value: "diving", label: "Diving" },
  { value: "tremolo_call", label: "Tremolo call" },
  { value: "wail_call", label: "Wail call" },
  { value: "yodel_call", label: "Yodel call" },
  { value: "hoot_call", label: "Hoot call" },
  { value: "territorial_display", label: "Territorial display" },
  { value: "penguin_dance", label: "Penguin dance" },
  { value: "preening", label: "Preening" },
  { value: "resting", label: "Resting" },
  { value: "flying", label: "Flying" },
  { value: "nest_sitting", label: "Sitting on nest" },
  { value: "chick_carrying", label: "Carrying chick(s)" },
  { value: "foot_waggle", label: "Foot waggle" },
];
