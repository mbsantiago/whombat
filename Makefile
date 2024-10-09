SHELL := /bin/bash

FRONT_DIR := front
BACK_DIR := back

.PHONY: dev dev-front dev-back dev-docs storybook install-dev build-frontend build-guide bundle publish clean

dev:
	docker-compose -f compose.dev.yaml up --watch --build frontend backend

dev-front:
	cd $(FRONT_DIR) && npm run dev

storybook:
	cd $(FRONT_DIR) && npm run storybook

dev-back:
	cd $(BACK_DIR) && make serve-dev

dev-docs:
	cd $(BACK_DIR) && make serve-docs

install-dev:
	bash scripts/install_dev.sh

build-frontend:
	bash scripts/update_front.sh

build-guide:
	bash scripts/update_guide.sh

bundle:
	bash scripts/bundle_linux.sh

publish:
	bash scripts/publish_pypi.sh

clean:
	rm -rf dist/ build/
