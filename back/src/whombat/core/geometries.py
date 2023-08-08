"""Core functions to handle geometry objects."""

from whombat import geometries, schemas

__all__ = [
    "compute_geometry_features",
]


DURATION = "duration"
LOW_FREQ = "low_freq"
HIGH_FREQ = "high_freq"
BANDWIDTH = "bandwidth"
NUM_SEGMENTS = "num_segments"


def _compute_time_stamp_features(
    _: geometries.TimeStamp,
) -> list[schemas.Feature]:
    return [schemas.Feature(name=DURATION, value=0)]


def _compute_time_interval_features(
    geometry: geometries.TimeInterval,
) -> list[schemas.Feature]:
    start, end = geometry.coordinates
    return [schemas.Feature(name=DURATION, value=end - start)]


def _compute_bounding_box_features(
    geometry: geometries.BoundingBox,
) -> list[schemas.Feature]:
    start_time, low_freq, end_time, high_freq = geometry.coordinates
    return [
        schemas.Feature(name=DURATION, value=end_time - start_time),
        schemas.Feature(name=LOW_FREQ, value=low_freq),
        schemas.Feature(name=HIGH_FREQ, value=high_freq),
        schemas.Feature(name=BANDWIDTH, value=high_freq - low_freq),
    ]


def _compute_point_features(
    geometry: geometries.Point,
) -> list[schemas.Feature]:
    _, low_freq, _, high_freq = geometry.bounds

    return [
        schemas.Feature(name=DURATION, value=0),
        schemas.Feature(name=LOW_FREQ, value=low_freq),
        schemas.Feature(name=HIGH_FREQ, value=high_freq),
        schemas.Feature(name=BANDWIDTH, value=0),
    ]


def _compute_line_string_features(
    geometry: geometries.LineString,
) -> list[schemas.Feature]:
    start_time, low_freq, end_time, high_freq = geometry.bounds

    return [
        schemas.Feature(name=DURATION, value=end_time - start_time),
        schemas.Feature(name=LOW_FREQ, value=low_freq),
        schemas.Feature(name=HIGH_FREQ, value=high_freq),
        schemas.Feature(name=BANDWIDTH, value=high_freq - low_freq),
    ]


def _compute_polygon_features(
    geometry: geometries.Polygon,
) -> list[schemas.Feature]:
    start_time, low_freq, end_time, high_freq = geometry.bounds

    return [
        schemas.Feature(name=DURATION, value=end_time - start_time),
        schemas.Feature(name=LOW_FREQ, value=low_freq),
        schemas.Feature(name=HIGH_FREQ, value=high_freq),
        schemas.Feature(name=BANDWIDTH, value=high_freq - low_freq),
    ]


def _compute_multi_point_features(
    geometry: geometries.MultiPoint,
) -> list[schemas.Feature]:
    start_time, low_freq, end_time, high_freq = geometry.bounds

    return [
        schemas.Feature(name=DURATION, value=end_time - start_time),
        schemas.Feature(name=LOW_FREQ, value=low_freq),
        schemas.Feature(name=HIGH_FREQ, value=high_freq),
        schemas.Feature(name=BANDWIDTH, value=high_freq - low_freq),
        schemas.Feature(name=NUM_SEGMENTS, value=len(geometry.coordinates)),
    ]


def _compute_multi_linestring_features(
    geometry: geometries.MultiLineString,
) -> list[schemas.Feature]:
    start_time, low_freq, end_time, high_freq = geometry.bounds

    return [
        schemas.Feature(name=DURATION, value=end_time - start_time),
        schemas.Feature(name=LOW_FREQ, value=low_freq),
        schemas.Feature(name=HIGH_FREQ, value=high_freq),
        schemas.Feature(name=BANDWIDTH, value=high_freq - low_freq),
        schemas.Feature(name=NUM_SEGMENTS, value=len(geometry.coordinates)),
    ]


def _compute_multi_polygon_features(
    geometry: geometries.MultiPolygon,
) -> list[schemas.Feature]:
    start_time, low_freq, end_time, high_freq = geometry.bounds

    return [
        schemas.Feature(name=DURATION, value=end_time - start_time),
        schemas.Feature(name=LOW_FREQ, value=low_freq),
        schemas.Feature(name=HIGH_FREQ, value=high_freq),
        schemas.Feature(name=BANDWIDTH, value=high_freq - low_freq),
        schemas.Feature(name=NUM_SEGMENTS, value=len(geometry.coordinates)),
    ]


_COMPUTE_FEATURES = {
    geometries.TimeStamp.geom_type: _compute_time_stamp_features,
    geometries.TimeInterval.geom_type: _compute_time_interval_features,
    geometries.BoundingBox.geom_type: _compute_bounding_box_features,
    geometries.Point.geom_type: _compute_point_features,
    geometries.LineString.geom_type: _compute_line_string_features,
    geometries.Polygon.geom_type: _compute_polygon_features,
    geometries.MultiPoint.geom_type: _compute_multi_point_features,
    geometries.MultiLineString.geom_type: _compute_multi_linestring_features,
    geometries.MultiPolygon.geom_type: _compute_multi_polygon_features,
}


def compute_geometry_features(
    geometry: geometries.Geometry,
) -> list[schemas.Feature]:
    """Compute features from a geometry.

    Some basic acoustic features can be computed from a geometry. This function
    computes these features and returns them as a list of features.

    The following features are computed when possible:

    - ``duration``: The duration of the geometry.
    - ``low_freq``: The lowest frequency of the geometry.
    - ``high_freq``: The highest frequency of the geometry.
    - ``bandwidth``: The bandwidth of the geometry.
    - ``num_segments``: The number of segments in the geometry.

    Depending on the geometry type, some features may not be computed. For
    example, a ``TimeStamp`` geometry does not have a bandwidth.

    Parameters
    ----------
    geometry : geometries.Geometry
        The geometry to compute features from.

    Returns
    -------
    list[schemas.Feature]
        The computed features.

    Raises
    ------
    NotImplementedError
        If the geometry type is not supported.
    """
    try:
        return _COMPUTE_FEATURES[geometry.type](geometry)
    except KeyError as error:
        raise NotImplementedError(
            f"Geometry type {geometry.type} is not supported."
        ) from error
