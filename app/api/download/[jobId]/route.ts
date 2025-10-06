import { type NextRequest, NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { existsSync } from "fs"
import path from "path"
import { processingJobs } from "../../process-video/route"

export async function GET(request: NextRequest, { params }: { params: Promise<{ jobId: string }> }) {
  try {
    const { jobId } = await params
    const job = processingJobs.get(jobId)

    if (!job || job.status !== "complete") {
      return NextResponse.json({ error: "Video not ready or not found" }, { status: 404 })
    }

    const outputPath = path.join(process.cwd(), "public", "output", `${jobId}_output.mp4`)

    if (!existsSync(outputPath)) {
      return NextResponse.json({ error: "Video file not found" }, { status: 404 })
    }

    const fileBuffer = await readFile(outputPath)

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": `attachment; filename="${jobId}_enhanced.mp4"`,
        "Content-Length": fileBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error("[v0] Download error:", error)
    return NextResponse.json({ error: "Failed to download video" }, { status: 500 })
  }
}
