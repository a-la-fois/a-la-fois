docker-compose -f ./docker-compose.dev.yml up -d
yarn start:docHandler:dapr:dev &
VITE_SERVER_URL=http://localhost:3000 yarn start:messageProxy:dapr:dev &
yarn start:examples:dev
