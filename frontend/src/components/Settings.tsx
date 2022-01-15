/**
 * © 2022-2026 Ashraf Morningstar
 * https://github.com/AshrafMorningstar
 * 
 * This file is part of LinkedIn Viral Scheduler.
 * Created for educational and skill development purposes.
 */

import { useState, useEffect } from 'react'

/**
 * Settings Component
 * 
 * Manages administrative configuration and sensitive API credentials.
 * Utilizes `localStorage` for persistent storage of AI Provider keys,
 * ensuring they remain client-side for enhanced privacy.
 */
export function Settings() {
    /** 
     * AI Provider State
     * Holds API keys for various content generation services.
     */
    const [keys, setKeys] = useState({
        openai: '',
        gemini: '',
        deepseek: ''
    })

    /**
     * Initialization Logic
     * Hydrates the component state from browser storage on secure mount.
     */
    useEffect(() => {
        const stored = localStorage.getItem('ai_keys')
        if (stored) {
            try {
                setKeys(JSON.parse(stored))
            } catch (error) {
                console.error("[Settings]: Failed to parse stored API keys.");
            }
        }
    }, [])

    /**
     * Settings Persistor
     * Commits the current state of API keys back to browser localStorage.
     */
    const handleSave = () => {
        localStorage.setItem('ai_keys', JSON.stringify(keys))
        alert('Configuration saved successfully! Your keys are stored locally on this machine.')
    }

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold text-slate-100 mb-6">Settings & API Keys</h2>
            
            <div className="space-y-4">
                <div>
                     <label className="block text-sm font-medium text-slate-300 mb-2">OpenAI API Key</label>
                     <input 
                        type="password"
                        value={keys.openai}
                        onChange={(e) => setKeys(prev => ({ ...prev, openai: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="sk-..."
                     />
                </div>
                <div>
                     <label className="block text-sm font-medium text-slate-300 mb-2">Google Gemini API Key</label>
                     <input 
                        type="password"
                        value={keys.gemini}
                        onChange={(e) => setKeys(prev => ({ ...prev, gemini: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="AIza..."
                     />
                </div>
                <div>
                     <label className="block text-sm font-medium text-slate-300 mb-2">DeepSeek API Key</label>
                     <input 
                        type="password"
                        value={keys.deepseek}
                        onChange={(e) => setKeys(prev => ({ ...prev, deepseek: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="ds-..."
                     />
                </div>
            </div>

            <div className="mt-8 flex justify-end">
                <button 
                    onClick={handleSave}
                    className="bg-green-600 hover:bg-green-500 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
                >
                    Save Settings
                </button>
            </div>
        </div>
    )
}
