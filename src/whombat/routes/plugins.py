"""REST API routes for plugin discover."""
from fastapi import APIRouter

from whombat import plugins, schemas

__all__ = [
    "plugin_router",
]

plugin_router = APIRouter()


EXAMPLE_PLUGIN_INFO = schemas.PluginInfo(
    name="Example",
    version="0.1.0",
    description="Example plugin. This plugin is used to demonstrate how to create a plugin for Whombat.",
    thumbnail="https://via.placeholder.com/150",
    attribution="mbsantiago",
    url=plugins.get_plugin_page_url("example"),
)

BIRDNET_PLUGIN = schemas.PluginInfo(
    name="BirdNET",
    version="0.1.0",
    description="Run BirdNet on your recordings and explore the predictions.",
    thumbnail="https://via.placeholder.com/150",
    attribution="birdnet",
    url=plugins.get_plugin_page_url("birdnet"),
)


@plugin_router.get(
    "/list/",
    response_model=list[schemas.PluginInfo],
)
async def list_plugins():
    """List all plugins."""
    plugin_list = [
        EXAMPLE_PLUGIN_INFO,
        BIRDNET_PLUGIN,
    ]
    for name, plugin in plugins.load_plugins():
        plugin_list.append(
            schemas.PluginInfo(
                name=name,
                version=plugin.__version__,
                description=getattr(plugin, "__description__", None),
                thumbnail=getattr(plugin, "__thumbnail__", None),
                attribution=getattr(plugin, "__attribution__", None),
                url=plugins.get_plugin_page_url(name),
            )
        )

    return plugin_list
