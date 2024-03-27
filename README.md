# DDB Back End Developer Challenge

## Description

An HP management API implementation for the D&D Beyond Backend Developer
Challenge (see [instructions](./instructions/README.md)).

## Prerequisites

This project requires [Docker](https://www.docker.com/products/docker-desktop/)
and [Node](https://nodejs.org/en) to be installed on your machine.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run build
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Open API

This project supports the Open API specification and has a Swagger UI available
for exploring and testing endpoints at `/api` when running.
