"use client";

import { useAudioPlayer } from "@/components/audio/AudioPlayerProvider";
import { ToggleGroup } from "@/components/ui/ToggleGroup";
import { useClickOutside } from "@/hooks/use-click-outside";
import { type AudioTrack, type NatureTrackIcon } from "@/lib/audio-constants";
import {
  Bird,
  ChevronDown,
  ChevronUp,
  CloudRain,
  Flame,
  Headphones,
  Music2,
  Pause,
  Play,
  Trees,
  Volume2,
  Waves,
  type LucideIcon,
} from "lucide-react";
import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

const SECTION_STORAGE_KEY = "audio-player:section-open";

const NEW_PILL_CLASSNAME =
  "shrink-0 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300";

function AmbienceNewPill() {
  return (
    <span className={NEW_PILL_CLASSNAME} title="New">
      NEW
    </span>
  );
}

function readSectionOpen(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(SECTION_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function writeSectionOpen(open: boolean) {
  try {
    window.localStorage.setItem(SECTION_STORAGE_KEY, open ? "1" : "0");
  } catch {
    // Ignore storage errors
  }
}

const NATURE_TRACK_ICONS: Record<NatureTrackIcon, LucideIcon> = {
  trees: Trees,
  bird: Bird,
  "cloud-rain": CloudRain,
  flame: Flame,
  waves: Waves,
};

function TrackIcon({
  track,
  compact = false,
}: {
  track: AudioTrack;
  compact?: boolean;
}) {
  if (!track.icon) return null;

  const Icon = NATURE_TRACK_ICONS[track.icon];

  return (
    <Icon
      className={`shrink-0 ${compact ? "h-3.5 w-3.5" : "h-4 w-4"} ${track.iconClassName ?? "text-foreground/70"}`}
    />
  );
}

function TrackLabel({
  track,
  compact = false,
}: {
  track: AudioTrack;
  compact?: boolean;
}) {
  return (
    <>
      <TrackIcon track={track} compact={compact} />
      <span className="min-w-0 truncate">{track.title}</span>
    </>
  );
}

function natureItemClassName(
  track: AudioTrack,
  selected: boolean,
  extra = ""
) {
  if (!track.itemGradient) {
    return `${extra} transition-colors hover:bg-accent ${selected ? "bg-accent font-medium" : ""}`.trim();
  }

  return `${extra} relative overflow-hidden transition-opacity hover:opacity-90 ${
    selected ? "ring-1 ring-inset ring-foreground/20 font-medium" : ""
  }`.trim();
}

function TrackPicker({
  tracks,
  selectedTrackId,
  onSelect,
  disabled = false,
  menuPlacement = "top",
}: {
  tracks: AudioTrack[];
  selectedTrackId: string;
  onSelect: (trackId: string | null) => void;
  disabled?: boolean;
  menuPlacement?: "top" | "bottom";
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside(containerRef, () => setOpen(false), open);

  const selectedTrack = tracks.find((track) => track.id === selectedTrackId);
  const label = selectedTrack?.title ?? "None";

  const menuClassName =
    menuPlacement === "top"
      ? "absolute bottom-full left-0 right-0 z-50 mb-1 overflow-hidden rounded-md border bg-background shadow-lg"
      : "absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-md border bg-background shadow-lg";

  function handleSelect(trackId: string | null) {
    onSelect(trackId);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className={`relative ${open ? "z-50" : ""}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((isOpen) => !isOpen)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={`relative flex w-full items-center gap-2 overflow-hidden rounded-md border px-2 py-1.5 text-left text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${
          selectedTrack?.itemGradient
            ? "border-transparent"
            : "bg-background transition-colors hover:bg-accent"
        }`}
      >
        {selectedTrack?.itemGradient && (
          <span
            className={`pointer-events-none absolute inset-0 ${selectedTrack.itemGradient}`}
          />
        )}
        <span
          className={`relative flex min-w-0 flex-1 items-center gap-2 ${selectedTrack ? "" : "text-muted-foreground"}`}
        >
          {selectedTrack ? (
            <TrackLabel track={selectedTrack} />
          ) : (
            <span className="truncate">{label}</span>
          )}
        </span>
        <ChevronDown
          className={`relative h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className={menuClassName}>
          <ul
            role="listbox"
            aria-label="Tracks"
            className="max-h-36 overflow-y-auto overscroll-contain p-1 sm:max-h-44"
          >
            <li className="px-0.5">
              <button
                type="button"
                role="option"
                aria-selected={!selectedTrackId}
                onClick={() => handleSelect(null)}
                className={`flex w-full items-center rounded-md px-2.5 py-1.5 text-left text-sm transition-colors hover:bg-accent ${
                  !selectedTrackId ? "bg-accent font-medium" : ""
                }`}
              >
                None
              </button>
            </li>
            {tracks.map((track) => (
              <li key={track.id} className="px-0.5 py-0.5">
                <button
                  type="button"
                  role="option"
                  aria-selected={selectedTrackId === track.id}
                  onClick={() => handleSelect(track.id)}
                  className={natureItemClassName(
                    track,
                    selectedTrackId === track.id,
                    "flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm"
                  )}
                >
                  {track.itemGradient && (
                    <span
                      className={`pointer-events-none absolute inset-0 ${track.itemGradient}`}
                    />
                  )}
                  <span className="relative flex min-w-0 flex-1 items-center gap-2">
                    <TrackLabel track={track} />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function AudioPlayerControls({ compact = false }: { compact?: boolean }) {
  const {
    category,
    setCategory,
    trackId,
    tracks,
    selectTrack,
    currentTrack,
    isPlaying,
    togglePlay,
    volume,
    setVolume,
  } = useAudioPlayer();

  const hasTracks = tracks.length > 0;
  const selectedTrackId =
    currentTrack?.category === category ? (trackId ?? "") : "";

  return (
    <div className={compact ? "space-y-3 p-3" : "space-y-3 px-2 py-3"}>
      <ToggleGroup
        className={compact ? "w-full" : ""}
        options={[
          {
            value: "music",
            label: compact ? "Music" : "Music",
            icon: <Music2 className="h-3.5 w-3.5" />,
          },
          {
            value: "nature",
            label: compact ? "Nature" : "Nature",
            icon: <Trees className="h-3.5 w-3.5" />,
          },
        ]}
        value={category}
        onChange={(value) => setCategory(value as "music" | "nature")}
      />

      <div>
        <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          Track
        </label>
        <TrackPicker
          tracks={tracks}
          selectedTrackId={selectedTrackId}
          onSelect={selectTrack}
          disabled={!hasTracks}
          menuPlacement={compact ? "bottom" : "top"}
        />
        {!hasTracks && (
          <p className="mt-1 text-[11px] text-muted-foreground">
            Add MP3 files to public/audio and register them in audio-constants.ts
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={togglePlay}
          disabled={!currentTrack}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border bg-background text-foreground shadow-sm transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </button>

        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Volume2 className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            type="range"
            min={0}
            max={100}
            value={volume}
            onChange={(event) => setVolume(Number(event.target.value))}
            className="h-1.5 w-full cursor-pointer accent-emerald-600"
            aria-label="Volume"
          />
        </div>
      </div>
    </div>
  );
}

function NowPlayingLabel({ title }: { title: string }) {
  return (
    <p className="truncate px-2 pb-0.5 text-[10px] text-muted-foreground">
      Now playing: {title}
    </p>
  );
}

type SidebarAudioPlayerProps = {
  collapsed: boolean;
};

export default function SidebarAudioPlayer({ collapsed }: SidebarAudioPlayerProps) {
  const { isPlaying, currentTrack, togglePlay } = useAudioPlayer();
  const [sectionOpen, setSectionOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [popoverPosition, setPopoverPosition] = useState({
    left: 0,
    bottom: 0,
  });

  useEffect(() => {
    setSectionOpen(readSectionOpen());
    setMounted(true);
  }, []);

  useEffect(() => {
    function onOpenAmbience() {
      setSectionOpen(true);
      writeSectionOpen(true);
    }
    window.addEventListener("openAmbiencePlayer", onOpenAmbience);
    return () => window.removeEventListener("openAmbiencePlayer", onOpenAmbience);
  }, []);

  const toggleSection = () => {
    setSectionOpen((open) => {
      const next = !open;
      writeSectionOpen(next);
      return next;
    });
  };

  useEffect(() => {
    function updateLayout() {
      setIsDesktopCollapsed(collapsed && window.innerWidth >= 768);
    }

    updateLayout();
    window.addEventListener("resize", updateLayout);
    return () => window.removeEventListener("resize", updateLayout);
  }, [collapsed]);

  useEffect(() => {
    if (!popoverOpen || !buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    setPopoverPosition({
      left: rect.right + 8,
      bottom: window.innerHeight - rect.bottom,
    });
  }, [popoverOpen]);

  useEffect(() => {
    if (!popoverOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setPopoverOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [popoverOpen]);

  const popover = popoverOpen && mounted ? (
    <PopoverPanel
      ref={popoverRef}
      left={popoverPosition.left}
      bottom={popoverPosition.bottom}
      nowPlayingTrack={isPlaying ? currentTrack : null}
    >
      <AudioPlayerControls compact />
    </PopoverPanel>
  ) : null;

  const headphonesTitle =
    isPlaying && currentTrack
      ? `Now playing: ${currentTrack.title}`
      : "Music & nature sounds";

  if (isDesktopCollapsed) {
    return (
      <div className="hidden shrink-0 border-t md:block">
        <div className="flex justify-center px-2 py-3">
          <button
            ref={buttonRef}
            type="button"
            onClick={() => setPopoverOpen((open) => !open)}
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-md border bg-background text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-foreground"
            title={headphonesTitle}
            aria-label={headphonesTitle}
          >
            <Headphones className="h-5 w-5" />
            {isPlaying && currentTrack && (
              <span className="absolute right-0.5 top-0.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-background" />
            )}
          </button>
        </div>
        {popover && createPortal(popover, document.body)}
      </div>
    );
  }

  return (
    <div className="shrink-0 border-t">
      <div className="px-1 py-1">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={toggleSection}
            className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-accent/50"
            aria-expanded={sectionOpen}
          >
            <Headphones className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="min-w-0 truncate text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Ambience
            </span>
            <AmbienceNewPill />
            {isPlaying && currentTrack && (
              <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
            )}
            {sectionOpen ? (
              <ChevronUp className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" />
            ) : (
              <ChevronDown className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" />
            )}
          </button>
          {!sectionOpen && currentTrack && (
            <button
              type="button"
              onClick={togglePlay}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border bg-background text-foreground shadow-sm transition-colors hover:bg-accent"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="h-3.5 w-3.5" />
              ) : (
                <Play className="h-3.5 w-3.5" />
              )}
            </button>
          )}
        </div>
        {isPlaying && currentTrack && (
          <NowPlayingLabel title={currentTrack.title} />
        )}
      </div>
      {sectionOpen && <AudioPlayerControls />}
    </div>
  );
}

const PopoverPanel = forwardRef<
  HTMLDivElement,
  {
    left: number;
    bottom: number;
    children: ReactNode;
    nowPlayingTrack?: { title: string } | null;
  }
>(function PopoverPanel({ left, bottom, children, nowPlayingTrack }, ref) {
  return (
    <div
      ref={ref}
      style={{
        position: "fixed",
        left,
        bottom,
        width: 280,
      }}
      className="z-100 rounded-lg border bg-background shadow-xl"
    >
      <div className="border-b px-3 py-2">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold">Ambience</p>
          <AmbienceNewPill />
        </div>
        {nowPlayingTrack ? (
          <p className="truncate text-xs text-muted-foreground">
            Now playing: {nowPlayingTrack.title}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">Music & nature sounds</p>
        )}
      </div>
      {children}
    </div>
  );
});
