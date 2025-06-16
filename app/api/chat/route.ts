// app/api/chat/route.ts

import type { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Cache-Control": "no-store",
    },
  });
}

export async function POST(request: NextRequest) {
  console.log("📡 [route.ts] → POST /api/chat invoked");

  // 1. Parse and validate JSON body
  let messages: any[];
  try {
    const body = await request.json();
    console.log("📨 [route.ts] Received body:", body);
    messages = body.messages;
  } catch (err) {
    console.error("❌ [route.ts] Failed to parse JSON:", err);
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    console.warn("⚠️ [route.ts] No messages provided or empty array");
    return new Response(JSON.stringify({ error: "No messages provided" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 2. Build the upstream URL
  const pythonUrl = new URL("/api/chat", request.url);
  console.log("🔗 [route.ts] Proxying to Python at:", pythonUrl.toString());

  // 3. Call the Python function
  let pythonRes: Response;
  try {
    pythonRes = await fetch(pythonUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });
    console.log(`📥 [route.ts] Python response status: ${pythonRes.status}`);
  } catch (err) {
    console.error("💥 [route.ts] Network error proxying to Python:", err);
    return new Response(JSON.stringify({ error: "Failed to reach Python service" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 4. If Python errored, log and return its body
  if (!pythonRes.ok) {
    const text = await pythonRes.text();
    console.error(`❌ [route.ts] Python service error (${pythonRes.status}):`, text);
    return new Response(text, {
      status: pythonRes.status,
      headers: {
        "Content-Type": pythonRes.headers.get("Content-Type") || "application/json"
      },
    });
  }

  // 5. Stream back as SSE
  console.log("🚀 [route.ts] Streaming response back to client");
  const headers = new Headers(pythonRes.headers);
  headers.set("Content-Type", "text/event-stream");
  headers.set("Cache-Control", "no-cache");
  headers.set("Connection", "keep-alive");

  return new Response(pythonRes.body, {
    status: 200,
    headers,
  });
}
