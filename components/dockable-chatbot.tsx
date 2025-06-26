"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useChatState } from "@/hooks/use-chat-state"
import { MessageCircle, X, Send, Loader2, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { MarkdownRenderer } from "./markdown-renderer"

export default function DockableChatbot() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    isMinimized,
    toggleMinimized,
    isDocked,
    currentSize,
    sizePreset,
    showSizeSelector,
    currentThinkingPhrase,
    isCowboyMode,
    toggleSizeSelector,
    selectSize,
    toggleCowboyMode,
  } = useChatState()

  // Debug log to ensure we're getting the values
  useEffect(() => {
    console.log("🔍 DockableChatbot - isCowboyMode:", isCowboyMode)
    console.log("🔍 DockableChatbot - toggleCowboyMode:", typeof toggleCowboyMode)
  }, [isCowboyMode, toggleCowboyMode])

  // Position state for undocked mode
  const [position, setPosition] = useState(() => ({
    x: typeof window !== "undefined" ? window.innerWidth - currentSize.width - 20 : 0,
    y: typeof window !== "undefined" ? window.innerHeight - currentSize.height - 20 : 0,
  }))

  const chatRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ isDragging: boolean; offsetX: number; offsetY: number }>({
    isDragging: false,
    offsetX: 0,
    offsetY: 0,
  })

  // Auto-scroll to bottom
  const messagesEndRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Drag handling
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isDocked) return

    dragRef.current = {
      isDragging: true,
      offsetX: e.clientX - position.x,
      offsetY: e.clientY - position.y,
    }
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current.isDragging) return

      setPosition({
        x: e.clientX - dragRef.current.offsetX,
        y: e.clientY - dragRef.current.offsetY,
      })
    }

    const handleMouseUp = () => {
      dragRef.current.isDragging = false
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [])

  // Close size selector when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showSizeSelector && chatRef.current && !chatRef.current.contains(event.target as Node)) {
        toggleSizeSelector()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showSizeSelector, toggleSizeSelector])

  // Handle cowboy button click with debugging
  const handleCowboyClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    console.log("🎯 Cowboy button clicked!")
    console.log("🤠 Current mode before toggle:", isCowboyMode)
    toggleCowboyMode()
  }

  if (isMinimized) {
    return (
      <Button
        className="fixed bottom-4 right-4 rounded-full w-12 h-12 p-0 shadow-lg bg-sky-100 hover:bg-sky-200 text-gray-950 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-50 z-50"
        onClick={toggleMinimized}
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    )
  }

  const style = isDocked
    ? {
        position: "fixed" as const,
        bottom: "1rem",
        right: "1rem",
        width: `${currentSize.width}px`,
        height: `${currentSize.height}px`,
      }
    : {
        position: "fixed" as const,
        top: `${position.y}px`,
        left: `${position.x}px`,
        width: `${currentSize.width}px`,
        height: `${currentSize.height}px`,
      }

  return (
    <Card
      ref={chatRef}
      className="shadow-lg flex flex-col bg-sky-50/95 backdrop-blur-sm border-sky-200 dark:bg-gray-900/95 dark:border-gray-700 z-50 pointer-events-auto relative"
      style={style}
    >
      <CardHeader
        className="p-3 border-b border-sky-200 dark:border-gray-700 flex flex-row items-center justify-between bg-sky-100/50 dark:bg-gray-800/50 flex-shrink-0"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-sky-600 dark:text-sky-400" />
          <div className="flex items-center gap-1">
            <span className="font-medium text-gray-950 dark:text-gray-50">vi</span>
            {isCowboyMode && (
              <span className="text-lg animate-bounce" title="Cowboy mode active!">
                🤠
              </span>
            )}
          </div>
          {isLoading && <Loader2 className="h-4 w-4 animate-spin text-sky-600 dark:text-sky-400" />}
        </div>
        <div className="flex items-center gap-1 relative">
          {/* Cowboy Mode Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-6 w-6 hover:bg-sky-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-all duration-200",
              isCowboyMode && "bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/50 dark:hover:bg-amber-800/50",
            )}
            onClick={handleCowboyClick}
            title={isCowboyMode ? "Switch to normal mode" : "Yeehaw! Switch to cowboy mode"}
          >
            <span className={cn("text-sm transition-transform duration-200", isCowboyMode && "scale-110")}>
              {isCowboyMode ? "🤠" : "🎩"}
            </span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 hover:bg-sky-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            onClick={toggleSizeSelector}
            title="Resize window"
          >
            <Settings className="h-4 w-4" />
          </Button>

          {showSizeSelector && (
            <div className="absolute top-8 right-0 bg-white dark:bg-gray-800 border border-sky-200 dark:border-gray-700 rounded-md shadow-lg p-2 min-w-[120px] z-10">
              <div className="space-y-1">
                <button
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm rounded hover:bg-sky-100 dark:hover:bg-gray-700 transition-colors",
                    sizePreset === "small" && "bg-sky-100 dark:bg-gray-700",
                  )}
                  onClick={() => selectSize("small")}
                >
                  Small
                </button>
                <button
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm rounded hover:bg-sky-100 dark:hover:bg-gray-700 transition-colors",
                    sizePreset === "medium" && "bg-sky-100 dark:bg-gray-700",
                  )}
                  onClick={() => selectSize("medium")}
                >
                  Medium
                </button>
                <button
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm rounded hover:bg-sky-100 dark:hover:bg-gray-700 transition-colors",
                    sizePreset === "large" && "bg-sky-100 dark:bg-gray-700",
                  )}
                  onClick={() => selectSize("large")}
                >
                  Large
                </button>
              </div>
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 hover:bg-sky-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            onClick={toggleMinimized}
            title="Minimize chat"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-3 space-y-4 bg-sky-50/30 dark:bg-gray-900/30 min-h-0">
        {messages.map((message) => {
          // Fix datetime formatting
          const messageId = message.id
          const timestamp =
            messageId && !isNaN(Number(messageId))
              ? new Date(Number(messageId)).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })

          return (
            <div key={message.id} className="space-y-1">
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center">{timestamp}</div>
              <div
                className={cn(
                  "flex flex-col max-w-[90%] rounded-lg p-3",
                  message.role === "user"
                    ? "ml-auto bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-sm"
                    : "bg-white/80 dark:bg-gray-800/80 text-gray-950 dark:text-gray-50 shadow-sm border border-sky-200/50 dark:border-gray-700/50",
                )}
              >
                {message.role === "assistant" ? (
                  message.content === "" && isLoading ? (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 italic">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{currentThinkingPhrase || "Thinking..."}</span>
                    </div>
                  ) : (
                    <>
                      {message.content ? (
                        <MarkdownRenderer content={message.content} />
                      ) : (
                        <span className="text-gray-500">No content available</span>
                      )}
                    </>
                  )
                ) : (
                  <span>{message.content}</span>
                )}
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </CardContent>
      <CardFooter className="p-3 pt-0 bg-sky-100/30 dark:bg-gray-800/30 border-t border-sky-200/50 dark:border-gray-700/50 flex-shrink-0">
        <form onSubmit={handleSubmit} className="flex w-full gap-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder={isCowboyMode ? "Ask me about Miguel's CV, partner..." : "Ask me about Miguel's CV..."}
            className="flex-1 bg-white/80 dark:bg-gray-800/80 border-sky-200 dark:border-gray-600 focus:border-sky-400 dark:focus:border-sky-500 text-gray-950 dark:text-gray-50"
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="sm"
            className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-sm"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
