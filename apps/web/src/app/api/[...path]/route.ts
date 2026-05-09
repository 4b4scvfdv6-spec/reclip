import { NextRequest, NextResponse } from "next/server";

const API_BASE =
  process.env.API_BASE_URL || "http://localhost:4000";

async function proxyRequest(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const targetPath = "/" + path.join("/");
  const url = new URL(request.url);
  const queryString = url.search;
  const targetUrl = `${API_BASE}${targetPath}${queryString}`;

  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  headers.set("x-terms-accepted", "true");

  const init: RequestInit = {
    method: request.method,
    headers,
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    try {
      const body = await request.text();
      if (body) {
        init.body = body;
      }
    } catch {
      // No body
    }
  }

  try {
    const response = await fetch(targetUrl, init);

    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    }

    // For blob responses (like video downloads)
    const blob = await response.blob();
    return new NextResponse(blob, {
      status: response.status,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition":
          response.headers.get("content-disposition") || "",
      },
    });
  } catch (error) {
    console.error("[v0] Proxy error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Proxy request failed" },
      { status: 502 }
    );
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, context);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, context);
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, context);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, context);
}
