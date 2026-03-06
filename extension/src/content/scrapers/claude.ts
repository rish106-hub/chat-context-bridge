import type { Message } from '../../shared/types'

export function scrapeClaude(): Message[] {
  const messages: Message[] = []

  // Claude uses div elements with data-is-streaming, data-testid attributes
  // Human messages: [data-testid="human-turn"]
  // AI messages: [data-testid="ai-turn"]
  const humanTurns = document.querySelectorAll('[data-testid="human-turn"]')
  const aiTurns = document.querySelectorAll('[data-testid="ai-turn"]')

  if (humanTurns.length > 0 || aiTurns.length > 0) {
    // Interleave turns in DOM order
    const allTurns = Array.from(
      document.querySelectorAll('[data-testid="human-turn"], [data-testid="ai-turn"]')
    )
    allTurns.forEach((el, index) => {
      const isHuman = el.getAttribute('data-testid') === 'human-turn'
      const content = extractClaudeText(el)
      if (content.trim()) {
        messages.push({ role: isHuman ? 'user' : 'assistant', content: content.trim(), index })
      }
    })
    return messages
  }

  // Fallback: Claude shared links / older UI
  const messageEls = document.querySelectorAll(
    '.human-turn, .ai-turn, [class*="HumanTurn"], [class*="AssistantTurn"]'
  )
  if (messageEls.length > 0) {
    messageEls.forEach((el, index) => {
      const isHuman =
        el.classList.contains('human-turn') ||
        el.className.includes('HumanTurn') ||
        el.className.includes('human')
      const content = extractClaudeText(el)
      if (content.trim()) {
        messages.push({ role: isHuman ? 'user' : 'assistant', content: content.trim(), index })
      }
    })
    return messages
  }

  // Generic fallback
  return alternatingFallback('[class*="message"], [class*="Message"]')
}

function extractClaudeText(el: Element): string {
  const parts: string[] = []
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_ELEMENT)
  const seen = new Set<Element>()

  let node: Element | null = el
  while (node) {
    const tag = node.tagName?.toLowerCase()
    if (!seen.has(node) && tag) {
      seen.add(node)
      if (tag === 'pre') {
        const code = node.querySelector('code')
        const lang = code?.className?.match(/language-(\w+)/)?.[1] || ''
        parts.push(`\`\`\`${lang}\n${node.textContent?.trim()}\n\`\`\``)
        // Skip children of pre
        node = walker.nextSibling() as Element | null
        continue
      }
    }
    node = walker.nextNode() as Element | null
  }

  // Simpler extraction for Claude
  const clone = el.cloneNode(true) as Element
  clone.querySelectorAll('pre').forEach((pre) => {
    const code = pre.querySelector('code')
    const lang = code?.className?.match(/language-(\w+)/)?.[1] || ''
    const replacement = document.createTextNode(`\`\`\`${lang}\n${pre.textContent?.trim()}\n\`\`\``)
    pre.replaceWith(replacement)
  })

  return clone.textContent?.trim() || el.textContent?.trim() || ''
}

function alternatingFallback(selector: string): Message[] {
  const els = Array.from(document.querySelectorAll(selector))
    .filter((el) => (el.textContent?.trim().length ?? 0) > 10)
  return els.map((el, index) => ({
    role: index % 2 === 0 ? 'user' : 'assistant',
    content: el.textContent?.trim() || '',
    index,
  }))
}
