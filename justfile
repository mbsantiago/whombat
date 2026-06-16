set shell := ["bash", "-eu", "-o", "pipefail", "-c"]

default:
    @just --list

install-back:
    cd back && just install

install-front:
    cd front && npm ci

install: install-back install-front
    @:

dev:
    docker-compose -f compose.dev.yaml up --watch --build frontend backend

dev-back:
    cd back && just serve

dev-front:
    cd front && npm run dev

docs:
    cd back && just docs

storybook:
    cd front && npm run storybook

test-back:
    cd back && just test

test-front:
    cd front && npm run test

test: test-back test-front
    @:

check-back:
    cd back && just check

check-front:
    cd front && npm run format-check && npm run lint && npm run lint-tsc && npm run test

check: check-back check-front
    @:

build-front:
    bash scripts/update_front.sh

build-guide:
    cd back && just build-guide

bundle:
    bash scripts/bundle_linux.sh

clean:
    rm -rf dist build
