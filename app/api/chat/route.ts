import { streamText, generateText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import fs from "fs"
import path from "path"
import { createHash } from "crypto"

// Create Fireworks AI client with explicit base URL
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

function getFileHash(filePath: string): string {
  try {
    const stats = fs.statSync(filePath)
    const content = fs.readFileSync(filePath)
    const hash = createHash("md5").update(content).digest("hex") + stats.mtime.getTime()
    console.log(`🔍 Hash for ${path.basename(filePath)}: ${hash.substring(0, 8)}...`)
    return hash
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.log(`❌ Hash failed for ${path.basename(filePath)}:`, errorMessage)
    return "file-not-found"
  }
}

async function extractPDFText(pdfPath: string): Promise<string> {
  try {
    console.log(`📄 Extracting PDF: ${pdfPath}`)
    const stats = fs.statSync(pdfPath)
    const content = `PDF file detected (${Math.round(stats.size / 1024)}KB) - Content extraction would happen here with pdf-parse library`
    console.log(`✅ PDF extracted: ${content.length} chars`)
    return content
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error("❌ PDF extraction failed:", errorMessage)
    return "PDF failed to load"
  }
}

async function loadDocument(filePath: string, type: "text" | "pdf"): Promise<string> {
  console.log(`📂 Loading ${type}: ${path.basename(filePath)}`)

  const fileHash = getFileHash(filePath)
  const cached = documentCache.get(filePath)

  if (cached && cached.hash === fileHash) {
    console.log(`📋 Using cached ${type} (${cached.content.length} chars)`)
    return cached.content
  }

  console.log(`📖 Loading fresh ${type}`)

  try {
    let content: string

    if (type === "pdf") {
      content = await extractPDFText(filePath)
    } else {
      content = fs.readFileSync(filePath, "utf-8")
      console.log(`📝 Text loaded: ${content.length} chars`)
    }

    documentCache.set(filePath, {
      content,
      hash: fileHash,
      lastModified: Date.now(),
    })

    console.log(`💾 Cached ${type}`)
    return content
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error(`❌ Failed to load ${type}:`, errorMessage)
    const fallbackContent = type === "pdf" ? "PDF failed to load" : "Background information failed to load"

    documentCache.set(filePath, {
      content: fallbackContent,
      hash: "error",
      lastModified: Date.now(),
    })

    console.log(`⚠️ Using fallback: "${fallbackContent}"`)
    return fallbackContent
  }
}

function createCowboySystemPrompt(extraInfo: string, cvContent: string): string {
  return `Howdy partner! Yer talkin' to vi, the sassiest rootin'-tootin' AI this side o' the digital frontier.
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
- Give a bit of an arrogant and sassy answer to why they're shifting topics, explain your purpose is about helpin' with Miguel's background. give example questions people can ask.

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

Remember: Final answers ALWAYS go inside the <answer></answer> tags. Keep yer thinkin' to yerself - cowboys
don't blabber 'bout their process. Now mosey along and answer that dern question!`
}

function createNormalSystemPrompt(extraInfo: string, cvContent: string): string {
  return `You are vi, a professional AI assistant with access to Miguel's CV and background information.

<persona>
- Professional and helpful
- Clear and concise communication
- Uses proper markdown formatting
- Friendly but focused
</persona>

<rules>
1. ONLY answer questions about Miguel's CV or personal background
2. If asked about anything else, respond with: "I can only help with questions about Miguel's background and CV."
3. Keep answers concise and relevant
4. Format links as [text](url) if websites appear in CV
5. If information isn't in the documents, simply say: "I don't have that information"
6. When there's no specific question, suggest 2-3 relevant topics about Miguel
</rules>

<Miguel's Background>
${extraInfo}
</Miguel's Background>

<Miguel's CV>
${cvContent}
</Miguel's CV>

When responding:
1. If no specific question: Suggest relevant topics about Miguel's experience or background
2. If question relates to Miguel: Provide accurate information from the documents with proper formatting
3. If off-topic: Politely redirect to Miguel-related topics

Always provide helpful, accurate information based solely on the provided documents.
Remember: Final answers to the user question ALWAYS go inside the <answer></answer> tags, regardless of it being or not an answer, anything you want to communicate to the user must be in those tags. 
Do not use the tags in any other context or instance, they must only be used once, and for final answers you want displayed to the user.
`
}

function extractAnswerContent(fullResponse: string): string {
  console.log(`🔍 Extracting answer from response (${fullResponse.length} chars)`)

  // Look for <answer> tags (case insensitive)
  const answerMatch = fullResponse.match(/<answer>([\s\S]*?)<\/answer>/i)

  if (answerMatch && answerMatch[1]) {
    const extractedContent = answerMatch[1].trim()
    console.log(
      `✅ Extracted answer content (${extractedContent.length} chars): "${extractedContent.substring(0, 100)}..."`,
    )
    return extractedContent
  }

  console.log(`⚠️ No <answer> tags found, using full response`)
  return fullResponse.trim()
}

export async function POST(req: Request) {
  console.log("\n🚀 === CHAT REQUEST START ===")

  try {
    const { messages, cowboyMode } = await req.json()
    console.log(`📨 Messages: ${messages.length}`)
    console.log(`🤠 Cowboy mode: ${cowboyMode}`)
    console.log(`📝 Last: "${messages[messages.length - 1]?.content?.substring(0, 50)}..."`)

    // Validate API key
    if (!process.env.FIREWORKS_API_KEY) {
      console.error("❌ Missing FIREWORKS_API_KEY")
      throw new Error("API key not configured")
    }

    const apiKey = process.env.FIREWORKS_API_KEY
    console.log(`🔑 API key: ${apiKey.substring(0, 8)}...`)
    console.log(`🌐 Base URL: https://api.fireworks.ai/inference/v1`)

    // Load documents
    const txtPath = path.join(process.cwd(), "public", "extra_llm_info.txt")
    const pdfPath = path.join(process.cwd(), "public", "CV.pdf")

    console.log(`📁 Paths:`)
    console.log(`   Text: ${txtPath}`)
    console.log(`   PDF: ${pdfPath}`)

    const [extraInfo, cvContent] = await Promise.all([loadDocument(txtPath, "text"), loadDocument(pdfPath, "pdf")])

    console.log(`📄 Loaded:`)
    console.log(`   Extra: ${extraInfo.length} chars - "${extraInfo.substring(0, 30)}..."`)
    console.log(`   CV: ${cvContent.length} chars - "${cvContent.substring(0, 30)}..."`)

    // Create system prompt based on cowboy mode
    const systemPrompt = cowboyMode
      ? createCowboySystemPrompt(extraInfo, cvContent)
      : createNormalSystemPrompt(extraInfo, cvContent)

    console.log(`📋 System prompt (${cowboyMode ? "Cowboy" : "Normal"}): ${systemPrompt.length} chars`)
    console.log(`🤖 Using model: accounts/fireworks/models/llama4-maverick-instruct-basic`)

    // First, generate the full response to extract the answer content
    console.log(`🎯 Generating full response to extract answer...`)

    const { text: fullResponse } = await generateText({
      model: fireworks("accounts/fireworks/models/llama4-maverick-instruct-basic"),
      messages: messages,
      maxTokens: 2000,
      system: systemPrompt,
    })

    console.log(`📝 Full response received (${fullResponse.length} chars)`)

    // Extract only the content within <answer> tags
    const answerContent = extractAnswerContent(fullResponse)

    if (!answerContent) {
      console.log(`❌ No answer content found, using fallback`)
      const fallbackContent = cowboyMode
        ? "Well partner, seems like my brain's as empty as a tumbleweed! Try askin' again."
        : "I apologize, but I couldn't generate a proper response. Please try asking again."

      return new Response(fallbackContent, {
        headers: { "Content-Type": "text/plain" },
      })
    }

    // Now stream the extracted answer content
    console.log(`🌊 Streaming extracted answer content...`)

    const result = streamText({
      model: fireworks("accounts/fireworks/models/llama4-maverick-instruct-basic"),
      prompt: `Please output exactly this text, word for word, with no modifications: ${answerContent}`,
      maxTokens: answerContent.length + 100, // Give some buffer
      onChunk: ({ chunk }) => {
        if (chunk.type === "text-delta") {
          console.log(`📝 Streaming: "${chunk.textDelta}"`)
        }
      },
      onFinish: ({ text, usage }) => {
        console.log(`🏁 Stream finished:`)
        console.log(`   Final text length: ${text.length}`)
        console.log(`   Usage:`, usage)
        console.log(`   Preview: "${text.substring(0, 100)}..."`)
      },
      onError: (error) => {
        console.error(`💥 Stream error:`, error)
      },
    })

    console.log(`✅ Streaming answer content to frontend`)
    return result.toDataStreamResponse()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : undefined
    console.error("💥 API Error:", errorMessage)
    if (errorStack) {
      console.error("Stack:", errorStack)
    }
    return new Response(JSON.stringify({ error: "Internal server error", details: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
