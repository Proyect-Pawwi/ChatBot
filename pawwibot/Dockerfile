# Etapa de construcción
FROM node:18-alpine as builder

WORKDIR /app

# Instala dependencias necesarias para compilar paquetes nativos
RUN apk add --no-cache python3 make g++ git

COPY package*.json ./
RUN npm install

COPY . .

# Compila el proyecto TypeScript
RUN npm run build

# Etapa de producción
FROM node:18-alpine as deploy

WORKDIR /app

# Copia solo lo necesario desde builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Instala solo dependencias de producción
RUN npm install --omit=dev

# Railway maneja el puerto por variable de entorno
ARG PORT
ENV PORT $PORT
EXPOSE $PORT

# Ejecuta el bot
CMD ["npm", "start"]
