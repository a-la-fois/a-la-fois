docker-compose -f ./docker-compose.dev.yml up -d
yarn start:docHandler:dapr:dev &
yarn start:messageProxy:dapr:dev &
yarn start:examples:dev
