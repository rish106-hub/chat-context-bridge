import type { Platform } from './types'

export const PLATFORM_PATTERNS: Record<Platform, RegExp[]> = {
  chatgpt: [/chatgpt\.com/, /openai\.com\/chatgpt/],
  claude: [/claude\.ai/],
  gemini: [/gemini\.google\.com/],
  perplexity: [/perplexity\.ai/],
  mistral: [/chat\.mistral\.ai/],
  unknown: [],
}

export const SHARED_LINK_PATTERNS: Record<Platform, RegExp> = {
  chatgpt: /chatgpt\.com\/share\//,
  claude: /claude\.ai\/share\//,
  gemini: /gemini\.google\.com\/share\//,
  perplexity: /perplexity\.ai\/search\//,
  mistral: /chat\.mistral\.ai\/share\//,
  unknown: /^$/,
}

export const DEFAULT_BACKEND_URL = 'https://backend-six-zeta-44.vercel.app'

export const STORAGE_KEYS = {
  BACKEND_URL: 'backendUrl',
  LAST_SUMMARY: 'lastSummary',
  GEMINI_API_KEY: 'geminiApiKey',
} as const
