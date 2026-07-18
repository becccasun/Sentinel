import { useState, useRef, useEffect } from 'react'
import { Send, Smartphone } from 'lucide-react'
import { useApp } from '../../logic/state/AppContext'
import { buildLocalCheckIn } from '../../logic/agent/checkInGenerator'
import { parseReply, buildConfirmation } from '../../logic/agent/replyParser'
import ChatBubble from '../components/ChatBubble'
import AgentStatus from '../components/AgentStatus'

const QUICK_REPLIES = [
  'pause DoorDash',
  'move $75 to savings',
  'how am I doing?',
  'pause Peacock',
]

export default function CheckInChat() {
  const { state, dispatch, derived } = useApp()
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  // Seed initial agent message from the last generated check-in or build it locally
  useEffect(() => {
    if (state.chatMessages.length === 0) {
      const text = state.lastCheckinText || buildLocalCheckIn(state, derived)
      dispatch({
        type: 'ADD_CHAT_MESSAGE',
        message: { role: 'agent', text, timestamp: new Date().toISOString() },
      })
    }
  // Only run on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [state.chatMessages, thinking])

  function handleSend(text) {
    const trimmed = (text || input).trim()
    if (!trimmed) return

    setInput('')
    dispatch({
      type: 'ADD_CHAT_MESSAGE',
      message: { role: 'user', text: trimmed, timestamp: new Date().toISOString() },
    })

    setThinking(true)

    // Parse intents and dispatch state mutations
    const intents = parseReply(trimmed, state)
    intents.forEach(intent => {
      if (intent.type === 'PAUSE_SUBSCRIPTION') {
        dispatch({ type: 'PAUSE_SUBSCRIPTION', id: intent.subId })
      }
      if (intent.type === 'MOVE_SAVINGS') {
        dispatch({ type: 'MOVE_TO_SAVINGS', amount: intent.amount, goalId: intent.goalId })
      }
    })

    // Generate confirmation using updated derived (next render will have it, so simulate via setTimeout)
    setTimeout(() => {
      // Re-derive safe to spend with mutations applied
      const updatedSafeToSpend = intents.some(i => i.type === 'MOVE_SAVINGS')
        ? Math.max(0, derived.safeToSpend - (intents.find(i => i.type === 'MOVE_SAVINGS')?.amount || 0))
        : derived.safeToSpend
      const mockDerived = { ...derived, safeToSpend: updatedSafeToSpend }
      const confirmation = buildConfirmation(intents, state, mockDerived)

      dispatch({
        type: 'ADD_CHAT_MESSAGE',
        message: { role: 'agent', text: confirmation, timestamp: new Date().toISOString() },
      })
      setThinking(false)
    }, 800)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full animate-fade-in" style={{ height: 'calc(100vh - 32px)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <h1 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
            <Smartphone size={20} className="text-emerald-400" /> AI Check-In
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Chat with your agent · state updates happen in real-time
          </p>
        </div>
        <AgentStatus status={derived.agentStatus} size="sm" />
      </div>

      {/* Chat thread */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-2">
        {state.chatMessages.map((msg, i) => (
          <ChatBubble key={i} message={msg} />
        ))}

        {thinking && (
          <div className="flex items-start gap-2 animate-fade-in">
            <div className="bg-slate-800 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1 items-center">
                <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Quick replies */}
      <div className="shrink-0 pt-3 pb-2 border-t border-slate-800">
        <p className="text-xs text-slate-600 mb-2">Quick replies:</p>
        <div className="flex flex-wrap gap-2">
          {QUICK_REPLIES.map(qr => (
            <button
              key={qr}
              onClick={() => handleSend(qr)}
              className="text-xs px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-slate-100 border border-slate-700 hover:border-slate-600 transition-all"
            >
              {qr}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="shrink-0 flex gap-2 pt-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Reply to your agent…"
          className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
        />
        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || thinking}
          className="btn-primary px-4 py-3 disabled:opacity-40"
        >
          <Send size={16} />
        </button>
      </div>

      {/* Demo note */}
      <p className="text-xs text-slate-700 text-center mt-2 shrink-0">
        Today this loop runs in-app. Real inbound SMS parsing is the next milestone.
      </p>
    </div>
  )
}
