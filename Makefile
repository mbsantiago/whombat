SHELL := /bin/bash

dev-front:
	cd front && npm run dev

dev-back:
	cd back && make serve-dev

dev-docs:
	cd back && make serve-docs

install-dev:
	bash scripts/install_dev.sh

build-frontend:
	bash scripts/update_front.sh

build-guide:
	bash scripts/update_guide.sh

bundle-pyinstaller:
	bash scripts/bundle_linux.sh

publish:
	bash scripts/publish_pypi.sh

storybook:
	cd front && npm run storybook
