import { useEffect, useState, useCallback } from 'react'
import type { ExtensionState, SummaryResult, ScrapedConversation } from '../shared/types'
import { DEFAULT_BACKEND_URL, STORAGE_KEYS } from '../shared/constants'
import { Header } from './components/Header'
import { StatusView } from './components/StatusView'
import { SummaryView } from './components/SummaryView'
import { SettingsView } from './components/SettingsView'

type View = 'main' | 'settings'

const initialState: ExtensionState = {
  status: 'idle',
  platform: null,
  isSharedLink: false,
  conversation: null,
  summary: null,
  error: null,
  backendUrl: DEFAULT_BACKEND_URL,
}

export default function App() {
  const [view, setView] = useState<View>('main')
  const [state, setState] = useState<ExtensionState>(initialState)
  const [backendUrl, setBackendUrl] = useState(DEFAULT_BACKEND_URL)

  // Load persisted settings and detect current page
  useEffect(() => {
    chrome.storage.local.get([STORAGE_KEYS.BACKEND_URL, STORAGE_KEYS.LAST_SUMMARY], (result) => {
      const url = result[STORAGE_KEYS.BACKEND_URL] || DEFAULT_BACKEND_URL
      setBackendUrl(url)
      setState((s) => ({ ...s, backendUrl: url }))
    })

    detectCurrentPage()
  }, [])

  const detectCurrentPage = useCallback(() => {
    setState((s) => ({ ...s, status: 'detecting' }))
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0]
      if (!tab?.id) {
        setState((s) => ({ ...s, status: 'idle', error: 'No active tab found' }))
        return
      }

      chrome.tabs.sendMessage(tab.id, { type: 'GET_PAGE_INFO' }, (response) => {
        if (chrome.runtime.lastError || !response) {
          setState((s) => ({
            ...s,
            status: 'idle',
            platform: 'unknown',
            isSharedLink: false,
          }))
          return
        }
        const info = response.payload
        setState((s) => ({
          ...s,
          status: 'idle',
          platform: info.platform,
          isSharedLink: info.isSharedLink,
        }))
      })
    })
  }, [])

  const handleSummarize = useCallback(() => {
    setState((s) => ({ ...s, status: 'scraping', error: null }))

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0]
      if (!tab?.id) return

      // Step 1: Scrape the conversation
      chrome.tabs.sendMessage(tab.id, { type: 'SCRAPE_CONVERSATION' }, (scrapeResponse) => {
        if (chrome.runtime.lastError || !scrapeResponse) {
          setState((s) => ({ ...s, status: 'error', error: 'Failed to scrape conversation. Refresh the page and try again.' }))
          return
        }

        const conversation: ScrapedConversation = scrapeResponse.payload
        if (!conversation.messages.length) {
          setState((s) => ({ ...s, status: 'error', error: 'No messages found. Make sure you are on a chat page with visible messages.' }))
          return
        }

        setState((s) => ({ ...s, status: 'summarizing', conversation }))

        // Step 2: Send to background → backend for summarization
        chrome.runtime.sendMessage(
          { type: 'SUMMARIZE', payload: conversation, backendUrl },
          (summaryResponse) => {
            if (chrome.runtime.lastError) {
              setState((s) => ({ ...s, status: 'error', error: 'Connection error. Is the backend running?' }))
              return
            }
            if (summaryResponse.type === 'ERROR') {
              setState((s) => ({ ...s, status: 'error', error: summaryResponse.payload }))
              return
            }

            const summary: SummaryResult = summaryResponse.payload
            setState((s) => ({ ...s, status: 'done', summary }))
            chrome.storage.local.set({ [STORAGE_KEYS.LAST_SUMMARY]: summary })
          }
        )
      })
    })
  }, [backendUrl])

  const handleReset = useCallback(() => {
    setState((s) => ({ ...s, status: 'idle', summary: null, error: null }))
    detectCurrentPage()
  }, [detectCurrentPage])

  const handleSaveSettings = useCallback((url: string) => {
    chrome.storage.local.set({ [STORAGE_KEYS.BACKEND_URL]: url })
    setBackendUrl(url)
    setState((s) => ({ ...s, backendUrl: url }))
    setView('main')
  }, [])

  return (
    <div className="flex flex-col min-h-[300px] max-h-[600px] w-[400px] bg-slate-900 text-slate-100">
      <Header
        onSettingsClick={() => setView(view === 'settings' ? 'main' : 'settings')}
        onBackClick={view === 'settings' ? () => setView('main') : undefined}
        showBack={view === 'settings'}
      />

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {view === 'settings' ? (
          <SettingsView currentUrl={backendUrl} onSave={handleSaveSettings} />
        ) : state.status === 'done' && state.summary ? (
          <SummaryView summary={state.summary} conversation={state.conversation} onReset={handleReset} />
        ) : (
          <StatusView
            state={state}
            onSummarize={handleSummarize}
            onReset={handleReset}
          />
        )}
      </div>
    </div>
  )
}
