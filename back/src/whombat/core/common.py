"""Common functions for Whombat."""

from collections.abc import Callable
from typing import Hashable, TypeVar

A = TypeVar("A")


__all__ = [
    "remove_duplicates",
]


def remove_duplicates(
    objects: list[A],
    key: Callable[[A], Hashable] = lambda x: x,
) -> list[A]:
    """Remove duplicates from a list of objects.

    This functions removes duplicates from a list of objects, using a
    key function to determine whether two objects are equal. The key
    function defaults to the identity function, so the objects
    themselves are used as keys. The order of the objects is preserved.

    It is possible to provide a custom key function, which should take
    an object and return a hashable value. The key function should
    return the same value for two objects that are considered equal.

    Parameters
    ----------
    objects : list[A]
        The list of objects to remove duplicates from.
    key : Callable[[A], Hashable], optional
        The function to use to get the key of each object, by default
        the identity function.

    Returns
    -------
    list[A]
        The list of objects without duplicates.
    """
    seen = set()
    ret = []
    for obj in objects:
        obj_key = key(obj)
        if obj_key not in seen:
            ret.append(obj)
            seen.add(obj_key)
    return ret
