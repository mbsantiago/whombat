"""Parameters shared by Whombat CLI commands."""

from dataclasses import dataclass
from functools import cached_property
from pathlib import Path

from cyclopts import Parameter

from whombat.system import get_settings
from whombat.system.settings import Settings, load_settings_from_path


@Parameter(name="*")
@dataclass
class Common:
    """Shared command-line configuration."""

    config_path: Path | None = None
    """Use settings from this Whombat JSON file for the command."""

    @cached_property
    def settings(self) -> Settings:
        """Load settings selected for this command."""
        if self.config_path is not None:
            return load_settings_from_path(self.config_path)
        return get_settings()
