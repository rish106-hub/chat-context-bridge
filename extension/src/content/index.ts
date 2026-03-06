import type { Platform, ScrapedConversation, MessageType } from '../shared/types'
import { PLATFORM_PATTERNS, SHARED_LINK_PATTERNS } from '../shared/constants'
import { scrapeChatGPT } from './scrapers/chatgpt'
import { scrapeClaude } from './scrapers/claude'
import { scrapeGemini } from './scrapers/gemini'
import { scrapeGeneric, scrapePerplexity } from './scrapers/generic'

function detectPlatform(): Platform {
  const url = window.location.href
  for (const [platform, patterns] of Object.entries(PLATFORM_PATTERNS)) {
    if (platform === 'unknown') continue
    if (patterns.some((p) => p.test(url))) return platform as Platform
  }
  return 'unknown'
}

function isSharedLink(platform: Platform): boolean {
  if (platform === 'unknown') return false
  return SHARED_LINK_PATTERNS[platform].test(window.location.href)
}

function getPageTitle(): string {
  return document.title?.replace(/ - (ChatGPT|Claude|Gemini|Perplexity).*$/, '').trim() || 'Untitled Conversation'
}

function scrapeConversation(platform: Platform): ScrapedConversation {
  let messages = []

  switch (platform) {
    case 'chatgpt':
      messages = scrapeChatGPT()
      break
    case 'claude':
      messages = scrapeClaude()
      break
    case 'gemini':
      messages = scrapeGemini()
      break
    case 'perplexity':
      messages = scrapePerplexity()
      break
    default:
      messages = scrapeGeneric()
  }

  return {
    platform,
    title: getPageTitle(),
    url: window.location.href,
    messages,
    messageCount: messages.length,
    scrapedAt: Date.now(),
  }
}

// Listen for messages from the popup / background
chrome.runtime.onMessage.addListener((message: MessageType, _sender, sendResponse) => {
  if (message.type === 'GET_PAGE_INFO') {
    const platform = detectPlatform()
    sendResponse({
      type: 'PAGE_INFO',
      payload: {
        platform,
        isSharedLink: isSharedLink(platform),
        title: getPageTitle(),
      },
    })
    return true
  }

  if (message.type === 'SCRAPE_CONVERSATION') {
    const platform = detectPlatform()
    const conversation = scrapeConversation(platform)
    sendResponse({ type: 'SCRAPED_CONVERSATION', payload: conversation })
    return true
  }
})
