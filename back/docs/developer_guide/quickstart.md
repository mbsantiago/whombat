# Quickstart

While developing, it's often helpful to run development servers that host different parts of the application, or provide specific views, such as the UI components or documentation.

These development servers include:

- **FastAPI Backend Server**: Hosts the Python API.
- **Next.js Frontend Server**: Builds and serves the user interface.
- **Storybook Server**: Allows you to browse and visually inspect all UI components.
- **MkDocs Server**: Renders and serves the project documentation.

This guide will show you how to start these servers, allowing you to see how your code changes are reflected in the app in real time.

This guide provides two ways to set up your _Whombat_ development environment:

**Manual Setup**: Ideal if you prefer direct control over your development environment and are comfortable managing dependencies.

**Docker Compose**: Streamlines setup and provides a consistent environment.

## Option 1: Manual Setup

### Pre-requisites

Before setting up your Whombat development environment, ensure you have the following tools installed:

1. **Python 3.12**: We developed Whombat using this version, but any version greater or equal to 3.11 should be compatible.
      Download Python 3.12 [here](https://www.python.org/downloads/release/python-3117/).

2. **uv**: UV is a Python package dependency manager that we use to manage dependencies for the Python part of Whombat.
      Download uv [uv](https://docs.astral.sh/uv/#highlights).

3. **Node.js**: We use Node.js to develop and bundle the final JavaScript code for the Whombat frontend.
      Download the latest version [here](https://nodejs.org/dist/v20.11.0/node-v20.11.0-linux-x64.tar.xz).

### Set Up

After confirming that you have all the prerequisites ready, follow these steps to set up a development environment on your machine.

1. Clone the repository:

```bash
git clone https://github.com/mbsantiago/whombat.git
```

2. Navigate to the backend directory and install dependencies:

```bash
cd whombat/back
uv sync --dev
```

3. Move to the frontend directory and install all dependencies:

```bash
cd ../front
npm install
```

These instructions ensure you have the necessary tools and dependencies to kickstart Whombat development on your local machine.

### Running the Development Servers

- **Backend**: To initiate the backend server, run the following command from the project's root directory:

```bash
make serve-back
```

- **Frontend**: To start the frontend development server, run:

```bash
make serve-front
```

Once both servers are running, navigate to [http://localhost:3000](http://localhost:3000) in your web browser to access the Whombat development environment.

- **Storybook:**

  ```bash
  make storybook
  ```

  Access Storybook at http://localhost:6006.

- **Documentation Server:**

  ```bash
  make dev-docs
  ```

  View the documentation at http://localhost:8000.

## Option 2: Docker Compose

### Pre-requisites

- **Docker** and **Docker Compose**: Install them by following the instructions for your operating system on the official Docker [website](https://docs.docker.com/compose/install/).

### Set Up

Once you have Docker Compose installed, follow these steps:

1. Clone the Repository

```bash
git clone https://github.com/mbsantiago/whombat.git
```

2. Navigate to the Project Directory

```bash
cd whombat
```

### Run Services

- **Backend and Frontend:**

  ```bash
  docker-compose -f compose.dev.yaml up backend frontend
  ```

  Access the Whombat development environment at http://localhost:3000

- **Storybook:**

  ```bash
  docker-compose -f compose.dev.yaml up storybook
  ```

  Access Storybook at http://localhost:6006.

- **Documentation Server:**

  ```bash
  docker-compose -f compose.dev.yaml up docs
  ```

  View the documentation at http://localhost:8000.

- **All Services:**
  ```bash
  docker-compose -f compose.dev.yaml up
  ```
