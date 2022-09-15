FROM node:18-alpine as builder

ARG BUILD_CONTEXT

# For examples
ARG SERVER_URL
ENV VITE_SERVER_URL=$SERVER_URL

WORKDIR /base

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


# run examples
FROM nginx:alpine as examples

COPY ./packages/examples/nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /base/packages/examples/dist /usr/share/nginx/html
