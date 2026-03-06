import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import Groq from 'groq-sdk'

// ─── Types (mirrored from extension) ─────────────────────────────────────────
interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
  index: number
}

interface ScrapedConversation {
  platform: string
  title: string
  url: string
  messages: Message[]
  messageCount: number
  scrapedAt: number
}

interface SummaryResult {
  quickSummary: string
  keyTopics: string[]
  decisions: string[]
  technicalDetails: string
  continuationPrompt: string
  platform: string
  originalMessageCount: number
  model: string
}

// ─── CORS preflight ───────────────────────────────────────────────────────────
export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

// ─── Main handler ─────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const conversation: ScrapedConversation = await request.json()

    if (!conversation?.messages?.length) {
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 })
    }

    // Build the conversation transcript
    const transcript = buildTranscript(conversation)

    // Try Gemini first, fall back to Groq
    let result: SummaryResult
    let model: string

    if (process.env.GEMINI_API_KEY) {
      try {
        const { summary, usedModel } = await summarizeWithGemini(transcript, conversation)
        result = { ...summary, model: usedModel, platform: conversation.platform, originalMessageCount: conversation.messageCount }
        model = usedModel
      } catch (geminiErr) {
        console.warn('Gemini failed, trying Groq:', geminiErr)
        if (process.env.GROQ_API_KEY) {
          const { summary, usedModel } = await summarizeWithGroq(transcript, conversation)
          result = { ...summary, model: usedModel, platform: conversation.platform, originalMessageCount: conversation.messageCount }
          model = usedModel
        } else {
          throw geminiErr
        }
      }
    } else if (process.env.GROQ_API_KEY) {
      const { summary, usedModel } = await summarizeWithGroq(transcript, conversation)
      result = { ...summary, model: usedModel, platform: conversation.platform, originalMessageCount: conversation.messageCount }
      model = usedModel
    } else {
      return NextResponse.json(
        { error: 'No API key configured. Add GEMINI_API_KEY or GROQ_API_KEY to .env' },
        { status: 500 }
      )
    }

    return NextResponse.json(result, {
      headers: { 'Access-Control-Allow-Origin': '*' },
    })
  } catch (err) {
    console.error('Summarize error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

// ─── Gemini summarizer ────────────────────────────────────────────────────────
async function summarizeWithGemini(transcript: string, conversation: ScrapedConversation) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

  const prompt = buildPrompt(transcript, conversation)
  const result = await model.generateContent(prompt)
  const text = result.response.text()

  return { summary: parseStructuredSummary(text, conversation), usedModel: 'gemini-2.0-flash-001' }
}

// ─── Groq fallback summarizer ─────────────────────────────────────────────────
async function summarizeWithGroq(transcript: string, conversation: ScrapedConversation) {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: buildPrompt(transcript, conversation) },
    ],
    temperature: 0.3,
    max_tokens: 2048,
  })

  const text = completion.choices[0]?.message?.content || ''
  return { summary: parseStructuredSummary(text, conversation), usedModel: 'llama-3.3-70b (groq)' }
}

// ─── Prompt building ──────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are an expert at analyzing LLM conversations and creating comprehensive, structured summaries that allow someone to seamlessly continue the conversation in a new chat window.

Your summaries must:
1. Preserve all important context, decisions, and technical details
2. Be ready to paste at the start of a new LLM chat
3. Include all code snippets, file names, or technical specifics discussed
4. Capture the "state" of the work - what was done, what still needs doing
5. Be concise but complete - no fluff, no repetition`

function buildPrompt(transcript: string, conversation: ScrapedConversation): string {
  return `${SYSTEM_PROMPT}

## Conversation to Summarize
Title: ${conversation.title}
Platform: ${conversation.platform}
Total messages: ${conversation.messageCount}
URL: ${conversation.url}

## Full Transcript
${transcript}

## Your Task
Analyze this conversation and respond with ONLY valid JSON in this exact format (no markdown, no extra text):

{
  "quickSummary": "2-3 sentence overview of what this conversation was about and what was accomplished",
  "keyTopics": ["topic1", "topic2", "topic3"],
  "decisions": [
    "Specific decision or conclusion reached",
    "Another concrete outcome"
  ],
  "technicalDetails": "Any code, commands, file names, configurations, or technical specifics mentioned. Include actual code snippets if relevant.",
  "continuationPrompt": "A ready-to-paste prompt for a new LLM chat that fully restores context. Start with 'I was working on...' or 'Continuing a conversation about...' and include all necessary background, current state, and what needs to happen next."
}`
}

// ─── Response parsing ─────────────────────────────────────────────────────────
function parseStructuredSummary(
  text: string,
  conversation: ScrapedConversation
): Omit<SummaryResult, 'model' | 'platform' | 'originalMessageCount'> {
  // Try to extract JSON from the response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        quickSummary: parsed.quickSummary || 'Summary not available',
        keyTopics: Array.isArray(parsed.keyTopics) ? parsed.keyTopics : [],
        decisions: Array.isArray(parsed.decisions) ? parsed.decisions : [],
        technicalDetails: parsed.technicalDetails || '',
        continuationPrompt: parsed.continuationPrompt || buildFallbackContinuation(conversation),
      }
    } catch {
      // JSON parse failed, use fallback
    }
  }

  // Fallback: return the raw text as quickSummary
  return {
    quickSummary: text.slice(0, 300),
    keyTopics: [],
    decisions: [],
    technicalDetails: '',
    continuationPrompt: buildFallbackContinuation(conversation),
  }
}

function buildFallbackContinuation(conversation: ScrapedConversation): string {
  const msgs = conversation.messages.slice(-6) // last 6 messages for context
  const excerpt = msgs
    .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content.slice(0, 200)}`)
    .join('\n\n')

  return `Continuing a conversation from ${conversation.platform} about "${conversation.title}".

Here is the recent context from our previous conversation:

${excerpt}

Please continue from where we left off.`
}

// ─── Transcript builder ───────────────────────────────────────────────────────
function buildTranscript(conversation: ScrapedConversation): string {
  // Truncate very long conversations to stay within token limits
  // Gemini 2.0 Flash: 1M context, but we'll cap at ~50k chars for speed
  const MAX_CHARS = 80_000

  const lines = conversation.messages.map((m) => {
    const role = m.role === 'user' ? '### Human' : '### Assistant'
    return `${role}\n${m.content}`
  })

  const full = lines.join('\n\n---\n\n')
  if (full.length <= MAX_CHARS) return full

  // Truncation strategy: keep first 20% and last 80% to preserve recent context
  const keepStart = Math.floor(MAX_CHARS * 0.2)
  const keepEnd = Math.floor(MAX_CHARS * 0.8)
  const start = full.slice(0, keepStart)
  const end = full.slice(full.length - keepEnd)

  return `${start}\n\n[... ${Math.round((full.length - MAX_CHARS) / 1000)}k characters truncated for length ...]\n\n${end}`
}
