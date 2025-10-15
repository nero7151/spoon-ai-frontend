import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const authorization = request.headers.get("authorization");

    if (!authorization) {
      return NextResponse.json(
        { error: "Authorization header is required" },
        { status: 401 },
      );
    }

    // Forward the request to the backend with extended timeout
    const response = await fetch("http://backend:3000/recipe/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authorization,
      },
      body: JSON.stringify(body),
      // Extend timeout to 5 minutes for AI generation
      signal: AbortSignal.timeout(300000), // 5 minutes
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: "Recipe generation failed", details: errorText },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Recipe generation error:", error);

    if (
      error instanceof Error &&
      (error.name === "TimeoutError" || error.message?.includes("timeout"))
    ) {
      return NextResponse.json(
        {
          error:
            "Recipe generation timed out. Please try again with a simpler request.",
        },
        { status: 504 },
      );
    }

    return NextResponse.json(
      { error: "Internal server error during recipe generation" },
      { status: 500 },
    );
  }
}

export const maxDuration = 300; // 5 minutes for Vercel
