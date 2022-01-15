/**
 * © 2022-2026 Ashraf Morningstar
 * https://github.com/AshrafMorningstar
 * 
 * This file is part of LinkedIn Viral Scheduler.
 * Created for educational and skill development purposes.
 */

import fs from 'fs';
import path from 'path';
import * as mime from 'mime-types';
import chokidar from 'chokidar';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const WATCH_DIR = process.env.MEDIA_WATCH_DIR || path.join(process.cwd(), 'media_watch');

if (!fs.existsSync(WATCH_DIR)) {
  fs.mkdirSync(WATCH_DIR, { recursive: true });
}

/**
 * Initializes the File System Media Watchdog.
 * 
 * Uses the Chokidar library to monitor the MEDIA_WATCH_DIR for new files
 * (Images, Videos, PDFs). When a file is added, it triggers the registration 
 * and AI analysis pipeline.
 */
export function startMediaWatcher() {
  console.log(`🚀 [System]: Activating Media Watcher on: ${WATCH_DIR}`);

  const watcher = chokidar.watch(WATCH_DIR, {
    ignored: /(^|[\/\\])\../, // ignore dotfiles
    persistent: true
  });

  /** Add Event Listener */
  watcher
    .on('add', async (filePath) => {
      console.log(`[Media Watcher]: New asset detected: ${path.basename(filePath)}`);
      await processNewFile(filePath);
    })
    .on('error', error => {
        console.error(`[Media Watcher Error]: ${error}`);
    });
}

/**
 * Handles the registration of newly detected media files.
 * 
 * 1. Extracts file metadata and MIME types
 * 2. Determines the category of media (IMAGE, VIDEO, DOCUMENT)
 * 3. Deduplicates based on file path to prevent double-entry
 * 4. Persists the media reference to the database attached to a default user
 * 
 * @param filePath - The absolute path of the newly added file
 */
async function processNewFile(filePath: string) {
  try {
    const fileName = path.basename(filePath);
    const mimeType = mime.lookup(filePath) || 'application/octet-stream';

    /** Basic Categorization Heuristic */
    let mediaType = 'DOCUMENT';
    if (mimeType.startsWith('image/')) mediaType = 'IMAGE';
    else if (mimeType.startsWith('video/')) mediaType = 'VIDEO';
    
    /** Database Deduplication */
    const exists = await prisma.mediaItem.findFirst({
      where: { path: filePath }
    });

    if (exists) {
      console.log(`[Media Watcher]: Asset already tracked: ${fileName}`);
      return;
    }

    /** 
     * User Association
     * For demo purposes, we associate media with the primary system user.
     */
    let user = await prisma.user.findFirst();
    if (!user) {
        user = await prisma.user.create({
            data: { email: 'demo@example.com' }
        });
    }

    /** Data Persistence */
    await prisma.mediaItem.create({
      data: {
        userId: user.id,
        path: filePath,
        mimeType: mimeType,
        mediaType: mediaType,
        status: 'NEW',
        meta: JSON.stringify({ 
            fileName, 
            addedAt: new Date().toISOString(),
            size: fs.statSync(filePath).size
        })
      }
    });
    
    console.log(`[Media Success]: Registered ${fileName} as ${mediaType}`);

  } catch (err) {
    console.error('[Media Logic Error]: Failed to index file:', err);
  }
}
