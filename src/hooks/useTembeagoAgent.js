/**
 * useTembeagoAgent.js
 * -------------------
 * React hook for the Tembeago AI Recommendation Agent.
 * Uses SSE streaming with proper fallback handling.
 */

import { useState, useCallback, useRef } from 'react'

const AGENT_BASE_URL = import.meta.env.VITE_AGENT_URL || 'http://127.0.0.1:8000'

export default function useTembeagoAgent() {

  const [messages, setMessages]               = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [tip, setTip]                         = useState(null)
  const [isLoading, setIsLoading]             = useState(false)
  const [isStreaming, setIsStreaming]          = useState(false)
  const [streamingText, setStreamingText]     = useState('')
  const [toolStatus, setToolStatus]           = useState('')
  const [error, setError]                     = useState(null)
  const threadIdRef                           = useRef(null)
  const abortControllerRef                    = useRef(null)

  const sendMessage = useCallback(async (userMessage) => {
    if (!userMessage.trim() || isLoading) return

    setError(null)
    setStreamingText('')
    setToolStatus('')

    const newUserMessage = { role: 'user', content: userMessage.trim() }

    const history = messages
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .map(m => ({ role: m.role, content: m.content }))

    const updatedMessages = [...history, newUserMessage]
    setMessages(prev => [...prev, newUserMessage])
    setIsLoading(true)

    abortControllerRef.current = new AbortController()

    try {
      // ── Try SSE streaming first ─────────────────────────────────────────────
      const response = await fetch(`${AGENT_BASE_URL}/chat/stream`, {
        method:  'POST',
        headers: {
        'Content-Type': 'application/json',
        'X-API-Key': import.meta.env.VITE_AGENT_API_KEY || '',
        },
        body: JSON.stringify({
          messages:   updatedMessages,
          user_id:    'usr_004',
          user_name:  'Amina',
          thread_id:  threadIdRef.current || undefined,
        }),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        throw new Error('Stream request failed')
      }

      setIsLoading(false)
      setIsStreaming(true)

      const reader  = response.body.getReader()
      const decoder = new TextDecoder()

      let accumulatedText      = ''
      let finalRecommendations = []
      let finalTip             = null
      let finalMessage         = ''
      let buffer               = ''   // buffer for incomplete SSE lines

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')

        // Keep last incomplete line in buffer
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue

          try {
            const data = JSON.parse(line.slice(6))

            switch (data.type) {

              case 'text':
                accumulatedText += data.content
                setStreamingText(accumulatedText)
                // Clear tool status once text starts coming in
                setToolStatus('')
                break

              case 'tool_call':
                // Force re-render by appending timestamp
                setToolStatus(data.message)
                break

              case 'recommendations':
                finalRecommendations = data.data    || []
                finalTip             = data.tip     || null
                finalMessage         = data.message || ''
                if (data.thread_id) threadIdRef.current = data.thread_id
                setRecommendations(finalRecommendations)
                setTip(finalTip)
                break

              case 'done':
                setIsStreaming(false)
                setToolStatus('')
                setStreamingText('')

                const displayMessage = accumulatedText.trim() || finalMessage.trim() || 'Here are my top recommendations for you!'

                setMessages(prev => [...prev, {
                  role:            'assistant',
                  content:         displayMessage,
                  recommendations: finalRecommendations,
                  tip:             finalTip,
                }])
                return  // exit cleanly

              case 'error':
                throw new Error(data.message)
            }

          } catch (_) {
            // Skip malformed lines silently
          }
        }
      }

    } catch (err) {
      if (err.name === 'AbortError') return

      // ── Fallback to regular /chat if streaming fails ────────────────────────
      console.warn('Streaming failed, falling back to /chat:', err.message)

      try {
        setToolStatus('🔍 Searching Tembeago listings...')

        const fallbackRes = await fetch(`${AGENT_BASE_URL}/chat`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages:  updatedMessages,
            user_id:   'user_1',
            thread_id: threadIdRef.current || undefined,
          }),
        })

        if (!fallbackRes.ok) throw new Error('Request failed')

        const data = await fallbackRes.json()
        threadIdRef.current = data.thread_id

        setToolStatus('')
        setIsLoading(false)
        setIsStreaming(true)

        // Simulate typing
        const words = (data.message || '').split(' ')
        let built = ''
        for (let i = 0; i < words.length; i++) {
          built += (i > 0 ? ' ' : '') + words[i]
          setStreamingText(built)
          await new Promise(r => setTimeout(r, 30))
        }

        setIsStreaming(false)
        setStreamingText('')

        setMessages(prev => [...prev, {
          role:            'assistant',
          content:         data.message || '',
          recommendations: data.recommendations || [],
          tip:             data.tip || null,
        }])
        setRecommendations(data.recommendations || [])
        setTip(data.tip || null)

      } catch (fallbackErr) {
        setError(fallbackErr.message || 'Failed to connect to the agent.')
        setMessages(prev => prev.slice(0, -1))
      }

    } finally {
      setIsLoading(false)
      setIsStreaming(false)
      setStreamingText('')
      setToolStatus('')
    }
  }, [messages, isLoading])


  const clearChat = useCallback(async () => {
    if (abortControllerRef.current) abortControllerRef.current.abort()

    if (threadIdRef.current) {
      try {
        await fetch(`${AGENT_BASE_URL}/clear-chat`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ thread_id: threadIdRef.current }),
        })
      } catch (_) {}
      threadIdRef.current = null
    }

    setMessages([])
    setRecommendations([])
    setTip(null)
    setStreamingText('')
    setToolStatus('')
    setError(null)
  }, [])


  return {
    messages,
    recommendations,
    tip,
    isLoading,
    isStreaming,
    streamingText,
    toolStatus,
    error,
    sendMessage,
    clearChat,
  }
}