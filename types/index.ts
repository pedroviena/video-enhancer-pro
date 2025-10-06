export interface ProcessingSettings {
  useAI: boolean
  denoise: number
  sharpness: number
  contrast: number
  bitrate: string
  preset: string
}

export interface ProcessingJob {
  status: "processing" | "complete" | "error"
  progress: number
  message: string
  videoUrl?: string
  error?: string
}

export type ProcessingStage = "upload" | "settings" | "processing" | "complete"

export interface VideoFile {
  name: string
  size: number
  type: string
}
