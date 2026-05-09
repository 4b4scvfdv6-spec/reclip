"use client";

import { useMemo, useState } from "react";
import { Header } from "../components/Header";
import { TopCtaBanner } from "../components/TopCtaBanner";
import { ChannelForm } from "../components/ChannelForm";
import { DownloadAllButton } from "../components/DownloadAllButton";
import { VideoGrid } from "../components/VideoGrid";
import { StitchSelectedButton } from "../components/StitchSelectedButton";

type Video = {
  id: string;
  title: string;
  thumbnail: string;
  sourceUrl: string;
  platform: "youtube" | "tiktok";
};

export default function Page() {
  const [refreshToken, setRefreshToken] = useState(0);
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideoIds, setSelectedVideoIds] = useState<string[]>([]);
  const [ctaVideoUrl, setCtaVideoUrl] = useState<string | null>(null);

  const triggerRefresh = () => setRefreshToken((v) => v + 1);
  const ids = useMemo(() => videos.map((video) => video.id), [videos]);
  const selectedUrls = useMemo(
    () =>
      videos
        .filter((video) => selectedVideoIds.includes(video.id))
        .map((video) => video.sourceUrl),
    [videos, selectedVideoIds]
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero section */}
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-balance">
            Download & Stitch Social Videos
          </h2>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Add YouTube or TikTok channels, preview their videos, download
            clips, and stitch them together with your CTA video.
          </p>
        </div>

        {/* CTA Banner */}
        <TopCtaBanner onCtaChange={setCtaVideoUrl} />

        {/* Two column layout on larger screens */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1 space-y-6">
            {/* Channel Form */}
            <ChannelForm onAdded={triggerRefresh} />

            {/* Stitch Section */}
            <StitchSelectedButton
              selectedUrls={selectedUrls}
              ctaUrl={ctaVideoUrl}
            />
          </div>

          <div className="lg:col-span-2">
            {/* Actions bar */}
            <div className="rounded-xl bg-card border border-border p-4 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    Video Library
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {ctaVideoUrl
                      ? "Select videos to stitch with your CTA"
                      : "Add a CTA video to enable stitching"}
                  </p>
                </div>
                <DownloadAllButton videoIds={ids} />
              </div>
            </div>

            {/* Video Grid */}
            <VideoGrid
              refreshToken={refreshToken}
              selectedVideoIds={selectedVideoIds}
              onSelectionChange={setSelectedVideoIds}
              onVideosLoaded={setVideos}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-sm text-muted-foreground text-center">
            RECLIP - Video Downloader & Stitcher. Built for content creators.
          </p>
        </div>
      </footer>
    </div>
  );
}
