## Setup

### Requirements

node 16+

### Bootstrap

```bash
nvm use
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
docker start required (example `colima start`)

```bash
yarn build
yarn dev
```

After application start:

```bash
yarn setup:dev # generate tokens for correct work of collaboration
```

#### Stop dev application

```bash
yarn kill:ports
```
