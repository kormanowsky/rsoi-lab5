FROM node:alpine 

ARG SERVICE

COPY library/ /library
RUN mkdir -p /apps/${SERVICE}

WORKDIR /apps/${SERVICE}

COPY services/${SERVICE}/src/ ./src
COPY services/${SERVICE}/package*.json .

RUN npm install

CMD ["npx", "tsx", "./src/run.ts"]
