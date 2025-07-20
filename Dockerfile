# Etapa 1: build
FROM node:21-alpine3.18 AS builder

WORKDIR /app

# Instalar bash necesario para algunos scripts en Alpine
RUN apk add --no-cache bash

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar todas las dependencias (dev y prod)
RUN npm install

# Copiar todo el proyecto
COPY . .

# Compilar el código TypeScript a JavaScript usando npx (evita problemas de permisos)
RUN npx tsc

# Etapa 2: producción
FROM node:21-alpine3.18 AS production

WORKDIR /app

# Copiar solo package.json para instalar dependencias de producción
COPY package*.json ./

RUN npm install --omit=dev

# Copiar los archivos compilados desde la etapa builder
COPY --from=builder /app/dist ./dist

# Puerto que exponemos
EXPOSE 3000
ENV PORT=3000

# Comando para iniciar la aplicación
CMD ["node", "dist/index.js"]
