"""REST API routes for plugin discover."""

from fastapi import APIRouter

from whombat import plugins, schemas

__all__ = [
    "plugin_router",
]

plugin_router = APIRouter()


@plugin_router.get(
    "/list/",
    response_model=list[schemas.PluginInfo],
)
async def list_plugins():
    """List all plugins."""
    plugin_list = []
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
