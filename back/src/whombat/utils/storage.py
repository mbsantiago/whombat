"""Storage abstraction module for Whombat.

This module provides functions to interact with either local storage or
AWS S3, depending on the configuration. It abstracts away the underlying
storage mechanism, allowing the rest of the application to use a unified
interface.
"""

import io
import os
from pathlib import Path
from typing import Union

import boto3
from botocore.client import Config
from botocore.exceptions import NoCredentialsError, PartialCredentialsError
from whombat.system.settings import get_settings

__all__ = [
    "get_audio_file_path",
    "read_audio_file",
    "write_audio_file",
    "delete_audio_file",
    "list_audio_files",
]

settings = get_settings()

if settings.use_s3:
    try:
        s3_client = boto3.client(
            "s3",
            region_name=settings.s3_region_name,
            endpoint_url=settings.s3_endpoint_url,
            config=Config(signature_version="s3v4"),
        )
    except (NoCredentialsError, PartialCredentialsError) as e:
        raise RuntimeError(
            "AWS credentials not found. Ensure IAM role is assigned or credentials are set."
        ) from e
else:
    s3_client = None


def get_audio_file_path(filename: Union[str, Path]) -> Union[str, Path]:
    """Get the path or S3 key for an audio file."""
    return str(filename)


def read_audio_file(filename: Union[str, Path]) -> bytes:
    """Read an audio file from local storage or S3."""
    if settings.use_s3:
        try:
            response = s3_client.get_object(
                Bucket=settings.s3_bucket_name, Key=str(filename)
            )
            return response["Body"].read()
        except Exception as e:
            raise FileNotFoundError(
                f"Could not read file {filename} from S3: {e}"
            ) from e
    else:
        file_path = settings.audio_dir / filename
        if not file_path.is_file():
            raise FileNotFoundError(f"File {file_path} does not exist.")
        with open(file_path, "rb") as f:
            return f.read()


def write_audio_file(filename: Union[str, Path], data: bytes) -> None:
    """Write an audio file to local storage or S3."""
    if settings.use_s3:
        try:
            s3_client.put_object(
                Bucket=settings.s3_bucket_name, Key=str(filename), Body=data
            )
        except Exception as e:
            raise IOError(f"Could not write file {filename} to S3: {e}") from e
    else:
        file_path = settings.audio_dir / filename
        os.makedirs(file_path.parent, exist_ok=True)
        with open(file_path, "wb") as f:
            f.write(data)


def delete_audio_file(filename: Union[str, Path]) -> None:
    """Delete an audio file from local storage or S3."""
    if settings.use_s3:
        try:
            s3_client.delete_object(
                Bucket=settings.s3_bucket_name, Key=str(filename)
            )
        except Exception as e:
            raise IOError(f"Could not delete file {filename} from S3: {e}") from e
    else:
        file_path = settings.audio_dir / filename
        if file_path.exists():
            file_path.unlink()


def list_audio_files(prefix: str = "") -> list[str]:
    """List audio files in local storage or S3."""
    if settings.use_s3:
        try:
            paginator = s3_client.get_paginator("list_objects_v2")
            page_iterator = paginator.paginate(
                Bucket=settings.s3_bucket_name, Prefix=prefix
            )
            files = []
            for page in page_iterator:
                files.extend(
                    [content["Key"] for content in page.get("Contents", [])]
                )
            return files
        except Exception as e:
            raise IOError(f"Could not list files in S3 bucket: {e}") from e
    else:
        audio_dir = settings.audio_dir / prefix
        return [
            str(p.relative_to(settings.audio_dir))
            for p in audio_dir.glob("**/*")
            if p.is_file()
        ]
