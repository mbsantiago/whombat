"""Schemas for handling Datasets."""

from uuid import UUID

from pydantic import BaseModel, DirectoryPath, Field

__all__ = [
    "Dataset",
    "DatasetCreate",
    "DatasetUpdate",
]


class Dataset(BaseModel):
    """Schema for Dataset objects returned to the user."""

    uuid: UUID
    name: str
    description: str | None
    audio_dir: DirectoryPath

    class Config:
        """Pydantic configuration."""

        orm_mode = True


class DatasetCreate(BaseModel):
    """Schema for Dataset objects created by the user."""

    audio_dir: DirectoryPath
    name: str = Field(..., min_length=1)
    description: str | None = Field(None)


class DatasetUpdate(BaseModel):
    """Schema for Dataset objects updated by the user."""

    audio_dir: DirectoryPath | None
    name: str | None = Field(..., min_length=1)
    description: str | None = Field(None)
