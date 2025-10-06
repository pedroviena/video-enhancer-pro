import { Sparkles } from "lucide-react"

export function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
      <div className="text-center space-y-4">
        <div className="relative">
          <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-t-4 border-primary mx-auto" />
          <Sparkles className="w-8 h-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    </div>
  )
}
