import { useState, useRef, useEffect } from 'react'

const API_BASE = import.meta.env.VITE_API_URL || 'https://ordertrackingbotbe-1.onrender.com'

const QUICK_ACTIONS = [
  { label: '📦 Track Order', message: 'I want to track my order' },
  { label: '📋 My Orders', message: 'Show all my orders' },
  { label: '🚚 Active Shipments', message: 'What are my active shipments?' },
  { label: '↩️ Return / Cancel', message: 'I want to return or cancel an order' },
]

function TypingDots() {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, padding: '4px 0' }}>
      <div style={av}>🤖</div>
      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '18px 18px 18px 4px', padding: '12px 16px', display: 'flex', gap: 5 }}>
        {[0,1,2].map(i => (
          <span key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: '#475569', display: 'inline-block', animation: 'pulse 1.2s infinite ease-in-out', animationDelay: `${i*0.2}s` }} />
        ))}
      </div>
    </div>
  )
}

const av = { width: 32, height: 32, borderRadius: '50%', background: '#1e3a5f', border: '1px solid #2d4a6b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }

function Bubble({ msg }) {
  const bot = msg.role === 'bot'
  return (
    <div style={{ display: 'flex', justifyContent: bot ? 'flex-start' : 'flex-end', alignItems: 'flex-end', gap: 8 }}>
      {bot && <div style={av}>🤖</div>}
      <div style={{
        maxWidth: '72%',
        background: bot ? '#1e293b' : 'linear-gradient(135deg, #3730a3, #4f46e5)',
        border: bot ? '1px solid #334155' : '1px solid #4338ca',
        borderRadius: bot ? '18px 18px 18px 4px' : '18px 18px 4px 18px',
        padding: '11px 15px',
      }}>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: '#e2e8f0', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{msg.content}</p>
        <span style={{ display: 'block', fontSize: 10, color: '#475569', marginTop: 5, textAlign: 'right' }}>
          {new Date(msg.time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  )
}

export default function App() {
  const [messages, setMessages] = useState([{
    role: 'bot',
    content: "👋 Hi! I'm your Order Tracking Assistant.\n\nShare your Order ID (e.g. ORD-1001) or registered email to get started!",
    time: Date.now(),
  }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [showQuick, setShowQuick] = useState(true)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])

  async function send(text) {
    const msg = text || input.trim()
    if (!msg) return
    setMessages(p => [...p, { role: 'user', content: msg, time: Date.now() }])
    setInput('')
    setLoading(true)
    setShowQuick(false)
    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, sessionId }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      if (!sessionId) setSessionId(data.sessionId)
      setMessages(p => [...p, { role: 'bot', content: data.reply, time: Date.now() }])
    } catch {
      setMessages(p => [...p, { role: 'bot', content: '⚠️ Could not connect to the server. Please try again.', time: Date.now() }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #ffffff; font-family: 'Inter', sans-serif; }
        @keyframes pulse { 0%,80%,100%{transform:scale(0.7);opacity:0.4} 40%{transform:scale(1);opacity:1} }
        textarea:focus { outline: none; border-color: #4f46e5 !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 4px; }
        .chip:hover { background: #1e293b !important; border-color: #475569 !important; }
      `}</style>

      {/* Page bg */}
      <div style={{ minHeight: '100vh', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>

        {/* Card */}
        <div style={{ width: '100%', maxWidth: 680, height: '88vh', maxHeight: 780, background: '#0d1117', border: '1px solid #1e2d3d', borderRadius: 20, display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 0 80px rgba(79,70,229,0.06)' }}>

          {/* Header */}
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #1e2d3d', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: '#0f1f38', border: '1px solid #1e3a5f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>📦</div>
              <div>
                <p style={{ fontWeight: 700, fontSize: 15, color: '#e2e8f0', letterSpacing: '-0.02em' }}>Order Tracking Bot</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
                  <span style={{ fontSize: 11, color: '#64748b' }}>Online · AI-Powered Support</span>
                </div>
              </div>
            </div>
            <button onClick={() => { setMessages([{ role:'bot', content:"👋 Hi! I'm your Order Tracking Assistant.\n\nShare your Order ID or email to get started!", time:Date.now() }]); setSessionId(null); setShowQuick(true) }}
              style={{ background: 'transparent', border: '1px solid #1e2d3d', borderRadius: 8, color: '#64748b', padding: '6px 12px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
              ↺ New Chat
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {messages.map((m, i) => <Bubble key={i} msg={m} />)}
            {loading && <TypingDots />}

            {showQuick && !loading && (
              <div style={{ marginTop: 4, paddingLeft: 40 }}>
                <p style={{ fontSize: 11, color: '#475569', marginBottom: 8 }}>Quick actions</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {QUICK_ACTIONS.map(a => (
                    <button key={a.label} className="chip" onClick={() => send(a.message)}
                      style={{ background: '#0f172a', border: '1px solid #1e2d3d', borderRadius: 20, padding: '7px 14px', color: '#94a3b8', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Hint bar */}
          <div style={{ padding: '6px 16px', background: '#080e18', borderTop: '1px solid #0f1a2e', textAlign: 'center', fontSize: 11, color: '#334155', flexShrink: 0 }}>
            💡 Try: <code style={{ background: '#0f1a2e', color: '#4f83cc', padding: '1px 6px', borderRadius: 4, fontSize: 11 }}>ORD-1001</code>
            {' · '}
            <code style={{ background: '#0f1a2e', color: '#4f83cc', padding: '1px 6px', borderRadius: 4, fontSize: 11 }}>sanket@example.com</code>
          </div>

          {/* Input */}
          <div style={{ padding: '12px 16px', borderTop: '1px solid #1e2d3d', display: 'flex', gap: 10, alignItems: 'flex-end', background: '#0d1117', flexShrink: 0 }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
              placeholder="Type your message… (Enter to send)"
              rows={1}
              disabled={loading}
              style={{ flex: 1, background: '#111827', border: '1px solid #1e2d3d', borderRadius: 12, padding: '11px 14px', color: '#e2e8f0', fontSize: 14, fontFamily: 'inherit', resize: 'none', lineHeight: 1.5, maxHeight: 120, overflowY: 'auto' }}
            />
            <button
              onClick={() => send()}
              disabled={loading || !input.trim()}
              style={{ width: 44, height: 44, borderRadius: 12, background: loading || !input.trim() ? '#1e293b' : '#4f46e5', border: 'none', color: 'white', fontSize: 18, cursor: loading || !input.trim() ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.2s' }}>
              {loading ? '⏳' : '➤'}
            </button>
          </div>

          <p style={{ textAlign: 'center', fontSize: 10, color: '#1e293b', padding: '4px 0 10px', flexShrink: 0 }}>Powered by Spring AI · Tool Calling · PostgreSQL</p>
        </div>
      </div>
    </>
  )
}