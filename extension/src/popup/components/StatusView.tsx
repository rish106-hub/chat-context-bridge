import { Loader2, MessageSquare, AlertCircle, ExternalLink, Sparkles } from 'lucide-react'
import type { ExtensionState, Platform } from '../../shared/types'

interface StatusViewProps {
  state: ExtensionState
  onSummarize: () => void
  onReset: () => void
}

const PLATFORM_LABELS: Record<Platform, string> = {
  chatgpt: 'ChatGPT',
  claude: 'Claude',
  gemini: 'Gemini',
  perplexity: 'Perplexity',
  mistral: 'Mistral',
  unknown: 'Unknown',
}

const PLATFORM_COLORS: Record<Platform, string> = {
  chatgpt: 'bg-green-500/20 text-green-400 border-green-500/30',
  claude: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  gemini: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  perplexity: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  mistral: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  unknown: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
}

export function StatusView({ state, onSummarize, onReset }: StatusViewProps) {
  const isLoading = state.status === 'detecting' || state.status === 'scraping' || state.status === 'summarizing'
  const isError = state.status === 'error'
  const isReady = state.status === 'idle' && state.platform && state.platform !== 'unknown'
  const isUnsupported = state.status === 'idle' && (!state.platform || state.platform === 'unknown')

  return (
    <div className="flex flex-col items-center justify-center p-6 gap-4 min-h-[220px]">
      {/* Loading states */}
      {isLoading && (
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <Loader2 size={24} className="text-emerald-400 animate-spin" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">
              {state.status === 'detecting' && 'Detecting page...'}
              {state.status === 'scraping' && 'Reading conversation...'}
              {state.status === 'summarizing' && 'Generating summary...'}
            </p>
            {state.status === 'summarizing' && (
              <p className="text-xs text-slate-400 mt-1">
                This may take a few seconds for long chats
              </p>
            )}
          </div>
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="flex flex-col items-center gap-3 text-center w-full">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertCircle size={24} className="text-red-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">Something went wrong</p>
            <p className="text-xs text-slate-400 mt-1 max-w-[280px]">{state.error}</p>
          </div>
          <button
            onClick={onReset}
            className="mt-1 px-4 py-2 text-xs bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
          >
            Try again
          </button>
        </div>
      )}

      {/* Ready to summarize */}
      {isReady && (
        <div className="flex flex-col items-center gap-4 text-center w-full">
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${PLATFORM_COLORS[state.platform!]}`}>
                {PLATFORM_LABELS[state.platform!]}
              </span>
              {state.isSharedLink && (
                <span className="text-xs font-medium px-2.5 py-1 rounded-full border bg-emerald-500/20 text-emerald-400 border-emerald-500/30 flex items-center gap-1">
                  <ExternalLink size={10} />
                  Shared link
                </span>
              )}
            </div>
            <p className="text-sm text-slate-300 mt-1">
              Ready to summarize this conversation
            </p>
            <p className="text-xs text-slate-500">
              {state.isSharedLink
                ? 'This shared link will be scraped and summarized'
                : 'The current active chat will be summarized'}
            </p>
          </div>

          <button
            onClick={onSummarize}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-medium rounded-xl transition-all duration-150 shadow-lg shadow-emerald-500/20 active:scale-95"
          >
            <Sparkles size={15} />
            Generate Summary
          </button>
        </div>
      )}

      {/* Unsupported page */}
      {isUnsupported && (
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center">
            <MessageSquare size={24} className="text-slate-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">Navigate to a chat</p>
            <p className="text-xs text-slate-400 mt-1">
              Open a conversation on ChatGPT, Claude, Gemini, or Perplexity
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-1.5 mt-1">
            {(['chatgpt', 'claude', 'gemini', 'perplexity'] as Platform[]).map((p) => (
              <span key={p} className={`text-xs px-2 py-0.5 rounded-full border ${PLATFORM_COLORS[p]}`}>
                {PLATFORM_LABELS[p]}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
