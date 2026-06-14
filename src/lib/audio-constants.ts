export type AudioCategory = "music" | "nature";

export type NatureTrackIcon =
  | "trees"
  | "bird"
  | "cloud-rain"
  | "flame"
  | "waves";

export type AudioTrack = {
  id: string;
  title: string;
  category: AudioCategory;
  /** Path under public/, e.g. "/audio/music/my-song.mp3" */
  src: string;
  artist?: string;
  icon?: NatureTrackIcon;
  /** Full-row gradient classes for nature tracks in the picker */
  itemGradient?: string;
  iconClassName?: string;
};

// Add tracks here after dropping MP3 files into public/audio/music/
export const MUSIC_TRACKS: AudioTrack[] = [
  {
    id: "friday",
    title: "Screen Porch Sunset",
    category: "music",
    src: "/audio/music/08 Chau Sara - Friday_639169972727327463.mp3",
  },
  {
    id: "leaving-earth",
    title: "Dust on the Drive",
    category: "music",
    src: "/audio/music/09 Hoffy Beats x Enluv - Leaving Earth_639169972746025909.mp3",
  },
  {
    id: "since-that-night",
    title: "Fireflies After Dark",
    category: "music",
    src: "/audio/music/10 Softy x Yasumu - Since That Night_639169972805424679.mp3",
  },
  {
    id: "became",
    title: "Home at Bumpity Road",
    category: "music",
    src: "/audio/music/11 Dontcry x Nokiaa - Became_639169972771943252.mp3",
  },
  {
    id: "choosing-you",
    title: "This Old Place",
    category: "music",
    src: "/audio/music/15 No Spirit x No Spirit - Choosing You_639169972855674065.mp3",
  },
  {
    id: "cozy",
    title: "Quilt & Coffee",
    category: "music",
    src: "/audio/music/17 Bcalm x Softy x Banks - Cozy_639169972786520461.mp3",
  },
  {
    id: "baltic-sea-cruise",
    title: "Big Lake Horizon",
    category: "music",
    src: "/audio/music/18 Kaspa x Piotr Wiese - Baltic Sea Cruise_639169972873457069.mp3",
  },
  {
    id: "littlewood-1",
    title: "Littlewood Path",
    category: "music",
    src: "/audio/music/19 Loafy Building x Amess - Littlewood 1_639169972710775459.mp3",
  },
  {
    id: "sleeping-in",
    title: "Sleep Till the Loons",
    category: "music",
    src: "/audio/music/21 Casiio x Dontcry - Sleeping In_639169972829413419.mp3",
  },
  {
    id: "take-me-far-away",
    title: "Far from the Highway",
    category: "music",
    src: "/audio/music/24 jhove x cxlt. - take me far away_639169972912903613.mp3",
  },
  {
    id: "serenity",
    title: "Morning on the Dock",
    category: "music",
    src: "/audio/music/26 Kinissue x Softy x Redmatic - Serenity_639169972894678225.mp3",
  },
];

// Add tracks here after dropping MP3 files into public/audio/nature/
export const NATURE_TRACKS: AudioTrack[] = [
  {
    id: "forest-ambience",
    title: "Forest Ambience",
    category: "nature",
    src: "/audio/nature/audiopapkin-forest-ambience-296528.mp3",
    icon: "trees",
    itemGradient:
      "bg-linear-to-r from-emerald-50 via-background to-teal-50 dark:from-emerald-950/30 dark:via-background dark:to-teal-950/20",
    iconClassName: "text-emerald-700 dark:text-emerald-400",
  },
  {
    id: "birds-forest",
    title: "Birds in the Forest",
    category: "nature",
    src: "/audio/nature/soundreality-birds-forest-nature-445379.mp3",
    icon: "bird",
    itemGradient:
      "bg-linear-to-r from-lime-50 via-background to-emerald-50 dark:from-lime-950/25 dark:via-background dark:to-emerald-950/20",
    iconClassName: "text-lime-700 dark:text-lime-400",
  },
  {
    id: "summer-rain",
    title: "Summer Rain",
    category: "nature",
    src: "/audio/nature/white_records-rain-sounds-relaxing-noise-and-sound-of-summer-rain-143334.mp3",
    icon: "cloud-rain",
    itemGradient:
      "bg-linear-to-r from-sky-50 via-background to-indigo-50 dark:from-sky-950/30 dark:via-background dark:to-indigo-950/20",
    iconClassName: "text-sky-700 dark:text-sky-400",
  },
  {
    id: "crackling-fire",
    title: "Crackling Fire",
    category: "nature",
    src: "/audio/nature/dragon-studio-fire-crackling-sounds-427410.mp3",
    icon: "flame",
    itemGradient:
      "bg-linear-to-r from-amber-50 via-background to-orange-50 dark:from-amber-950/30 dark:via-background dark:to-orange-950/20",
    iconClassName: "text-amber-700 dark:text-amber-400",
  },
  {
    id: "spring-stream",
    title: "Spring Stream",
    category: "nature",
    src: "/audio/nature/white_records-sound-of-a-quiet-spring-stream-background-sounds-of-nature-144993.mp3",
    icon: "waves",
    itemGradient:
      "bg-linear-to-r from-cyan-50 via-background to-sky-50 dark:from-cyan-950/25 dark:via-background dark:to-sky-950/20",
    iconClassName: "text-teal-700 dark:text-teal-400",
  },
];

export const ALL_AUDIO_TRACKS: AudioTrack[] = [...MUSIC_TRACKS, ...NATURE_TRACKS];

export function getTracksForCategory(category: AudioCategory): AudioTrack[] {
  return category === "music" ? MUSIC_TRACKS : NATURE_TRACKS;
}

export function getTrackById(id: string | null | undefined): AudioTrack | null {
  if (!id) return null;
  return ALL_AUDIO_TRACKS.find((track) => track.id === id) ?? null;
}
