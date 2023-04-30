"""Module defining the Auth backends.

This module defines the authentication backends for the application. The
backends are used to authenticate users and provide them with a token to
access the API.

We have two backends, one for database authentication and one for JWT
authentication. The database backend is used to authenticate users with
their username and password. The JWT backend is used to authenticate users
with a JWT token.

The database backend uses a cookie to store the token. The JWT backend uses
a bearer token.

The database backend is meant to be used for the Whombat web application.
But the JWT backend can be used to access the Whombat API from other
applications.
"""
from fastapi import Depends
from fastapi_users.authentication import (
    AuthenticationBackend,
    BearerTransport,
    CookieTransport,
    JWTStrategy,
)
from fastapi_users.authentication.strategy.db import (
    AccessTokenDatabase,
    DatabaseStrategy,
)

from whombat.database import models
from whombat.routers.deps import get_access_token_db

__all__ = [
    "db_auth_backend",
    "token_auth_backend",
]


# TODO: Move this to a config file and make cryptographically secure
JWT_SECRET = "SECRET"


cookie_transport = CookieTransport(cookie_max_age=60 * 60 * 24)

bearer_transport = BearerTransport(tokenUrl="auth/jwt/login")


def get_database_strategy(
    access_token_db: AccessTokenDatabase[models.AccessToken] = Depends(
        get_access_token_db
    ),
) -> DatabaseStrategy:
    """Get the database strategy for the auth backend."""
    return DatabaseStrategy(access_token_db, lifetime_seconds=60 * 60 * 24)


def get_jwt_strategy() -> JWTStrategy:
    """Get the JWT strategy for the auth backend."""
    return JWTStrategy(secret=JWT_SECRET, lifetime_seconds=3600)


db_auth_backend = AuthenticationBackend(
    name="database",
    transport=cookie_transport,
    get_strategy=get_database_strategy,
)

token_auth_backend = AuthenticationBackend(
    name="jtk",
    transport=bearer_transport,
    get_strategy=get_jwt_strategy,
)
