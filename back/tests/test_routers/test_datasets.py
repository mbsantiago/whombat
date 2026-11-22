import json
import shutil
from collections.abc import Callable
from io import BytesIO
from pathlib import Path, PurePosixPath, PureWindowsPath

from fastapi.testclient import TestClient
from soundevent import data
from soundevent.io import aoef

from whombat import schemas


class TestCreateDataset:
    def test_reports_dedup_counts(
        self,
        client: TestClient,
        audio_dir: Path,
        random_wav_factory: Callable[..., Path],
        cookies: dict[str, str],
    ):
        dataset_dir = audio_dir / "router_duplicates"
        dataset_dir.mkdir(parents=True)
        original = random_wav_factory(path=dataset_dir / "a.wav")
        shutil.copy(original, dataset_dir / "b.wav")

        response = client.post(
            "/api/v1/datasets/",
            json={
                "name": "router_duplicates",
                "audio_dir": str(dataset_dir),
            },
            cookies=cookies,
        )

        assert response.status_code == 200, response.text
        body = response.json()
        assert body["dataset"]["name"] == "router_duplicates"
        assert body["files_found"] == 2
        assert body["duplicates_in_selection"] == 1
        assert body["already_known"] == 0
        assert body["recordings_created"] == 1
        assert body["recordings_attached"] == 1


class TestExportDataset:
    def test_can_export_empty_dataset(
        self,
        client: TestClient,
        dataset: schemas.Dataset,
        cookies: dict[str, str],
    ):
        # Download
        response = client.get(
            "/api/v1/datasets/detail/download/json/",
            params={
                "dataset_uuid": str(dataset.uuid),
            },
            cookies=cookies,
        )
        assert response.status_code == 200
        content = aoef.AOEFObject.model_validate(response.json())
        assert content.data.collection_type == "dataset"

    def test_exported_paths_are_relative(
        self,
        client: TestClient,
        dataset: schemas.Dataset,
        dataset_dir: Path,
        dataset_recording: schemas.Recording,
        cookies: dict[str, str],
    ):
        # Download
        response = client.get(
            "/api/v1/datasets/detail/download/json/",
            params={
                "dataset_uuid": str(dataset.uuid),
            },
            cookies=cookies,
        )
        assert response.status_code == 200
        content = aoef.AOEFObject.model_validate(response.json())
        assert content.data.collection_type == "dataset"
        assert len(content.data.recordings) == 1
        assert content.data.recordings[0].uuid == dataset_recording.uuid

        recording = content.data.recordings[0]
        assert not recording.path.is_absolute()
        assert (dataset_dir / recording.path).exists()

    def test_can_import_dataset(
        self,
        client: TestClient,
        dataset_dir: Path,
        random_wav_factory: Callable[..., Path],
        cookies: dict[str, str],
    ):
        recording_path = random_wav_factory(dataset_dir / "test.wav")
        recording = data.Recording.from_file(recording_path)
        dataset = data.Dataset(
            name="test_dataset",
            description="test_description",
            recordings=[recording],
        )

        # Save to in memory file
        dataset_file = BytesIO(
            aoef.to_aeof(dataset).model_dump_json().encode("utf-8")
        )

        response = client.post(
            "/api/v1/datasets/import/",
            files={"dataset": dataset_file},
            data={"audio_dir": str(dataset_dir)},
            cookies=cookies,
        )
        assert response.status_code == 200

        response_data = response.json()
        assert response_data["name"] == "test_dataset"
        assert response_data["description"] == "test_description"
        assert response_data["recording_count"] == 1

        # Check the recording exists
        response = client.get(
            "/api/v1/recordings/detail/",
            params={
                "recording_uuid": str(recording.uuid),
            },
            cookies=cookies,
        )
        assert response.status_code == 200

    def test_can_import_dataset_with_windows_paths(
        self,
        client: TestClient,
        dataset_dir: Path,
        random_wav_factory: Callable[..., Path],
        cookies: dict[str, str],
    ):
        relative_path = Path("subdir") / "test.wav"
        recording_path = random_wav_factory(dataset_dir / relative_path)
        recording = data.Recording.from_file(recording_path)

        dataset = data.Dataset(
            name="test_dataset",
            description="test_description",
            recordings=[recording],
        )

        # Save to in memory file
        aoef_obj = aoef.to_aeof(dataset, audio_dir=dataset_dir).model_dump(
            mode="json"
        )

        aoef_obj["data"]["recordings"][0]["path"] = str(
            PureWindowsPath(relative_path)
        )

        dataset_file = BytesIO(json.dumps(aoef_obj).encode("utf-8"))

        response = client.post(
            "/api/v1/datasets/import/",
            files={"dataset": dataset_file},
            data={"audio_dir": str(dataset_dir)},
            cookies=cookies,
        )
        assert response.status_code == 200

        response_data = response.json()
        assert response_data["name"] == "test_dataset"
        assert response_data["description"] == "test_description"
        assert response_data["recording_count"] == 1

        # Check the recording exists
        response = client.get(
            "/api/v1/recordings/detail/",
            params={
                "recording_uuid": str(recording.uuid),
            },
            cookies=cookies,
        )
        assert response.status_code == 200

    def test_can_import_dataset_with_posix_paths(
        self,
        client: TestClient,
        dataset_dir: Path,
        random_wav_factory: Callable[..., Path],
        cookies: dict[str, str],
    ):
        relative_path = Path("subdir") / "test.wav"
        recording_path = random_wav_factory(dataset_dir / relative_path)
        recording = data.Recording.from_file(recording_path)

        dataset = data.Dataset(
            name="test_dataset",
            description="test_description",
            recordings=[recording],
        )

        # Save to in memory file
        aoef_obj = aoef.to_aeof(dataset, audio_dir=dataset_dir).model_dump(
            mode="json"
        )

        aoef_obj["data"]["recordings"][0]["path"] = str(
            PurePosixPath(relative_path)
        )

        dataset_file = BytesIO(json.dumps(aoef_obj).encode("utf-8"))

        response = client.post(
            "/api/v1/datasets/import/",
            files={"dataset": dataset_file},
            data={"audio_dir": str(dataset_dir)},
            cookies=cookies,
        )
        assert response.status_code == 200

        response_data = response.json()
        assert response_data["name"] == "test_dataset"
        assert response_data["description"] == "test_description"
        assert response_data["recording_count"] == 1

        # Check the recording exists
        response = client.get(
            "/api/v1/recordings/detail/",
            params={
                "recording_uuid": str(recording.uuid),
            },
            cookies=cookies,
        )
        assert response.status_code == 200

    def test_fails_with_invalid_aoef_format(
        self,
        client: TestClient,
        dataset_dir: Path,
        cookies: dict[str, str],
    ):
        file = BytesIO()
        file.write(json.dumps({}).encode("utf-8"))

        response = client.post(
            "/api/v1/datasets/import/",
            files={"dataset": file},
            data={"audio_dir": str(dataset_dir)},
            cookies=cookies,
        )
        assert response.status_code == 400
        assert (
            "Expected a JSON file in AOEF format" in response.json()["message"]
        )

    def test_rejects_missing_audio_directory(
        self,
        client: TestClient,
        audio_dir: Path,
        cookies: dict[str, str],
    ):
        response = client.post(
            "/api/v1/datasets/import/",
            files={"dataset": BytesIO(b"")},
            data={"audio_dir": str(audio_dir / "missing")},
            cookies=cookies,
        )

        assert response.status_code == 400

    def test_fails_when_aoef_collection_type_is_mismatched(
        self,
        client: TestClient,
        dataset_dir: Path,
        cookies: dict[str, str],
    ):
        annotation_project = data.AnnotationProject(
            name="test_project",
            description="test_description",
        )

        file = BytesIO()
        file.write(
            aoef.to_aeof(annotation_project).model_dump_json().encode("utf-8")
        )

        response = client.post(
            "/api/v1/datasets/import/",
            files={"dataset": file},
            data={"audio_dir": str(dataset_dir)},
            cookies=cookies,
        )
        assert response.status_code == 400
        assert (
            "Detected object type: 'annotation_project'"
            in response.json()["message"]
        )


class TestBrowseDatasetDirectories:
    def test_lists_audio_root(self, client: TestClient, audio_dir: Path):
        (audio_dir / "zeta").mkdir()
        (audio_dir / "Alpha").mkdir()
        (audio_dir / "recording.wav").touch()

        response = client.get("/api/v1/datasets/browse/")

        assert response.status_code == 200
        assert response.json() == {
            "path": "",
            "absolute": str(audio_dir.resolve()),
            "parent": None,
            "directories": [
                {
                    "name": "Alpha",
                    "path": "Alpha",
                    "absolute": str(audio_dir.resolve() / "Alpha"),
                },
                {
                    "name": "zeta",
                    "path": "zeta",
                    "absolute": str(audio_dir.resolve() / "zeta"),
                },
            ],
        }

    def test_lists_nested_directory(self, client: TestClient, audio_dir: Path):
        nested = audio_dir / "sub" / "dir"
        (nested / "child").mkdir(parents=True)
        (nested / "file.txt").touch()

        response = client.get(
            "/api/v1/datasets/browse/", params={"path": "sub/dir"}
        )

        assert response.status_code == 200
        assert response.json() == {
            "path": "sub/dir",
            "absolute": str(nested.resolve()),
            "parent": "sub",
            "directories": [
                {
                    "name": "child",
                    "path": "sub/dir/child",
                    "absolute": str((nested / "child").resolve()),
                }
            ],
        }

    def test_rejects_escaping_paths(self, client: TestClient, audio_dir: Path):
        for path in ("..", "../outside"):
            response = client.get(
                "/api/v1/datasets/browse/", params={"path": path}
            )
            assert response.status_code == 400

    def test_rejects_symlink_escape(
        self, client: TestClient, audio_dir: Path, tmp_path: Path
    ):
        outside = tmp_path / "outside"
        outside.mkdir()
        (audio_dir / "escape").symlink_to(outside, target_is_directory=True)

        response = client.get(
            "/api/v1/datasets/browse/", params={"path": "escape"}
        )

        assert response.status_code == 400


class TestCompleteDatasetDirectories:
    def test_completes_case_insensitive_nested_prefix(
        self, client: TestClient, audio_dir: Path
    ):
        (audio_dir / "Birds" / "Night").mkdir(parents=True)
        (audio_dir / "Birds" / "Nest").mkdir()
        (audio_dir / "Other").mkdir()

        response = client.get(
            "/api/v1/datasets/complete/", params={"path": "birds/n"}
        )

        assert response.status_code == 200
        assert [entry["path"] for entry in response.json()] == [
            "Birds/Nest",
            "Birds/Night",
        ]

        response = client.get(
            "/api/v1/datasets/complete/",
            params={"path": "Birds/*ight"},
        )
        assert response.status_code == 200
        assert [entry["path"] for entry in response.json()] == ["Birds/Night"]

    def test_completion_is_confined_and_limited(
        self, client: TestClient, audio_dir: Path
    ):
        for index in range(21):
            (audio_dir / f"entry{index:02}").mkdir()

        response = client.get(
            "/api/v1/datasets/complete/", params={"path": ""}
        )
        assert response.status_code == 200
        assert len(response.json()) == 20

        response = client.get(
            "/api/v1/datasets/complete/", params={"path": "../"}
        )
        assert response.status_code == 400


class TestBrowseDatasetDirectoryEdgeCases:
    def test_symlink_escape_is_not_listed(
        self, client: TestClient, audio_dir: Path, tmp_path: Path
    ):
        outside = tmp_path / "outside"
        outside.mkdir()
        (audio_dir / "escape").symlink_to(outside, target_is_directory=True)
        (audio_dir / "inside").mkdir()

        response = client.get("/api/v1/datasets/browse/")

        names = [entry["name"] for entry in response.json()["directories"]]
        assert names == ["inside"]

    def test_rejects_nonexistent_directory(self, client: TestClient):
        response = client.get(
            "/api/v1/datasets/browse/", params={"path": "missing"}
        )

        assert response.status_code == 400

    def test_rejects_file_path(self, client: TestClient, audio_dir: Path):
        (audio_dir / "file.txt").touch()

        response = client.get(
            "/api/v1/datasets/browse/", params={"path": "file.txt"}
        )

        assert response.status_code == 400
