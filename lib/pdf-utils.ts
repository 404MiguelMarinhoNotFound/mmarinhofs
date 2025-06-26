import pdfParse from "pdf-parse"
import fs from "fs"

export async function extractPDFText(pdfPath: string): Promise<string> {
  try {
    const pdfBuffer = fs.readFileSync(pdfPath)
    const data = await pdfParse(pdfBuffer)
    return data.text
  } catch (error) {
    console.warn("PDF extraction failed:", error)
    return "PDF failed to load"
  }
}
