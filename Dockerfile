# Etapa 1: build
FROM node:21-alpine3.18 AS builder

# Crear directorio de trabajo
WORKDIR /app

# Instalar bash (necesario en Alpine para algunos scripts)
RUN apk add --no-cache bash

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar TODAS las dependencias (dev + prod)
RUN npm install

# Copiar el resto del proyecto
COPY . .

# Asegurar permisos de ejecución del binario de TypeScript
RUN chmod +x ./node_modules/.bin/tsc

# Compilar el código TypeScript a JavaScript
RUN npm run build

# Etapa 2: producción
FROM node:21-alpine3.18 AS production

# Directorio de trabajo
WORKDIR /app

# Copiar solo los package*.json para instalar dependencias de producción
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm install --omit=dev

# Copiar archivos compilados desde la etapa builder
COPY --from=builder /app/dist ./dist

# Si tienes assets, descomenta la siguiente línea:
# COPY --from=builder /app/assets ./assets

# Configurar puerto de entorno
ENV PORT=3000
EXPOSE $PORT

# Comando de arranque
CMD ["npm", "start"]
