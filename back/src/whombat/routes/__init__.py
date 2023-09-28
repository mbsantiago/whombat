"""Whombat REST API routes."""
from fastapi import APIRouter

from whombat.routes.annotation_projects import annotation_projects_router
from whombat.routes.annotations import annotations_router
from whombat.routes.audio import audio_router
from whombat.routes.auth import auth_router
from whombat.routes.clips import clips_router
from whombat.routes.datasets import dataset_router
from whombat.routes.evaluation_sets import evaluation_sets_router
from whombat.routes.evaluation_tasks import evaluation_tasks_router
from whombat.routes.notes import notes_router
from whombat.routes.prediction_runs import prediction_runs_router
from whombat.routes.recordings import recording_router
from whombat.routes.sound_events import sound_events_router
from whombat.routes.spectrograms import spectrograms_router
from whombat.routes.tags import tags_router
from whombat.routes.tasks import tasks_router
from whombat.routes.users import users_router

__all__ = [
    "main_router",
]

main_router = APIRouter(
    prefix="/api/v1",
)
main_router.include_router(
    auth_router,
    prefix="/auth",
    tags=["auth"],
)
main_router.include_router(
    users_router,
    prefix="/users",
    tags=["users"],
)
main_router.include_router(
    tags_router,
    prefix="/tags",
    tags=["tags"],
)
main_router.include_router(
    dataset_router,
    prefix="/datasets",
    tags=["datasets"],
)
main_router.include_router(
    recording_router,
    prefix="/recordings",
    tags=["recordings"],
)
main_router.include_router(
    annotation_projects_router,
    prefix="/annotation_projects",
    tags=["annotation_projects"],
)
main_router.include_router(
    tasks_router,
    prefix="/tasks",
    tags=["tasks"],
)
main_router.include_router(
    clips_router,
    prefix="/clips",
    tags=["clips"],
)
main_router.include_router(
    spectrograms_router,
    prefix="/spectrograms",
    tags=["spectrograms"],
)
main_router.include_router(
    notes_router,
    prefix="/notes",
    tags=["notes"],
)
main_router.include_router(
    audio_router,
    prefix="/audio",
    tags=["audio"],
)
main_router.include_router(
    sound_events_router,
    prefix="/sound_events",
    tags=["sound_events"],
)
main_router.include_router(
    annotations_router,
    prefix="/annotations",
    tags=["annotations"],
)
main_router.include_router(
    evaluation_sets_router,
    prefix="/evaluation_sets",
    tags=["evaluation_sets"],
)
main_router.include_router(
    evaluation_tasks_router,
    prefix="/evaluation_tasks",
    tags=["evaluation_tasks"],
)
main_router.include_router(
    prediction_runs_router,
    prefix="/prediction_runs",
    tags=["prediction_runs"],
)
