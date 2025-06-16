import type { NextRequest } from "next/server"
import { spawn } from "child_process"

export async function POST(req: NextRequest) {
  console.log("🎯 API route called")

  try {
    const { messages } = await req.json()
    console.log("📨 Received messages:", messages)

    // Get the last user message
    const lastMessage = messages[messages.length - 1]
    const userQuestion = lastMessage?.content || ""
    console.log("❓ User question:", userQuestion)

    if (!userQuestion.trim()) {
      console.log("❌ No user question provided")
      return new Response(JSON.stringify({ error: "No message provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Create a readable stream
    const stream = new ReadableStream({
      start(controller) {
        console.log("🐍 Starting Python process")

        // Spawn the Python process with UTF-8 encoding
        const pythonProcess = spawn("python3", ["scripts/chat_handler.py"], {
          stdio: ["pipe", "pipe", "pipe"],
          env: { ...process.env, PYTHONIOENCODING: "utf-8" },
        })

        console.log("📤 Sending user question to Python process")
        // Send the user question to stdin
        pythonProcess.stdin.write(userQuestion + "\n")
        pythonProcess.stdin.end()

        let buffer = ""

        // Handle stdout (streaming response)
        pythonProcess.stdout.on("data", (data) => {
          const chunk = data.toString("utf-8")
          console.log("📥 Python stdout raw:", Buffer.from(data).toString("hex"))
          console.log("📥 Python stdout decoded:", chunk)
          buffer += chunk

          // Check for completion signal
          if (buffer.includes("__STREAM_END__")) {
            console.log("🏁 Detected stream end signal")
            const parts = buffer.split("__STREAM_END__")
            const content = parts[0]
            if (content) {
              console.log("📤 Sending final content:", content)
              controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ type: "content", content })}\n\n`))
            }
            controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ type: "done" })}\n\n`))
            controller.close()
            return
          }

          // Send the chunk
          if (chunk && !chunk.includes("__STREAM_END__")) {
            console.log("📤 Sending chunk:", chunk)
            controller.enqueue(
              new TextEncoder().encode(`data: ${JSON.stringify({ type: "content", content: chunk })}\n\n`),
            )
          }
        })

        // Handle stderr (errors) - only show actual errors
        pythonProcess.stderr.on("data", (data) => {
          const error = data.toString("utf-8")

          // Only show actual ERROR messages, not debug info
          if (error.includes("ERROR:") && !error.includes("🐍") && !error.includes("✅") && !error.includes("📝")) {
            console.error("❌ Python error:", error)
            controller.enqueue(
              new TextEncoder().encode(`data: ${JSON.stringify({ type: "error", error: error.trim() })}\n\n`),
            )
          }
        })

        // Handle process completion
        pythonProcess.on("close", (code) => {
          console.log("🔚 Python process closed with code:", code)
          if (code !== 0) {
            controller.enqueue(
              new TextEncoder().encode(
                `data: ${JSON.stringify({ type: "error", error: `Process exited with code ${code}` })}\n\n`,
              ),
            )
          }
          controller.close()
        })

        // Handle process errors
        pythonProcess.on("error", (error) => {
          console.error("💥 Failed to start Python process:", error)
          controller.enqueue(
            new TextEncoder().encode(
              `data: ${JSON.stringify({ type: "error", error: "Failed to start Python process" })}\n\n`,
            ),
          )
          controller.close()
        })
      },
    })

    console.log("📡 Returning stream response")
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    })
  } catch (error) {
    console.error("💥 API Error:", error)
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
