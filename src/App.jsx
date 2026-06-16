import { useState, useRef, useEffect } from 'react'

const API_BASE = import.meta.env.VITE_API_URL || ''

// ─── Quick action chips shown at start ───────────────────────────────────────
const QUICK_ACTIONS = [
  { label: '📦 Track Order', message: 'I want to track my order' },
  { label: '📋 My Orders', message: 'Show all my orders' },
  { label: '🚚 Active Shipments', message: 'What are my active shipments?' },
  { label: '↩️ Return/Cancel', message: 'I want to return or cancel an order' },
]

// ─── Status badge colors ──────────────────────────────────────────────────────
const STATUS_STYLES = {
  PROCESSING:       { bg: '#1e3a5f', text: '#60a5fa', dot: '#3b82f6' },
  SHIPPED:          { bg: '#1a3a2a', text: '#4ade80', dot: '#22c55e' },
  OUT_FOR_DELIVERY: { bg: '#3a2a08', text: '#fbbf24', dot: '#f59e0b' },
  DELIVERED:        { bg: '#1a2e1a', text: '#86efac', dot: '#4ade80' },
  CANCELLED:        { bg: '#3a1a1a', text: '#f87171', dot: '#ef4444' },
  RETURN_REQUESTED: { bg: '#2d1a3a', text: '#c084fc', dot: '#a855f7' },
  RETURNED:         { bg: '#2d1a3a', text: '#a78bfa', dot: '#8b5cf6' },
}

function formatDate(dateStr) {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
}

function TypingDots() {
  return (
    <div style={styles.typingBubble}>
      <div style={styles.botAvatar}>🤖</div>
      <div style={styles.dotsContainer}>
        {[0, 1, 2].map(i => (
          <span key={i} style={{ ...styles.dot, animationDelay: `${i * 0.2}s` }} />
        ))}
      </div>
    </div>
  )
}

function MessageBubble({ msg }) {
  const isBot = msg.role === 'bot'
  return (
    <div style={{ ...styles.messageRow, justifyContent: isBot ? 'flex-start' : 'flex-end' }}>
      {isBot && <div style={styles.botAvatar}>🤖</div>}
      <div style={isBot ? styles.botBubble : styles.userBubble}>
        <p style={styles.messageText}>{msg.content}</p>
        <span style={styles.timestamp}>
          {new Date(msg.time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  )
}

export default function App() {
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      content: "👋 Hi! I'm your Order Tracking Assistant. I can help you track orders, view your order history, or process returns.\n\nPlease share your **Order ID** (e.g., ORD-1001) or **registered email** to get started!",
      time: Date.now(),
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [showQuickActions, setShowQuickActions] = useState(true)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function sendMessage(text) {
    const userMsg = text || input.trim()
    if (!userMsg) return

    setMessages(prev => [...prev, { role: 'user', content: userMsg, time: Date.now() }])
    setInput('')
    setLoading(true)
    setShowQuickActions(false)

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, sessionId }),
      })

      if (!res.ok) throw new Error(`Server error: ${res.status}`)
      const data = await res.json()

      if (!sessionId) setSessionId(data.sessionId)
      setMessages(prev => [...prev, { role: 'bot', content: data.reply, time: Date.now() }])
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'bot',
        content: '⚠️ Sorry, I couldn\'t connect to the server. Please try again in a moment.',
        time: Date.now(),
        isError: true,
      }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  function clearChat() {
    setMessages([{
      role: 'bot',
      content: "👋 Hi! I'm your Order Tracking Assistant. How can I help you today?",
      time: Date.now(),
    }])
    setSessionId(null)
    setShowQuickActions(true)
  }

  return (
    <div style={styles.root}>
      {/* Background grid */}
      <div style={styles.bgGrid} />

      <div style={styles.container}>
        {/* ── Header ── */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.headerIcon}>📦</div>
            <div>
              <h1 style={styles.headerTitle}>Order Tracking Bot</h1>
              <div style={styles.headerStatus}>
                <span style={styles.onlineDot} />
                <span style={styles.onlineText}>Online · AI-Powered Support</span>
              </div>
            </div>
          </div>
          <button onClick={clearChat} style={styles.clearBtn} title="New conversation">
            ↺ New Chat
          </button>
        </div>

        {/* ── Messages ── */}
        <div style={styles.messages}>
          {messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}
          {loading && <TypingDots />}

          {/* Quick actions shown only at start */}
          {showQuickActions && !loading && (
            <div style={styles.quickActions}>
              <p style={styles.quickLabel}>Quick actions:</p>
              <div style={styles.quickGrid}>
                {QUICK_ACTIONS.map(action => (
                  <button
                    key={action.label}
                    onClick={() => sendMessage(action.message)}
                    style={styles.chip}
                    onMouseEnter={e => e.currentTarget.style.background = '#1e293b'}
                    onMouseLeave={e => e.currentTarget.style.background = '#0f172a'}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* ── Sample data hint ── */}
        <div style={styles.hint}>
          💡 Try: <code style={styles.code}>ORD-1001</code> · <code style={styles.code}>sanket@example.com</code> · <code style={styles.code}>ORD-1002</code>
        </div>

        {/* ── Input ── */}
        <div style={styles.inputArea}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message... (Enter to send)"
            style={styles.textarea}
            rows={1}
            disabled={loading}
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            style={{
              ...styles.sendBtn,
              opacity: (loading || !input.trim()) ? 0.4 : 1,
              cursor: (loading || !input.trim()) ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? '⏳' : '➤'}
          </button>
        </div>
        <p style={styles.footer}>Powered by Spring AI · Tool Calling · PostgreSQL</p>
      </div>
    </div>
  )
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = {
  root: {
    minHeight: '100vh',
    background: '#020817',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Inter', sans-serif",
    padding: '16px',
    position: 'relative',
    overflow: 'hidden',
  },
  bgGrid: {
    position: 'fixed',
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(99,102,241,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px)
    `,
    backgroundSize: '40px 40px',
    pointerEvents: 'none',
  },
  container: {
    width: '100%',
    maxWidth: '720px',
    height: '90vh',
    maxHeight: '800px',
    background: '#0d1117',
    border: '1px solid #1e2d3d',
    borderRadius: '20px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: '0 0 60px rgba(99,102,241,0.08), 0 0 0 1px rgba(255,255,255,0.03)',
    position: 'relative',
    zIndex: 1,
  },
  header: {
    padding: '16px 20px',
    background: '#0d1117',
    borderBottom: '1px solid #1e2d3d',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexShrink: 0,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  headerIcon: {
    fontSize: '28px',
    width: '44px',
    height: '44px',
    background: 'linear-gradient(135deg, #1e3a5f, #1a1f2e)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #2d4a6b',
  },
  headerTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '700',
    color: '#e2e8f0',
    letterSpacing: '-0.02em',
  },
  headerStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '2px',
  },
  onlineDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    background: '#22c55e',
    boxShadow: '0 0 6px #22c55e',
  },
  onlineText: {
    fontSize: '11px',
    color: '#64748b',
    fontWeight: '500',
  },
  clearBtn: {
    background: 'transparent',
    border: '1px solid #1e2d3d',
    borderRadius: '8px',
    color: '#64748b',
    padding: '6px 12px',
    fontSize: '12px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 0.2s',
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    scrollbarWidth: 'thin',
    scrollbarColor: '#1e2d3d transparent',
  },
  messageRow: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '8px',
  },
  botAvatar: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    background: '#1e2d3d',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    flexShrink: 0,
    border: '1px solid #2d4a6b',
  },
  botBubble: {
    maxWidth: '75%',
    background: '#111827',
    border: '1px solid #1e2d3d',
    borderRadius: '16px 16px 16px 4px',
    padding: '12px 14px',
  },
  userBubble: {
    maxWidth: '75%',
    background: 'linear-gradient(135deg, #312e81, #1e1b4b)',
    border: '1px solid #4338ca',
    borderRadius: '16px 16px 4px 16px',
    padding: '12px 14px',
  },
  messageText: {
    margin: 0,
    fontSize: '14px',
    lineHeight: '1.6',
    color: '#cbd5e1',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  timestamp: {
    display: 'block',
    fontSize: '10px',
    color: '#475569',
    marginTop: '6px',
    textAlign: 'right',
  },
  typingBubble: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '8px',
  },
  dotsContainer: {
    background: '#111827',
    border: '1px solid #1e2d3d',
    borderRadius: '16px 16px 16px 4px',
    padding: '14px 18px',
    display: 'flex',
    gap: '5px',
    alignItems: 'center',
  },
  dot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    background: '#475569',
    animation: 'bounce 1.2s infinite ease-in-out',
    display: 'inline-block',
  },
  quickActions: {
    marginTop: '8px',
  },
  quickLabel: {
    fontSize: '11px',
    color: '#475569',
    marginBottom: '8px',
    margin: '0 0 8px 38px',
  },
  quickGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginLeft: '38px',
  },
  chip: {
    background: '#0f172a',
    border: '1px solid #1e2d3d',
    borderRadius: '20px',
    padding: '7px 14px',
    color: '#94a3b8',
    fontSize: '13px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 0.2s',
  },
  hint: {
    padding: '8px 16px',
    fontSize: '11px',
    color: '#475569',
    borderTop: '1px solid #1e2d3d',
    background: '#0a0f18',
    textAlign: 'center',
    flexShrink: 0,
  },
  code: {
    fontFamily: "'JetBrains Mono', monospace",
    background: '#1e2d3d',
    padding: '1px 6px',
    borderRadius: '4px',
    color: '#60a5fa',
    fontSize: '11px',
  },
  inputArea: {
    padding: '12px 16px',
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-end',
    background: '#0d1117',
    borderTop: '1px solid #1e2d3d',
    flexShrink: 0,
  },
  textarea: {
    flex: 1,
    background: '#111827',
    border: '1px solid #1e2d3d',
    borderRadius: '12px',
    padding: '12px 14px',
    color: '#e2e8f0',
    fontSize: '14px',
    fontFamily: 'inherit',
    resize: 'none',
    outline: 'none',
    lineHeight: '1.5',
    maxHeight: '120px',
    overflowY: 'auto',
  },
  sendBtn: {
    width: '44px',
    height: '44px',
    background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
    border: 'none',
    borderRadius: '12px',
    color: 'white',
    fontSize: '18px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'opacity 0.2s',
    boxShadow: '0 0 20px rgba(99,102,241,0.3)',
  },
  footer: {
    textAlign: 'center',
    fontSize: '10px',
    color: '#334155',
    padding: '4px 0 10px',
    margin: 0,
    flexShrink: 0,
  },
}

// Inject keyframes for typing dots
const styleTag = document.createElement('style')
styleTag.textContent = `
  @keyframes bounce {
    0%, 80%, 100% { transform: scale(0.7); opacity: 0.4; }
    40% { transform: scale(1); opacity: 1; }
  }
  textarea:focus { border-color: #4338ca !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #1e2d3d; border-radius: 4px; }
`
document.head.appendChild(styleTag)