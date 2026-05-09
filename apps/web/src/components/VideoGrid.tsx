"use client";

import { useEffect, useState } from "react";
import { api } from "../lib/api";
import {
  Download,
  ExternalLink,
  Check,
  Loader,
  VideoOff,
} from "lucide-react";
import { cn } from "../lib/utils";

// YouTube icon component
function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
    </svg>
  );
}

// TikTok icon component
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

type Video = {
  id: string;
  title: string;
  thumbnail: string;
  sourceUrl: string;
  platform: "youtube" | "tiktok";
};

type Props = {
  refreshToken: number;
  selectedVideoIds: string[];
  onSelectionChange: (videos: string[]) => void;
  onVideosLoaded: (videos: Video[]) => void;
};

export function VideoGrid({
  refreshToken,
  selectedVideoIds,
  onSelectionChange,
  onVideosLoaded,
}: Props) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingIds, setDownloadingIds] = useState<string[]>([]);

  async function load() {
    try {
      setError(null);
      setIsLoading(true);
      const data = await api<{ videos: Video[] }>("/videos");
      setVideos(data.videos);
      onVideosLoaded(data.videos);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed loading videos");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [refreshToken]);

  const onDownloadOne = async (videoId: string) => {
    setDownloadingIds((prev) => [...prev, videoId]);
    try {
      await api("/downloads/single", {
        method: "POST",
        body: JSON.stringify({ videoId }),
      });
    } finally {
      setTimeout(() => {
        setDownloadingIds((prev) => prev.filter((id) => id !== videoId));
      }, 1000);
    }
  };

  const onToggleSelect = (videoId: string) => {
    if (selectedVideoIds.includes(videoId)) {
      onSelectionChange(selectedVideoIds.filter((id) => id !== videoId));
      return;
    }
    onSelectionChange([...selectedVideoIds, videoId]);
  };

  const selectAll = () => {
    onSelectionChange(videos.map((v) => v.id));
  };

  const clearSelection = () => {
    onSelectionChange([]);
  };

  if (error) {
    return (
      <div className="rounded-xl bg-destructive/10 border border-destructive/30 p-6 text-center">
        <p className="text-destructive">{error}</p>
        <button
          onClick={load}
          className="mt-4 px-4 py-2 rounded-lg bg-destructive/20 text-destructive hover:bg-destructive/30 transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl bg-card border border-border overflow-hidden animate-pulse"
          >
            <div className="aspect-video bg-muted" />
            <div className="p-4 space-y-2">
              <div className="h-4 w-3/4 bg-muted rounded" />
              <div className="h-3 w-1/4 bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="rounded-xl bg-card border border-border p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center mb-4">
          <VideoOff className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No videos yet
        </h3>
        <p className="text-muted-foreground">
          Add a YouTube or TikTok channel above to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Selection controls */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {videos.length} video{videos.length !== 1 ? "s" : ""} found
          {selectedVideoIds.length > 0 && (
            <span className="text-primary ml-2">
              ({selectedVideoIds.length} selected)
            </span>
          )}
        </p>
        <div className="flex gap-2">
          <button
            onClick={selectAll}
            className="text-sm px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all"
          >
            Select All
          </button>
          {selectedVideoIds.length > 0 && (
            <button
              onClick={clearSelection}
              className="text-sm px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Video grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {videos.map((video) => {
          const isSelected = selectedVideoIds.includes(video.id);
          const isDownloading = downloadingIds.includes(video.id);

          return (
            <article
              key={video.id}
              className={cn(
                "group rounded-xl bg-card border overflow-hidden transition-all cursor-pointer",
                isSelected
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-border hover:border-muted-foreground"
              )}
              onClick={() => onToggleSelect(video.id)}
            >
              {/* Thumbnail */}
              <div className="relative aspect-video bg-muted overflow-hidden">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />

                {/* Selection indicator */}
                <div
                  className={cn(
                    "absolute top-2 left-2 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all",
                    isSelected
                      ? "bg-primary border-primary"
                      : "bg-black/50 border-white/50 group-hover:border-white"
                  )}
                >
                  {isSelected && <Check className="w-4 h-4 text-white" />}
                </div>

                {/* Platform badge */}
                <div className="absolute top-2 right-2">
                  <div
                    className={cn(
                      "px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1",
                      video.platform === "youtube"
                        ? "bg-red-500/90 text-white"
                        : "bg-black/90 text-white"
                    )}
                  >
                    {video.platform === "youtube" ? (
                      <YouTubeIcon className="w-3 h-3" />
                    ) : (
                      <TikTokIcon className="w-3 h-3" />
                    )}
                    {video.platform === "youtube" ? "YT" : "TT"}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h4 className="text-sm font-medium text-foreground line-clamp-2 mb-3">
                  {video.title}
                </h4>

                {/* Actions */}
                <div
                  className="flex gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => onDownloadOne(video.id)}
                    disabled={isDownloading}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                      isDownloading
                        ? "bg-primary/20 text-primary"
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                    )}
                  >
                    {isDownloading ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    {isDownloading ? "Queued" : "Download"}
                  </button>
                  <a
                    href={video.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center px-3 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
