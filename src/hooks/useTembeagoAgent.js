/**
 * useTembeagoAgent.js
 * -------------------
 * React hook for the Tembeago AI Recommendation Agent.
 * Supports streaming via Server-Sent Events (SSE).
 */

import { useState, useCallback, useRef } from 'react'

const AGENT_BASE_URL = import.meta.env.VITE_AGENT_URL || 'http://127.0.0.1:8000'

// Check if a string is JSON (to avoid displaying raw JSON as text)
function isJSON(str) {
  try {
    const trimmed = str.trim()
    return (trimmed.startsWith('{') || trimmed.startsWith('['))
  } catch (_) {
    return false
  }
}

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
      const response = await fetch(`${AGENT_BASE_URL}/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages:  updatedMessages,
          user_id:   'user_1',
          thread_id: threadIdRef.current || undefined,
        }),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.detail || 'Something went wrong.')
      }

      setIsLoading(false)
      setIsStreaming(true)

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let accumulatedText = ''
      let finalRecommendations = []
      let finalTip = null
      let isJsonResponse = false  // flag to skip raw JSON display

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue

          try {
            const data = JSON.parse(line.slice(6))

            switch (data.type) {
              case 'text':
                // Skip if the content looks like raw JSON
                if (isJSON(data.content) || isJSON(accumulatedText + data.content)) {
                  isJsonResponse = true
                  break
                }
                if (!isJsonResponse) {
                  accumulatedText += data.content
                  setStreamingText(accumulatedText)
                }
                break

              case 'tool_call':
                setToolStatus(data.message)
                // Reset when tools start
                accumulatedText = ''
                isJsonResponse = false
                setStreamingText('')
                break

              case 'recommendations':
                finalRecommendations = data.data || []
                finalTip = data.tip || null
                threadIdRef.current = data.thread_id
                setRecommendations(finalRecommendations)
                setTip(finalTip)
                // Use the message from recommendations if text was JSON
                if (isJsonResponse && data.message) {
                  accumulatedText = data.message
                }
                break

              case 'done':
                setIsStreaming(false)
                setToolStatus('')
                setStreamingText('')
                setMessages(prev => [
                  ...prev,
                  {
                    role:            'assistant',
                    content:         accumulatedText,
                    recommendations: finalRecommendations,
                    tip:             finalTip,
                  }
                ])
                isJsonResponse = false
                break

              case 'error':
                throw new Error(data.message)
            }
          } catch (_) {}
        }
      }

    } catch (err) {
      if (err.name === 'AbortError') return
      setError(err.message || 'Failed to connect to the agent. Please try again.')
      setMessages(prev => prev.slice(0, -1))
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
