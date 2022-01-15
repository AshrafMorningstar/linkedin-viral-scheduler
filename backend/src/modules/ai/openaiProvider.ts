/**
 * © 2022-2026 Ashraf Morningstar
 * https://github.com/AshrafMorningstar
 * 
 * This file is part of LinkedIn Viral Scheduler.
 * Created for educational and skill development purposes.
 */

import OpenAI from 'openai';
import { AIProvider, AIPostInput, AIPostOutput } from './providers';

/**
 * OpenAIProviderImpl
 * 
 * Implementation of AIProvider using the OpenAI GPT-3.5 or GPT-4 models.
 * Optimized for high-engagement LinkedIn content generation.
 */
export class OpenAIProviderImpl implements AIProvider {
  /** Identifier for the provider */
  name = 'openai';
  
  /** OpenAI SDK Client */
  private client: OpenAI;

  /**
   * @param apiKey - Valid OpenAI API Key
   */
  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  /**
   * Generates a LinkedIn post using OpenAI Chat Completion.
   * 
   * @param input - Contextual hints and media information
   * @returns Structured object containing viral hooks and post body
   * @throws Error if the API request fails or response format is invalid
   */
  async generatePost(input: AIPostInput): Promise<AIPostOutput> {
    /**
     * Optimized Prompt Engineering
     * Strategies:
     * 1. Context-aware role definition (LinkedIn Expert)
     * 2. Structured output requirement (Raw JSON)
     * 3. Specific formatting constraints
     */
    const prompt = `
You are a LinkedIn content expert.
Media type: ${input.mediaType}
Context: ${input.contextHint || "professional update"}

Write:
1) A 2–3 line hook (grab attention).
2) A body of 3–8 short paragraphs/sentences.
3) 3–5 professional hashtags.
4) An alt-text description.

Return ONLY a JSON object with keys: hook, body, hashtags, altText.
`;

    const completion = await this.client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });

    const content = completion.choices[0].message.content || "{}";
    
    try {
        /** Programmatic data parsing and validation */
        const json = JSON.parse(content);
        return {
            hook: json.hook || "",
            body: json.body || "",
            hashtags: json.hashtags || "",
            altText: json.altText || ""
        };
    } catch (e) {
        console.error("[OpenAI Error]: Parser failed to process AI response payload:", content);
        throw new Error("AI response parsing failed - Non-conformant payload.");
    }
  }
}
