yarn build:lib
docker-compose -f ./docker-compose.dev.yml up -d
yarn start:models:dev &
yarn start:docHandler:dapr:dev &
yarn start:messageProxy:dapr:dev &
ADMIN_SECRET=le_secret yarn start:api:dapr:dev &
yarn start:docClient:dev &
VITE_SERVER_URL=ws://127.0.0.1:3000 yarn start:examples:dev
