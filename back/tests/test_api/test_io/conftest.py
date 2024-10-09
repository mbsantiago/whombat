from pathlib import Path

import pytest

from whombat.system.app import ROOT_DIR


@pytest.fixture
def example_data_path() -> Path:
    path = ROOT_DIR.parent.parent.parent / "example_data"
    assert path.exists()
    return path


@pytest.fixture
def example_dataset_path(example_data_path: Path) -> Path:
    path = example_data_path / "example_dataset.json"
    assert path.exists()
    return path


@pytest.fixture
def example_annotation_project_path(example_data_path: Path) -> Path:
    path = example_data_path / "example_annotation_project.json"
    assert path.exists()
    return path


@pytest.fixture
def example_audio_dir(example_data_path: Path) -> Path:
    path = example_data_path / "audio"
    assert path.exists()
    return path
