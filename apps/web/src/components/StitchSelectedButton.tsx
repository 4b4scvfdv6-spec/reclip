"use client";

import { useState } from "react";
import { apiBlob } from "../lib/api";
import { Scissors, Loader, CircleCheck, CircleAlert, Music } from "lucide-react";
import { cn } from "../lib/utils";

export function StitchSelectedButton({
  selectedUrls,
  ctaUrl,
}: {
  selectedUrls: string[];
  ctaUrl?: string | null;
}) {
  const [audioUrl, setAudioUrl] = useState("");
  const [showAudioInput, setShowAudioInput] = useState(false);
  const [status, setStatus] = useState<"idle" | "stitching" | "done" | "error">(
    "idle"
  );
  const [error, setError] = useState("");

  const stitchUrls = ctaUrl ? [...selectedUrls, ctaUrl] : selectedUrls;

  const stitch = async () => {
    setError("");
    setStatus("stitching");
    try {
      const blob = await apiBlob("/stitch/submit", {
        method: "POST",
        body: JSON.stringify({
          urls: stitchUrls,
          audioUrl: audioUrl.trim() ? audioUrl.trim() : null,
        }),
      });

      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `stitched-${Date.now()}.mp4`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
      setStatus("done");
      setTimeout(() => setStatus("idle"), 3000);
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Failed to stitch videos");
    }
  };

  const isDisabled = selectedUrls.length === 0 || !ctaUrl;

  return (
    <div className="rounded-xl bg-card border border-border p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Scissors className="w-5 h-5 text-primary" />
            Stitch Videos
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {selectedUrls.length > 0
              ? `${selectedUrls.length} video${selectedUrls.length !== 1 ? "s" : ""} selected + CTA`
              : "Select videos from the grid to stitch with your CTA"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAudioInput(!showAudioInput)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all",
              showAudioInput || audioUrl
                ? "bg-accent/10 border-accent/30 text-accent"
                : "bg-secondary border-border text-muted-foreground hover:text-foreground"
            )}
          >
            <Music className="w-4 h-4" />
            Audio
          </button>

          <button
            onClick={stitch}
            disabled={isDisabled || status === "stitching"}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all",
              status === "done"
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : status === "error"
                  ? "bg-destructive/20 text-destructive border border-destructive/30"
                  : "bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {status === "stitching" ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Stitching...
              </>
            ) : status === "done" ? (
              <>
                <CircleCheck className="w-4 h-4" />
                Downloaded
              </>
            ) : (
              <>
                <Scissors className="w-4 h-4" />
                Stitch & Download
              </>
            )}
          </button>
        </div>
      </div>

      {showAudioInput && (
        <div className="mt-4 pt-4 border-t border-border">
          <label className="block text-sm font-medium text-foreground mb-2">
            Background Audio (optional)
          </label>
          <input
            value={audioUrl}
            onChange={(e) => setAudioUrl(e.target.value)}
            placeholder="https://example.com/audio.mp3"
            className="w-full px-4 py-2.5 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
          />
        </div>
      )}

      {error && (
        <div className="mt-4 flex items-center gap-2 text-sm text-destructive">
          <CircleAlert className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  );
}
