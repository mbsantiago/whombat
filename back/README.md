# Whombat - Python Backend

**whombat** is an open-source web-based audio annotation tool designed to facilitate audio data labeling and annotation, with a special focus on aiding machine learning model development.

For additional details on installing the entire application and its usage, refer to the main [README](https://github.com/mbsantiago/whombat).

For the latest updates and detailed documentation, check out the official [documentation](https://mbsantiago.github.io/whombat/).

## Installation

### With Pip

The most straightforward method to set up the backend and Whombat Python API is using pip.
Execute the following command:

```bash
pip install whombat
```

### From Source Code

Clone the repository:

```bash
git clone https://github.com/mbsantiago/whombat.git
```

Install the package:

```bash
cd whombat/back
pip install .
```

If you want to contribute to the backend rather than only install the package,
use the development environment instructions below.

### With Docker

Run Whombat inside a Docker container.
Build the container by cloning the repository and executing:

```bash
git clone https://github.com/mbsantiago/whombat.git
docker build -t whombat .
```

Once the build is complete, run the container with persistent database and
audio directories mounted from the host:

```bash
docker run -p 5000:5000 \\
  -v "$PWD/whombat-data:/data" \\
  -v "$PWD/whombat-audio:/audio" \\
  whombat
```

The container runs as the non-root `app` user. The host directories mounted at
`/data` and `/audio` must be writable by that user. Docker does not change the
ownership or permissions of mounted files automatically.

Find the `app` user's numeric user and group IDs with:

```bash
docker run --rm --entrypoint id whombat app
```

Create the host directories and set their ownership to those IDs. For example,
if the command reports `uid=999(app) gid=999(app)`:

```bash
mkdir -p whombat-data whombat-audio
sudo chown -R 999:999 whombat-data whombat-audio
```

Replace `999:999` with the IDs reported by your image. This changes ownership
of those host directories and everything inside them. The files remain in
place, but your host account may lose access unless it has permission through
a group or other access rule. Choose directories dedicated to Whombat and check
their ownership before running `chown`.

### Development Environment

Backend development uses `uv` for dependency management and `just` for common
tasks.

1. Follow the official [installation instructions](https://docs.astral.sh/uv/#highlights) to get `uv` on your machine.

2. Install [`just`](https://github.com/casey/just#installation) to use the local task runner.

3. Clone the repository:

```bash
git clone https://github.com/mbsantiago/whombat.git
```

4. Navigate to the backend directory and install dependencies:

```bash
cd whombat/back
uv sync --all-extras --dev --locked
```

5. Start the development server:

```bash
just serve
```

Common backend commands:

```bash
just check
just typecheck
just test
just docs
just guide
```

If you are working across both backend and frontend, use the repository root
workflows described in the main `README.md`.
