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

export function useChatState() {
  const [isDocked, setIsDocked] = useState(true)
  const [isMinimized, setIsMinimized] = useState(false)
  const [sizePreset, setSizePreset] = useState<"small" | "medium" | "large">("medium")
  const [showSizeSelector, setShowSizeSelector] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: Date.now().toString(),
      role: "assistant",
      content:
        "Howdy! I'm vi, your AI assistant with access to your CV and additional context. Ask me anything about the documents!",
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
    console.log("\n🎯 === FRONTEND CHAT SUBMIT ===")
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
    setMessages((prev) => {
      console.log(`📊 Previous messages count: ${prev.length}`)
      return [...prev, userMessage]
    })
    setInput("")
    setIsLoading(true)
    const thinkingPhrase = getRandomThinkingPhrase()
    setCurrentThinkingPhrase(thinkingPhrase)
    console.log(`🤔 Set thinking phrase: "${thinkingPhrase}"`)

    // Create assistant message
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "",
    }

    console.log("🤖 Adding assistant message placeholder:", assistantMessage)
    setMessages((prev) => [...prev, assistantMessage])

    try {
      console.log("🌐 Making API call to /api/chat")
      const requestBody = {
        messages: [...messages, userMessage],
      }
      console.log("📤 Request body:", JSON.stringify(requestBody, null, 2))

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      console.log("📡 API Response status:", response.status, response.statusText)
      console.log("📡 Response headers:", Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ HTTP error response:", errorText)
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`)
      }

      if (!response.body) {
        console.error("❌ No response body")
        throw new Error("No response body")
      }

      console.log("📖 Starting to read response stream")
      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      let accumulatedContent = ""
      let chunkCount = 0

      // Read the stream
      while (true) {
        const { done, value } = await reader.read()
        chunkCount++

        if (done) {
          console.log(`✅ Stream reading completed after ${chunkCount} chunks`)
          console.log(`📝 Final accumulated content length: ${accumulatedContent.length}`)
          console.log(`📝 Final content preview: "${accumulatedContent.substring(0, 200)}..."`)
          break
        }

        const chunk = decoder.decode(value)
        console.log(`📦 Chunk ${chunkCount} received (${chunk.length} chars):`, chunk)

        const lines = chunk.split("\n")
        console.log(`📄 Split into ${lines.length} lines`)

        for (const line of lines) {
          console.log(`🔍 Processing line: "${line}"`)

          // Handle different AI SDK stream formats
          if (line.startsWith("0:")) {
            // Format: 0:{"type":"text-delta","textDelta":"content"}
            const data = line.slice(2).trim()
            if (!data) {
              console.log("⏭️ Skipping empty 0: line")
              continue
            }

            console.log(`🔍 Processing 0: data: ${data}`)

            try {
              const parsed = JSON.parse(data)
              console.log(`✅ Parsed JSON type: ${parsed.type}`)

              if (parsed.type === "text-delta" && parsed.textDelta) {
                console.log(`📝 Text delta received: "${parsed.textDelta}"`)
                accumulatedContent += parsed.textDelta

                setMessages((prev) => {
                  return prev.map((msg) => {
                    if (msg.id === assistantMessage.id) {
                      console.log(`🔄 Updating message content (${accumulatedContent.length} chars)`)
                      return { ...msg, content: accumulatedContent }
                    }
                    return msg
                  })
                })
              } else if (parsed.type === "finish") {
                console.log("🏁 Stream completed with finish signal")
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
              } else {
                console.log(`ℹ️ Unhandled 0: message type: ${parsed.type}`, parsed)
              }
            } catch (parseError) {
              console.error("🚫 Failed to parse 0: data:", parseError, "Data:", data)
            }
          } else if (line.startsWith("data: ")) {
            // Format: data: {"type":"text-delta","textDelta":"content"}
            const data = line.slice(6).trim()
            if (!data || data === "[DONE]") {
              console.log("⏭️ Skipping empty or DONE data line")
              continue
            }

            console.log(`🔍 Processing data: line: ${data}`)

            try {
              const parsed = JSON.parse(data)
              console.log(`✅ Parsed data: JSON type: ${parsed.type}`)

              if (parsed.type === "text-delta" && parsed.textDelta) {
                console.log(`📝 Data text delta received: "${parsed.textDelta}"`)
                accumulatedContent += parsed.textDelta

                setMessages((prev) => {
                  return prev.map((msg) => {
                    if (msg.id === assistantMessage.id) {
                      console.log(`🔄 Updating message content (${accumulatedContent.length} chars)`)
                      return { ...msg, content: accumulatedContent }
                    }
                    return msg
                  })
                })
              } else if (parsed.type === "finish") {
                console.log("🏁 Data stream completed with finish signal")
                setIsLoading(false)
                return
              } else if (parsed.type === "error") {
                console.error("❌ Data stream error:", parsed.error)
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessage.id ? { ...msg, content: "[Error: " + parsed.error + "]" } : msg,
                  ),
                )
                setIsLoading(false)
                return
              } else {
                console.log(`ℹ️ Unhandled data: message type: ${parsed.type}`, parsed)
              }
            } catch (parseError) {
              console.error("🚫 Failed to parse data: line:", parseError, "Data:", data)
            }
          } else if (line.trim() && !line.startsWith("event:") && !line.startsWith("id:")) {
            // Try to parse as direct JSON (some formats)
            console.log(`🔍 Trying to parse as direct JSON: ${line}`)
            try {
              const parsed = JSON.parse(line)
              console.log(`✅ Parsed direct JSON type: ${parsed.type}`)

              if (parsed.type === "text-delta" && parsed.textDelta) {
                console.log(`📝 Direct text delta received: "${parsed.textDelta}"`)
                accumulatedContent += parsed.textDelta

                setMessages((prev) => {
                  return prev.map((msg) => {
                    if (msg.id === assistantMessage.id) {
                      console.log(`🔄 Updating message content (${accumulatedContent.length} chars)`)
                      return { ...msg, content: accumulatedContent }
                    }
                    return msg
                  })
                })
              } else if (parsed.type === "finish") {
                console.log("🏁 Direct stream completed with finish signal")
                setIsLoading(false)
                return
              }
            } catch (parseError) {
              console.log(`ℹ️ Line not JSON, skipping: ${line}`)
            }
          } else if (line.trim()) {
            console.log(`ℹ️ Other line type: ${line}`)
          }
        }
      }

      // If we get here without any content, there might be an issue
      if (accumulatedContent.length === 0) {
        console.warn("⚠️ No content accumulated from stream")
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessage.id
              ? { ...msg, content: "Stream completed but no content received. Check server logs." }
              : msg,
          ),
        )
      }
    } catch (error) {
      console.error("💥 Chat error:", error)
      console.error("Stack trace:", error.stack)
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessage.id
            ? { ...msg, content: "Sorry, I encountered an error. Please try again." }
            : msg,
        ),
      )
    } finally {
      console.log("🔄 Setting loading to false")
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
