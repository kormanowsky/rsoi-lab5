FROM node:alpine 

ARG SERVICE
ARG STORAGE_CONN_STRING

RUN mkdir -p /library && mkdir -p /apps/${SERVICE}

WORKDIR /library

COPY library/src ./src
COPY library/package*.json .

RUN npm install

WORKDIR /apps/${SERVICE}

COPY services/${SERVICE}/src/ ./src
COPY services/${SERVICE}/package*.json .

RUN npm install

CMD ["npx", "tsx", "./src/run.ts"]
