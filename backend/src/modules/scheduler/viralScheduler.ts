/**
 * © 2022-2026 Ashraf Morningstar
 * https://github.com/AshrafMorningstar
 * 
 * This file is part of LinkedIn Viral Scheduler.
 * Created for educational and skill development purposes.
 */

import { PrismaClient } from '@prisma/client';
import { DateTime } from 'luxon';

const prisma = new PrismaClient();

/**
 * Optimal Posting Windows (UTC)
 * Based on LinkedIn global engagement heatmaps:
 * Tue, Wed, Thu are peak engagement days, particularly mid-morning and mid-afternoon.
 */
const PRIME_WINDOWS = [
  { weekday: 2, hour: 10 }, // Tue 10:00
  { weekday: 2, hour: 14 }, // Tue 14:00
  { weekday: 3, hour: 10 }, // Wed 10:00
  { weekday: 3, hour: 14 }, // Wed 14:00
  { weekday: 4, hour: 10 }, // Thu 10:00
  { weekday: 4, hour: 14 }  // Thu 14:00
];

/**
 * AI-powered best time prediction (Simplified Heuristic Engine)
 * 
 * In a production environment, this would interface with a machine learning model
 * trained on local account history to identify unique engagement patterns.
 * 
 * @param contentType - The text content of the post
 * @param mediaType - The type of media attached (IMAGE, VIDEO, DOCUMENT)
 * @returns Best weekday, hour, and the AI reasoning behind the choice
 */
function predictBestTime(contentType: string, mediaType: string): { weekday: number; hour: number; reasoning: string } {
    if (mediaType === 'VIDEO') {
        /** Videos: High engagement early week morning */
        return { 
            weekday: 2, 
            hour: 10, 
            reasoning: 'Video content captures peak attention during Tuesday morning focus blocks.' 
        };
    } else if (mediaType === 'DOCUMENT') {
        /** PDF/Carousels: Mid-week afternoon depth checks */
        return { 
            weekday: 3, 
            hour: 14, 
            reasoning: 'Professional carousels/documents see higher save rates on Wednesday afternoons.' 
        };
    } else {
        /** Standard Images: Thursday afternoon recap */
        return { 
            weekday: 4, 
            hour: 14, 
            reasoning: 'Visual imagery performs optimally as the mid-week professional workload tapers.' 
        };
    }
}

/**
 * Assigns posting schedules to all pending drafts for a specific user.
 * 
 * @param userId - Unique user identifier
 * @param timezone - Target timezone for calculation (defaults to 'UTC')
 * @param useAI - Whether to use AI-driven prediction or fallback to fixed prime slots
 */
export async function assignSchedulesForUser(userId: string, timezone: string = 'UTC', useAI: boolean = true) {
  /** Fetch all drafts that haven't been assigned a schedule yet */
  const drafts = await prisma.postDraft.findMany({
    where: {
      userId: userId,
      schedules: { none: {} }
    },
    include: { mediaItem: true }
  });

  if (!drafts.length) {
    console.log(`[Scheduler]: No pending drafts for user ${userId}. Skipping.`);
    return;
  }

  const now = DateTime.now().setZone(timezone);
  let index = 0;

  for (const draft of drafts) {
    let slot;
    let reasoning = 'Standard viral window assignment';

    if (useAI && draft.mediaItem) {
        /** AI Prediction Path */
        const prediction = predictBestTime(draft.body || '', draft.mediaItem.mediaType);
        slot = prediction;
        reasoning = prediction.reasoning;
    } else {
        /** Fallback Heuristic Path */
        slot = PRIME_WINDOWS[index % PRIME_WINDOWS.length];
    }

    /** Ensure we don't schedule everything in the same week if high volume */
    const baseWeekAdd = Math.floor(index / PRIME_WINDOWS.length);

    /** Initialize starting date/time object */
    let scheduled = now.plus({ weeks: baseWeekAdd })
      .set({ weekday: slot.weekday, hour: slot.hour, minute: 0, second: 0 });

    /** Safety Check: If the slot for the current week has passed, roll to next week */
    if (scheduled < now) {
      scheduled = scheduled.plus({ weeks: 1 });
    }

    /** Commit schedule to database */
    await prisma.schedulePlan.create({
      data: {
        userId: userId,
        postDraftId: draft.id,
        scheduledAt: scheduled.toJSDate(),
        status: 'PENDING',
      }
    });

    console.log(`[Scheduler]: Successfully assigned ${scheduled.toISO()} for draft ${draft.id} (${reasoning})`);
    index++;
  }
}
