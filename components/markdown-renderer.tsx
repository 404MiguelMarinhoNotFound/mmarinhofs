"use client"

import type React from "react"

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  // Simple markdown parser for common formatting
  const parseMarkdown = (text: string) => {
    // Split by lines to handle different elements
    const lines = text.split("\n")
    const elements: React.ReactNode[] = []
    let i = 0

    while (i < lines.length) {
      const line = lines[i]

      // Code blocks (```)
      if (line.trim().startsWith("```")) {
        const codeLines: string[] = []
        i++ // Skip opening ```
        while (i < lines.length && !lines[i].trim().startsWith("```")) {
          codeLines.push(lines[i])
          i++
        }
        elements.push(
          <pre key={i} className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md my-2 overflow-x-auto">
            <code className="text-sm font-mono">{codeLines.join("\n")}</code>
          </pre>,
        )
        i++ // Skip closing ```
        continue
      }

      // Headers
      if (line.startsWith("# ")) {
        elements.push(
          <h1 key={i} className="text-xl font-bold mt-4 mb-2">
            {line.slice(2)}
          </h1>,
        )
      } else if (line.startsWith("## ")) {
        elements.push(
          <h2 key={i} className="text-lg font-bold mt-3 mb-2">
            {line.slice(3)}
          </h2>,
        )
      } else if (line.startsWith("### ")) {
        elements.push(
          <h3 key={i} className="text-md font-bold mt-2 mb-1">
            {line.slice(4)}
          </h3>,
        )
      }
      // Lists
      else if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        const listItems: string[] = []
        while (i < lines.length && (lines[i].trim().startsWith("- ") || lines[i].trim().startsWith("* "))) {
          listItems.push(lines[i].trim().slice(2))
          i++
        }
        elements.push(
          <ul key={i} className="list-disc list-inside my-2 space-y-1">
            {listItems.map((item, idx) => (
              <li key={idx}>{parseInlineMarkdown(item)}</li>
            ))}
          </ul>,
        )
        i-- // Adjust for the outer loop increment
      }
      // Numbered lists
      else if (/^\d+\.\s/.test(line.trim())) {
        const listItems: string[] = []
        while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
          listItems.push(lines[i].trim().replace(/^\d+\.\s/, ""))
          i++
        }
        elements.push(
          <ol key={i} className="list-decimal list-inside my-2 space-y-1">
            {listItems.map((item, idx) => (
              <li key={idx}>{parseInlineMarkdown(item)}</li>
            ))}
          </ol>,
        )
        i-- // Adjust for the outer loop increment
      }
      // Empty lines
      else if (line.trim() === "") {
        elements.push(<br key={i} />)
      }
      // Regular paragraphs
      else {
        elements.push(
          <p key={i} className="my-1">
            {parseInlineMarkdown(line)}
          </p>,
        )
      }

      i++
    }

    return elements
  }

  // Parse inline markdown (bold, italic, code, links)
  const parseInlineMarkdown = (text: string): React.ReactNode => {
    const parts: React.ReactNode[] = []
    let remaining = text
    let key = 0

    while (remaining.length > 0) {
      // Inline code (`code`)
      const codeMatch = remaining.match(/^`([^`]+)`/)
      if (codeMatch) {
        parts.push(
          <code key={key++} className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-sm font-mono">
            {codeMatch[1]}
          </code>,
        )
        remaining = remaining.slice(codeMatch[0].length)
        continue
      }

      // Bold (**text** or __text__)
      const boldMatch = remaining.match(/^(\*\*|__)([^*_]+)\1/)
      if (boldMatch) {
        parts.push(
          <strong key={key++} className="font-bold">
            {boldMatch[2]}
          </strong>,
        )
        remaining = remaining.slice(boldMatch[0].length)
        continue
      }

      // Italic (*text* or _text_)
      const italicMatch = remaining.match(/^(\*|_)([^*_]+)\1/)
      if (italicMatch) {
        parts.push(
          <em key={key++} className="italic">
            {italicMatch[2]}
          </em>,
        )
        remaining = remaining.slice(italicMatch[0].length)
        continue
      }

      // Links [text](url)
      const linkMatch = remaining.match(/^\[([^\]]+)\]$$([^)]+)$$/)
      if (linkMatch) {
        parts.push(
          <a
            key={key++}
            href={linkMatch[2]}
            className="text-blue-500 hover:text-blue-700 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {linkMatch[1]}
          </a>,
        )
        remaining = remaining.slice(linkMatch[0].length)
        continue
      }

      // Regular character
      parts.push(remaining[0])
      remaining = remaining.slice(1)
    }

    return parts
  }

  return <div className={`markdown-content ${className}`}>{parseMarkdown(content)}</div>
}
