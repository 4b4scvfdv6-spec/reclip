import { Router } from 'express';
import { z } from 'zod';
import { config } from '../lib/config.js';
import { db } from '../lib/db.js';

const schema = z.object({
  urls: z.array(z.string().url()).min(1),
  audioUrl: z.string().url().nullable().optional(),
  ctaUrl: z.string().url().optional()
});

export const stitchRouter = Router();

stitchRouter.post('/', async (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  db.stitchSubmissions += 1;

  if (!config.FFMPEG_API_URL) {
    return res.status(503).json({ error: 'Stitch API is not configured yet' });
  }

  try {
    const { urls, ctaUrl, audioUrl } = parsed.data;

    const headers: Record<string, string> = { 'content-type': 'application/json' };
    if (config.FFMPEG_API_KEY) {
      headers.authorization = `Bearer ${config.FFMPEG_API_KEY}`;
    }

    if (ctaUrl) {
      // Stitch each short individually with the CTA video appended
      const stitchedBlobs: Buffer[] = [];

      for (const shortUrl of urls) {
        const stitchResponse = await fetch(config.FFMPEG_API_URL, {
          method: 'POST',
          headers,
          body: JSON.stringify({ urls: [shortUrl, ctaUrl], audioUrl })
        });

        if (!stitchResponse.ok) {
          const errText = await stitchResponse.text().catch(() => '');
          return res.status(stitchResponse.status).json({
            error: `Stitch failed: ${stitchResponse.status} ${errText}`
          });
        }

        stitchedBlobs.push(Buffer.from(await stitchResponse.arrayBuffer()));
      }

      const stitchedVideos = stitchedBlobs.map((buffer, index) => ({
        filename: `stitched-short-${index + 1}.mp4`,
        data: buffer.toString('base64'),
        contentType: 'video/mp4'
      }));

      return res.json({ videos: stitchedVideos });
    } else {
      const response = await fetch(config.FFMPEG_API_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({ urls, audioUrl })
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        return res.status(response.status).json({ error: `Stitch failed: ${response.status} ${errText}` });
      }

      const stitchedBuffer = Buffer.from(await response.arrayBuffer());
      res.setHeader('content-type', response.headers.get('content-type') || 'video/mp4');
      res.setHeader('content-disposition', 'attachment; filename="stitched.mp4"');
      return res.status(200).send(stitchedBuffer);
    }
  } catch (error) {
    console.error('Stitch API unavailable', error);
    return res.status(502).json({ error: 'Stitch API unavailable' });
  }
});
