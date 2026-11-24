"""Tests for the plugin loading helpers."""

import pkgutil
import sys
from types import ModuleType

from fastapi import APIRouter, FastAPI

from whombat import plugins
from whombat.system import create_app
from whombat.system.settings import Settings


def make_plugin(**attributes) -> ModuleType:
    """Create a fake plugin module."""
    module = ModuleType("whombat_testplugin")
    module.__dict__["__version__"] = "0.1.0"
    module.__dict__["__description__"] = "A test plugin."
    for name, value in attributes.items():
        setattr(module, name, value)
    return module


def test_add_plugin_routes_mounts_router():
    router = APIRouter()

    @router.get("/hello/")
    async def hello():
        return "hi"

    app = FastAPI()
    plugins.add_plugin_routes(app, "testplugin", make_plugin(router=router))

    paths = {getattr(route, "path", "") for route in app.routes}
    assert "/plugins/routes/testplugin/hello/" in paths


def test_add_plugin_routes_ignores_plugin_without_router():
    app = FastAPI()
    plugins.add_plugin_routes(app, "testplugin", make_plugin())
    assert not any(
        "/plugins/routes" in getattr(route, "path", "") for route in app.routes
    )


def test_add_plugin_routes_ignores_non_router_attribute():
    app = FastAPI()
    plugins.add_plugin_routes(
        app, "testplugin", make_plugin(router="not a router")
    )
    assert not any(
        "/plugins/routes" in getattr(route, "path", "") for route in app.routes
    )


def test_plugin_has_pages_without_attribute():
    assert plugins.plugin_has_pages(make_plugin()) is False


def test_plugin_has_pages_with_attribute():
    assert plugins.plugin_has_pages(make_plugin(has_pages=True)) is True


def test_load_plugins_skips_unimportable_module(monkeypatch):
    monkeypatch.setattr(
        pkgutil,
        "iter_modules",
        lambda: [(None, "whombat_does_not_exist", False)],
    )
    assert list(plugins.load_plugins()) == []


def _install_plugin(tmp_path, monkeypatch, source: str) -> None:
    package_dir = tmp_path / "whombat_brokenplugin"
    package_dir.mkdir()
    (package_dir / "__init__.py").write_text(source)
    monkeypatch.syspath_prepend(str(tmp_path))
    monkeypatch.delitem(sys.modules, "whombat_brokenplugin", raising=False)


async def test_app_starts_with_a_plugin_that_has_no_router(
    settings: Settings, monkeypatch, tmp_path
):
    _install_plugin(
        tmp_path,
        monkeypatch,
        '__description__ = "Broken"\n__version__ = "0.0.1"\n',
    )

    assert create_app(settings) is not None


async def test_app_starts_with_a_plugin_that_fails_to_import(
    settings: Settings, monkeypatch, tmp_path
):
    _install_plugin(
        tmp_path,
        monkeypatch,
        '__description__ = "Broken"\n__version__ = "0.0.1"\n'
        'raise RuntimeError("boom")\n',
    )

    assert create_app(settings) is not None
