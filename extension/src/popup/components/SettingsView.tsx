import { useState } from 'react'
import { Save, Server } from 'lucide-react'

interface SettingsViewProps {
  currentUrl: string
  onSave: (url: string) => void
}

export function SettingsView({ currentUrl, onSave }: SettingsViewProps) {
  const [url, setUrl] = useState(currentUrl)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = url.trim().replace(/\/$/, '')
    onSave(trimmed)
  }

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="text-xs text-slate-400 leading-relaxed">
        ChatBridge uses a local Next.js backend to call the Gemini API for free summarization. Run the backend locally to get started.
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
            <Server size={12} />
            Backend URL
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="http://localhost:3000"
            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
          <p className="text-xs text-slate-500">Default: http://localhost:3000</p>
        </div>

        <button
          type="submit"
          className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-medium rounded-lg transition-colors"
        >
          <Save size={13} />
          Save Settings
        </button>
      </form>

      <div className="border-t border-slate-700/60 pt-3">
        <p className="text-xs font-medium text-slate-400 mb-2">Quick Start</p>
        <div className="bg-slate-800 rounded-lg p-2.5 font-mono text-xs text-slate-300 space-y-1">
          <p className="text-slate-500"># In the backend directory:</p>
          <p>cd chat-context-bridge/backend</p>
          <p>npm install</p>
          <p>cp .env.example .env</p>
          <p className="text-slate-500"># Add your Gemini API key to .env</p>
          <p>npm run dev</p>
        </div>
      </div>

      <div className="border-t border-slate-700/60 pt-3">
        <p className="text-xs text-slate-500">
          Get a free Gemini API key at{' '}
          <a
            href="https://aistudio.google.com"
            target="_blank"
            rel="noreferrer"
            className="text-emerald-400 hover:underline"
          >
            aistudio.google.com
          </a>
          {' '}(no credit card required)
        </p>
      </div>
    </div>
  )
}
