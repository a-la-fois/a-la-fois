docker-compose -f ./docker-compose.dev.yml up -d
yarn start:docHandler:dapr:dev &
yarn start:messageProxy:dapr:dev &
yarn start:api &
VITE_SERVER_URL=ws://127.0.0.1:3000 yarn start:examples:dev
