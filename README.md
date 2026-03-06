# ChatBridge — LLM Context Carry

> Never lose chat context again. Summarize any LLM conversation and continue it seamlessly in any AI — instantly.

[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?logo=google-chrome&logoColor=white)](https://chrome.google.com/webstore)
[![Next.js](https://img.shields.io/badge/Backend-Next.js_16-000?logo=next.js)](https://nextjs.org)
[![Gemini](https://img.shields.io/badge/AI-Gemini_2.0_Flash-4285F4?logo=google)](https://aistudio.google.com)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## The Problem

You hit a token limit mid-conversation. You want to switch from ChatGPT to Claude. You need to share context with a colleague on a different AI platform. Every time, you lose your conversation state and have to re-explain everything from scratch.

## The Solution

ChatBridge is a Chrome extension that reads your LLM conversation, sends it to a free AI summarization API, and returns:

- **Quick Summary** — what was discussed and accomplished
- **Key Topics** — bullet-point highlights
- **Decisions Made** — concrete outcomes from the conversation
- **Technical Details** — code snippets, file names, commands
- **Continuation Prompt** — a ready-to-paste prompt that fully restores context in any new chat

## Supported Platforms

| Platform | Supported |
|---|---|
| ChatGPT (chatgpt.com) | ✅ |
| Claude (claude.ai) | ✅ |
| Google Gemini (gemini.google.com) | ✅ |
| Perplexity (perplexity.ai) | ✅ |
| Mistral (chat.mistral.ai) | ✅ |

## Architecture

```
Chrome Extension (popup + content scripts)
        │
        │  POST /api/summarize  (HTTPS)
        ▼
Next.js Backend (Vercel — free tier)
        │
        ├── Gemini 2.0 Flash (primary — 1,500 free req/day)
        └── Groq Llama 3.3 70B (fallback — ~1,000 free req/day)
```

The backend is already deployed at `https://backend-six-zeta-44.vercel.app` — **no setup required** for end users. Just install the extension.

---

## Quick Start (End Users)

1. Install the extension from the [Chrome Web Store](#) *(coming soon)*
2. Open any ChatGPT, Claude, or Gemini conversation
3. Click the ChatBridge icon in your toolbar
4. Hit **Generate Summary**
5. Copy the **Continuation Prompt** and paste it into any new LLM chat

---

## Developer Setup

### Prerequisites
- Node.js 18+
- A free [Gemini API key](https://aistudio.google.com) (optional — for self-hosting the backend)

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/chat-context-bridge.git
cd chat-context-bridge
```

### 2. Backend (optional — public instance already deployed)

```bash
cd backend
npm install
cp .env.example .env
# Add your GEMINI_API_KEY to .env
npm run dev
# Backend runs at http://localhost:3000
```

### 3. Extension

```bash
cd extension
npm install
npm run build
# Built to extension/dist/
```

Load in Chrome:
1. Go to `chrome://extensions/`
2. Enable **Developer mode** (top right toggle)
3. Click **Load unpacked** → select `extension/dist/`
4. Pin the ChatBridge icon to your toolbar

### 4. Point extension at your local backend (optional)

Click the ⚙️ settings icon in the extension popup and change the backend URL to `http://localhost:3000`.

---

## Project Structure

```
chat-context-bridge/
├── extension/                    # Chrome Extension (MV3 + React + Vite)
│   ├── src/
│   │   ├── popup/               # React popup UI
│   │   ├── content/             # Page scrapers per platform
│   │   │   ├── chatgpt.ts
│   │   │   ├── claude.ts
│   │   │   ├── gemini.ts
│   │   │   └── ...
│   │   ├── background/          # Service worker
│   │   └── shared/              # Types, constants, utils
│   ├── manifest.json
│   └── vite.config.ts
│
└── backend/                      # Next.js 16 App Router
    └── app/
        ├── api/
        │   └── summarize/        # Core summarization endpoint
        │       └── route.ts
        └── privacy/              # Privacy policy page
            └── page.tsx
```

---

## API Reference

### `POST /api/summarize`

Accepts a scraped conversation and returns a structured summary.

**Request body:**
```json
{
  "platform": "chatgpt",
  "title": "Conversation title",
  "url": "https://chatgpt.com/c/...",
  "messages": [
    { "role": "user", "content": "...", "index": 0 },
    { "role": "assistant", "content": "...", "index": 1 }
  ],
  "messageCount": 2,
  "scrapedAt": 1741234567890
}
```

**Response:**
```json
{
  "quickSummary": "2-3 sentence overview",
  "keyTopics": ["topic1", "topic2"],
  "decisions": ["Decided to use X", "Chose Y approach"],
  "technicalDetails": "Code snippets, file names, commands...",
  "continuationPrompt": "I was working on... [full context for new chat]",
  "platform": "chatgpt",
  "originalMessageCount": 42,
  "model": "gemini-2.0-flash-001"
}
```

---

## Free Tier Limits

| Provider | Model | Free Requests/Day | Context Window |
|---|---|---|---|
| Google Gemini | gemini-2.0-flash | 1,500 | 1M tokens |
| Groq | llama-3.3-70b-versatile | ~1,000 | 128k tokens |

Both are more than sufficient for personal use. The Groq fallback kicks in automatically if Gemini fails.

---

## Self-Hosting the Backend

Deploy your own instance to Vercel (free):

```bash
cd backend
npx vercel --prod
# Set GEMINI_API_KEY in Vercel dashboard → Settings → Environment Variables
# Optionally set GROQ_API_KEY for fallback
```

Then update `DEFAULT_BACKEND_URL` in `extension/src/shared/constants.ts` to your Vercel URL, rebuild, and reload the extension.

---

## Privacy

- **No data stored** — conversation text is sent to Gemini/Groq for summarization only, never logged or retained
- **No accounts** — no sign-in required
- **No tracking** — no analytics or telemetry
- **Local preferences** — backend URL and last summary stored only in your browser's local storage

Full privacy policy: [chatbridge.vercel.app/privacy](https://chatbridge.vercel.app/privacy)

---

## Contributing

PRs welcome. For major changes, open an issue first.

```bash
# Extension development (hot reload)
cd extension && npm run dev

# Backend development
cd backend && npm run dev
```

---

## License

MIT — see [LICENSE](LICENSE)
