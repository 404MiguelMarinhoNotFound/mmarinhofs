// app/api/chat/route.ts

import type { NextRequest } from "next/server";

export const config = {
  // Keep this as a Node.js function (not edge), so streaming Response.body works
  runtime: "nodejs"
};

export async function POST(request: NextRequest) {
  // 1. Parse and validate the body
  let messages: any[];
  try {
    const body = await request.json();
    messages = body.messages;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response(JSON.stringify({ error: "No messages provided" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 2. Proxy to the Python function
  const pythonRes = await fetch(
    new URL("/api_python/chat", request.url), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    }
  );

  // 3. If Python function errored out, bubble up the status and body
  if (!pythonRes.ok) {
    const text = await pythonRes.text();
    return new Response(text, {
      status: pythonRes.status,
      headers: { "Content-Type": pythonRes.headers.get("Content-Type") ?? "application/json" },
    });
  }

  // 4. Stream the Python response back as SSE
  const headers = new Headers(pythonRes.headers);
  headers.set("Content-Type", "text/event-stream");
  headers.set("Cache-Control", "no-cache");
  return new Response(pythonRes.body, {
    status: 200,
    headers,
  });
}
