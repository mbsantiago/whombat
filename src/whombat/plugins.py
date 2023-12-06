"""Functions to load plugin modules."""

import importlib
import pkgutil
import warnings
from types import ModuleType
from typing import Generator

from fastapi import APIRouter, FastAPI
from fastapi.staticfiles import StaticFiles

__all__ = [
    "load_plugins",
    "add_plugin_routes",
    "get_plugin_page_url",
    "plugin_has_pages",
    "add_plugin_pages",
]


def load_plugins() -> Generator[tuple[str, ModuleType], None, None]:
    """Load all plugins in the plugins directory.

    Will load all modules in the python path that start with 'whombat_'.

    Returns
    -------
    dict[str, ModuleType]
        A dictionary mapping plugin names to plugin modules.
    """
    for _, name, _ in pkgutil.iter_modules():
        if not name.startswith("whombat_"):
            continue

        module = importlib.import_module(name)

        if not hasattr(module, "__description__"):
            warnings.warn(f"Plugin {name} has no __description__ attribute.")
            continue

        if not hasattr(module, "__version__"):
            warnings.warn(f"Plugin {name} has no __version__ attribute.")

        yield name[8:], module


def add_plugin_routes(app: FastAPI, name: str, plugin: ModuleType) -> None:
    """Add a plugin's route to the app.

    Parameters
    ----------
    app : FastAPI
        The base app to add the plugin's route to.
    name : str
        The name of the plugin.
    plugin : ModuleType
        The plugin module.

    Notes
    -----
    The plugin module must have a `router` attribute that is an
    `APIRouter` instance. If this attribute is not present, or is not
    an `APIRouter` instance, the plugin's routes will not be added.
    """
    if not hasattr(plugin.module, "router") or not isinstance(
        plugin.module.router, APIRouter
    ):
        return
    app.include_router(plugin.module.router, prefix=f"/plugins/routes/{name}")


def get_plugin_page_url(name: str) -> str:
    """Get the URL of a plugin's page.

    Parameters
    ----------
    name : str
        The name of the plugin.

    Returns
    -------
    str
        The URL of the plugin's page.
    """
    return f"/plugins/pages/{name}/"


def plugin_has_pages(plugin: ModuleType) -> bool:
    """Check if a plugin has pages.

    Parameters
    ----------
    plugin : ModuleType
        The plugin module.

    Returns
    -------
    bool
        True if the plugin has pages, False otherwise.

    Notes
    -----
    The plugin module must have a `has_pages` attribute that is `True`.
    If this is the case it is assumed that the plugin has a `statics`
    directory that contains the plugin's pages.
    """
    return getattr(plugin.module, "has_pages", False)


def add_plugin_pages(app: FastAPI, name: str, plugin: ModuleType) -> None:
    """Add a plugin's pages to the app.

    Parameters
    ----------
    app : FastAPI
        The base app to add the plugin's pages to.
    name : str
        The name of the plugin.
    plugin : ModuleType
        The plugin module.

    Notes
    -----
    The plugin module must have a `has_pages` attribute that is `True`.
    If this is the case it is assumed that the plugin has a `statics`
    directory that contains the plugin's pages. This directory is
    mounted to the app's static files.
    """
    if not plugin_has_pages(plugin):
        return

    app.mount(
        get_plugin_page_url(name),
        StaticFiles(packages=[name], html=True),
        name=f"{name}",
    )
