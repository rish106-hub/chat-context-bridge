export default function PrivacyPolicy() {
  return (
    <main style={{ maxWidth: 700, margin: '60px auto', padding: '0 24px', fontFamily: 'system-ui, sans-serif', lineHeight: 1.7, color: '#e2e8f0' }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Privacy Policy</h1>
      <p style={{ color: '#94a3b8', marginBottom: 40 }}>Last updated: March 2025</p>

      <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 32 }}>What ChatBridge does</h2>
      <p>
        ChatBridge is a Chrome extension that reads the conversation text on LLM chat pages
        (ChatGPT, Claude, Gemini, Perplexity, Mistral) when you click the extension, sends it
        to our summarization API, and returns a structured summary and continuation prompt.
      </p>

      <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 32 }}>Data we collect</h2>
      <ul>
        <li><strong>Conversation text</strong> — sent to our API solely to produce a summary. It is not stored, logged, or used for any other purpose.</li>
        <li><strong>No personal data</strong> — we do not collect names, emails, IP addresses, or any identifying information.</li>
        <li><strong>No accounts</strong> — ChatBridge requires no account or sign-in.</li>
        <li><strong>No analytics</strong> — we do not use Google Analytics, Mixpanel, or any tracking service.</li>
      </ul>

      <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 32 }}>Third-party services</h2>
      <p>
        Conversation text is processed by <strong>Google Gemini API</strong> (and optionally Groq) to
        generate the summary. These providers operate under their own privacy policies. Text is sent
        over HTTPS and is not retained by ChatBridge after the API response is returned.
      </p>

      <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 32 }}>Local storage</h2>
      <p>
        Your backend URL preference and the last generated summary are stored locally in Chrome
        storage on your device. This data never leaves your browser except as part of normal
        extension operation.
      </p>

      <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 32 }}>Contact</h2>
      <p>
        Questions? Open an issue on our GitHub repository or reach out via the Chrome Web Store listing.
      </p>
    </main>
  )
}
