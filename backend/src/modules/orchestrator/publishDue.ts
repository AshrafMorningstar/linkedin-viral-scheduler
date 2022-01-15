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
 * Mock LinkedIn Publication Engine
 * 
 * In a production environment, this function would interface with the LinkedIn
 * Marketing Developer Platform API (e.g., /shares or /posts endpoints).
 * Here, we simulate the network request and the resulting LinkedIn URN.
 * 
 * @param schedule - The schedule plan object including post draft and account details
 * @returns A simulated LinkedIn Post URN
 */
async function mockPublishToLinkedIn(schedule: any) {
  console.log(`[LinkedIn Publisher]: Initiating share for post ${schedule.postDraft.id}`);
  console.log(`[LinkedIn Publisher]: Content payload: "${schedule.postDraft.body.slice(0, 50)}..."`);
  
  /** Simulated Network Latency */
  return `urn:li:share:${Date.now()}`;
}

/**
 * Automaton: Publication Orchestrator
 * 
 * Periodically invoked (via cron in server.ts) to identify, publish,
 * and mark schedules that have reached their target execution time.
 */
export async function publishDueSchedules() {
  const now = DateTime.utc().toJSDate();

  /**
   * Selection Logic
   * Fetches all PENDING or QUEUED schedules where the scheduledAt time
   * is less than or equal to the current system time.
   */
  const due = await prisma.schedulePlan.findMany({
    where: {
      status: { in: ['PENDING', 'QUEUED'] },
      scheduledAt: { lte: now }
    },
    include: {
      postDraft: { include: { mediaItem: true } },
      linkedinAccount: true
    }
  });

  if (due.length > 0) {
    console.log(`[Publisher]: Processing ${due.length} scheduled items...`);
  }

  for (const schedule of due) {
    try {
      /** Execution block for the mock publisher */
      const postUrn = await mockPublishToLinkedIn(schedule);

      /** Database update on successful transmission */
      await prisma.schedulePlan.update({
        where: { id: schedule.id },
        data: { status: 'POSTED', linkedinPostUrn: postUrn }
      });
      console.log(`[Publisher Success]: Published schedule ID: ${schedule.id}`);
    } catch (e) {
      console.error(`[Publisher Failure]: Execution failed for schedule ${schedule.id}:`, e);
      
      /** Error state persistence */
      await prisma.schedulePlan.update({
        where: { id: schedule.id },
        data: { status: 'FAILED' }
      });
    }
  }
}
