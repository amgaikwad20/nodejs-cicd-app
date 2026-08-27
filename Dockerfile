FROM node:20-alpine

WORKDIR /app

RUN apk update && apk upgrade --no-cache

COPY package*.json ./

RUN npm ci --omit=dev

COPY app.js server.js ./

EXPOSE 3000

USER node

CMD ["node", "server.js"]
