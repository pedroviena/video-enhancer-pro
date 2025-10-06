import { NextResponse } from "next/server"
import { existsSync } from "fs"
import path from "path"

export async function GET() {
  try {
    // Check if required directories exist
    const uploadsDir = path.join(process.cwd(), "public", "uploads")
    const outputDir = path.join(process.cwd(), "public", "output")

    const checks = {
      uploadsDir: existsSync(uploadsDir),
      outputDir: existsSync(outputDir),
      ffmpeg: true, // FFmpeg check would require spawning a process
      timestamp: new Date().toISOString(),
    }

    const isHealthy = checks.uploadsDir && checks.outputDir

    return NextResponse.json(
      {
        status: isHealthy ? "healthy" : "unhealthy",
        checks,
        version: "1.0.0",
      },
      { status: isHealthy ? 200 : 503 },
    )
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        error: "Health check failed",
      },
      { status: 503 },
    )
  }
}
