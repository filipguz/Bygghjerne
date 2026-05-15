'use client'

import { useCallback, useRef, useState } from 'react'
import { Maximize2, RefreshCw } from 'lucide-react'
import { Project } from '@/types/projects'

interface Props {
  streamUrl?: string | null
  project: Project
  fallback: React.ReactNode
}

export default function PixelStreamingViewer({ streamUrl, project, fallback }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [key, setKey] = useState(0)

  const refresh = useCallback(() => setKey((k) => k + 1), [])

  const fullscreen = useCallback(() => {
    containerRef.current?.requestFullscreen?.()
  }, [])

  if (!streamUrl) {
    return (
      <div className="relative w-full h-full">
        <span className="absolute top-3 left-3 z-10 flex items-center gap-1.5 rounded-full bg-slate-200/80 dark:bg-gray-700/80 px-2.5 py-1 text-[11px] font-medium text-slate-500 dark:text-gray-400 backdrop-blur-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-slate-400 dark:bg-gray-500" />
          3D-forhåndsvisning
        </span>
        {fallback}
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative w-full h-full bg-black">
      {/* Live badge */}
      <span className="absolute top-3 left-3 z-10 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
        <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
        Live 3D
      </span>

      {/* Controls */}
      <div className="absolute top-3 right-3 z-10 flex gap-1.5">
        <button
          onClick={refresh}
          title="Last inn på nytt"
          className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/60 text-white backdrop-blur-sm hover:bg-black/80 transition-colors"
        >
          <RefreshCw size={13} />
        </button>
        <button
          onClick={fullscreen}
          title="Fullskjerm"
          className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/60 text-white backdrop-blur-sm hover:bg-black/80 transition-colors"
        >
          <Maximize2 size={13} />
        </button>
      </div>

      <iframe
        key={key}
        ref={iframeRef}
        src={streamUrl}
        title={`Pixel Streaming — ${project.name}`}
        className="w-full h-full border-0"
        allow="camera; microphone; fullscreen; autoplay"
      />
    </div>
  )
}
