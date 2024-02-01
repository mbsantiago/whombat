SHELL := /bin/bash

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
