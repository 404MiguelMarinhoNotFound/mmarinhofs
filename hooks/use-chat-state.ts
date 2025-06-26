"use client"

import type React from "react"
import { useChat } from "ai/react"
import { useState } from "react"

// Cowboy-style thinking phrases
const thinkingPhrases = [
  "vi is fetchin' you the deets...",
  "rustlin' up some wisdom...",
  "ridin' through the data plains...",
  "wranglin' them answers...",
  "diggin' through the digital frontier...",
]

const getRandomThinkingPhrase = () => {
  return thinkingPhrases[Math.floor(Math.random() * thinkingPhrases.length)]
}

export function useChatState() {
  const [isDocked, setIsDocked] = useState(true)
  const [isMinimized, setIsMinimized] = useState(false)
  const [sizePreset, setSizePreset] = useState<"small" | "medium" | "large">("medium")
  const [showSizeSelector, setShowSizeSelector] = useState(false)
  const [currentThinkingPhrase, setCurrentThinkingPhrase] = useState("")

  const sizePresets = {
    small: { width: 350, height: 400 },
    medium: { width: 420, height: 500 },
    large: { width: 500, height: 600 },
  }

  const currentSize = sizePresets[sizePreset]

  // Use AI SDK's useChat hook with debugging
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: originalHandleSubmit,
    isLoading,
  } = useChat({
    api: "/api/chat",
    initialMessages: [
      {
        id: Date.now().toString(),
        role: "assistant",
        content:
          "Howdy! I'm vi, your AI assistant with access to your CV and additional context. Ask me anything about the documents!",
      },
    ],
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

  // Enhanced handleSubmit with debugging
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("\n🎯 === FRONTEND SUBMIT ===")
    console.log(`🚀 Input: "${input}"`)
    console.log(`📊 Current messages: ${messages.length}`)
    console.log(`⏳ Loading: ${isLoading}`)

    if (!input.trim() || isLoading) {
      console.log("❌ Submission blocked")
      return
    }

    const thinkingPhrase = getRandomThinkingPhrase()
    setCurrentThinkingPhrase(thinkingPhrase)
    console.log(`🤔 Thinking phrase: "${thinkingPhrase}"`)

    // Call the AI SDK's handleSubmit
    originalHandleSubmit(e)
  }

  const toggleMinimized = () => {
    setIsMinimized(!isMinimized)
  }

  const toggleDocked = () => {
    setIsDocked(!isDocked)
  }

  const toggleSizeSelector = () => {
    setShowSizeSelector(!showSizeSelector)
  }

  const selectSize = (size: "small" | "medium" | "large") => {
    setSizePreset(size)
    setShowSizeSelector(false)
  }

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
    toggleMinimized,
    toggleDocked,
    toggleSizeSelector,
    selectSize,
  }
}
