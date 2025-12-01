import React, { useState, useEffect } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

function App() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [userId] = useState(() => {
    try {
      const key = 'chacha_user_id'
      let id = localStorage.getItem(key)
      if (!id) {
        id = 'u_' + Math.random().toString(36).slice(2, 10)
        localStorage.setItem(key, id)
      }
      return id
    } catch {
      return 'anonymous'
    }
  })

  const sendMessage = async () => {
    if (!input.trim()) return
    const userMsg = { type: 'user', text: input }
    setMessages(m => [...m, userMsg])
    setInput('')
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.text, user_id: userId })
      })
      const data = await res.json()
      const botMsg = { type: 'bot', text: data.answer }
      setMessages(m => [...m, botMsg])
    } catch (e) {
      setMessages(m => [...m, { type: 'bot', text: 'Error contacting server.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ fontFamily: 'system-ui', maxWidth: 800, margin: '2rem auto' }}>
      <h1>Chacha Chaudhary Chatbot (React)</h1>
      <div style={{ border: '1px solid #ccc', padding: '1rem', minHeight: 300 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ margin: '0.5rem 0', textAlign: m.type === 'user' ? 'right' : 'left' }}>
            <span style={{ background: m.type === 'user' ? '#007bff' : '#eee', color: m.type === 'user' ? '#fff' : '#000', padding: '0.5rem 0.75rem', borderRadius: 12, display: 'inline-block' }}>{m.text}</span>
          </div>
        ))}
        {loading && <div>Typing...</div>}
      </div>
      <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask about Namami Gange..."
          style={{ flex: 1, padding: '0.5rem' }}
          onKeyDown={e => { if (e.key === 'Enter') sendMessage() }}
        />
        <button onClick={sendMessage} disabled={loading}>Send</button>
      </div>
    </div>
  )
}

export default App
