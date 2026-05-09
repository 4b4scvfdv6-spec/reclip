"use client";

import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Video, Upload, Check, CircleAlert } from "lucide-react";
import { cn } from "../lib/utils";

type CtaConfig = { title: string; subtitle: string; videoUrl: string };

export function TopCtaBanner({
  onCtaChange,
}: {
  onCtaChange?: (videoUrl: string | null) => void;
}) {
  const [cta, setCta] = useState<CtaConfig | null>(null);
  const [videoUrlInput, setVideoUrlInput] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle"
  );
  const [error, setError] = useState("");

  useEffect(() => {
    api<CtaConfig>("/cta/config")
      .then((data) => {
        setCta(data);
        setVideoUrlInput(data.videoUrl || "");
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    onCtaChange?.(cta?.videoUrl ? cta.videoUrl : null);
  }, [cta, onCtaChange]);

  const onClick = async () => {
    await api("/cta/click", { method: "POST" });
  };

  const saveVideo = async () => {
    setError("");
    setStatus("saving");
    try {
      const data = await api<{ videoUrl: string }>("/cta/video", {
        method: "POST",
        body: JSON.stringify({ videoUrl: videoUrlInput.trim() }),
      });
      setCta((prev) =>
        prev
          ? {
              ...prev,
              videoUrl: data.videoUrl,
            }
          : prev
      );
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2000);
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Failed to save CTA video");
    }
  };

  if (!cta) {
    return (
      <div className="rounded-xl bg-card border border-border p-6 mb-6 animate-pulse">
        <div className="h-6 w-48 bg-muted rounded mb-2" />
        <div className="h-4 w-64 bg-muted rounded" />
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-gradient-to-br from-card to-card/80 border border-border overflow-hidden mb-6">
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Video className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-foreground">
              {cta.title}
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {cta.subtitle}
            </p>

            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <input
                  value={videoUrlInput}
                  onChange={(e) => setVideoUrlInput(e.target.value)}
                  placeholder="https://example.com/your-cta-video.mp4"
                  className="w-full px-4 py-2.5 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>
              <button
                onClick={saveVideo}
                disabled={status === "saving"}
                className={cn(
                  "flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all",
                  status === "saved"
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : status === "error"
                      ? "bg-destructive/20 text-destructive border border-destructive/30"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
              >
                {status === "saving" ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : status === "saved" ? (
                  <>
                    <Check className="w-4 h-4" />
                    Saved
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Save CTA Video
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="mt-3 flex items-center gap-2 text-sm text-destructive">
                <CircleAlert className="w-4 h-4" />
                {error}
              </div>
            )}
          </div>
        </div>
      </div>

      {cta.videoUrl ? (
        <div className="border-t border-border bg-black/20">
          <video
            controls
            preload="metadata"
            className="w-full max-h-[320px] object-contain"
            onPlay={onClick}
          >
            <source src={cta.videoUrl} type="video/mp4" />
            Your browser does not support the CTA video.
          </video>
        </div>
      ) : (
        <div className="border-t border-border bg-muted/30 p-8 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Video className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">
            No CTA video set yet. Paste a video URL above and save.
          </p>
        </div>
      )}
    </div>
  );
}
