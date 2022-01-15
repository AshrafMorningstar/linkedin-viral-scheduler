/**
 * © 2022-2026 Ashraf Morningstar
 * https://github.com/AshrafMorningstar
 * 
 * This file is part of LinkedIn Viral Scheduler.
 * Created for educational and skill development purposes.
 */

import { PrismaClient } from '@prisma/client';
import { AIProviderFactory } from './factory';
import { assignSchedulesForUser } from '../scheduler/viralScheduler';

const prisma = new PrismaClient();

/**
 * Orchestrates the generation of LinkedIn post drafts for a specific user.
 * 
 * This function:
 * 1. Identifies unprocessed media items ('NEW' status)
 * 2. Initializes the requested AI provider (OpenAI, Gemini, etc.)
 * 3. Iterates through media to generate viral hooks, body content, and hashtags
 * 4. Persists the generated drafts into the database
 * 5. Triggers the automatic scheduling logic to assign posting times
 * 
 * @param userId - The unique identifier of the user
 * @param providerName - Name of the AI service to use (defaults to 'openai')
 * @param apiKeyOverride - Optional API key if provided by the client (localStorage)
 */
export async function generateDraftsForUser(userId: string, providerName: string = 'openai', apiKeyOverride?: string) {
    /**
     * API Key Resolution
     * Determines the appropriate key based on provider and optional client overrides.
     */
    let apiKey = process.env.OPENAI_API_KEY || "";
    if (providerName === 'gemini') apiKey = process.env.GEMINI_API_KEY || "";
    if (apiKeyOverride) apiKey = apiKeyOverride;

    if (!apiKey) {
        console.error(`[AI Error]: Authentication key missing for provider: ${providerName}`);
        return;
    }
    
    const provider = AIProviderFactory.getProvider(providerName, apiKey);
    
    /**
     * Fetch New Media
     * Only process media items that haven't been draft-generated yet.
     */
    const newMedia = await prisma.mediaItem.findMany({
        where: { userId: userId, status: 'NEW' }
    });

    for (const media of newMedia) {
        console.log(`[AI Orchestrator]: Analyzing media: ${media.path}`);
        try {
            /** AI Generation Invocation */
            const aiResult = await provider.generatePost({
                mediaType: media.mediaType as any,
                contextHint: "Viral LinkedIn Post"
            });

            /** Database Persistence for Generated Draft */
            await prisma.postDraft.create({
                data: {
                    userId: userId,
                    mediaItemId: media.id,
                    hook: aiResult.hook,
                    body: aiResult.body,
                    hashtags: aiResult.hashtags,
                    altText: aiResult.altText,
                    score: 0
                }
            });

            /** Status Update */
            await prisma.mediaItem.update({
                where: { id: media.id },
                data: { status: 'PROCESSED' }
            });
            console.log(`[AI Success]: Draft finalized for ${media.path}`);
        } catch (error) {
            console.error(`[AI Failure]: Could not generate content for media ID: ${media.id}`, error);
        }
    }

    /**
     * Dynamic Scheduling Sequence
     * After drafts are created, we automatically assign optimal posting times
     * using the AI-driven scheduling algorithm.
     */
    console.log(`[Scheduler]: Assigning posting slots for ${userId}...`);
    await assignSchedulesForUser(userId, 'UTC', true);
}
