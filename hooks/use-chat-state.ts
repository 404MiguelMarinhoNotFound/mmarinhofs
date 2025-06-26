"use client"

import type React from "react"
import { useChat } from "ai/react"
import { useState, useCallback, useMemo, useEffect } from "react"

// Cowboy-style thinking phrases
const cowboyThinkingPhrases = [
  "vi is fetchin' you the deets...",
  "rustlin' up some wisdom...",
  "ridin' through the data plains...",
  "wranglin' them answers...",
  "diggin' through the digital frontier...",
]

// Normal thinking phrases
const normalThinkingPhrases = [
  "vi is processing your request...",
  "analyzing the documents...",
  "searching through the information...",
  "gathering relevant details...",
  "reviewing the content...",
]

const getRandomThinkingPhrase = (isCowboyMode: boolean) => {
  const phrases = isCowboyMode ? cowboyThinkingPhrases : normalThinkingPhrases
  return phrases[Math.floor(Math.random() * phrases.length)]
}

export function useChatState() {
  const [isDocked, setIsDocked] = useState(true)
  const [isMinimized, setIsMinimized] = useState(false)
  const [sizePreset, setSizePreset] = useState<"small" | "medium" | "large">("medium")
  const [showSizeSelector, setShowSizeSelector] = useState(false)
  const [currentThinkingPhrase, setCurrentThinkingPhrase] = useState("")
  const [isCowboyMode, setIsCowboyMode] = useState(true) // Start in cowboy mode

  const sizePresets = {
    small: { width: 350, height: 400 },
    medium: { width: 420, height: 500 },
    large: { width: 500, height: 600 },
  }

  const currentSize = sizePresets[sizePreset]

  // Create initial message based on cowboy mode
  const initialMessage = useMemo(
    () => ({
      id: "initial",
      role: "assistant" as const,
      content: isCowboyMode
        ? "Howdy partner! I'm vi, your rootin'-tootin' AI assistant with access to your CV and additional context. Ask me anything about the documents! 🤠"
        : "Hello! I'm vi, your AI assistant with access to your CV and additional context. Ask me anything about the documents!",
    }),
    [isCowboyMode],
  )

  // Use AI SDK's useChat hook with stable configuration
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: originalHandleSubmit,
    isLoading,
    setMessages,
  } = useChat({
    api: "/api/chat",
    body: {
      cowboyMode: isCowboyMode,
    },
    initialMessages: [initialMessage],
    onResponse: (response) => {
      console.log("📡 Frontend received response:")
      console.log(`   Status: ${response.status} ${response.statusText}`)
      console.log(`   Headers:`, Object.fromEntries(response.headers.entries()))
    },
    onFinish: (message) => {
      console.log("🏁 Frontend message finished:")
      console.log(`   ID: ${message.id}`)
      console.log(`   Role: ${message.role}`)
      console.log(`   Content length: ${message.content.length}`)
      console.log(`   Preview: "${message.content.substring(0, 100)}..."`)
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error("💥 Frontend chat error:", errorMessage)
    },
  })

  // Update initial message when cowboy mode changes
  useEffect(() => {
    console.log(`🔄 Cowboy mode effect triggered: ${isCowboyMode}`)

    const newInitialMessage = {
      id: "initial",
      role: "assistant" as const,
      content: isCowboyMode
        ? "Howdy partner! I'm vi, your rootin'-tootin' AI assistant with access to your CV and additional context. Ask me anything about the documents! 🤠"
        : "Hello! I'm vi, your AI assistant with access to your CV and additional context. Ask me anything about the documents!",
    }

    setMessages((currentMessages) => {
      console.log(`📝 Current messages count: ${currentMessages.length}`)
      // Only update if we have messages and the first one is the initial message
      if (currentMessages.length > 0 && currentMessages[0].id === "initial") {
        // Check if the content actually needs to change to avoid unnecessary updates
        if (currentMessages[0].content !== newInitialMessage.content) {
          console.log(`✅ Updating initial message for cowboy mode: ${isCowboyMode}`)
          return [newInitialMessage, ...currentMessages.slice(1)]
        }
      }
      return currentMessages
    })
  }, [isCowboyMode, setMessages])

  // Enhanced handleSubmit with debugging
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      console.log("\n🎯 === FRONTEND SUBMIT ===")
      console.log(`🚀 Input: "${input}"`)
      console.log(`📊 Current messages: ${messages.length}`)
      console.log(`⏳ Loading: ${isLoading}`)
      console.log(`🤠 Cowboy mode: ${isCowboyMode}`)

      if (!input.trim() || isLoading) {
        console.log("❌ Submission blocked")
        return
      }

      const thinkingPhrase = getRandomThinkingPhrase(isCowboyMode)
      setCurrentThinkingPhrase(thinkingPhrase)
      console.log(`🤔 Thinking phrase: "${thinkingPhrase}"`)

      // Call the AI SDK's handleSubmit
      originalHandleSubmit(e)
    },
    [input, isLoading, isCowboyMode, messages.length, originalHandleSubmit],
  )

  const toggleMinimized = useCallback(() => {
    setIsMinimized((prev) => !prev)
  }, [])

  const toggleDocked = useCallback(() => {
    setIsDocked((prev) => !prev)
  }, [])

  const toggleSizeSelector = useCallback(() => {
    setShowSizeSelector((prev) => !prev)
  }, [])

  const selectSize = useCallback((size: "small" | "medium" | "large") => {
    setSizePreset(size)
    setShowSizeSelector(false)
  }, [])

  const toggleCowboyMode = useCallback(() => {
    console.log("🎯 COWBOY TOGGLE CLICKED!")
    console.log(`🤠 Current cowboy mode: ${isCowboyMode}`)

    setIsCowboyMode((prev) => {
      const newMode = !prev
      console.log(`🤠 Cowboy mode toggled from ${prev} to ${newMode}`)
      return newMode
    })
  }, [isCowboyMode])

  // Debug log current state
  useEffect(() => {
    console.log(`🐛 Current state - Cowboy mode: ${isCowboyMode}`)
  }, [isCowboyMode])

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    isDocked,
    isMinimized,
    currentSize,
    sizePreset,
    showSizeSelector,
    currentThinkingPhrase,
    isCowboyMode,
    toggleMinimized,
    toggleDocked,
    toggleSizeSelector,
    selectSize,
    toggleCowboyMode,
  }
}
