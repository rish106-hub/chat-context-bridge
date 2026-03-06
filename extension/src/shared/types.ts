export type Platform = 'chatgpt' | 'claude' | 'gemini' | 'perplexity' | 'mistral' | 'unknown'

export interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
  index: number
}

export interface ScrapedConversation {
  platform: Platform
  title: string
  url: string
  messages: Message[]
  messageCount: number
  scrapedAt: number
}

export interface SummaryResult {
  quickSummary: string
  keyTopics: string[]
  decisions: string[]
  technicalDetails: string
  continuationPrompt: string
  platform: Platform
  originalMessageCount: number
  model: string
}

export interface ExtensionState {
  status: 'idle' | 'detecting' | 'scraping' | 'summarizing' | 'done' | 'error'
  platform: Platform | null
  isSharedLink: boolean
  conversation: ScrapedConversation | null
  summary: SummaryResult | null
  error: string | null
  backendUrl: string
}

// Message types between extension contexts
export type MessageType =
  | { type: 'GET_PAGE_INFO' }
  | { type: 'PAGE_INFO'; payload: { platform: Platform; isSharedLink: boolean; title: string } }
  | { type: 'SCRAPE_CONVERSATION' }
  | { type: 'SCRAPED_CONVERSATION'; payload: ScrapedConversation }
  | { type: 'SUMMARIZE'; payload: ScrapedConversation; backendUrl: string }
  | { type: 'SUMMARY_RESULT'; payload: SummaryResult }
  | { type: 'ERROR'; payload: string }
