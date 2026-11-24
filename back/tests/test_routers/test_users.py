"""Test the user endpoints."""

from types import SimpleNamespace
from typing import cast

from fastapi import FastAPI
from fastapi.testclient import TestClient
from fastapi_users import exceptions as fastapi_users_exceptions

from whombat.routes.dependencies.users import get_user_manager


def set_manager(client: TestClient, manager: object) -> None:
    async def override_manager():
        yield manager

    cast(FastAPI, client.app).dependency_overrides[get_user_manager] = (
        override_manager
    )


def manager_that_raises(error: Exception):
    async def create(*args, **kwargs):
        raise error

    return SimpleNamespace(
        user_db=SimpleNamespace(has_user=lambda: _no_users()),
        create=create,
    )


async def _no_users() -> bool:
    return False


def test_first_user_duplicate_is_conflict(client: TestClient):
    set_manager(
        client,
        manager_that_raises(fastapi_users_exceptions.UserAlreadyExists()),
    )

    response = client.post(
        "/api/v1/users/first/",
        json={
            "username": "test",
            "name": "Test",
            "email": "test@example.com",
            "password": "password1",
        },
    )

    assert response.status_code == 409


def test_first_user_invalid_password_returns_safe_validation_detail(
    client: TestClient,
):
    set_manager(
        client,
        manager_that_raises(
            fastapi_users_exceptions.InvalidPasswordException(
                reason="Password is too weak"
            )
        ),
    )

    response = client.post(
        "/api/v1/users/first/",
        json={
            "username": "test",
            "name": "Test",
            "email": "test@example.com",
            "password": "password1",
        },
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Password is too weak"


def test_first_user_unexpected_error_is_not_exposed(
    client: TestClient,
    caplog,
):
    set_manager(client, manager_that_raises(RuntimeError("database secret")))

    response = client.post(
        "/api/v1/users/first/",
        json={
            "username": "test",
            "name": "Test",
            "email": "test@example.com",
            "password": "password1",
        },
    )

    assert response.status_code == 500
    assert response.json()["detail"] == "Could not create account."
    assert "Unexpected first user creation failure" in caplog.text
    assert "database secret" not in response.text
