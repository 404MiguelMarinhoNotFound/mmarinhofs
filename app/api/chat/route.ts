// app/api/chat/route.ts

import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { messages } = await req.json();
  if (!messages?.length) {
    return new Response(JSON.stringify({ error: "No messages." }), { status: 400 });
  }

  // Proxy into our new Python endpoint
  const pythonRes = await fetch(new URL("/api/chat", req.url), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });

  // Forward status, headers, and streamed body
  return new Response(pythonRes.body, {
    status: pythonRes.status,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
