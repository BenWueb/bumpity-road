"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  type AudioCategory,
  type AudioTrack,
  getTrackById,
  getTracksForCategory,
} from "@/lib/audio-constants";

const STORAGE_KEY = "audio-player";

type StoredState = {
  category: AudioCategory;
  trackId: string | null;
  volume: number;
};

type AudioPlayerContextValue = {
  category: AudioCategory;
  setCategory: (category: AudioCategory) => void;
  trackId: string | null;
  currentTrack: AudioTrack | null;
  tracks: AudioTrack[];
  selectTrack: (trackId: string | null) => void;
  isPlaying: boolean;
  togglePlay: () => void;
  pause: () => void;
  volume: number;
  setVolume: (volume: number) => void;
};

const AudioPlayerContext = createContext<AudioPlayerContextValue | null>(null);

function readStoredState(): StoredState {
  const fallback: StoredState = {
    category: "music",
    trackId: null,
    volume: 70,
  };

  if (typeof window === "undefined") return fallback;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<StoredState>;
    const category =
      parsed.category === "nature" ? "nature" : ("music" as AudioCategory);
    const volume =
      typeof parsed.volume === "number"
        ? Math.min(100, Math.max(0, parsed.volume))
        : fallback.volume;
    const trackId =
      typeof parsed.trackId === "string" ? parsed.trackId : fallback.trackId;

    const track = getTrackById(trackId);

    return {
      category,
      trackId: track ? track.id : null,
      volume,
    };
  } catch {
    return fallback;
  }
}

function writeStoredState(state: StoredState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore quota / private mode errors
  }
}

export function AudioPlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [category, setCategoryState] = useState<AudioCategory>("music");
  const [trackId, setTrackId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(70);

  const tracks = useMemo(() => getTracksForCategory(category), [category]);
  const currentTrack = useMemo(() => getTrackById(trackId), [trackId]);

  useEffect(() => {
    const stored = readStoredState();
    setCategoryState(stored.category);
    setTrackId(stored.trackId);
    setVolumeState(stored.volume);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    writeStoredState({ category, trackId, volume });
  }, [hydrated, category, trackId, volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume / 100;
  }, [volume, hydrated]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !hydrated) return;

    if (!currentTrack) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      setIsPlaying(false);
      return;
    }

    const shouldLoop = currentTrack.category === "nature";
    audio.loop = shouldLoop;

    if (audio.src !== new URL(currentTrack.src, window.location.origin).href) {
      audio.src = currentTrack.src;
      audio.load();
      setIsPlaying(false);
    }
  }, [currentTrack, hydrated]);

  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    void audio.play().then(() => {
      setIsPlaying(true);
    }).catch(() => {
      setIsPlaying(false);
    });
  }, [currentTrack, isPlaying]);

  const selectTrack = useCallback((nextTrackId: string | null) => {
    const audio = audioRef.current;

    if (!nextTrackId) {
      if (audio) {
        audio.pause();
      }
      setIsPlaying(false);
      setTrackId(null);
      return;
    }

    const track = getTrackById(nextTrackId);
    if (!track || !audio) {
      setTrackId(nextTrackId);
      return;
    }

    audio.loop = track.category === "nature";
    audio.src = track.src;
    audio.load();
    setTrackId(nextTrackId);

    void audio
      .play()
      .then(() => {
        setIsPlaying(true);
      })
      .catch(() => {
        setIsPlaying(false);
      });
  }, []);

  const setCategory = useCallback((nextCategory: AudioCategory) => {
    setCategoryState(nextCategory);
  }, []);

  const setVolume = useCallback((nextVolume: number) => {
    setVolumeState(Math.min(100, Math.max(0, nextVolume)));
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onEnded = () => setIsPlaying(false);
    const onPause = () => {
      if (audio.ended) setIsPlaying(false);
    };
    const onPlay = () => setIsPlaying(true);

    audio.addEventListener("ended", onEnded);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("play", onPlay);

    return () => {
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("play", onPlay);
    };
  }, []);

  const value = useMemo<AudioPlayerContextValue>(
    () => ({
      category,
      setCategory,
      trackId,
      currentTrack,
      tracks,
      selectTrack,
      isPlaying,
      togglePlay,
      pause,
      volume,
      setVolume,
    }),
    [
      category,
      setCategory,
      trackId,
      currentTrack,
      tracks,
      selectTrack,
      isPlaying,
      togglePlay,
      pause,
      volume,
      setVolume,
    ]
  );

  return (
    <AudioPlayerContext.Provider value={value}>
      {children}
      <audio ref={audioRef} preload="none" className="hidden" aria-hidden />
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayer() {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error("useAudioPlayer must be used within AudioPlayerProvider");
  }
  return context;
}
