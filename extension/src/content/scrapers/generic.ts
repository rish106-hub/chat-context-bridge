import type { Message } from '../../shared/types'

// Generic scraper for Perplexity, Mistral, and unknown platforms
export function scrapeGeneric(): Message[] {
  const messages: Message[] = []

  // Try common conversation patterns
  const selectors = [
    '[class*="message-container"]',
    '[class*="chat-message"]',
    '[class*="conversation-item"]',
    '[class*="turn"]',
    '[role="listitem"]',
    'li[class*="message"]',
  ]

  for (const selector of selectors) {
    const els = document.querySelectorAll(selector)
    if (els.length >= 2) {
      els.forEach((el, index) => {
        const content = el.textContent?.trim() || ''
        if (content.length > 10) {
          // Try to detect role from class names
          const cls = el.className?.toString().toLowerCase() || ''
          const isUser =
            cls.includes('user') ||
            cls.includes('human') ||
            cls.includes('question') ||
            cls.includes('query')
          messages.push({ role: isUser ? 'user' : 'assistant', content, index })
        }
      })
      if (messages.length > 0) return messages
    }
  }

  // Absolute fallback: grab all text blocks from main content
  const main = document.querySelector('main, article, [role="main"]') || document.body
  const paragraphs = Array.from(main.querySelectorAll('p'))
    .filter((p) => (p.textContent?.trim().length ?? 0) > 30)
    .slice(0, 50) // cap at 50 blocks

  return paragraphs.map((p, index) => ({
    role: index % 2 === 0 ? 'user' : 'assistant',
    content: p.textContent?.trim() || '',
    index,
  }))
}

// Perplexity-specific scraper
export function scrapePerplexity(): Message[] {
  const messages: Message[] = []

  // Perplexity has user queries and AI answers in a thread format
  const queries = document.querySelectorAll('[class*="AnswerHeading"], [class*="QueryBar"], [data-testid*="query"]')
  const answers = document.querySelectorAll('[class*="AnswerBody"], [class*="answer-content"], [class*="prose"]')

  if (queries.length > 0) {
    queries.forEach((q, index) => {
      const content = q.textContent?.trim() || ''
      if (content) messages.push({ role: 'user', content, index: index * 2 })
    })
    answers.forEach((a, index) => {
      const content = a.textContent?.trim() || ''
      if (content) messages.push({ role: 'assistant', content, index: index * 2 + 1 })
    })
    // Sort by index to interleave properly
    return messages.sort((a, b) => a.index - b.index)
  }

  return scrapeGeneric()
}
