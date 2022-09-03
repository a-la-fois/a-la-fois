yarn build
docker-compose -f ./docker-compose.dev.yml up -d
yarn start:messageProxy:dapr:dev &
yarn start:docHandler:dapr:dev
