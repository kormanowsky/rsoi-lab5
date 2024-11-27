FROM node:alpine 

ENV CHROMEDRIVER_SKIP_DOWNLOAD=1

ARG SERVICE

RUN mkdir -p /library && mkdir -p /apps/${SERVICE}

WORKDIR /library

COPY library/src ./src
COPY library/package*.json .

RUN npm ci

WORKDIR /apps/${SERVICE}

COPY services/${SERVICE}/src/ ./src
COPY services/${SERVICE}/package*.json .
COPY services/${SERVICE}/tsconfig.json .

RUN npm ci

CMD ["npm", "run", "serve"]
