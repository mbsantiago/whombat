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

1. **Python 3.12**: Use Python 3.12 for local development. The backend configuration targets Python 3.12.
      Download Python [here](https://www.python.org/downloads/).

2. **uv**: We use `uv` to manage Python dependencies for the backend.
       Install it by following the official instructions [here](https://docs.astral.sh/uv/#highlights).

3. **Node.js**: We use Node.js to develop and bundle the frontend.
       Install it using your preferred version manager or from the official website: https://nodejs.org/

4. **just**: We use `just` to wrap the common development tasks for this repo.
       Install it by following the instructions [here](https://github.com/casey/just#installation).

### Set Up

After confirming that you have all the prerequisites ready, follow these steps to set up a development environment on your machine.

1. Clone the repository:

```bash
git clone https://github.com/mbsantiago/whombat.git
```

2. Navigate to the project directory and install the backend and frontend dependencies:

```bash
cd whombat
just install
```

These instructions ensure you have the necessary tools and dependencies to start local Whombat development.

### Running the Development Servers

- **Backend**: To initiate the backend server, run the following command from the project's root directory:

```bash
just dev-back
```

- **Frontend**: To start the frontend development server, run:

```bash
just dev-front
```

Once both servers are running, navigate to [http://localhost:3000](http://localhost:3000) in your web browser to access the Whombat development environment.

- **Storybook:**

  ```bash
  just storybook
  ```

  Access Storybook at http://localhost:6006.

- **Documentation Server:**

  ```bash
  just docs
  ```

  View the documentation at http://localhost:8000.

### Running Checks

From the repository root, run all main checks with:

```bash
just check
```

For backend-only checks, run:

```bash
cd back
just check
```

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
  just dev
  ```

  Access the Whombat development environment at http://localhost:3000

- **Storybook:**

  ```bash
  docker compose -f compose.dev.yaml up storybook
  ```

  Access Storybook at http://localhost:6006.

- **Documentation Server:**

  ```bash
  docker compose -f compose.dev.yaml up docs
  ```

  View the documentation at http://localhost:8000.

- **All Services:**
  ```bash
  docker compose -f compose.dev.yaml up
  ```
