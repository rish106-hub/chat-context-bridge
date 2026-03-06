import { Settings, ArrowLeft, Zap } from 'lucide-react'

interface HeaderProps {
  onSettingsClick: () => void
  onBackClick?: () => void
  showBack: boolean
}

export function Header({ onSettingsClick, onBackClick, showBack }: HeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/60 bg-slate-900">
      <div className="flex items-center gap-2">
        {showBack && onBackClick ? (
          <button
            onClick={onBackClick}
            className="p-1 rounded hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft size={16} className="text-slate-400" />
          </button>
        ) : (
          <div className="w-6 h-6 rounded-md bg-emerald-500 flex items-center justify-center">
            <Zap size={14} className="text-white" fill="white" />
          </div>
        )}
        <span className="font-semibold text-sm text-white">
          {showBack ? 'Settings' : 'ChatBridge'}
        </span>
        {!showBack && (
          <span className="text-xs text-slate-500 font-normal">context carry</span>
        )}
      </div>
      <button
        onClick={onSettingsClick}
        className="p-1.5 rounded-md hover:bg-slate-700 transition-colors"
        title="Settings"
      >
        <Settings size={15} className="text-slate-400" />
      </button>
    </div>
  )
}
