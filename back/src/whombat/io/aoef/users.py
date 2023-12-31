import secrets
import uuid

from soundevent.io.aoef.user import UserObject
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import models
from whombat.api.users import generate_random_password_hash


async def import_users(
    session: AsyncSession,
    users: list[UserObject],
) -> dict[uuid.UUID, uuid.UUID]:
    """Import users from user objects in AOEF format.

    This function checks for existing users in the database and creates them if
    they don't already exist. The search is based on a comparison of the user
    objects' name and email fields. If a UUID clash occurs, the function
    assumes the user is the same and does not update the existing user.
    """
    if not users:
        return {}

    # Get all existing users from the database.
    # NOTE: May not be the most efficient way to do this, but we don't expect
    # to have a huge number of users so it should be fine.
    stmt = select(models.User)
    result = await session.execute(stmt)
    database_users = result.scalars().all()

    # Create a mapping of existing users by name and email.
    mappings = {
        "name": {user.name: user for user in database_users},
        "email": {user.email: user for user in database_users},
        "uuid": {user.id: user for user in database_users},
    }

    return_mapping = {}
    new_users = []
    for user in users:
        if user.uuid in mappings["uuid"]:
            return_mapping[user.uuid] = mappings["uuid"][user.uuid].id
            continue

        if user.email in mappings["email"]:
            return_mapping[user.uuid] = mappings["email"][user.email].id
            continue

        if user.name in mappings["name"]:
            return_mapping[user.uuid] = mappings["name"][user.name].id
            continue

        if not user.email:
            raise ValueError("User has no email address.")

        username = user.username or user.name
        if not username:
            # If the user has no username, generate a random one.
            username = secrets.token_hex(8)

        email = user.email
        if not email:
            # If the user has no email, generate a random one.
            email = f"{username}@whombat.com"

        db_user = models.User(
            id=user.uuid,
            username=username,
            name=user.name,
            email=email,
            hashed_password=generate_random_password_hash(session),
            is_active=False,
            is_superuser=False,
        )
        new_users.append(db_user)

    session.add_all(new_users)
    await session.flush()

    for user in new_users:
        return_mapping[user.id] = user.id

    return return_mapping
