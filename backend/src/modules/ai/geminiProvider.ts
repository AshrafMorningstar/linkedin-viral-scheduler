/**
 * © 2022-2026 Ashraf Morningstar
 * https://github.com/AshrafMorningstar
 * 
 * This file is part of LinkedIn Viral Scheduler.
 * Created for educational and skill development purposes.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIProvider, AIPostInput, AIPostOutput } from "./providers";

/**
 * GeminiProviderImpl
 * 
 * Implementation of AIProvider using Google's Generative AI (Gemini Pro).
 * Optimized for generating viral LinkedIn content with structured JSON output.
 */
export class GeminiProviderImpl implements AIProvider {
  /** Identifier for the provider */
  name = "gemini";
  
  /** Google Generative AI instance */
  private genAI: GoogleGenerativeAI;

  /**
   * @param apiKey - Valid Google AI API Key
   */
  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  /**
   * Generates a LinkedIn post using the Gemini Pro model.
   * 
   * @param input - The media type and context hints for the post
   * @returns A structured post object containing hook, body, hashtags, and altText
   * @throws Error if AI generation or parsing fails
   */
  async generatePost(input: AIPostInput): Promise<AIPostOutput> {
    const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });

    /**
     * System Prompt for LinkedIn Optimization
     * Designed to force the model to return raw JSON for programmatic parsing.
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
DO NOT wrap in markdown code blocks.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    /**
     * Sanitization Logic
     * Ensures any accidental markdown formatting (like ```json) is removed before parsing.
     */
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

    try {
      const json = JSON.parse(cleanText);
      return {
        hook: json.hook || "",
        body: json.body || "",
        hashtags: json.hashtags || "",
        altText: json.altText || ""
      };
    } catch (e) {
      console.error("[Gemini Error]: Analysis failed to produce valid JSON", cleanText);
      throw new Error("AI response parsing failed - non-JSON format returned");
    }
  }
}
