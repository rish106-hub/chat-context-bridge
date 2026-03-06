import type { MessageType, ScrapedConversation, SummaryResult } from '../shared/types'
import { DEFAULT_BACKEND_URL, STORAGE_KEYS } from '../shared/constants'

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((message: MessageType, _sender, sendResponse) => {
  if (message.type === 'SUMMARIZE') {
    handleSummarize(message.payload, message.backendUrl)
      .then((result) => sendResponse({ type: 'SUMMARY_RESULT', payload: result }))
      .catch((err) => sendResponse({ type: 'ERROR', payload: String(err) }))
    return true // keep channel open for async
  }
})

async function handleSummarize(
  conversation: ScrapedConversation,
  backendUrl: string
): Promise<SummaryResult> {
  const url = `${backendUrl}/api/summarize`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(conversation),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Backend error ${response.status}: ${text}`)
  }

  return response.json() as Promise<SummaryResult>
}

async function getBackendUrl(): Promise<string> {
  return new Promise((resolve) => {
    chrome.storage.local.get(STORAGE_KEYS.BACKEND_URL, (result) => {
      resolve(result[STORAGE_KEYS.BACKEND_URL] || DEFAULT_BACKEND_URL)
    })
  })
}

// Badge management
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete' || !tab.url) return

  const sharedPatterns = [
    /chatgpt\.com\/share\//,
    /claude\.ai\/share\//,
    /gemini\.google\.com\/share\//,
    /perplexity\.ai\/search\//,
  ]

  const isShared = sharedPatterns.some((p) => p.test(tab.url!))
  if (isShared) {
    chrome.action.setBadgeText({ text: '✓', tabId })
    chrome.action.setBadgeBackgroundColor({ color: '#10b981', tabId })
  } else {
    chrome.action.setBadgeText({ text: '', tabId })
  }
})
