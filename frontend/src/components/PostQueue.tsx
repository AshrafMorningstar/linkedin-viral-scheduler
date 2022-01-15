/**
 * © 2022-2026 Ashraf Morningstar
 * https://github.com/AshrafMorningstar
 * 
 * This file is part of LinkedIn Viral Scheduler.
 * Created for educational and skill development purposes.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { Edit2, Send, Trash2, Calendar, FileText } from 'lucide-react'

const API_URL = 'http://localhost:3000'

type Schedule = {
    id: string
    scheduledAt: string
    status: string
    postDraft: {
        id: string
        hook: string
        body: string
        hashtags: string
        mediaItem?: {
            id: string
            path: string
            mediaType: string
        }
    }
}

/**
 * PostQueue Component
 * 
 * Displays a list of scheduled LinkedIn posts.
 * Allows users to review, edit, or manually "launch" (copy and open LinkedIn)
 * a post that is due for publication.
 */
export function PostQueue() {
    const queryClient = useQueryClient()
    
    /**
     * Fetch Scheduled Posts
     * Retrieves the upcoming and historical schedule plan from the API.
     */
    const { data: schedules } = useQuery({ 
        queryKey: ['schedules'], 
        queryFn: () => axios.get<Schedule[]>(`${API_URL}/schedules`).then(r => r.data) 
    })

    /**
     * Launch Mutation
     * 1. Extracts post content (hook + body + hashtags)
     * 2. Copies content to the user's system clipboard
     * 3. Opens LinkedIn in a new tab for manual pasting
     * 4. Updates the schedule status to 'POSTING' in the backend
     */
    const launchMutation = useMutation({
        mutationFn: async (id: string) => {
             const schedule = schedules?.find(s => s.id === id)
             if (!schedule) return
             
             /** Narrative preparation */
             const text = `${schedule.postDraft.hook}\n\n${schedule.postDraft.body}\n\n${schedule.postDraft.hashtags}`
             
             /** Clipboard Interaction */
             await navigator.clipboard.writeText(text)
             
             /** Direct User redirect to LinkedIn feed */
             window.open('https://www.linkedin.com/feed/', '_blank')

             /** API Update to track intent to post */
             await axios.post(`${API_URL}/schedules/${id}/launch`)
             return id
        },
        onSuccess: () => {
            /** Re-fetch schedules to show status updates */
            queryClient.invalidateQueries({ queryKey: ['schedules'] })
            console.log('[UI]: Content copied and LinkedIn opened.');
        }
    })

    return (
        <div className="space-y-4">
             {schedules?.map(plan => (
                <div key={plan.id} className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col md:flex-row gap-6 items-start">
                    {/* Time & Status */}
                    <div className="w-full md:w-48 shrink-0 space-y-2">
                        <div className="flex items-center gap-2 text-blue-400 font-mono text-sm">
                            <Calendar className="w-4 h-4" />
                            {new Date(plan.scheduledAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
                        </div>
                        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold uppercase tracking-wider ${
                            plan.status === 'POSTED' ? 'bg-green-900/50 text-green-400' : 
                            plan.status === 'FAILED' ? 'bg-red-900/50 text-red-400' : 'bg-blue-900/50 text-blue-300'
                        }`}>
                            {plan.status}
                        </span>
                        {plan.postDraft.mediaItem && (
                            <div className="bg-slate-950 p-2 rounded border border-slate-800 text-xs text-slate-400 truncate flex items-center gap-2">
                                <FileText className="w-3 h-3" />
                                {plan.postDraft.mediaItem.path.split(/[/\\]/).pop()}
                            </div>
                        )}
                    </div>

                    {/* Content Preview */}
                    <div className="flex-1 min-w-0">
                         <h3 className="text-slate-200 font-medium mb-1 line-clamp-1">{plan.postDraft.hook}</h3>
                         <p className="text-slate-500 text-sm line-clamp-2">{plan.postDraft.body}</p>
                         <p className="text-blue-500/70 text-xs mt-2">{plan.postDraft.hashtags}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex bg-slate-950/50 p-1 rounded-lg border border-slate-800">
                         <button 
                            className="p-2 hover:bg-slate-800 rounded-md text-slate-400 hover:text-blue-400 transition-colors"
                            title="Edit"
                         >
                            <Edit2 className="w-4 h-4" />
                         </button>
                         <button 
                            onClick={() => launchMutation.mutate(plan.id)}
                            className="p-2 hover:bg-blue-900/30 rounded-md text-slate-400 hover:text-blue-400 transition-colors"
                            title="Launch / Share to LinkedIn"
                         >
                            <Send className="w-4 h-4" />
                         </button>
                         <button 
                            className="p-2 hover:bg-red-900/20 rounded-md text-slate-400 hover:text-red-400 transition-colors"
                            title="Delete"
                         >
                            <Trash2 className="w-4 h-4" />
                         </button>
                    </div>
                </div>
            ))}
            
            {schedules?.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                    No posts scheduled. Go create one!
                </div>
            )}
        </div>
    )
}
