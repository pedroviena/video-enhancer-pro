# Video Enhancer Pro 🎬✨

Uma aplicação profissional de aprimoramento de vídeo com IA, construída com Next.js 15 e FFmpeg.

## 🚀 Funcionalidades

- **Upload de Vídeo**: Interface drag-and-drop intuitiva para upload de vídeos
- **Upscaling com IA**: Aumente a resolução dos seus vídeos em 2x usando algoritmos avançados
- **Melhorias de Qualidade**:
  - Suavização (Denoise) - Remove ruído e granulação
  - Nitidez (Sharpness) - Melhora a definição dos detalhes
  - Contraste - Ajusta o contraste para cores mais vibrantes
- **Compressão Inteligente**: Configure bitrate e presets de codificação
- **Processamento em Tempo Real**: Acompanhe o progresso do processamento com atualizações ao vivo
- **Interface Profissional**: Design moderno e responsivo com tema escuro

## 🛠️ Tecnologias

- **Next.js 15** - Framework React com App Router
- **TypeScript** - Tipagem estática para maior segurança
- **FFmpeg** - Processamento de vídeo de nível profissional
- **Tailwind CSS v4** - Estilização moderna e responsiva
- **shadcn/ui** - Componentes UI de alta qualidade
- **Geist Font** - Tipografia profissional da Vercel

## 📋 Pré-requisitos

Antes de começar, você precisa ter instalado:

- **Node.js** 18.x ou superior
- **FFmpeg** instalado no sistema

### Instalando FFmpeg

**macOS:**
\`\`\`bash
brew install ffmpeg
\`\`\`

**Ubuntu/Debian:**
\`\`\`bash
sudo apt update
sudo apt install ffmpeg
\`\`\`

**Windows:**
Baixe de [ffmpeg.org](https://ffmpeg.org/download.html) e adicione ao PATH

## 🚀 Instalação Local

1. Clone o repositório ou baixe o código

2. Instale as dependências:
\`\`\`bash
npm install
\`\`\`

3. Crie os diretórios necessários:
\`\`\`bash
mkdir -p public/uploads public/output
\`\`\`

4. Configure as variáveis de ambiente (opcional):
\`\`\`bash
cp .env.example .env
\`\`\`

5. Execute o servidor de desenvolvimento:
\`\`\`bash
npm run dev
\`\`\`

6. Abra [http://localhost:3000](http://localhost:3000) no seu navegador

## 🌐 Deploy na Vercel

### Deploy Automático (Recomendado)

1. **Faça push do código para GitHub**:
\`\`\`bash
git init
git add .
git commit -m "Initial commit"
git remote add origin seu-repositorio.git
git push -u origin main
\`\`\`

2. **Importe no Vercel**:
   - Acesse [vercel.com](https://vercel.com)
   - Clique em "New Project"
   - Importe seu repositório do GitHub
   - Clique em "Deploy"

3. **Configure FFmpeg no Vercel**:
   - O FFmpeg já está disponível no ambiente Vercel por padrão
   - Não é necessária configuração adicional

### Deploy Manual via CLI

\`\`\`bash
# Instale a CLI da Vercel
npm i -g vercel

# Faça login
vercel login

# Deploy
vercel --prod
\`\`\`

### Configurações Importantes para Produção

O projeto já está configurado com:
- ✅ Timeout de 300 segundos para processamento de vídeo
- ✅ 3GB de memória para funções serverless
- ✅ Limpeza automática de arquivos temporários (a cada 6 horas)
- ✅ Error boundaries para tratamento de erros
- ✅ Analytics da Vercel integrado

## 📦 Build para Produção Local

\`\`\`bash
npm run build
npm start
\`\`\`

## 🎯 Como Usar

1. **Upload**: Arraste e solte um vídeo ou clique para selecionar (MP4, AVI, MOV)
2. **Configure**: Ajuste as configurações de qualidade e compressão:
   - Ative o upscaling com IA se desejar aumentar a resolução
   - Ajuste os sliders de suavização, nitidez e contraste
   - Escolha o bitrate e preset de codificação
3. **Processe**: Clique em "Iniciar Processamento" e aguarde
4. **Download**: Baixe seu vídeo melhorado quando o processamento terminar

## 🏗️ Estrutura do Projeto

\`\`\`
video-enhancer-pro/
├── app/
│   ├── api/
│   │   ├── process-video/
│   │   │   └── route.ts          # Endpoint de processamento
│   │   ├── progress/[jobId]/
│   │   │   └── route.ts          # Endpoint de progresso
│   │   ├── download/[jobId]/
│   │   │   └── route.ts          # Endpoint de download
│   │   └── cleanup/
│   │       └── route.ts          # Limpeza de arquivos antigos
│   ├── layout.tsx                # Layout principal
│   ├── page.tsx                  # Página principal
│   └── globals.css               # Estilos globais
├── components/
│   ├── ui/                       # Componentes shadcn/ui
│   └── error-boundary.tsx        # Error boundary para produção
├── public/
│   ├── uploads/                  # Vídeos enviados (temporário)
│   └── output/                   # Vídeos processados (temporário)
├── vercel.json                   # Configuração Vercel
├── .env.example                  # Exemplo de variáveis de ambiente
└── package.json
\`\`\`

## 🔧 API Endpoints

### POST `/api/process-video`
Inicia o processamento de um vídeo

**Body (FormData):**
- `video`: Arquivo de vídeo
- `settings`: JSON com configurações

**Response:**
\`\`\`json
{
  "jobId": "uuid-do-job"
}
\`\`\`

### GET `/api/progress/[jobId]`
Consulta o progresso do processamento

**Response:**
\`\`\`json
{
  "status": "processing" | "complete" | "error",
  "progress": 0-100,
  "message": "Mensagem de status",
  "videoUrl": "/output/video.mp4" (quando completo)
}
\`\`\`

### GET `/api/download/[jobId]`
Baixa o vídeo processado

**Response:** Arquivo de vídeo MP4

### GET `/api/cleanup`
Limpa arquivos temporários antigos (executado automaticamente via cron)

**Response:**
\`\`\`json
{
  "success": true,
  "deletedFiles": 5,
  "message": "Cleaned up 5 old files"
}
\`\`\`

## ⚙️ Configurações de Processamento

### Suavização (Denoise)
- **Range**: 0-10
- **Recomendado**: 4
- **Efeito**: Remove ruído e granulação do vídeo

### Nitidez (Sharpness)
- **Range**: 0-2
- **Recomendado**: 1.0
- **Efeito**: Aumenta a definição dos detalhes

### Contraste
- **Range**: 1-5
- **Recomendado**: 2.0
- **Efeito**: Ajusta o contraste das cores

### Bitrate
- **1000k**: Baixa qualidade, menor tamanho
- **2500k**: Padrão 720p
- **4000k**: Padrão 1080p
- **8000k**: Alta qualidade

### Preset
- **fast**: Processamento rápido, compressão menor
- **medium**: Equilibrado (recomendado)
- **slow**: Processamento lento, melhor compressão

## 🚨 Limitações

- Tamanho máximo de arquivo: 500MB (configurável)
- Timeout de processamento: 5 minutos (Vercel Pro)
- Arquivos temporários são limpos automaticamente após 24 horas

## 🔐 Segurança e Melhorias para Produção

### Implementado
- ✅ Error boundaries para tratamento de erros
- ✅ Validação de tipos de arquivo
- ✅ Limpeza automática de arquivos temporários
- ✅ Timeouts configurados
- ✅ Tratamento de erros robusto

### Recomendações Adicionais
- 🔒 Adicionar autenticação de usuários (NextAuth.js)
- 🔒 Implementar rate limiting (Upstash Rate Limit)
- 🔒 Usar armazenamento em nuvem (Vercel Blob, S3)
- 🔒 Adicionar fila de processamento (Vercel Queue, BullMQ)
- 🔒 Implementar webhooks para notificações
- 🔒 Adicionar monitoramento (Sentry, LogRocket)

## 🌍 Variáveis de Ambiente

Copie `.env.example` para `.env` e configure:

\`\`\`env
# Tamanho máximo de arquivo (bytes)
MAX_FILE_SIZE=524288000

# Tempo de retenção de arquivos (horas)
FILE_RETENTION_HOURS=24

# Caminho do FFmpeg (opcional)
FFMPEG_PATH=

# Debug mode
DEBUG=false
\`\`\`

## 📊 Monitoramento

O projeto inclui:
- **Vercel Analytics**: Métricas de uso e performance
- **Console Logs**: Logs detalhados com prefixo `[v0]`
- **Error Boundaries**: Captura e exibição de erros

## 🐛 Troubleshooting

### FFmpeg não encontrado
\`\`\`bash
# Verifique se o FFmpeg está instalado
ffmpeg -version

# Se não estiver, instale conforme as instruções acima
\`\`\`

### Erro de timeout no Vercel
- Aumente o timeout em `vercel.json` (requer plano Pro)
- Reduza o tamanho do vídeo ou qualidade de processamento

### Erro de memória
- Aumente a memória em `vercel.json` (máximo 3008MB)
- Processe vídeos menores ou em chunks

## 📝 Licença

Este projeto foi criado com v0.app da Vercel.

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

## 📧 Suporte

Para problemas ou dúvidas, abra uma issue no repositório.

---

**Pronto para Deploy!** 🚀

Este projeto está 100% configurado para deploy na Vercel com todas as otimizações de produção.

Desenvolvido por PEDRO VIENA
