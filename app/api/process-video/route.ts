import { type NextRequest, NextResponse } from "next/server"
// Ensure this route runs on the Node.js runtime (required for native binaries like ffmpeg)
export const runtime = "nodejs"
import { writeFile, mkdir } from "fs/promises"
import { existsSync } from "fs"
import path from "path"
import { v4 as uuidv4 } from "uuid"

// Store processing jobs in memory (in production, use Redis or a database)
const processingJobs = new Map<
  string,
  {
    status: "processing" | "complete" | "error"
    progress: number
    message: string
    videoUrl?: string
    error?: string
  }
>()

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const videoFile = formData.get("video") as File
    const settingsStr = formData.get("settings") as string
    const settings = JSON.parse(settingsStr)

    if (!videoFile) {
      return NextResponse.json({ error: "No video file provided" }, { status: 400 })
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "public", "uploads")
    const outputDir = path.join(process.cwd(), "public", "output")

    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }
    if (!existsSync(outputDir)) {
      await mkdir(outputDir, { recursive: true })
    }

    // Generate unique job ID
    const jobId = uuidv4()

    // Save uploaded file
    const bytes = await videoFile.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const inputPath = path.join(uploadsDir, `${jobId}_input${path.extname(videoFile.name)}`)
    await writeFile(inputPath, buffer)

    // Initialize job status
    processingJobs.set(jobId, {
      status: "processing",
      progress: 0,
      message: "Iniciando processamento...",
    })

    // Start processing in background
    processVideo(jobId, inputPath, settings).catch((error) => {
      console.error("[v0] Processing error:", error)
      processingJobs.set(jobId, {
        status: "error",
        progress: 0,
        message: "Erro no processamento",
        error: error.message,
      })
    })

    return NextResponse.json({ jobId })
  } catch (error) {
    console.error("[v0] Upload error:", error)
    return NextResponse.json({ error: "Failed to process video" }, { status: 500 })
  }
}

async function processVideo(jobId: string, inputPath: string, settings: any) {
  // Dynamically import to avoid bundling on client and to access installer path at runtime
  const ffmpegModule: any = await import("fluent-ffmpeg")
  const ffmpeg = ffmpegModule.default ?? ffmpegModule

  // Point fluent-ffmpeg to the installed ffmpeg binary (works on Netlify linux environment)
  const ffmpegInstaller: any = await import("@ffmpeg-installer/ffmpeg")
  if (ffmpegInstaller?.path) {
    ffmpeg.setFfmpegPath(ffmpegInstaller.path)
  }
  const outputPath = path.join(process.cwd(), "public", "output", `${jobId}_output.mp4`)

  return new Promise((resolve, reject) => {
    let command = ffmpeg(inputPath)

    // Build filter complex
    const filters: string[] = []

    // Apply denoise
    if (settings.denoise > 0) {
      filters.push(`hqdn3d=${settings.denoise}:${settings.denoise}:${settings.denoise}:${settings.denoise}`)
    }

    // Apply sharpness
    if (settings.sharpness > 0) {
      filters.push(`unsharp=5:5:${settings.sharpness}:5:5:0`)
    }

    // Apply contrast
    if (settings.contrast !== 1.0) {
      filters.push(`eq=contrast=${settings.contrast}`)
    }

    // Apply AI upscaling (simulated - in production, use Real-ESRGAN)
    if (settings.useAI) {
      filters.push("scale=iw*2:ih*2:flags=lanczos")
    }

    if (filters.length > 0) {
      command = command.videoFilters(filters.join(","))
    }

    command
      .videoBitrate(settings.bitrate)
      .outputOptions([`-preset ${settings.preset}`, "-movflags +faststart"])
      .output(outputPath)
      .on("start", () => {
        processingJobs.set(jobId, {
          status: "processing",
          progress: 5,
          message: "Iniciando processamento...",
        })
      })
      .on("progress", (progress: any) => {
        const percent = Math.min(Math.round(progress.percent || 0), 99)
        let message = "Processando vídeo..."

        if (percent < 20) {
          message = settings.useAI ? "Aplicando upscaling com IA..." : "Iniciando processamento..."
        } else if (percent < 40) {
          message = "Melhorando contraste e cores..."
        } else if (percent < 60) {
          message = "Aplicando filtro de nitidez..."
        } else if (percent < 80) {
          message = "Aplicando suavização..."
        } else {
          message = "Comprimindo e finalizando..."
        }

        processingJobs.set(jobId, {
          status: "processing",
          progress: percent,
          message,
        })
      })
      .on("end", () => {
        processingJobs.set(jobId, {
          status: "complete",
          progress: 100,
          message: "Concluído!",
          videoUrl: `/output/${jobId}_output.mp4`,
        })
        resolve(true)
      })
      .on("error", (err: Error) => {
        console.error("[v0] FFmpeg error:", err)
        processingJobs.set(jobId, {
          status: "error",
          progress: 0,
          message: "Erro no processamento",
          error: err.message,
        })
        reject(err)
      })
      .run()
  })
}

// Export the jobs map for the progress endpoint
export { processingJobs }
