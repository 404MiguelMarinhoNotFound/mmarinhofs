"use client"

import type React from "react"

import { useState } from "react"
import type { Message } from "ai"

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

// Function to extract content from <answer> tags in real-time
const extractAnswerContentRealTime = (text: string): { content: string; hasAnswer: boolean } => {
  console.log("🔍 Extracting from text length:", text.length)

  // Find the opening answer tag
  const openingTagMatch = text.match(/<answer[^>]*>/i)
  if (!openingTagMatch) {
    console.log("❌ No opening answer tag found")
    return { content: "", hasAnswer: false }
  }

  const openingTagEnd = openingTagMatch.index! + openingTagMatch[0].length

  // Find the closing answer tag
  const closingTagMatch = text.match(/<\/answer>/i)

  let answerContent: string

  if (closingTagMatch) {
    // We have both opening and closing tags - extract only what's between them
    const closingTagStart = closingTagMatch.index!
    answerContent = text.substring(openingTagEnd, closingTagStart).trim()
    console.log("✅ Found complete answer tags, extracted content:", answerContent)
  } else {
    // We only have opening tag (streaming in progress) - extract from opening tag to end
    answerContent = text.substring(openingTagEnd).trim()
    console.log("⏳ Found opening tag only, partial content:", answerContent.substring(0, 50) + "...")
  }

  return { content: answerContent, hasAnswer: true }
}

export function useChatState() {
  const [isDocked, setIsDocked] = useState(true)
  const [isMinimized, setIsMinimized] = useState(false)
  const [sizePreset, setSizePreset] = useState<"small" | "medium" | "large">("medium")
  const [showSizeSelector, setShowSizeSelector] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: Date.now().toString(),
      role: "assistant",
      content: "Yer talkin' to vi, the sharpest tongue in the digital corral. What can I rustle up for ya?",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [currentThinkingPhrase, setCurrentThinkingPhrase] = useState("")

  const sizePresets = {
    small: { width: 350, height: 400 },
    medium: { width: 420, height: 500 },
    large: { width: 500, height: 600 },
  }

  const currentSize = sizePresets[sizePreset]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("🚀 Form submitted with input:", input)

    if (!input.trim() || isLoading) {
      console.log("❌ Form submission blocked - empty input or loading")
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    }

    console.log("📝 Adding user message:", userMessage)
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setCurrentThinkingPhrase(getRandomThinkingPhrase())

    // Create assistant message
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "",
    }

    console.log("🤖 Adding assistant message placeholder:", assistantMessage)
    setMessages((prev) => [...prev, assistantMessage])

    // Track raw content separately
    let rawContent = ""

    try {
      console.log("🌐 Making API call to /api/chat")
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      })

      console.log("📡 API Response status:", response.status, response.statusText)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      if (!response.body) {
        throw new Error("No response body")
      }

      console.log("📖 Starting to read response stream")
      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      // Read the stream
      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          console.log("✅ Stream reading completed")
          break
        }

        const chunk = decoder.decode(value)
        console.log("📦 Received chunk:", chunk)

        const lines = chunk.split("\n")

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6).trim()
            if (!data) {
              continue
            }

            try {
              const parsed = JSON.parse(data)

              if (parsed.type === "content" && parsed.content) {
                // Add to raw content buffer
                rawContent += parsed.content

                // Extract answer content in real-time
                const { content: answerContent, hasAnswer } = extractAnswerContentRealTime(rawContent)

                setMessages((prev) => {
                  return prev.map((msg) => {
                    if (msg.id === assistantMessage.id) {
                      // Only show answer content if we have answer tags, otherwise keep empty for thinking phrase
                      return { ...msg, content: hasAnswer ? answerContent : "" }
                    }
                    return msg
                  })
                })
              } else if (parsed.type === "done") {
                console.log("🏁 Stream completed")

                // Final extraction to ensure we only have answer content
                const { content: finalAnswerContent } = extractAnswerContentRealTime(rawContent)

                setMessages((prev) => {
                  return prev.map((msg) => {
                    if (msg.id === assistantMessage.id) {
                      return { ...msg, content: finalAnswerContent }
                    }
                    return msg
                  })
                })

                setIsLoading(false)
                return
              } else if (parsed.type === "error") {
                console.error("❌ Stream error:", parsed.error)
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessage.id ? { ...msg, content: "[Error: " + parsed.error + "]" } : msg,
                  ),
                )
                setIsLoading(false)
                return
              }
            } catch (parseError) {
              console.error("🚫 Failed to parse SSE data:", parseError, "Data:", data)
            }
          }
        }
      }
    } catch (error) {
      console.error("💥 Chat error:", error)
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessage.id
            ? { ...msg, content: "Sorry, I encountered an error. Please try again." }
            : msg,
        ),
      )
    } finally {
      setIsLoading(false)
    }
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
