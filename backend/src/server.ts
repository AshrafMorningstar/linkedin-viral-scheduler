/**
 * © 2022-2026 Ashraf Morningstar
 * https://github.com/AshrafMorningstar
 * 
 * This file is part of LinkedIn Viral Scheduler.
 * Created for educational and skill development purposes.
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { startMediaWatcher } from './modules/media/mediaWatcher';
import { generateDraftsForUser } from './modules/ai/generateDrafts'; 
import { publishDueSchedules } from './modules/orchestrator/publishDue';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const prisma = new PrismaClient();

/**
 * Media Storage Configuration
 * Files are stored in the MEDIA_WATCH_DIR defined in .env or the 'media_watch' directory.
 */
const uploadDir = process.env.MEDIA_WATCH_DIR || path.join(process.cwd(), 'media_watch');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

app.use(cors());
app.use(express.json());

/**
 * @api {post} /upload Upload Media
 * @apiDescription Handles multipart form data for media uploads (Images, Videos, PDFs).
 */
app.post('/upload', upload.single('media'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    
    res.json({ 
        message: 'File uploaded successfully', 
        path: req.file.path,
        filename: req.file.filename 
    });
});

/**
 * Check API Status
 */
app.get('/', (req, res) => {
  res.send('LinkedIn Viral Scheduler API is running');
});

/**
 * @api {get} /media Fetch All Media
 * @apiDescription Retrieves a list of all detected media items in the database.
 */
app.get('/media', async (req, res) => {
    const items = await prisma.mediaItem.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(items);
});

/**
 * @api {get} /drafts Fetch All Drafts
 * @apiDescription Retrieves all post drafts with their associated media items.
 */
app.get('/drafts', async (req, res) => {
    const drafts = await prisma.postDraft.findMany({ 
        include: { mediaItem: true },
        orderBy: { createdAt: 'desc' } 
    });
    res.json(drafts);
});

/**
 * @api {get} /schedules Fetch All Schedules
 * @apiDescription Retrieves all scheduled posts, sorted by their posting time.
 */
app.get('/schedules', async (req, res) => {
    const schedules = await prisma.schedulePlan.findMany({
        include: { postDraft: true },
        orderBy: { scheduledAt: 'asc' }
    });
    res.json(schedules);
});

/**
 * @api {post} /generate Trigger AI Generation
 * @apiDescription Generates LinkedIn post content for new media using the specified AI provider.
 */
app.post('/generate', async (req, res) => {
    const user = await prisma.user.findFirst(); 
    if (!user) return res.status(404).json({ error: 'No user found' });

    const { provider, apiKey } = req.body;

    // Trigger asynchronous background generation to avoid blocking the request
    generateDraftsForUser(user.id, provider, apiKey).catch(err => {
        console.error("[Generation Error]:", err);
    });

    res.json({ message: 'Generation sequence triggered in background' });
});

/**
 * @api {post} /ai/image Generate AI Image (Stub)
 * @apiDescription Simulates AI image generation based on a text prompt.
 */
app.post('/ai/image', async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt required' });

    const result = {
        url: `https://via.placeholder.com/1024x1024.png?text=${encodeURIComponent(prompt.slice(0, 50))}`,
        message: 'Image generation placeholder active'
    };
    res.json(result);
});

/**
 * @api {post} /schedules/:id/launch Prepare Post for Sharing
 * @apiDescription Marks a schedule as 'POSTING' and returns content for clipboard usage.
 */
app.post('/schedules/:id/launch', async (req, res) => {
    const { id } = req.params;
    const schedule = await prisma.schedulePlan.findUnique({
        where: { id },
        include: { postDraft: true }
    });

    if (!schedule) return res.status(404).json({ error: 'Schedule not found' });

    await prisma.schedulePlan.update({
        where: { id },
        data: { status: 'POSTING' }
    });

    res.json({ 
        message: 'Post content prepared and marked as posting',
        content: `${schedule.postDraft.hook}\n\n${schedule.postDraft.body}\n\n${schedule.postDraft.hashtags}`
    });
});

/**
 * Initialize Server and Component Services
 */
app.listen(PORT, () => {
  console.log(`🚀 LinkedIn Viral Scheduler Server is live on http://localhost:${PORT}`);
  
  // Initialize Media Watchdog
  startMediaWatcher();
  
  // Initialize Automated Social Publisher (1-minute intervals)
  cron.schedule('* * * * *', () => {
    console.log('[System]: Checking for due schedules...');
    publishDueSchedules();
  });
});
