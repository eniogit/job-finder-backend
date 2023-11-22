FROM node:20.9.0-alpine3.18 as build

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

FROM build as run-dev

WORKDIR /app

COPY . .

CMD ["node", "index.js"]
