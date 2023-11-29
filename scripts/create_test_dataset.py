import asyncio
import logging
from pathlib import Path

from whombat import api, schemas

logging.getLogger("aiosqlite").setLevel(logging.WARNING)
logging.getLogger("whombat.api.recordings").setLevel(logging.DEBUG)
logging.getLogger("whombat.api.datasets").setLevel(logging.DEBUG)
logging.getLogger("whombat.api.common").setLevel(logging.DEBUG)
logging.getLogger("whombat.core.files").setLevel(logging.DEBUG)
logging.basicConfig(level=logging.DEBUG)

name = "Animal Sound Archive"
description = """
The Animal Sound Archive at the Museum für Naturkunde Berlin is one of the
oldest and most comprehensive collection of animal sound recordings in the
world. It comprises approximately 120,000 sound recordings including 1,800 bird
species, 580 mammal species and numerous fish, amphibian, reptile and insect
species. One third of the recordings were made in the natural habitat, while
two thirds were made in zoos or under experimental conditions. The recordings
from natural habitats originate primarily from Central and Eastern Europe. Over
time, original recordings from all continents have become part of the archive.

The collection is growing continuously, not least thanks to the support of
enthusiastic collectors of animal sounds who readily make their recordings
available to us. Our work at the Animal Sound Archive focuses on making the
collection available for scientific purposes as well as to the interested
public. We are also preserving the sound material in a permanent digital
database that is freely accessible. Parts of the collection have been processed
for educational purposes and are available on the Schools Portal.
"""
audio_dir = Path("/home/santiago/Datasets/Bats/Animal Sound Archive")
db_url = "sqlite+aiosqlite:///whombat.db"


async def main():
    async with api.sessions.create(db_url=db_url) as session:
        await api.datasets.create(
            session,
            schemas.DatasetCreate(
                name=name,
                description=description,
                audio_dir=audio_dir,
            ),
        )
        await session.commit()
        print("Done")


if __name__ == "__main__":
    asyncio.run(main())
