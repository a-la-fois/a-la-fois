FROM node:18

ENV NODE_ENV=production

WORKDIR /app

COPY package.json tsconfig.build.json tsconfig.json dapr-config.yaml ./
COPY ./src ./src

RUN yarn --ignore-scripts --production=false
RUN yarn build:server

CMD [ "yarn", "start" ]

