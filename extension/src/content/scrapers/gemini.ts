import type { Message } from '../../shared/types'

export function scrapeGemini(): Message[] {
  const messages: Message[] = []

  // Gemini uses model-response and user-query elements
  const turns = Array.from(
    document.querySelectorAll('model-response, user-query, [class*="model-response"], [class*="user-query"]')
  )

  if (turns.length > 0) {
    turns.forEach((el, index) => {
      const tag = el.tagName.toLowerCase()
      const isUser = tag === 'user-query' || el.className.includes('user-query') || el.className.includes('human')
      const content = extractGeminiText(el)
      if (content.trim()) {
        messages.push({ role: isUser ? 'user' : 'assistant', content: content.trim(), index })
      }
    })
    return messages
  }

  // Fallback: Gemini uses conversation-turn elements
  const conversationTurns = document.querySelectorAll(
    '[class*="conversation-container"] > *, [class*="ConversationTurn"], [data-turn]'
  )
  if (conversationTurns.length > 0) {
    conversationTurns.forEach((el, index) => {
      const content = el.textContent?.trim() || ''
      if (content.length > 5) {
        messages.push({ role: index % 2 === 0 ? 'user' : 'assistant', content, index })
      }
    })
    return messages
  }

  // Last resort
  return fallbackExtraction()
}

function extractGeminiText(el: Element): string {
  // Gemini renders markdown, code blocks use <code-block> or <pre>
  const parts: string[] = []

  el.querySelectorAll('p, pre, code-block, li').forEach((node) => {
    const tag = node.tagName.toLowerCase()
    if (tag === 'pre' || tag === 'code-block') {
      const lang = node.querySelector('code')?.className?.match(/language-(\w+)/)?.[1] || ''
      parts.push(`\`\`\`${lang}\n${node.textContent?.trim()}\n\`\`\``)
    } else {
      const text = node.textContent?.trim()
      if (text) parts.push(text)
    }
  })

  return parts.join('\n\n') || el.textContent?.trim() || ''
}

function fallbackExtraction(): Message[] {
  const mainContent = document.querySelector('main, [role="main"], [class*="content"]')
  if (!mainContent) return []

  const blocks = Array.from(mainContent.querySelectorAll('p, [class*="message"], [class*="turn"]'))
    .filter((el) => (el.textContent?.trim().length ?? 0) > 20)

  return blocks.map((el, index) => ({
    role: index % 2 === 0 ? 'user' : 'assistant',
    content: el.textContent?.trim() || '',
    index,
  }))
}
