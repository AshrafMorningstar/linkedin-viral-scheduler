<!--
© 2022-2026 Ashraf Morningstar
https://github.com/AshrafMorningstar

This file is part of LinkedIn Viral Scheduler.
Created for educational and skill development purposes.
-->

# 🚀 Quick Start Guide

## Prerequisites

- Node.js 18+ installed
- npm or yarn
- At least one AI API key (OpenAI, Gemini, or DeepSeek)

## Installation (5 minutes)

### 1. Backend Setup

```bash
cd backend
npm install
npx prisma db push
```

### 2. Frontend Setup

```bash
cd frontend
npm install
```

### 3. Environment Configuration

Create `backend/.env`:

```env
PORT=3000
DATABASE_URL="file:./dev.db"
MEDIA_WATCH_DIR="C:/Users/Admin/Desktop/Morningstar/LInk Dot/3/media_watch"
OPENAI_API_KEY="sk-..."
GEMINI_API_KEY="AI..."
```

## Running the App

### Terminal 1 - Backend

```bash
cd backend
npm run dev
```

Server starts on http://localhost:3000

### Terminal 2 - Frontend

```bash
cd frontend
npm run dev
```

App opens on http://localhost:5173

## First Use

1. **Open** http://localhost:5173
2. **Click** Settings icon (top right)
3. **Enter** your AI API keys
4. **Save** settings
5. **Go to** Create tab
6. **Drag & drop** an image
7. **Click** "Generate & Schedule"
8. **View** your post in Queue tab
9. **Click** Share button to launch to LinkedIn!

## Troubleshooting

**"npm not found"**

- Install Node.js from https://nodejs.org

**"Cannot find module"**

- Run `npm install` in both backend and frontend

**"API key invalid"**

- Check your keys in Settings
- Verify format (OpenAI: sk-..., Gemini: AI...)

**"No posts generated"**

- Check backend console for errors
- Ensure media file is in supported format
- Try uploading directly via drag-and-drop

## Need Help?

Check the full [README.md](file:///c:/Users/Admin/Desktop/Morningstar/LInk%20Dot/3/README.md) or [Walkthrough](file:///c:/Users/Admin/.gemini/antigravity/brain/eb14bfc1-240e-448f-bb3c-69cdab19fc9f/walkthrough.md)
