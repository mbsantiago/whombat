from io import BytesIO

import pytest
import soundfile as sf

from whombat.api.audio import HEADER_SIZE, load_clip_bytes


def test_load_clip_bytes(random_wav_factory):
    samplerate = 8_000
    duration = 1
    channels = 1
    bit_depth = 16
    start = HEADER_SIZE
    frames = 1024

    path = random_wav_factory(
        duration=duration,
        samplerate=samplerate,
        channels=channels,
        bit_depth=bit_depth,
    )

    loaded_bytes, start_, end_, filesize = load_clip_bytes(
        path=path,
        start=start,
        frames=frames,
    )

    assert len(loaded_bytes) == end_ - start_
    assert end_ - start_ == frames * channels * bit_depth // 8

    with open(path, "rb") as f:
        f.seek(start_)
        read_bytes = f.read(end_ - start_)

    assert len(loaded_bytes) == len(read_bytes)
    assert loaded_bytes == read_bytes
    assert start_ == start
    assert filesize == path.stat().st_size


def test_load_clip_bytes_with_header(random_wav_factory):
    samplerate = 8_000
    duration = 1
    channels = 1
    bit_depth = 16
    frames = 512

    path = random_wav_factory(
        duration=duration,
        samplerate=samplerate,
        channels=channels,
        bit_depth=bit_depth,
    )

    loaded_bytes, start_, end_, filesize = load_clip_bytes(
        path=path,
        start=0,
        frames=frames,
    )

    with open(path, "rb") as f:
        read_bytes = f.read(end_)

    assert len(loaded_bytes) == len(read_bytes)
    assert start_ == 0
    assert filesize == path.stat().st_size


@pytest.mark.parametrize("fmt", ["wav", "flac", "mp3"])
def test_stream_a_whole_audio_file(fmt: str, random_wav_factory):
    """Test streaming a whole audio file.

    This test is to ensure that the whole audio file is streamed and the
    resulting audio file can be read by soundfile.
    """
    path = random_wav_factory(
        duration=1,
        samplerate=8_000,
        channels=1,
        fmt=fmt,
    )

    start = 0
    filesize = None
    buffer = BytesIO()
    while True:
        part, start, _, filesize = load_clip_bytes(
            path=path,
            start=start,
        )
        buffer.write(part)
        start = start + len(part)

        if not part or start >= filesize:
            break

    buffer.seek(0)

    with sf.SoundFile(buffer) as f:
        assert f.samplerate == 8_000
        assert f.channels == 1
        assert f.frames == 8_000


@pytest.mark.parametrize("fmt", ["wav", "flac", "mp3"])
def test_stream_a_whole_audio_file_with_non_1_speed(
    fmt: str, random_wav_factory
):
    path = random_wav_factory(
        duration=1,
        samplerate=8_000,
        channels=1,
        fmt=fmt,
    )

    start = 0
    filesize = None
    buffer = BytesIO()
    while True:
        part, start, _, filesize = load_clip_bytes(
            path=path,
            start=start,
            speed=2,
        )
        buffer.write(part)
        start = start + len(part)

        if not part or start >= filesize:
            break

    buffer.seek(0)

    with sf.SoundFile(buffer) as f:
        assert f.samplerate == 16_000
        assert f.channels == 1
        assert f.frames == 8_000


@pytest.mark.parametrize("fmt", ["wav", "flac", "mp3"])
def test_stream_an_audio_clip(fmt: str, random_wav_factory):
    path = random_wav_factory(
        duration=3,
        samplerate=8_000,
        channels=1,
        fmt=fmt,
    )

    start = 0
    filesize = None
    buffer = BytesIO()
    while True:
        part, start, _, filesize = load_clip_bytes(
            path=path,
            start=start,
            speed=2,
            start_time=1,
            end_time=2,
        )
        buffer.write(part)
        start = start + len(part)

        if not part or start >= filesize:
            break

    buffer.seek(0)

    with sf.SoundFile(buffer) as f:
        assert f.samplerate == 16_000
        assert f.channels == 1
        assert f.frames == 8_000
        streamed_data = f.read()

    # MP3 files are not guaranteed to be the same when streamed
    # because of the compression.
    if fmt != "mp3":
        with sf.SoundFile(path) as f:
            f.seek(8_000)
            original_data = f.read(8_000)
        assert (streamed_data == original_data).all()
