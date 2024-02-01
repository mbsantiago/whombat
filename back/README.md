# Whombat - Python Backend

**whombat** is an open-source web-based audio annotation tool designed to
facilitate audio data labeling and annotation, with a special focus on aiding
machine learning model development.

For additional details on installing the entire application and its usage, refer
to the main [README](https://github.com/mbsantiago/whombat).

For the latest updates and detailed documentation, check out the official
[documentation](https://mbsantiago.github.io/whombat/).

## Installation

### With Pip

The most straightforward method to set up the backend and Whombat Python API is
using pip. Execute the following command:

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
cd whombat/backend
pip install .
```

### With Docker

Run Whombat inside a Docker container. Build the container by cloning the repository and executing:


```bash
git clone https://github.com/mbsantiago/whombat.git
docker build -t whombat .
```

Once the build is complete, run the container with:

```bash
docker run -p 5000:5000 whombat
```

### Development Environment

We manage Whombat's development with `pdm`. 

1. Follow the official [installation instructions](https://pdm-project.org/latest/#installation) to get `pdm` on your machine.

2. Clone the repository:

```bash
git clone https://github.com/mbsantiago/whombat.git
```

3. Navigate to the backend directory and install dependencies:

```bash
cd whombat/back
pdm install --dev
```

4. Start the development server:

```bash
pdm run make serve-dev
```

or

```bash
WHOMBAT_DEV=true pdm run python -m whombat
```
