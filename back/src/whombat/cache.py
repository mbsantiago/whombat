"""Cache functions."""
from contextlib import AbstractContextManager
from typing import Any, Callable, Hashable, MutableMapping, TypeVar

from asyncache import cached as _cached
from cachetools import keys

__all__ = [
    "cached",
    "clear_cache",
    "clear_all_caches",
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
