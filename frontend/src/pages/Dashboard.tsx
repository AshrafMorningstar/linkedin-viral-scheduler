/**
 * © 2022-2026 Ashraf Morningstar
 * https://github.com/AshrafMorningstar
 * 
 * This file is part of LinkedIn Viral Scheduler.
 * Created for educational and skill development purposes.
 */

import { useState } from 'react'
import { PostCreator } from '../components/PostCreator'
import { PostQueue } from '../components/PostQueue'
import { Settings } from '../components/Settings'
import { LayoutDashboard, Calendar, Settings as SettingsIcon } from 'lucide-react'

/**
 * Dashboard Page
 * 
 * The primary interface hub for the LinkedIn Viral Scheduler.
 * Manages the application-level navigation and state for various
 * functional tabs including content creation, queue management, and settings.
 */
export function Dashboard() {
  /** 
   * Active Tab State
   * Controls which view is currently rendered in the main content area.
   */
  const [activeTab, setActiveTab] = useState<'create' | 'queue' | 'drafts' | 'schedule' | 'settings'>('create')

  return (
    <div className="min-h-screen p-8 max-w-7xl mx-auto">
      <header className="mb-8 flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            LinkedIn Viral Scheduler
            </h1>
            <p className="text-slate-400">API-Based Compliant Automation</p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={() => setActiveTab('settings')}
                className="p-2 text-slate-400 hover:text-white transition-colors"
                title="Settings"
            >
                <SettingsIcon className="w-6 h-6" />
            </button>
        </div>
      </header>

      {/* Navigation Tab Bar */}
      <div className="flex gap-4 border-b border-slate-800 mb-6">
        <button
            onClick={() => setActiveTab('create')}
            className={`pb-2 px-4 flex items-center gap-2 ${activeTab === 'create' ? 'border-b-2 border-blue-500 text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
        >
            <LayoutDashboard className="w-4 h-4" />
            Create
        </button>
        <button
            onClick={() => setActiveTab('queue')}
            className={`pb-2 px-4 flex items-center gap-2 ${activeTab === 'queue' ? 'border-b-2 border-blue-500 text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
        >
            <Calendar className="w-4 h-4" />
            Queue & Drafts
        </button>
      </div>

      {/* Dynamic View Injection */}
      <main>
        {activeTab === 'create' && (
            <PostCreator onTabChange={(tab) => setActiveTab(tab as any)} />
        )}

        {(activeTab === 'queue' || activeTab === 'drafts' || activeTab === 'schedule') && (
            <PostQueue />
        )}

        {activeTab === 'settings' && (
            <Settings />
        )}
      </main>
    </div>
  )
}
