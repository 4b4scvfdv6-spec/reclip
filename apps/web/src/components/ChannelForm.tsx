"use client";

import { FormEvent, useState } from "react";
import { api, Platform } from "../lib/api";
import { Plus, CircleAlert, Loader } from "lucide-react";
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

export function ChannelForm({ onAdded }: { onAdded: () => void }) {
  const [platform, setPlatform] = useState<Platform>("youtube");
  const [handle, setHandle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await api("/channels", {
        method: "POST",
        body: JSON.stringify({ platform, handle }),
      });
      setHandle("");
      onAdded();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add channel");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-xl bg-card border border-border p-6 mb-6">
      <h3 className="text-base font-semibold text-foreground mb-4">
        Add Channel
      </h3>
      <form onSubmit={submit} className="space-y-4">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPlatform("youtube")}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-lg border font-medium transition-all",
              platform === "youtube"
                ? "bg-red-500/10 border-red-500/30 text-red-400"
                : "bg-secondary border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground"
            )}
          >
            <YouTubeIcon className="w-4 h-4" />
            YouTube
          </button>
          <button
            type="button"
            onClick={() => setPlatform("tiktok")}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-lg border font-medium transition-all",
              platform === "tiktok"
                ? "bg-pink-500/10 border-pink-500/30 text-pink-400"
                : "bg-secondary border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground"
            )}
          >
            <TikTokIcon className="w-4 h-4" />
            TikTok
          </button>
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <input
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder={
                platform === "youtube"
                  ? "@channelname or channel URL"
                  : "@username or profile URL"
              }
              required
              className="w-full px-4 py-2.5 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !handle.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Add
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <CircleAlert className="w-4 h-4" />
            {error}
          </div>
        )}
      </form>
    </div>
  );
}
