"use client"

import type React from "react"
import { useState } from "react"
import { Upload, Sparkles, Download, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import type { ProcessingStage, ProcessingSettings } from "@/types"

export default function VideoEnhancerPage() {
  const [stage, setStage] = useState<ProcessingStage>("upload")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [settings, setSettings] = useState<ProcessingSettings>({
    useAI: false,
    denoise: 4,
    sharpness: 1.0,
    contrast: 2.0,
    bitrate: "2500k",
    preset: "medium",
  })
  const [progress, setProgress] = useState(0)
  const [progressMessage, setProgressMessage] = useState("")
  const [processedVideoUrl, setProcessedVideoUrl] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [jobId, setJobId] = useState<string | null>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const maxSize = 500 * 1024 * 1024 // 500MB
      if (file.size > maxSize) {
        alert("Arquivo muito grande! O tamanho máximo é 500MB.")
        return
      }
      setUploadedFile(file)
      setStage("settings")
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    const file = event.dataTransfer.files?.[0]
    if (file && file.type.startsWith("video/")) {
      const maxSize = 500 * 1024 * 1024 // 500MB
      if (file.size > maxSize) {
        alert("Arquivo muito grande! O tamanho máximo é 500MB.")
        return
      }
      setUploadedFile(file)
      setStage("settings")
    }
  }

  const startProcessing = async () => {
    if (!uploadedFile) return

    setStage("processing")
    setIsProcessing(true)
    setProgress(0)

    const formData = new FormData()
    formData.append("video", uploadedFile)
    formData.append("settings", JSON.stringify(settings))

    try {
      const response = await fetch("/api/process-video", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Processing failed")
      }

      const data = await response.json()
      const currentJobId = data.jobId
      setJobId(currentJobId)

      const pollInterval = setInterval(async () => {
        const progressResponse = await fetch(`/api/progress/${currentJobId}`)
        const progressData = await progressResponse.json()

        setProgress(progressData.progress)
        setProgressMessage(progressData.message)

        if (progressData.status === "complete") {
          clearInterval(pollInterval)
          setProcessedVideoUrl(`/api/download/${currentJobId}`)
          setStage("complete")
          setIsProcessing(false)
        } else if (progressData.status === "error") {
          clearInterval(pollInterval)
          alert("Error processing video: " + progressData.error)
          setIsProcessing(false)
          setStage("settings")
        }
      }, 1000)
    } catch (error) {
      console.error("Error:", error)
      alert("Failed to start processing")
      setIsProcessing(false)
      setStage("settings")
    }
  }

  const handleDownload = () => {
    if (processedVideoUrl) {
      const a = document.createElement("a")
      a.href = processedVideoUrl
      a.download = `${uploadedFile?.name.replace(/\.[^/.]+$/, "")}_enhanced.mp4`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }

  const resetApp = () => {
    setStage("upload")
    setUploadedFile(null)
    setProgress(0)
    setProgressMessage("")
    setProcessedVideoUrl(null)
    setJobId(null)
    setSettings({
      useAI: false,
      denoise: 4,
      sharpness: 1.0,
      contrast: 2.0,
      bitrate: "2500k",
      preset: "medium",
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/20">
      <Card className="w-full max-w-2xl p-6 md:p-8 space-y-6 shadow-2xl border-border/50 backdrop-blur-sm">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-8 h-8 text-primary animate-pulse" />
            <h1 className="text-3xl md:text-4xl font-bold text-balance bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Video Enhancer Pro
            </h1>
          </div>
          <p className="text-muted-foreground text-pretty">Melhore, aplique upscaling e comprima seus vídeos com IA</p>
        </div>

        {/* Upload Section */}
        {stage === "upload" && (
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="border-2 border-dashed rounded-xl p-12 text-center hover:border-primary hover:bg-muted/30 transition-all duration-300 cursor-pointer group"
          >
            <label htmlFor="video-upload" className="cursor-pointer">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Upload className="w-12 h-12 text-primary group-hover:scale-110 transition-transform" />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-lg">Clique para fazer upload ou arraste e solte</p>
                  <p className="text-sm text-muted-foreground">MP4, AVI, MOV (Max 500MB)</p>
                </div>
              </div>
              <input id="video-upload" type="file" className="hidden" accept="video/*" onChange={handleFileUpload} />
            </label>
          </div>
        )}

        {/* Settings Section */}
        {stage === "settings" && uploadedFile && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="text-sm text-center p-3 rounded-lg bg-primary/10 border border-primary/20">
              Arquivo carregado: <span className="font-semibold text-primary">{uploadedFile.name}</span>
            </div>

            {/* AI Upscaling */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Upscaling com IA
              </h3>
              <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-muted/50 to-muted/30 border border-border/50 hover:border-primary/50 transition-colors">
                <Label htmlFor="ai-toggle" className="font-medium cursor-pointer">
                  Ativar Real-ESRGAN (2x)
                </Label>
                <Switch
                  id="ai-toggle"
                  checked={settings.useAI}
                  onCheckedChange={(checked) => setSettings({ ...settings, useAI: checked })}
                />
              </div>
            </div>

            {/* Quality Improvements */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Melhorias de Qualidade</h3>
              <div className="p-5 rounded-lg bg-gradient-to-br from-muted/50 to-muted/30 border border-border/50 space-y-6">
                {/* Denoise */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="font-medium">Suavização</Label>
                    <span className="text-sm font-mono text-primary font-semibold px-2 py-1 rounded bg-primary/10">
                      {settings.denoise}
                    </span>
                  </div>
                  <Slider
                    value={[settings.denoise]}
                    onValueChange={([value]) => setSettings({ ...settings, denoise: value })}
                    min={0}
                    max={10}
                    step={1}
                    className="cursor-pointer"
                  />
                </div>

                {/* Sharpness */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="font-medium">Nitidez</Label>
                    <span className="text-sm font-mono text-primary font-semibold px-2 py-1 rounded bg-primary/10">
                      {settings.sharpness.toFixed(1)}
                    </span>
                  </div>
                  <Slider
                    value={[settings.sharpness]}
                    onValueChange={([value]) => setSettings({ ...settings, sharpness: value })}
                    min={0}
                    max={2}
                    step={0.1}
                    className="cursor-pointer"
                  />
                </div>

                {/* Contrast */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="font-medium">Contraste</Label>
                    <span className="text-sm font-mono text-primary font-semibold px-2 py-1 rounded bg-primary/10">
                      {settings.contrast.toFixed(1)}
                    </span>
                  </div>
                  <Slider
                    value={[settings.contrast]}
                    onValueChange={([value]) => setSettings({ ...settings, contrast: value })}
                    min={1}
                    max={5}
                    step={0.1}
                    className="cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Compression Settings */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Configurações de Compressão</h3>
              <div className="p-5 rounded-lg bg-gradient-to-br from-muted/50 to-muted/30 border border-border/50 space-y-4">
                <div className="grid grid-cols-3 gap-4 items-center">
                  <Label className="font-medium">Bitrate</Label>
                  <Select
                    value={settings.bitrate}
                    onValueChange={(value) => setSettings({ ...settings, bitrate: value })}
                  >
                    <SelectTrigger className="col-span-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1000k">Baixa (1000k)</SelectItem>
                      <SelectItem value="2500k">Padrão 720p (2500k)</SelectItem>
                      <SelectItem value="4000k">Padrão 1080p (4000k)</SelectItem>
                      <SelectItem value="8000k">Alta Qualidade (8000k)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-3 gap-4 items-center">
                  <Label className="font-medium">Preset</Label>
                  <Select
                    value={settings.preset}
                    onValueChange={(value) => setSettings({ ...settings, preset: value })}
                  >
                    <SelectTrigger className="col-span-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fast">Rápido</SelectItem>
                      <SelectItem value="medium">Médio (Equilibrado)</SelectItem>
                      <SelectItem value="slow">Lento (Melhor Compressão)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Process Button */}
            <Button
              onClick={startProcessing}
              disabled={isProcessing}
              className="w-full group hover:shadow-lg hover:shadow-primary/20 transition-all duration-300"
              size="lg"
            >
              <Sparkles className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
              Iniciar Processamento
            </Button>
          </div>
        )}

        {/* Processing Section */}
        {stage === "processing" && (
          <div className="text-center p-8 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/20 space-y-6 animate-in fade-in duration-500">
            <div className="relative">
              <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-t-4 border-primary mx-auto" />
              <Sparkles className="w-8 h-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-lg">{progressMessage || "Iniciando processamento..."}</p>
              <p className="text-sm text-muted-foreground">Isso pode levar alguns minutos</p>
            </div>
            <div className="space-y-2">
              <Progress value={progress} className="w-full h-3" />
              <p className="text-sm font-mono text-primary font-semibold">{progress}%</p>
            </div>
          </div>
        )}

        {/* Download Section */}
        {stage === "complete" && (
          <div className="text-center p-8 bg-gradient-to-br from-green-500/10 to-green-500/5 border-2 border-green-500/30 rounded-xl space-y-6 animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto animate-bounce">
              <Download className="w-10 h-10 text-green-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-bold text-balance">Processamento Concluído!</h2>
              <p className="text-muted-foreground text-pretty">
                Seu vídeo foi melhorado com sucesso e está pronto para download.
              </p>
            </div>
            <div className="flex flex-col gap-3 max-w-sm mx-auto">
              <Button
                onClick={handleDownload}
                className="w-full group hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300"
                size="lg"
              >
                <Download className="w-5 h-5 mr-2 group-hover:translate-y-1 transition-transform" />
                Baixar Vídeo Melhorado
              </Button>
              <Button
                onClick={resetApp}
                variant="outline"
                className="w-full hover:bg-muted/50 transition-colors bg-transparent"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Processar outro vídeo
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
