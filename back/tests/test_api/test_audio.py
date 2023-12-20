from whombat.api.audio import load_clip_bytes


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
    start = 1024 * 1024
    end = 1024 * 1024 * 2

    with open(path, "rb") as f:
        f.seek(start)
        bytes = f.read(end - start)

    loaded_bytes, start_, end_, filesize = load_clip_bytes(
        path=path,
        samplerate=samplerate,
        channels=channels,
        duration=duration,
        start=start,
        end=end,
        bit_depth=bit_depth,
    )

    assert loaded_bytes == bytes
    assert start_ == start
    assert end_ == end
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
        samplerate=samplerate,
        channels=channels,
        duration=duration,
        start=start,
        end=end,
        bit_depth=bit_depth,
    )

    assert len(loaded_bytes) == len(read_bytes)
    assert start_ == start
    assert end_ == end
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
        end = start + 1024 * 1024

        if filesize is not None and end > filesize:
            end = filesize

        part, start, end, filesize = load_clip_bytes(
            path=path,
            samplerate=8_000,
            channels=1,
            duration=1,
            start=start,
            end=end,
            bit_depth=32,
        )
        parts.append(part)
        start = end

        assert filesize == true_filesize

        if not part or start >= filesize:
            break

    assert b"".join(parts) == full_bytes
