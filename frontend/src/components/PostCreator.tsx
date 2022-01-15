/**
 * © 2022-2026 Ashraf Morningstar
 * https://github.com/AshrafMorningstar
 * 
 * This file is part of LinkedIn Viral Scheduler.
 * Created for educational and skill development purposes.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, Video as VideoIcon, Image as ImageIcon, Save, Send } from 'lucide-react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

const API_URL = 'http://localhost:3000'

interface PostCreatorProps {
    onTabChange: (tab: 'queue' | 'drafts' | 'schedule') => void
}

/**
 * PostCreator Component
 * 
 * Provides a rich interface for initiating the LinkedIn content creation flow.
 * Supports drag-and-drop media uploads, AI model selection, and prompt-based
 * content generation.
 */
export function PostCreator({ onTabChange }: PostCreatorProps) {
    const queryClient = useQueryClient()
    
    /** State Management for Content Creation */
    const [prompt, setPrompt] = useState('')
    const [mediaFile, setMediaFile] = useState<File | null>(null)
    const [mediaPreview, setMediaPreview] = useState<string | null>(null)
    const [selectedProvider, setSelectedProvider] = useState<string>('openai')

    /**
     * File Drop Handler
     * Process accepted files and generates transient preview URLs for the UI.
     */
    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0]
        if (!file) return
        setMediaFile(file)
        
        /** Generate contextual preview based on file MIME type */
        if (file.type.startsWith('image/')) {
            const reader = new FileReader()
            reader.onload = () => setMediaPreview(reader.result as string)
            reader.readAsDataURL(file)
        } else if (file.type.startsWith('video/')) {
            setMediaPreview(URL.createObjectURL(file))
        } else {
            setMediaPreview(null) /** Document/PDF fallback (icon only) */
        }
    }, [])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
        onDrop, 
        accept: { 
            'image/*': [], 
            'video/*': [], 
            'application/pdf': [] 
        } 
    })

    /**
     * Generation Mutation
     * 1. Uploads media to the backend if present
     * 2. Requests AI content generation for the current provider
     * 3. Syncs the draft state with the local query cache
     */
    const generateMutation = useMutation({
        mutationFn: async (isDraft: boolean) => {
            let uploadedFilename = null;

            if (mediaFile) {
                const formData = new FormData();
                formData.append('media', mediaFile);
                const uploadRes = await axios.post(`${API_URL}/upload`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                uploadedFilename = uploadRes.data.filename;
            }

            const res = await axios.post(`${API_URL}/generate`, {
                prompt,
                provider: selectedProvider,
                isDraft,
                mediaFilename: uploadedFilename 
            })
            return res.data
        },
        onSuccess: () => {
            /** Refresh stale data and notify parent navigation */
             queryClient.invalidateQueries({ queryKey: ['drafts'] })
             if (onTabChange) onTabChange('drafts')
        }
    })

    const handleSaveDraft = () => generateMutation.mutate(true)
    const handleGenerate = () => generateMutation.mutate(false)

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
            <div>
                <h2 className="text-xl font-semibold text-slate-100 mb-2">Create New Post</h2>
                <p className="text-slate-400 text-sm">Upload media or start with a topic. AI will generate the rest.</p>
            </div>

            {/* AI Provider Selection */}
            <div className="flex gap-4">
                 <select 
                    value={selectedProvider}
                    onChange={(e) => setSelectedProvider(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                 >
                    <option value="openai">OpenAI (GPT-4)</option>
                    <option value="gemini">Google Gemini</option>
                    <option value="deepseek">DeepSeek</option>
                 </select>
            </div>

            {/* Drag & Drop Area */}
            <div 
                {...getRootProps()} 
                className={twMerge(
                    "border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-colors cursor-pointer",
                    isDragActive ? "border-blue-500 bg-blue-500/10" : "border-slate-700 hover:border-slate-600 bg-slate-950"
                )}
            >
                <input {...getInputProps()} />
                {mediaPreview ? (
                    <div className="relative w-full max-w-md">
                         {mediaFile?.type.startsWith('image/') && (
                             <img src={mediaPreview} alt="Preview" className="rounded-lg max-h-64 mx-auto" />
                         )}
                         {mediaFile?.type.startsWith('video/') && (
                            <video src={mediaPreview} controls className="rounded-lg max-h-64 mx-auto" />
                         )}
                         {!mediaFile?.type.startsWith('image/') && !mediaFile?.type.startsWith('video/') && (
                             <div className="flex flex-col items-center py-4">
                                <FileText className="w-12 h-12 text-blue-400 mb-2" />
                                <p className="text-slate-300 font-medium">{mediaFile?.name}</p>
                             </div>
                         )}
                         <p className="text-center text-xs text-slate-500 mt-2">Click or drag to replace</p>
                    </div>
                ) : (
                    <>
                        <Upload className="w-10 h-10 text-slate-500 mb-4" />
                        <p className="text-slate-300 font-medium">Drag & drop media here, or click to select</p>
                        <p className="text-slate-500 text-sm mt-1">Supports Images, Videos, PDFs</p>
                    </>
                )}
            </div>

            {/* Prompt Input */}
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Topic or Instructions (Optional)</label>
                <textarea 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g. Discuss the future of React Server Components..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
                />
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-2">
                <button 
                    onClick={handleSaveDraft}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                    <Save className="w-4 h-4" />
                    Save as Draft
                </button>
                <button 
                    onClick={handleGenerate}
                    className="flex-[2] bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                    <Send className="w-4 h-4" />
                    Generate & Schedule
                </button>
            </div>
        </div>
    )
}
