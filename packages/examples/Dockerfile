FROM node:20 as build

ENV NODE_ENV=production

WORKDIR /app

COPY package.json tsconfig.json tsconfig.node.json vite.config.ts index.html ./
COPY ./src ./src

RUN yarn --ignore-scripts --production=false
RUN yarn build

FROM nginx
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
