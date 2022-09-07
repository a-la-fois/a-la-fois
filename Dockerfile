FROM node:18-buster as builder

ARG BUILD_CONTEXT

WORKDIR /base

# node-rdkafka dependencies
# RUN apt-get update && apt-get install -y \
#   bash \
#   g++ \
#   ca-certificates \
#   lz4-dev \
#   musl-dev \
#   cyrus-sasl-dev \
#   openssl-dev \
#   make \
#   python3 \
#   && rm -rf /var/lib/apt/lists/*

# RUN apk add --no-cache --virtual .build-deps gcc zlib-dev libc-dev bsd-compat-headers py-setuptools bash
# RUN rm -rf node_modules/node-rdkafka/deps node_modules/node-rdkafka/build/deps/*.a

COPY package.json .
COPY yarn.lock .
COPY tsconfig.base.json .
COPY ./packages ./packages

RUN yarn install

RUN yarn build:$BUILD_CONTEXT


# setup a base for all services
FROM node:18-alpine as base-runner

ENV NODE_ENV production

USER node
WORKDIR /home/node

COPY --from=builder --chown=node:node /base/ ./


# run messageProxy
FROM base-runner as messageProxy
CMD ["node", "./packages/messageProxy/dist/main.js"]


# run docHandler
FROM base-runner as docHandler
CMD ["node", "./packages/docHandler/dist/main.js"]
