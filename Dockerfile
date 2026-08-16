# syntax=docker/dockerfile:1

# Base Alpine: usa musl no lugar da glibc, o que corta ~150MB frente ao slim.
# Funciona aqui porque as três dependências com binário nativo do projeto
# (sharp, o SWC do Next e o oxide do Tailwind) publicam variantes musl, e o
# package-lock.json as registra. Se alguma dependência nativa nova não tiver
# build musl, o sintoma é um erro de "cannot find module" no build — a saída é
# voltar para node:22-slim.

# ─── 1/3 · deps ───────────────────────────────────────────────────────────────
# Estágio isolado só para instalar dependências. Como copiamos apenas os dois
# arquivos de manifesto, o Docker reaproveita esta camada em todo build em que
# package.json e package-lock.json não mudaram — o npm ci só roda de novo
# quando uma dependência realmente muda.
FROM node:22-alpine AS deps
WORKDIR /app

# Camada de compatibilidade que alguns binários pré-compilados esperam
# encontrar mesmo na variante musl. São poucos KB.
RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json ./

# --ignore-scripts pula os postinstall das dependências. Aqui isso importa:
# playwright baixaria ~400MB de navegadores e ffmpeg-static outro binário
# pesado — ambos só servem aos utilitários em scripts/, que não participam do
# build. Também é a recomendação padrão contra supply-chain (postinstall é
# código de terceiros rodando na sua máquina). sharp, o SWC do Next e o oxide
# do Tailwind não precisam de script: vêm como binários pré-compilados em
# pacotes optionalDependencies.
RUN npm ci --ignore-scripts

# ─── 2/3 · builder ────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# ─── 3/3 · runner ─────────────────────────────────────────────────────────────
# Imagem final: nada de código-fonte, nada de node_modules de desenvolvimento,
# nada de TypeScript ou ESLint. Só o servidor compilado.
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
# Sem isto o servidor escuta em 127.0.0.1 e fica inalcançável de fora do
# container — o Nginx Proxy Manager receberia "connection refused".
ENV HOSTNAME=0.0.0.0

# Rodar como root dentro do container é desnecessário para servir HTML.
# No Alpine as ferramentas são addgroup/adduser (BusyBox), não groupadd/useradd.
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 --ingroup nodejs nextjs

# O modo standalone do Next monta um server.js com apenas os módulos que o
# tracing provou serem usados. Mas ele não copia public/ nem .next/static —
# esses dois vão à mão.
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

# O Docker passa a saber se o processo está apenas vivo ou de fato respondendo.
# Usamos o fetch global do Node 22 porque a imagem não traz curl nem wget.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
