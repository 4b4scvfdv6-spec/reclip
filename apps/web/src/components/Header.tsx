"use client";

import { Film, Download, Scissors } from "lucide-react";

export function Header() {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">RECLIP</h1>
              <p className="text-xs text-muted-foreground">
                Video Downloader & Stitcher
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Download className="w-4 h-4" />
              <span>Download</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Scissors className="w-4 h-4" />
              <span>Stitch</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
