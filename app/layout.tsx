import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Suspense } from "react"
import { ErrorBoundary } from "@/components/error-boundary"
import { LoadingSpinner } from "@/components/loading-spinner"

export const metadata: Metadata = {
  title: "Video Enhancer Pro - Melhore seus vídeos com IA",
  description: "Aplique upscaling, melhore a qualidade e comprima seus vídeos com tecnologia de IA avançada",
  generator: "v0.app",
  keywords: ["video enhancer", "AI upscaling", "video quality", "video compression", "FFmpeg"],
  authors: [{ name: "Video Enhancer Pro" }],
  openGraph: {
    title: "Video Enhancer Pro",
    description: "Melhore seus vídeos com IA - Upscaling, qualidade e compressão profissional",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Video Enhancer Pro",
    description: "Melhore seus vídeos com IA - Upscaling, qualidade e compressão profissional",
  },
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#8b5cf6",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={`font-sans antialiased ${GeistSans.variable} ${GeistMono.variable}`}>
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
        </ErrorBoundary>
        <Analytics />
      </body>
    </html>
  )
}
