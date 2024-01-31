"""Cache functions."""

from contextlib import AbstractContextManager
from functools import wraps
from typing import (
    Any,
    Awaitable,
    Callable,
    Generic,
    Hashable,
    MutableMapping,
    ParamSpec,
    TypeVar,
)

from asyncache import cached as _cached
from cachetools import keys
from pydantic import BaseModel

__all__ = [
    "cached",
    "clear_cache",
    "clear_all_caches",
    "get_cache",
    "clear_cache_key",
    "update_cache_key",
    "CacheCollection",
]


_T = TypeVar("_T")

CACHES: dict[str, MutableMapping[Hashable, Any]] = {}
"""Store all caches used by the application."""


def cached(
    name: str,
    cache: MutableMapping[Hashable, Any] | None = None,
    key: Callable[..., Hashable] = keys.hashkey,
    lock: AbstractContextManager[Any] | None = None,
) -> Callable[[_T], _T]:
    """Decorate a function to cache its return value.

    Parameters
    ----------
    name : str
        The name of the cache.

    cache : MutableMapping[Hashable, Any], optional
        The cache to use. If None and a cache with the given name
        exists, that cache will be used. Otherwise, a new cache will
        be created.

    key : Callable[..., Hashable], optional
        The function to use to generate the cache key.

    lock : AbstractContextManager[Any], optional
        The lock to use to synchronize access to the cache.

    Returns
    -------
    Callable[[_T], _T]
        The decorator function.

    """
    if cache is not None and name in CACHES:
        raise ValueError(f"Cache {name} already exists.")

    if cache is None:
        cache = CACHES.get(name)

    if cache is None:
        cache = {}

    CACHES[name] = cache

    def decorator(func):
        return _cached(cache=cache, key=key, lock=lock)(func)

    return decorator


def clear_cache(name: str) -> None:
    """Clear a cache."""
    if name not in CACHES:
        raise ValueError(f"Cache {name} does not exist.")

    CACHES[name].clear()


def clear_all_caches() -> None:
    """Clear all caches."""
    for cache in CACHES.values():
        cache.clear()


def get_cache(name: str) -> MutableMapping[Hashable, Any]:
    """Get a cache by name."""
    return CACHES[name]


def clear_cache_key(name: str, key: Hashable) -> None:
    """Clear a cache key."""
    cache = get_cache(name)
    if key in cache:
        del cache[key]


def update_cache_key(name: str, key: Hashable, value: Any) -> None:
    """Update a cache key."""
    cache = get_cache(name)
    cache[key] = value


M = TypeVar("M", bound=BaseModel)
P = ParamSpec("P")
Func = Callable[P, Awaitable[M]]


class CacheCollection(Generic[M]):
    """Collection of caches.

    Use this class to manage a collection of hashes that are meant
    to store objects of the same type. This will ensure that the
    caches are updated and cleared when the objects are updated and
    deleted.
    """

    def __init__(self, model: type[M]):
        """Initialize the cache collection."""
        self.model = model
        self.caches: list[tuple[str, Callable[[M], Hashable]]] = []

    def cached(
        self,
        name: str,
        cache: MutableMapping[Hashable, Any] | None = None,
        key: Callable[..., Hashable] = keys.hashkey,
        lock: AbstractContextManager[Any] | None = None,
        data_key: Callable[[M], Hashable] = lambda x: hash(x),
    ):
        """Decorate a function to cache its return value."""

        def decorator(func):
            return cached(name=name, cache=cache, key=key, lock=lock)(func)

        # Store in the cache collection
        self.caches.append((name, data_key))
        return decorator

    def with_update(self, func: Func[P, M]) -> Func[P, M]:
        """Decorate a function to update the cache."""

        @wraps(func)
        async def wrapper(*args: P.args, **kwargs: P.kwargs):
            # Call the function
            data = await func(*args, **kwargs)

            # Update the cache
            self.update_object(data)

            return data

        return wrapper  # type: ignore

    def with_clear(self, func: Func[P, M]) -> Func[P, M]:
        """Decorate a function to clear the cache."""

        @wraps(func)
        async def wrapper(*args: P.args, **kwargs: P.kwargs):
            # Call the function
            data = await func(*args, **kwargs)

            # Clear the cache
            self.clear_object(data)

            return data

        return wrapper  # type: ignore

    def clear_object(self, data: M) -> None:
        """Clear the cache for an object."""
        for name, data_key in self.caches:
            clear_cache_key(name, data_key(data))

    def update_object(self, data: M) -> None:
        """Update the cache for an object."""
        for name, data_key in self.caches:
            update_cache_key(name, data_key(data), data)
