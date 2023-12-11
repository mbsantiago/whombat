SHELL := /bin/bash
.PHONY: clean clean-build clean-pyc clean-test coverage dist docs help install lint lint/flake8 lint/black

.DEFAULT_GOAL := help

WHOMBAT_BACKEND_DEV_PORT ?= 8000

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

help:
	@python -c "$$PRINT_HELP_PYSCRIPT" < $(MAKEFILE_LIST)

clean: clean-build clean-pyc clean-test clean-docs

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

lint/flake8:
	flake8 src tests

lint/black:
	black --check src tests

lint/pylint:
	pylint src tests

lint/pycodestyle:
	pycodestyle src

lint/pydocstyle:
	pydocstyle src

lint/pyright:
	pyright src

lint: lint/flake8 lint/black lint/pycodestyle lint/pydocstyle lint/pylint lint/pyright ## check style

format:
	isort src tests
	black src tests

test:
	pytest -x

coverage:
	coverage run --source whombat -m pytest
	coverage report -m
	coverage html
	$(BROWSER) htmlcov/index.html

docs:
	mkdocs build
	URL="site/index.html"; xdg-open $$URL || sensible-browser $$URL || x-www-browser $$URL || gnome-open $$URL

docs-serve:
	URL="http://localhost:8000/whombat/"; xdg-open $$URL || sensible-browser $$URL || x-www-browser $$URL || gnome-open $$URL
	@$(ENV_PREFIX)mkdocs serve

install: clean
	pip install .

dev:
	uvicorn src.whombat.app:app --reload --port $(WHOMBAT_BACKEND_DEV_PORT)
