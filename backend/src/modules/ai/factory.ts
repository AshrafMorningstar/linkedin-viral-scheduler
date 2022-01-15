/**
 * © 2022-2026 Ashraf Morningstar
 * https://github.com/AshrafMorningstar
 * 
 * This file is part of LinkedIn Viral Scheduler.
 * Created for educational and skill development purposes.
 */

import { AIProvider, AIPostInput, AIPostOutput } from './providers';
import { OpenAIProviderImpl } from './openaiProvider';
import { GeminiProviderImpl } from './geminiProvider';

/**
 * AIProviderFactory
 * 
 * A creational design pattern implementation (Factory Method) to abstract
 * the instantiation of different AI content generation providers.
 */
export class AIProviderFactory {
    /**
     * Instantiates and returns an AI provider based on the specified name.
     * 
     * @param providerName - The name of the AI service (e.g., 'openai', 'gemini', 'deepseek')
     * @param apiKey - The authentication key for the selected AI service
     * @returns An instance of AIProvider corresponding to the requested service
     */
    static getProvider(providerName: string, apiKey: string): AIProvider {
        const normalizedName = providerName.toLowerCase();
        
        console.log(`[AI Factory]: Initializing provider for ${normalizedName}`);
        
        switch (normalizedName) {
            case 'gemini':
                return new GeminiProviderImpl(apiKey);
            
            case 'deepseek':
                /**
                 * DeepSeek implementation note:
                 * DeepSeek often provides an OpenAI-compatible API. For enhanced
                 * flexibility, we can configure the OpenAI provider with a custom
                 * base URL if needed.
                 */
                return new OpenAIProviderImpl(apiKey); 
            
            case 'openai':
            default:
                return new OpenAIProviderImpl(apiKey);
        }
    }
}
