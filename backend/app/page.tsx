export default function Home() {
  return (
    <main style={{ fontFamily: 'monospace', padding: '2rem', background: '#0f172a', color: '#94a3b8', minHeight: '100vh' }}>
      <h1 style={{ color: '#10b981', marginBottom: '0.5rem' }}>ChatBridge Backend</h1>
      <p style={{ marginBottom: '1rem' }}>API server is running.</p>
      <p style={{ fontSize: '0.875rem' }}>
        <span style={{ color: '#10b981' }}>POST</span>{' '}
        <code style={{ background: '#1e293b', padding: '2px 6px', borderRadius: '4px' }}>/api/summarize</code>
        {' '}— Summarize a scraped LLM conversation
      </p>
    </main>
  )
}
