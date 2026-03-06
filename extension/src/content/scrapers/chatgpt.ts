import type { Message } from '../../shared/types'

export function scrapeChatGPT(): Message[] {
  const messages: Message[] = []

  // ChatGPT uses article elements with data-message-author-role
  const articleEls = document.querySelectorAll('article[data-message-author-role]')

  if (articleEls.length > 0) {
    articleEls.forEach((el, index) => {
      const role = el.getAttribute('data-message-author-role')
      if (role !== 'user' && role !== 'assistant') return

      // Get all text content, preserve code blocks
      const content = extractText(el)
      if (content.trim()) {
        messages.push({ role, content: content.trim(), index })
      }
    })
    return messages
  }

  // Fallback: shared link page uses a different structure
  // ChatGPT shared pages render conversation in divs with specific classes
  const turnEls = document.querySelectorAll('[class*="ConversationItem"], [class*="conversation-turn"]')
  if (turnEls.length > 0) {
    turnEls.forEach((el, index) => {
      const isUser = el.querySelector('[class*="user"], [class*="human"]') !== null ||
        el.getAttribute('data-author-type') === 'user'
      const content = extractText(el)
      if (content.trim()) {
        messages.push({ role: isUser ? 'user' : 'assistant', content: content.trim(), index })
      }
    })
    return messages
  }

  // Generic fallback: look for alternating message bubbles
  return genericFallback()
}

function extractText(el: Element): string {
  const parts: string[] = []

  el.querySelectorAll('p, pre, li, h1, h2, h3, h4, h5, h6').forEach((node) => {
    const tag = node.tagName.toLowerCase()
    if (tag === 'pre') {
      const code = node.querySelector('code')
      const lang = code?.className?.match(/language-(\w+)/)?.[1] || ''
      parts.push(`\`\`\`${lang}\n${node.textContent?.trim()}\n\`\`\``)
    } else if (tag.startsWith('h')) {
      parts.push(`${'#'.repeat(parseInt(tag[1]))} ${node.textContent?.trim()}`)
    } else {
      parts.push(node.textContent?.trim() || '')
    }
  })

  return parts.filter(Boolean).join('\n\n') || el.textContent?.trim() || ''
}

function genericFallback(): Message[] {
  // Last resort: grab all visible text blocks and guess roles by alternation
  const blocks = Array.from(document.querySelectorAll('main p, main pre, main [class*="message"]'))
    .filter((el) => el.textContent && el.textContent.trim().length > 10)

  return blocks.map((el, index) => ({
    role: index % 2 === 0 ? 'user' : 'assistant',
    content: el.textContent?.trim() || '',
    index,
  }))
}
