import asyncio

import pytest
import uvicorn

from whombat.system import create_app
from whombat.system.settings import Settings


async def test_can_instantiate_app(test_settings: Settings):
    app = create_app(test_settings)
    config = uvicorn.Config(
        app,
        host=test_settings.host,
        port=test_settings.port,
        log_level=test_settings.log_level,
        reload=False,
    )
    server = uvicorn.Server(config)

    with pytest.raises(TimeoutError):
        async with asyncio.timeout(5):
            await server.serve()
            assert server.started
