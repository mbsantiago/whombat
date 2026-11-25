"""Test the Annotation Project endpoints."""

import json
from io import BytesIO
from pathlib import Path

from fastapi.testclient import TestClient
from soundevent import data
from soundevent.io import aoef

from whombat import schemas


class TestExportAnnotationProject:
    def test_exported_paths_are_relative(
        self,
        client: TestClient,
        annotation_project: schemas.AnnotationProject,
        audio_dir: Path,
        clip: schemas.Clip,
        cookies: dict[str, str],
    ):
        # Create annotation task
        response = client.post(
            "/api/v1/annotation_tasks/",
            params={"annotation_project_uuid": str(annotation_project.uuid)},
            json=[str(clip.uuid)],
            cookies=cookies,
        )
        assert response.status_code == 200

        response = client.patch(
            "/api/v1/annotation_projects/detail/",
            params={"annotation_project_uuid": str(annotation_project.uuid)},
            json={"name": "Sentry – novembro"},
            cookies=cookies,
        )
        assert response.status_code == 200

        # Download
        response = client.get(
            "/api/v1/annotation_projects/detail/download/",
            params={
                "annotation_project_uuid": str(annotation_project.uuid),
            },
            cookies=cookies,
        )

        assert response.status_code == 200
        assert response.headers["content-disposition"].startswith(
            "attachment; filename*=UTF-8''Sentry%20%E2%80%93%20novembro_"
        )

        content = aoef.AOEFObject.model_validate(response.json())

        assert content.data.recordings
        assert len(content.data.recordings) == 1

        recording = content.data.recordings[0]
        assert not recording.path.is_absolute()
        assert (audio_dir / recording.path).exists()

    def test_can_export_annotation_project(
        self,
        client: TestClient,
        cookies: dict[str, str],
        annotation_project: schemas.AnnotationProject,
        dataset_recording: schemas.Recording,
    ):
        # Create a clip using the dataset recording which is not in the root
        # audio dir
        response = client.post(
            "/api/v1/clips/",
            json=[
                [
                    str(dataset_recording.uuid),
                    schemas.ClipCreate(start_time=0, end_time=1).model_dump(
                        mode="json"
                    ),
                ]
            ],
            cookies=cookies,
        )
        assert response.status_code == 200
        clip_uuid = response.json()[0]["uuid"]

        # Create annotation task
        response = client.post(
            "/api/v1/annotation_tasks/",
            params={"annotation_project_uuid": str(annotation_project.uuid)},
            json=[str(clip_uuid)],
            cookies=cookies,
        )
        assert response.status_code == 200

        # Download
        response = client.get(
            "/api/v1/annotation_projects/detail/download/",
            params={
                "annotation_project_uuid": str(annotation_project.uuid),
            },
            cookies=cookies,
        )
        assert response.status_code == 200


class TestAnnotationProjectImport:
    def test_can_import_annotation_project(
        self,
        client: TestClient,
        cookies: dict[str, str],
        recording: schemas.Recording,
    ) -> None:
        rec = data.Recording.model_validate(recording.model_dump())
        clip = data.Clip(
            recording=rec,
            start_time=0,
            end_time=1,
        )

        sound_event1 = data.SoundEventAnnotation(
            sound_event=data.SoundEvent(
                geometry=data.Polygon(
                    coordinates=[
                        [
                            [0.0, 0.0],
                            [0.0, 1.0],
                            [1.0, 1.0],
                            [1.0, 0.0],
                        ]
                    ]
                ),
                recording=rec,
            ),
            tags=[
                data.Tag(key="species", value="Myotis myotis"),
                data.Tag(key="sex", value="Male"),
            ],
        )

        clip_annotation = data.ClipAnnotation(
            clip=clip,
            tags=[data.Tag(key="test_key", value="test_value")],
            sound_events=[sound_event1],
        )

        task = data.AnnotationTask(clip=clip)

        project = data.AnnotationProject(
            name="test_project",
            description="test_description",
            tasks=[task],
            clip_annotations=[clip_annotation],
            annotation_tags=[
                data.Tag(key="species", value="Myotis myotis"),
                data.Tag(key="sex", value="Male"),
            ],
        )

        file = BytesIO()
        file.write(aoef.to_aeof(project).model_dump_json().encode("utf-8"))

        response = client.post(
            "/api/v1/annotation_projects/import/",
            files={"annotation_project": file},
            cookies=cookies,
        )
        assert response.status_code == 200

    def test_fails_with_invalid_aoef_format(
        self,
        client: TestClient,
        cookies: dict[str, str],
    ):
        file = BytesIO()
        file.write(json.dumps({}).encode("utf-8"))

        response = client.post(
            "/api/v1/annotation_projects/import/",
            files={"annotation_project": file},
            cookies=cookies,
        )
        assert response.status_code == 400
        assert (
            "Expected a JSON file in AOEF format" in response.json()["message"]
        )

    def test_fails_when_aoef_collection_type_is_mismatched(
        self,
        client: TestClient,
        cookies: dict[str, str],
    ):
        dataset = data.Dataset(
            name="test_dataset",
            description="test_description",
            recordings=[
                data.Recording(
                    path=Path("test.wav"),
                    duration=1,
                    samplerate=22050,
                    channels=1,
                    hash="test_hash",
                )
            ],
        )

        file = BytesIO()
        file.write(aoef.to_aeof(dataset).model_dump_json().encode("utf-8"))

        response = client.post(
            "/api/v1/annotation_projects/import/",
            files={"annotation_project": file},
            cookies=cookies,
        )
        assert response.status_code == 400
        assert "Detected object type: 'dataset'" in response.json()["message"]

    def test_fails_if_duplicated_tasks_are_present(
        self,
        client: TestClient,
        cookies: dict[str, str],
        recording: schemas.Recording,
    ) -> None:
        rec = data.Recording.model_validate(recording.model_dump())
        clip = data.Clip(
            recording=rec,
            start_time=0,
            end_time=1,
        )

        task = data.AnnotationTask(clip=clip)

        project = data.AnnotationProject(
            name="test_project",
            description="test_description",
            tasks=[task, task],
        )

        file = BytesIO()
        file.write(aoef.to_aeof(project).model_dump_json().encode("utf-8"))

        response = client.post(
            "/api/v1/annotation_projects/import/",
            files={"annotation_project": file},
            cookies=cookies,
        )
        assert response.status_code == 409
        assert "Duplicated tasks" in response.json()["message"]
