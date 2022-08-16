FROM node:18-alpine as builder

ARG BUILD_CONTEXT

WORKDIR /base

COPY package.json .
COPY yarn.lock .
COPY tsconfig.base.json .
COPY ./packages ./packages

RUN yarn install

RUN yarn build:$BUILD_CONTEXT

FROM node:18-alpine as base-runner

ENV NODE_ENV production

USER node
WORKDIR /home/node

COPY --from=builder --chown=node:node /base/ ./


FROM base-runner as messageProxy
CMD ["node", "./packages/messageProxy/dist/main.js"]


FROM base-runner as docHandler
CMD ["node", "./packages/docHandler/dist/main.js"]