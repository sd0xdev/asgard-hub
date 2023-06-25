FROM docker.io/node:18.16  AS development

WORKDIR /usr/src/app

COPY --chown=node:node package*.json ./

RUN npm ci

COPY --chown=node:node . .

USER node

FROM node:lts-slim As build

WORKDIR /usr/src/app

COPY --chown=node:node package*.json ./
COPY --chown=node:node --from=development /usr/src/app/node_modules ./node_modules
COPY --chown=node:node . .

RUN npx nx run yggdrasil-discord-client:build
RUN npm cache clean --force

USER node

FROM docker.io/node:18.16-alpine AS production

COPY --chown=node:node --from=build /usr/src/app/dist/apps/yggdrasil-discord-client ./yggdrasil-discord-client
COPY --chown=node:node --from=development /usr/src/app/node_modules ./node_modules

ARG SERVER_VERSION
ENV SERVER_VERSION=${SERVER_VERSION}

CMD [ "node", "yggdrasil-discord-client" ]
