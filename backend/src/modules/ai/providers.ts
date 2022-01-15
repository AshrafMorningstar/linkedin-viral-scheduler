/**
 * © 2022-2026 Ashraf Morningstar
 * https://github.com/AshrafMorningstar
 * 
 * This file is part of LinkedIn Viral Scheduler.
 * Created for educational and skill development purposes.
 */

/**
 * AIPostInput
 * 
 * Captures the necessary context and technical constraints for AI 
 * post generation.
 */
export type AIPostInput = {
  /** The specific medium being shared (Image, Video, or Document) */
  mediaType: 'IMAGE' | 'VIDEO' | 'DOCUMENT';
  
  /** Qualitative context to guide the tone and topic of the post */
  contextHint?: string;
  
  /** Base64 or raw string content for deep OCR/analysis if supported */
  fileContent?: string; 
};

/**
 * AIPostOutput
 * 
 * Represents the structured components of a professional LinkedIn post.
 */
export type AIPostOutput = {
  /** Attention-grabbing opening statement */
  hook: string;
  
  /** Detailed professional narrative */
  body: string;
  
  /** Strategic tagging for engagement reach */
  hashtags: string;
  
  /** Implicit description for accessibility and SEO */
  altText?: string;
};

/**
 * AIProvider
 * 
 * Abstract contract for implementing diverse AI content generation engines.
 */
export interface AIProvider {
  /** Descriptive name of the AI service provider */
  name: string;
  
  /** Method to invoke the AI generation pipeline */
  generatePost(input: AIPostInput): Promise<AIPostOutput>;
}
