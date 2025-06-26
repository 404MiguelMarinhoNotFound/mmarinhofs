import { streamText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import fs from "fs"
import path from "path"
import { createHash } from "crypto"

// Create Fireworks AI client
const fireworks = createOpenAI({
  baseURL: "https://api.fireworks.ai/inference/v1",
  apiKey: process.env.FIREWORKS_API_KEY,
})

export const maxDuration = 30

// In-memory cache for document content
interface DocumentCache {
  content: string
  hash: string
  lastModified: number
}

const documentCache = new Map<string, DocumentCache>()

// Function to get file hash for cache invalidation
function getFileHash(filePath: string): string {
  try {
    const stats = fs.statSync(filePath)
    const content = fs.readFileSync(filePath)
    const hash = createHash("md5").update(content).digest("hex") + stats.mtime.getTime()
    console.log(`🔍 Generated hash for ${path.basename(filePath)}: ${hash.substring(0, 8)}...`)
    return hash
  } catch (error) {
    console.log(`❌ Failed to generate hash for ${path.basename(filePath)}:`, error.message)
    return "file-not-found"
  }
}

// Function to extract text from PDF (simplified - you'd want a proper PDF parser)
async function extractPDFText(pdfPath: string): Promise<string> {
  try {
    console.log(`📄 Attempting to extract PDF text from: ${pdfPath}`)
    // For production, use a library like 'pdf-parse'
    const stats = fs.statSync(pdfPath)
    const content = `PDF file detected (${Math.round(stats.size / 1024)}KB) - Content extraction would happen here with pdf-parse library`
    console.log(`✅ PDF extraction successful, content length: ${content.length}`)
    return content
  } catch (error) {
    console.error("❌ PDF extraction failed:", error)
    return "PDF failed to load"
  }
}

// Function to load and cache document content
async function loadDocument(filePath: string, type: "text" | "pdf"): Promise<string> {
  console.log(`📂 Loading document: ${filePath} (type: ${type})`)

  const fileHash = getFileHash(filePath)
  const cached = documentCache.get(filePath)

  // Return cached content if hash matches (file unchanged)
  if (cached && cached.hash === fileHash) {
    console.log(`📋 Using cached content for ${path.basename(filePath)} (${cached.content.length} chars)`)
    return cached.content
  }

  console.log(`📖 Loading fresh content for ${path.basename(filePath)}`)

  try {
    let content: string

    if (type === "pdf") {
      content = await extractPDFText(filePath)
    } else {
      content = fs.readFileSync(filePath, "utf-8")
      console.log(`📝 Text file loaded successfully, content length: ${content.length}`)
    }

    // Cache the content
    documentCache.set(filePath, {
      content,
      hash: fileHash,
      lastModified: Date.now(),
    })

    console.log(`💾 Cached content for ${path.basename(filePath)}`)
    return content
  } catch (error) {
    console.error(`❌ Failed to load ${type} file:`, error)
    const fallbackContent = type === "pdf" ? "PDF failed to load" : "Background information failed to load"

    // Cache the fallback to avoid repeated failed attempts
    documentCache.set(filePath, {
      content: fallbackContent,
      hash: "error",
      lastModified: Date.now(),
    })

    console.log(`⚠️ Using fallback content: "${fallbackContent}"`)
    return fallbackContent
  }
}

export async function POST(req: Request) {
  console.log("\n🚀 === NEW CHAT REQUEST ===")

  try {
    const { messages } = await req.json()
    console.log(`📨 Received ${messages.length} messages`)
    console.log(`📝 Last message: "${messages[messages.length - 1]?.content?.substring(0, 100)}..."`)

    // Check API key
    if (!process.env.FIREWORKS_API_KEY) {
      console.error("❌ FIREWORKS_API_KEY not found in environment variables")
      throw new Error("API key not configured")
    }
    console.log(`🔑 API key found: ${process.env.FIREWORKS_API_KEY.substring(0, 8)}...`)

    // Load documents with caching
    const txtPath = path.join(process.cwd(), "public", "extra_llm_info.txt")
    const pdfPath = path.join(process.cwd(), "public", "CV.pdf")

    console.log(`📁 Text file path: ${txtPath}`)
    console.log(`📁 PDF file path: ${pdfPath}`)

    const [extraInfo, cvContent] = await Promise.all([loadDocument(txtPath, "text"), loadDocument(pdfPath, "pdf")])

    console.log(`📄 Extra info loaded (${extraInfo.length} chars): "${extraInfo.substring(0, 50)}..."`)
    console.log(`📄 CV content loaded (${cvContent.length} chars): "${cvContent.substring(0, 50)}..."`)

    // Create the Wild West system prompt with content
    const systemPrompt = `Howdy partner! Yer talkin' to vi, the sassiest rootin'-tootin' AI this side o' the digital frontier.
Yeehaw! Here's how I operate:

<persona>
- Talks like a Wild West prospector who's had one too many sarsaparillas
- Maintains a dry, sarcastic sense of humor
- Occasionally rude but ultimately helpful
- Uses markdown formatting like a cowboy uses spurs - with purpose
</persona>

<rules>
1. ONLY answer questions 'bout Miguel's CV or personal background
2. If asked 'bout anythin' else, respond with: "That ain't none o' my biscuits and gravy, partner. Ask me 'bout Miguel."
3. Keep answers shorter'n a rattlesnake's attention span
4. Format links like [fancy text](url) if websites appear in CV
5. If info ain't in the documents, say: "I don't know" (no apologies)
6. When there's no question, suggest 2-3 topics 'bout Miguel's past
</rules>

<Miguel's Background>
${extraInfo}
</Miguel's Background>

<Miguel's cv>
${cvContent}
</Miguel's cv>

When I receive a query:
1. If QUESTION is empty:
<response>
<answer>
**Well howdy stranger!** 🤠
Y'all look lonelier than a jackalope at a hoedown. Try askin' 'bout:
- Miguel's time wranglin' [job title] at [company]
- That time he [interesting fact from CV]
- His fancy book-learnin' at [education entry]
</answer>
</response>

2. Else if question relates to Miguel:
- Search <Miguel's Background> like a gopher huntin' gold
- If found: Answer with sarcastic flair + relevant markdown
- If missing: "I don't know" (straight up)

3. Else (off-topic):
- Give rule #2 response

<formatting-example>
User asks: "What's Miguel's experience with cattle herding?"
CV contains: "2020-2023: Lead Bovine Relocation Specialist @ Texas Ranch Co (www.texasranch.com)"

<answer>
**Cattle herdin'?** 🤠
That city slicker's been pushin' beefalo since 2020 at [Texas Ranch Co](www.texasranch.com) -
'parently they gave him a shiny "Lead Bovine Relocation Specialist" badge. Fancy words fer muck
boots and cussin' at heifers if y'ask me.
</answer>
</formatting-example>

Remember: Final answers ALWAYS go in <answer></answer> tags. Keep yer thinkin' to yerself - cowboys
don't blabber 'bout their process. Now mosey along and answer that dern question!`

    console.log(`📋 System prompt created (${systemPrompt.length} chars)`)

    const lastMessage = messages[messages.length - 1]
    const enhancedMessages = [
      ...messages.slice(0, -1),
      {
        ...lastMessage,
        content: lastMessage.content,
      },
    ]

    console.log(`🤖 Calling AI model: accounts/fireworks/models/deepseek-r1-basic`)
    console.log(`📤 Enhanced messages count: ${enhancedMessages.length}`)

    const result = streamText({
      model: fireworks("accounts/fireworks/models/deepseek-r1-basic"),
      messages: enhancedMessages,
      maxTokens: 20000,
      system: systemPrompt,
    })

    console.log(`✅ AI model call successful, creating stream response`)

    const response = result.toDataStreamResponse()
    console.log(`📡 Stream response created, returning to client`)

    return response
  } catch (error) {
    console.error("💥 Chat API error:", error)
    console.error("Stack trace:", error.stack)
    return new Response(JSON.stringify({ error: "Internal server error", details: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
