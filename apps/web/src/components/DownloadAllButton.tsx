"use client";

import { useState } from "react";
import { api } from "../lib/api";
import { Download, Loader, CircleCheck } from "lucide-react";
import { cn } from "../lib/utils";

export function DownloadAllButton({ videoIds }: { videoIds: string[] }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [jobId, setJobId] = useState<string | null>(null);

  const downloadAll = async () => {
    setStatus("loading");
    try {
      const { jobId } = await api<{ jobId: string }>("/downloads/bulk", {
        method: "POST",
        body: JSON.stringify({ videoIds }),
      });
      setJobId(jobId);
      setStatus("success");
      setTimeout(() => {
        setStatus("idle");
        setJobId(null);
      }, 3000);
    } catch {
      setStatus("idle");
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={downloadAll}
        disabled={!videoIds.length || status === "loading"}
        className={cn(
          "flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all",
          status === "success"
            ? "bg-green-500/20 text-green-400 border border-green-500/30"
            : "bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      >
        {status === "loading" ? (
          <>
            <Loader className="w-4 h-4 animate-spin" />
            Queueing...
          </>
        ) : status === "success" ? (
          <>
            <CircleCheck className="w-4 h-4" />
            Queued
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            Download All ({videoIds.length})
          </>
        )}
      </button>
      {jobId && (
        <span className="text-sm text-muted-foreground">Job ID: {jobId}</span>
      )}
    </div>
  );
}
