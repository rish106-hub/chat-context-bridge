import { useState, useCallback } from 'react'
import { Copy, Check, RotateCcw, ChevronDown, ChevronRight, Code2, Lightbulb, Target, FileText } from 'lucide-react'
import type { SummaryResult, ScrapedConversation } from '../../shared/types'

interface SummaryViewProps {
  summary: SummaryResult
  conversation: ScrapedConversation | null
  onReset: () => void
}

interface CopyButtonProps {
  text: string
  label?: string
  className?: string
}

function CopyButton({ text, label = 'Copy', className = '' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [text])

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-md transition-all duration-150 ${
        copied
          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
          : 'bg-slate-700 hover:bg-slate-600 text-slate-300 border border-slate-600'
      } ${className}`}
    >
      {copied ? <Check size={11} /> : <Copy size={11} />}
      {copied ? 'Copied!' : label}
    </button>
  )
}

interface CollapsibleSectionProps {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
  badge?: string
}

function CollapsibleSection({ title, icon, children, defaultOpen = false, badge }: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="border border-slate-700/60 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-slate-800 hover:bg-slate-750 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-slate-400">{icon}</span>
          <span className="text-xs font-medium text-slate-200">{title}</span>
          {badge && (
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-slate-700 text-slate-400">{badge}</span>
          )}
        </div>
        {open ? (
          <ChevronDown size={13} className="text-slate-500" />
        ) : (
          <ChevronRight size={13} className="text-slate-500" />
        )}
      </button>
      {open && (
        <div className="px-3 py-2.5 bg-slate-800/40">{children}</div>
      )}
    </div>
  )
}

export function SummaryView({ summary, conversation, onReset }: SummaryViewProps) {
  const continuationPrompt = summary.continuationPrompt

  return (
    <div className="flex flex-col gap-3 p-3">
      {/* Stats row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">
            {summary.originalMessageCount} messages summarized
          </span>
          <span className="text-xs text-slate-600">·</span>
          <span className="text-xs text-slate-500">{summary.model}</span>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          <RotateCcw size={11} />
          New
        </button>
      </div>

      {/* Quick summary */}
      <div className="bg-slate-800/60 rounded-lg p-3 border border-slate-700/40">
        <p className="text-xs leading-relaxed text-slate-300">{summary.quickSummary}</p>
      </div>

      {/* Key topics */}
      {summary.keyTopics.length > 0 && (
        <CollapsibleSection
          title="Key Topics"
          icon={<Target size={13} />}
          badge={String(summary.keyTopics.length)}
          defaultOpen
        >
          <div className="flex flex-wrap gap-1.5">
            {summary.keyTopics.map((topic, i) => (
              <span
                key={i}
                className="text-xs px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/20"
              >
                {topic}
              </span>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Decisions */}
      {summary.decisions.length > 0 && (
        <CollapsibleSection
          title="Decisions & Conclusions"
          icon={<Lightbulb size={13} />}
          badge={String(summary.decisions.length)}
          defaultOpen
        >
          <ul className="space-y-1.5">
            {summary.decisions.map((d, i) => (
              <li key={i} className="flex gap-2 text-xs text-slate-300">
                <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>
                <span>{d}</span>
              </li>
            ))}
          </ul>
        </CollapsibleSection>
      )}

      {/* Technical details */}
      {summary.technicalDetails && (
        <CollapsibleSection title="Technical Details" icon={<Code2 size={13} />}>
          <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap font-mono">
            {summary.technicalDetails}
          </p>
        </CollapsibleSection>
      )}

      {/* Continuation prompt - the main output */}
      <div className="border border-emerald-500/30 rounded-lg overflow-hidden bg-emerald-500/5">
        <div className="flex items-center justify-between px-3 py-2 bg-emerald-500/10 border-b border-emerald-500/20">
          <div className="flex items-center gap-2">
            <FileText size={13} className="text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-300">Continuation Prompt</span>
          </div>
          <CopyButton text={continuationPrompt} label="Copy prompt" />
        </div>
        <div className="px-3 py-2.5 max-h-[160px] overflow-y-auto scrollbar-thin">
          <pre className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap font-mono">
            {continuationPrompt}
          </pre>
        </div>
      </div>

      <p className="text-xs text-slate-500 text-center">
        Paste the continuation prompt at the start of any new LLM chat
      </p>
    </div>
  )
}
