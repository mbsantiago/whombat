import struct

from whombat.api.audio import CHUNK_SIZE, HEADER_FORMAT, load_clip_bytes


def test_load_clip_bytes(random_wav_factory):
    samplerate = 8_000
    duration = 1
    channels = 1
    bit_depth = 32

    path = random_wav_factory(
        duration=duration,
        samplerate=samplerate,
        channels=channels,
        bit_depth=bit_depth,
    )
    start = 1024
    end = 2048

    with open(path, "rb") as f:
        f.seek(start)
        read_bytes = f.read(end - start)

    loaded_bytes, start_, end_, filesize = load_clip_bytes(
        path=path,
        start=start,
        end=end,
    )

    with open(path, "rb") as f:
        f.seek(start)
        read_bytes = f.read(end - start)

    assert len(loaded_bytes) == len(read_bytes)
    assert loaded_bytes == read_bytes
    assert start_ == start
    assert end_ == end - 1
    assert filesize == path.stat().st_size


def test_load_clip_bytes_with_header(random_wav_factory):
    samplerate = 8_000
    duration = 1
    channels = 1
    bit_depth = 32

    path = random_wav_factory(
        duration=duration,
        samplerate=samplerate,
        channels=channels,
        bit_depth=bit_depth,
    )
    start = 0
    end = 1024

    with open(path, "rb") as f:
        f.seek(start)
        read_bytes = f.read(end - start)

    loaded_bytes, start_, end_, filesize = load_clip_bytes(
        path=path,
        start=start,
        end=end,
    )

    assert len(loaded_bytes) == len(read_bytes)
    assert start_ == start
    assert end_ == end - 1
    assert filesize == path.stat().st_size


def test_stream_a_whole_audio_file(random_wav_factory):
    path = random_wav_factory(
        duration=1,
        samplerate=8_000,
        channels=1,
        bit_depth=32,
    )

    with open(path, "rb") as f:
        full_bytes = f.read()

    true_filesize = path.stat().st_size

    start = 0
    filesize = None
    parts = []
    while True:
        part, start, _, filesize = load_clip_bytes(
            path=path,
            start=start,
        )
        parts.append(part)
        start = start + len(part)

        assert filesize == true_filesize

        if not part or start >= filesize:
            break

    streamed = b"".join(parts)
    assert len(streamed) == len(full_bytes)
    assert streamed == full_bytes


def test_stream_a_whole_audio_file_with_non_1_speed(random_wav_factory):
    path = random_wav_factory(
        duration=0.5,
        samplerate=384_000,
        channels=1,
        bit_depth=32,
    )

    speed = 0.1

    with open(path, "rb") as f:
        full_bytes = f.read()

    true_filesize = path.stat().st_size

    start = 0
    filesize = None
    parts = []
    while True:
        part, start, _, filesize = load_clip_bytes(
            path=path,
            start=start,
            speed=speed,
        )
        parts.append(part)
        start = start + len(part)

        assert filesize == true_filesize

        if not part or start >= filesize:
            break

    streamed = b"".join(parts)

    assert streamed[44:] == full_bytes[44:]

    fields = [
        "riff",
        "size",
        "wave",
        "fmt ",
        "fmt_size",
        "format",
        "channels",
        "samplerate",
        "byte_rate",
        "block_align",
        "bit_depth",
        "data",
        "data_size",
    ]

    orig_header = struct.unpack(HEADER_FORMAT, full_bytes[:44])
    streamed_header = struct.unpack(HEADER_FORMAT, streamed[:44])

    for field, h1, h2 in zip(fields, orig_header, streamed_header):
        if field == "samplerate":
            assert int(h1 * speed) == h2
            continue

        if field == "byte_rate":
            assert int(h1 * speed) == h2
            continue

        assert h1 == h2
