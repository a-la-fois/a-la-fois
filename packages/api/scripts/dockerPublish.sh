#!/usr/bin/env bash

DIR=$( dirname -- "$( readlink -f -- "$0"; )"; )
ROOT_DIR="${DIR}/.."
DOCKER_IMAGE="api"
VERSION=$( ${DIR}/../../../utils/getPackageVersion.js ${ROOT_DIR}/package.json; )
TAG=ghcr.io/a-la-fois/${DOCKER_IMAGE}:${VERSION}

docker build --no-cache --tag ${TAG} ${ROOT_DIR}
docker push ${TAG}
