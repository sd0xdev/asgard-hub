#!/bin/bash

echo "CI: ${CI}"
echo "CI_JOB_IMAGE: ${CI_JOB_IMAGE}"

if [ "${CI}" = true ] ; then
    /kaniko/executor \
            --context "${CI_PROJECT_DIR}" \
            --dockerfile "${CI_PROJECT_DIR}/apps/${PROJECT_NAME}/Dockerfile" \
            --destination "${CI_REGISTRY_IMAGE}/yu-gpt-engine-image:${CI_COMMIT_SHA}" \
            --cache=false \
            --cleanup \
            --build-arg "SERVER_VERSION=${CI_COMMIT_SHORT_SHA}"
else

    echo "build docker compose" && \
    docker-compose -f ./docker-compose-prod.yml build --no-cache && \
    sh -c ./build-image.sh
fi
