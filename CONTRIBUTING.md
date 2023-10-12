## Setup

### Requirements

node 16+

### Bootstrap

```bash
npm i -G yarn # if you don't have yarn
yarn # in project root to install dependencies
yarn bootstrap
```

### Dapr

[install Dapr](https://docs.dapr.io/getting-started/install-dapr-cli/#step-1-install-the-dapr-cli)

```bash
dapr init -s
```

### Launch dev

docker-compose required

```bash
yarn build
yarn setup:dev
yarn dev
```
