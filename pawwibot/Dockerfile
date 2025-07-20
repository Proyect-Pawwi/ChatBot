# Etapa 1: Builder
FROM node:21-alpine3.18 AS builder

WORKDIR /app

# Activar pnpm (corepack)
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copiar solo archivos de dependencias para aprovechar cache
COPY package.json pnpm-lock.yaml* ./

# Instalar dependencias
RUN pnpm install

# Copiar el resto del código
COPY . .

# Construir el proyecto
RUN pnpm run build


# Etapa 2: Deploy (más liviana)
FROM node:21-alpine3.18 AS deploy

WORKDIR /app

ARG PORT
ENV PORT=$PORT
EXPOSE $PORT

# Copiar archivos necesarios desde builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/assets ./assets
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml* ./

# Activar pnpm (corepack)
RUN corepack enable && corepack prepare pnpm@latest --activate

# Instalar solo dependencias de producción
RUN pnpm install --prod

# Usuario sin privilegios (opcional, buena práctica)
RUN addgroup -g 1001 -S nodejs && adduser -S -u 1001 nodejs
USER nodejs

CMD ["npm", "start"]
