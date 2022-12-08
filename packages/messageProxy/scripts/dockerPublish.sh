#!/usr/bin/env bash

DIR=$( dirname -- "$( readlink -f -- "$0"; )"; )
ROOT_DIR="${DIR}/.."
DOCKER_IMAGE="message-proxy"
VERSION=$( ${DIR}/../../../utils/getPackageVersion.js ${ROOT_DIR}/package.json; )
TAG=cr.yandex/crpmiu1h5mdish4lqlu2/${DOCKER_IMAGE}:${VERSION}

docker build --no-cache --tag ${TAG} ${ROOT_DIR}
docker push ${TAG}
