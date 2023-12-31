"""Common API functions."""

from whombat.api.common.base import BaseAPI
from whombat.api.common.utils import (
    add_feature_to_object,
    add_note_to_object,
    add_tag_to_object,
    create_object,
    create_objects,
    create_objects_without_duplicates,
    delete_object,
    get_count,
    get_object,
    get_objects,
    get_objects_from_query,
    get_or_create_object,
    remove_feature_from_object,
    remove_note_from_object,
    remove_tag_from_object,
    update_feature_on_object,
    update_object,
)

__all__ = [
    "BaseAPI",
    "add_feature_to_object",
    "add_note_to_object",
    "add_tag_to_object",
    "create_object",
    "create_objects",
    "create_objects_without_duplicates",
    "delete_object",
    "get_count",
    "get_object",
    "get_objects",
    "get_objects_from_query",
    "get_or_create_object",
    "remove_feature_from_object",
    "remove_note_from_object",
    "remove_tag_from_object",
    "update_feature_on_object",
    "update_object",
]
