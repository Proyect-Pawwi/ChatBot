# Etapa 1: build
FROM node:21-alpine3.18 AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Etapa 2: producción
FROM node:21-alpine3.18 AS production

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY --from=builder /app/dist ./dist

# Si tienes assets, descomenta esta línea:
# COPY --from=builder /app/assets ./assets

ENV PORT=3000
EXPOSE $PORT

CMD ["npm", "start"]
