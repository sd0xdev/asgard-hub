# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.0.11] - 2023/08/17

### Added

- `.github/workflows/main.yml`: Added a new job `push_to_gitlab` that pushes the code to the GitLab repository's develop branch if the current branch is `develop`. This job runs on Ubuntu and uses the `actions/checkout` action to fetch the latest code and then pushes it to GitLab using the provided GitLab token.

- `.gitignore`: Added `docker-data/` to the `.gitignore` file to exclude the `docker-data` directory from version control.

- `.gitlab-ci.yml`: Added a new GitLab CI configuration file with multiple stages and jobs for building and deploying the code. These jobs use various tags, scripts, and variables to determine the build and deployment steps. The stages include `build-image` and `cloud-deploy`, and the jobs include `build-and-push` and `cloud-deploy` with different variables and rules.

### Fixed

- `apps/yggdrasil-core-engine/.env.local.example`: Updated the environment variables in the example `.env.local` file. The variables `OPENAI_API_KEY`, `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_DEPLOYMENT_NAME`, and `AZURE_OPENAI_MODEL_NAME` were replaced with `CORE_ENGINE_API_KEY`, `CHATGPT_API_KEY`, `CHATGPT_ORG`, `OPENAI_API_TYPE`, `AZURE_API_BASE_PATH`, `AZURE_CHATGPT_API_KEY`, `AZURE_DEPLOYMENT_NAME`, `AZURE_API_VERSION`, `RPC_API_KEY`, and `MONGO_DB_URI`.

- `apps/yggdrasil-core-engine/Dockerfile`: Added a Dockerfile for the `yggdrasil-core-engine` application. This Dockerfile includes multiple stages (`development`, `build`, and `production`) and sets up the necessary environment for building and running the application.

## [0.0.10] - 2023/06/16

### Added

- update OpenAI API version to `3.3.0` for `[@sd0x/nest-openai-client](https://www.npmjs.com/package/@sd0x/nest-openai-client)`
  - read more about the changes [here](https://www.npmjs.com/package/openai/v/3.3.0)
  - support `function`

## [0.0.9] - 2023/05/22

### Fixed

- nest-openai-client readme

## [0.0.8] - 2023/05/22

### Fixed

- nest-openai-client readme
