FROM node:alpine 

RUN mkdir /app

WORKDIR /app

COPY src ./src
COPY package*.json .


RUN npm install

CMD ["npx", "tsx", "./src/run.ts"]
