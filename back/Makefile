SHELL := /bin/bash
.PHONY: clean clean-build clean-pyc clean-test coverage dist docs help install lint lint/flake8 lint/black

.DEFAULT_GOAL := help

ENV_PREFIX=.venv/bin/
WHOMBAT_BACKEND_DEV_PORT ?= 5000

define BROWSER_PYSCRIPT
import os, webbrowser, sys

from urllib.request import pathname2url

webbrowser.open("file://" + pathname2url(os.path.abspath(sys.argv[1])))
endef
export BROWSER_PYSCRIPT

define PRINT_HELP_PYSCRIPT
import re, sys

for line in sys.stdin:
	match = re.match(r'^([a-zA-Z_-]+):.*?## (.*)$$', line)
	if match:
		target, help = match.groups()
		print("%-20s %s" % (target, help))
endef
export PRINT_HELP_PYSCRIPT

BROWSER := python -c "$$BROWSER_PYSCRIPT"

help:  ## show this help message and exit
	@python -c "$$PRINT_HELP_PYSCRIPT" < $(MAKEFILE_LIST)

clean: clean-build clean-pyc clean-test clean-docs  ## remove all build, test, coverage and Python artifacts

clean-build:
	rm -fr build/
	rm -fr dist/
	rm -fr .eggs/
	find . -name '*.egg-info' -exec rm -fr {} +
	find . -name '*.egg' -exec rm -f {} +

clean-pyc:
	find . -name '*.pyc' -exec rm -f {} +
	find . -name '*.pyo' -exec rm -f {} +
	find . -name '*~' -exec rm -f {} +
	find . -name '__pycache__' -exec rm -fr {} +

clean-test:
	rm -f .coverage
	rm -fr htmlcov/
	rm -fr .pytest_cache

clean-docs:
	rm -fr site/

lint/ruff:
	$(ENV_PREFIX)ruff check src tests

lint/pyright:
	$(ENV_PREFIX)pyright src

lint: lint/ruff lint/pyright

format:  ## format code
	$(ENV_PREFIX)ruff format src tests

test:  ## Run all tests
	$(ENV_PREFIX)pytest -n auto

install: clean  ## install the package to the active Python's site-packages
	python -m venv .venv
	$(ENV_PREFIX)pip install .

coverage:  ## check code coverage
	$(ENV_PREFIX)coverage run --source whombat -m pytest
	$(ENV_PREFIX)coverage report -m
	$(ENV_PREFIX)coverage html
	$(BROWSER) htmlcov/index.html

build-docs:  ## build documentation
	$(ENV_PREFIX)mkdocs build

build-guide:  ## build user guide
	$(ENV_PREFIX)mkdocs build -f mkdocs-guide.yml -d src/whombat/user_guide

serve-docs:  ## serve documentation
	$(ENV_PREFIX)mkdocs serve --open

serve-guide:  ## serve user guide
	URL="http://localhost:8000/whombat/"; xdg-open $$URL || sensible-browser $$URL || x-www-browser $$URL || gnome-open $$URL
	$(ENV_PREFIX)mkdocs serve -f mkdocs-guide.yml

serve-dev:  ## serve development backend
	WHOMBAT_DEV=true $(ENV_PREFIX)python -m whombat
