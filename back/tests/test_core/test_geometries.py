"""Test suite for core geometry functions."""

from whombat import geometries
from whombat.core import geometries as core_geometry


def test_compute_time_stamp_features():
    """Test that the duration of a TimeStamp is 0."""
    time_stamp = geometries.TimeStamp(coordinates=0)
    features = core_geometry.compute_geometry_features(time_stamp)
    assert len(features) == 1
    assert features[0].name == core_geometry.DURATION
    assert features[0].value == 0


def test_compute_time_interval_features():
    """Test that the duration of a TimeInterval is correct."""
    time_interval = geometries.TimeInterval(coordinates=(0, 1))
    features = core_geometry.compute_geometry_features(time_interval)
    assert len(features) == 1
    assert features[0].name == core_geometry.DURATION
    assert features[0].value == 1


def test_compute_bounding_box_features():
    """Test that the duration of a BoundingBox is correct."""
    bounding_box = geometries.BoundingBox(coordinates=(0, 1, 2, 3))
    features = core_geometry.compute_geometry_features(bounding_box)
    assert len(features) == 4
    assert features[0].name == core_geometry.DURATION
    assert features[0].value == 2
    assert features[1].name == core_geometry.LOW_FREQ
    assert features[1].value == 1
    assert features[2].name == core_geometry.HIGH_FREQ
    assert features[2].value == 3
    assert features[3].name == core_geometry.BANDWIDTH
    assert features[3].value == 2


def test_compute_point_features():
    """Test that the duration of a Point is 0."""
    point = geometries.Point(coordinates=(0, 1))
    features = core_geometry.compute_geometry_features(point)
    assert len(features) == 4
    assert features[0].name == core_geometry.DURATION
    assert features[0].value == 0
    assert features[1].name == core_geometry.LOW_FREQ
    assert features[1].value == 1
    assert features[2].name == core_geometry.HIGH_FREQ
    assert features[2].value == 1
    assert features[3].name == core_geometry.BANDWIDTH
    assert features[3].value == 0


def test_compute_linestring_features():
    """Test that the duration of a LineString is correct."""
    linestring = geometries.LineString(coordinates=[(1, 2), (4, 3)])
    features = core_geometry.compute_geometry_features(linestring)
    assert len(features) == 4
    assert features[0].name == core_geometry.DURATION
    assert features[0].value == 3
    assert features[1].name == core_geometry.LOW_FREQ
    assert features[1].value == 2
    assert features[2].name == core_geometry.HIGH_FREQ
    assert features[2].value == 3
    assert features[3].name == core_geometry.BANDWIDTH
    assert features[3].value == 1


def test_compute_polygon_features():
    """Test that the duration of a Polygon is correct."""
    polygon = geometries.Polygon(coordinates=[[(1, 2), (4, 3), (5, 0)]])
    features = core_geometry.compute_geometry_features(polygon)
    assert len(features) == 4
    assert features[0].name == core_geometry.DURATION
    assert features[0].value == 4
    assert features[1].name == core_geometry.LOW_FREQ
    assert features[1].value == 0
    assert features[2].name == core_geometry.HIGH_FREQ
    assert features[2].value == 3
    assert features[3].name == core_geometry.BANDWIDTH
    assert features[3].value == 3


def test_compute_multipoint_features():
    """Test that the duration of a MultiPoint is correct."""
    multipoint = geometries.MultiPoint(coordinates=[(1, 2), (4, 3)])
    features = core_geometry.compute_geometry_features(multipoint)
    assert len(features) == 5
    assert features[0].name == core_geometry.DURATION
    assert features[0].value == 3
    assert features[1].name == core_geometry.LOW_FREQ
    assert features[1].value == 2
    assert features[2].name == core_geometry.HIGH_FREQ
    assert features[2].value == 3
    assert features[3].name == core_geometry.BANDWIDTH
    assert features[3].value == 1
    assert features[4].name == core_geometry.NUM_SEGMENTS
    assert features[4].value == 2


def test_compute_multilinestring_features():
    """Test that the duration of a MultiLineString is correct."""
    multilinestring = geometries.MultiLineString(
        coordinates=[[(1, 2), (4, 3)], [(2, 1), (5, 2)]]
    )
    features = core_geometry.compute_geometry_features(multilinestring)
    assert len(features) == 5
    assert features[0].name == core_geometry.DURATION
    assert features[0].value == 4
    assert features[1].name == core_geometry.LOW_FREQ
    assert features[1].value == 1
    assert features[2].name == core_geometry.HIGH_FREQ
    assert features[2].value == 3
    assert features[3].name == core_geometry.BANDWIDTH
    assert features[3].value == 2
    assert features[4].name == core_geometry.NUM_SEGMENTS
    assert features[4].value == 2


def test_compute_multipolygon_features():
    """Test that the duration of a MultiPolygon is correct."""
    multipolygon = geometries.MultiPolygon(
        coordinates=[[[(-1, 2), (4, 3), (5, 0)]], [[(1, 3), (2, 5), (5, 2)]]]
    )
    features = core_geometry.compute_geometry_features(multipolygon)
    assert len(features) == 5
    assert features[0].name == core_geometry.DURATION
    assert features[0].value == 6
    assert features[1].name == core_geometry.LOW_FREQ
    assert features[1].value == 0
    assert features[2].name == core_geometry.HIGH_FREQ
    assert features[2].value == 5
    assert features[3].name == core_geometry.BANDWIDTH
    assert features[3].value == 5
    assert features[4].name == core_geometry.NUM_SEGMENTS
    assert features[4].value == 2
