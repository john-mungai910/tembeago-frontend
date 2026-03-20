/**
 * TembeagoChat.jsx
 * ----------------
 * Chat UI with streaming support.
 * Text streams word by word, tool status shows while searching,
 * recommendation cards appear at the end.
 */

import { useRef, useEffect } from 'react'
import useTembeagoAgent from '../hooks/useTembeagoAgent'
import RecommendationCard from './RecommendationCard'

export default function TembeagoChat() {
  const {
    messages,
    sendMessage,
    isLoading,
    isStreaming,
    streamingText,
    toolStatus,
    error,
    clearChat,
  } = useTembeagoAgent()

  const inputRef = useRef(null)
  const bottomRef = useRef(null)

  // Auto scroll to bottom on new content
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingText, toolStatus])

  const handleSend = () => {
    const value = inputRef.current?.value?.trim()
    if (!value || isLoading || isStreaming) return
    sendMessage(value)
    inputRef.current.value = ''
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const isBusy = isLoading || isStreaming

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', fontFamily: 'sans-serif' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0' }}>
        <h2 style={{ margin: 0 }}>🌍 Tembeago AI Assistant</h2>
        <button onClick={clearChat} style={{ fontSize: '13px', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}>
          Clear chat
        </button>
      </div>

      {/* Messages */}
      <div style={{ minHeight: '400px', maxHeight: '600px', overflowY: 'auto', padding: '8px 0' }}>

        {/* Welcome message */}
        {messages.length === 0 && !isBusy && (
          <div style={{ textAlign: 'center', color: '#9ca3af', padding: '40px 0' }}>
            <p>👋 Hi! I'm Tembe, your Tembeago travel assistant.</p>
            <p>Ask me to find hotels, attractions or tours anywhere in Kenya!</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginTop: '16px' }}>
              {[
                'Find me a beach hotel in Mombasa',
                'Safari camps in Maasai Mara',
                'Budget accommodation in Nairobi',
                'Top tourist attractions in Kenya',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => sendMessage(suggestion)}
                  style={{ fontSize: '13px', padding: '6px 14px', borderRadius: '20px', border: '1px solid #e5e7eb', background: '#f9fafb', color: '#111827', cursor: 'pointer' }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Conversation history */}
        {messages.map((msg, index) => (
          <div key={index} style={{ marginBottom: '16px' }}>

            {/* User message */}
            {msg.role === 'user' && (
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ background: '#f97316', color: '#fff', padding: '10px 14px', borderRadius: '18px 18px 4px 18px', maxWidth: '80%', fontSize: '14px' }}>
                  {msg.content}
                </div>
              </div>
            )}

            {/* Assistant message */}
            {msg.role === 'assistant' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f97316', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>
                    🌍
                  </div>
                  <div style={{ background: '#f3f4f6', padding: '10px 14px', borderRadius: '18px 18px 18px 4px', maxWidth: '80%', fontSize: '14px', color: '#374151' }}>
                    {msg.content}
                  </div>
                </div>

                {/* Recommendation cards */}
                {msg.recommendations && msg.recommendations.length > 0 && (
                  <div style={{ paddingLeft: '42px' }}>
                    {msg.recommendations.map((rec) => (
                      <RecommendationCard key={rec.rank} recommendation={rec} />
                    ))}
                  </div>
                )}

                {/* Travel tip */}
                {msg.tip && (
                  <div style={{ paddingLeft: '42px', marginTop: '8px' }}>
                    <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#065f46' }}>
                      💡 <strong>Travel Tip:</strong> {msg.tip}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Tool status — shows while agent is searching DB */}
        {toolStatus && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f97316', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              🌍
            </div>
            <div style={{ background: '#f3f4f6', padding: '10px 14px', borderRadius: '18px', fontSize: '14px', color: '#6b7280', fontStyle: 'italic' }}>
              {toolStatus}
            </div>
          </div>
        )}

        {/* Streaming text — shows as GPT-4o generates the response */}
        {streamingText && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '8px 0' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f97316', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              🌍
            </div>
            <div style={{ background: '#f3f4f6', padding: '10px 14px', borderRadius: '18px 18px 18px 4px', maxWidth: '80%', fontSize: '14px', color: '#374151' }}>
              {streamingText}
              {/* Blinking cursor while streaming */}
              <span style={{ display: 'inline-block', width: '2px', height: '14px', background: '#f97316', marginLeft: '2px', animation: 'blink 1s step-end infinite', verticalAlign: 'text-bottom' }} />
            </div>
          </div>
        )}

        {/* Initial loading indicator */}
        {isLoading && !streamingText && !toolStatus && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f97316', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              🌍
            </div>
            <div style={{ background: '#f3f4f6', padding: '10px 14px', borderRadius: '18px', fontSize: '14px', color: '#6b7280' }}>
              Thinking...
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', color: '#dc2626', marginTop: '8px' }}>
            ⚠️ {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Blinking cursor CSS */}
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>

      {/* Input */}
      <div style={{ display: 'flex', gap: '8px', padding: '16px 0', borderTop: '1px solid #e5e7eb' }}>
        <input
          ref={inputRef}
          onKeyDown={handleKeyDown}
          placeholder="Ask me to find hotels, tours or attractions..."
          disabled={isBusy}
          style={{ flex: 1, padding: '10px 14px', borderRadius: '24px', border: '1px solid #e5e7eb', fontSize: '14px', outline: 'none', background: isBusy ? '#f9fafb' : '#fff' }}
        />
        <button
          onClick={handleSend}
          disabled={isBusy}
          style={{ background: isBusy ? '#fdba74' : '#f97316', color: '#fff', border: 'none', borderRadius: '24px', padding: '10px 20px', fontSize: '14px', fontWeight: '600', cursor: isBusy ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}
        >
          {isLoading ? '...' : isStreaming ? '●●●' : 'Send'}
        </button>
      </div>

    </div>
  )
}