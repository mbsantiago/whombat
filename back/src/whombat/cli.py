"""Console script for whombat."""
import sys

import click


@click.command()
def main(args=None):
    """Console script for whombat."""
    click.echo(str(args))
    return 0


if __name__ == "__main__":
    sys.exit(main())  # pragma: no cover
