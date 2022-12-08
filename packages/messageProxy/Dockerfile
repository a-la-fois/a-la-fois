FROM node:16

ENV NODE_ENV=production

WORKDIR /app

COPY package.json nest-cli.json tsconfig.build.json tsconfig.json ./
COPY ./src ./src

RUN yarn --ignore-scripts --production=false
RUN yarn build:server

EXPOSE 3000

CMD [ "yarn", "start" ]

