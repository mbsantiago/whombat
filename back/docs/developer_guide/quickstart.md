# Quickstart

## Pre-requisites

Before setting up your Whombat development environment, ensure you have the
following tools installed:

1. **Python 3.11**: We developed Whombat using this version, but any newer
   version should be compatible. Download Python 3.11
   [here](https://www.python.org/downloads/release/python-3117/).

2. **PDM**: PDM is a Python package dependency manager that we use to manage
   dependencies for the Python part of Whombat. Download PDM
   [here](https://pdm-project.org/latest/#installation).

3. **Node.js**: We use Node.js to develop and bundle the final JavaScript code
   for the Whombat frontend. Download the latest version
   [here](https://nodejs.org/dist/v20.11.0/node-v20.11.0-linux-x64.tar.xz).

## Set Up a Development Environment

After confirming that you have all the prerequisites ready, follow these steps
to set up a development environment on your machine.

1. Clone the repository:

```bash
git clone https://github.com/mbsantiago/whombat.git
```

2. Navigate to the backend directory and install dependencies:

```bash
cd whombat/back
pdm install --dev
```

3. Move to the frontend directory and install all dependencies:

```bash
cd ../front
npm install
```

These instructions ensure you have the necessary tools and dependencies to
kickstart Whombat development on your local machine.

## Running the Development Server

Once installed, you can start the backend server by navigating to the `back`
directory and running:

```bash
pdm run make serve-dev
```

You can also start the frontend development server by navigating to the `front`
directory and running:

```bash
npm run dev
```

These commands initiate the development servers for both the backend and
frontend components of Whombat. Navigate to [localhost:3000](localhost:3000) to
access the development front end.

## Our Standards

At Whombat, we emphasize code quality and employ various tools to streamline
development.

### Code Formatting

We follow the black style for Python to maintain consistent formatting
throughout the project. Additionally, we use isort to organize imports neatly.
For the Typescript project, prettier serves as the primary code formatter.

### Linting

We utilize the following tools for linting and error checking:

1. Python:
       - **Ruff** for fast overall error checking
       - **Pyright** for type checking

2. Typescript:
       - **Eslint** for linting
       - **Tsc** for checking Typescript code

### Documentation

We adhere to the Numpy docstring format for documenting Python code. Our
documentation is built using mkdocs, providing a clear and organized structure
for users and contributors.
