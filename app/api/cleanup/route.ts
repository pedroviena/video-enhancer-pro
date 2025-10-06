import { NextResponse } from "next/server"
import { readdir, unlink, stat } from "fs/promises"
import path from "path"

// Cleanup old files (runs via cron job)
export async function GET() {
  try {
    const uploadsDir = path.join(process.cwd(), "public", "uploads")
    const outputDir = path.join(process.cwd(), "public", "output")
    const retentionHours = Number.parseInt(process.env.FILE_RETENTION_HOURS || "24")
    const retentionMs = retentionHours * 60 * 60 * 1000

    let deletedCount = 0

    // Clean uploads directory
    const uploadFiles = await readdir(uploadsDir).catch(() => [])
    for (const file of uploadFiles) {
      const filePath = path.join(uploadsDir, file)
      const stats = await stat(filePath)
      const age = Date.now() - stats.mtimeMs

      if (age > retentionMs) {
        await unlink(filePath)
        deletedCount++
      }
    }

    // Clean output directory
    const outputFiles = await readdir(outputDir).catch(() => [])
    for (const file of outputFiles) {
      const filePath = path.join(outputDir, file)
      const stats = await stat(filePath)
      const age = Date.now() - stats.mtimeMs

      if (age > retentionMs) {
        await unlink(filePath)
        deletedCount++
      }
    }

    return NextResponse.json({
      success: true,
      deletedFiles: deletedCount,
      message: `Cleaned up ${deletedCount} old files`,
    })
  } catch (error) {
    console.error("[v0] Cleanup error:", error)
    return NextResponse.json({ error: "Cleanup failed" }, { status: 500 })
  }
}
