"""Test suite for the geometry schemas module."""

import shapely.geometry

from whombat import geometries


def test_timestamp_geometry():
    """Test the timestamp geometry schema."""
    timestamp = geometries.TimeStamp(coordinates=1.0)
    assert timestamp.type == "TimeStamp"
    assert timestamp.geom == shapely.geometry.box(
        1.0, 0.0, 1.0, geometries.MAX_FREQUENCY
    )

    assert (
        timestamp.model_dump_json() == '{"type":"TimeStamp","coordinates":1.0}'
    )


def test_timeinterval_geometry():
    """Test the timeinterval geometry schema."""
    timeinterval = geometries.TimeInterval(
        coordinates=(1.0, 2.0),
    )
    assert timeinterval.type == "TimeInterval"
    assert timeinterval.geom == shapely.geometry.box(
        1.0, 0.0, 2.0, geometries.MAX_FREQUENCY
    )

    assert (
        timeinterval.model_dump_json()
        == '{"type":"TimeInterval","coordinates":[1.0,2.0]}'
    )


def test_bounding_box_geometry():
    """Test the bounding box geometry schema."""
    bounding_box = geometries.BoundingBox(coordinates=(1.0, 2.0, 3.0, 4.0))
    assert bounding_box.type == "BoundingBox"
    assert bounding_box.geom == shapely.geometry.box(1.0, 2.0, 3.0, 4.0)
    assert (
        bounding_box.model_dump_json()
        == '{"type":"BoundingBox","coordinates":[1.0,2.0,3.0,4.0]}'
    )


def test_point_geometry():
    """Test the point geometry schema."""
    point = geometries.Point(coordinates=(1.0, 2.0))
    assert point.type == "Point"
    assert point.geom == shapely.geometry.Point(1.0, 2.0)
    assert (
        point.model_dump_json() == '{"type":"Point","coordinates":[1.0,2.0]}'
    )


def test_linestring_geometry():
    """Test the linestring geometry schema."""
    linestring = geometries.LineString(
        coordinates=[(1.0, 2.0), (3.0, 4.0)],
    )
    assert linestring.type == "LineString"
    assert linestring.geom == shapely.geometry.LineString(
        [(1.0, 2.0), (3.0, 4.0)]
    )
    assert (
        linestring.model_dump_json()
        == '{"type":"LineString","coordinates":[[1.0,2.0],[3.0,4.0]]}'
    )


def test_polygon_geometry():
    """Test the polygon geometry schema."""
    polygon = geometries.Polygon(
        coordinates=[
            [
                (1.0, 2.0),
                (3.0, 4.0),
                (5.0, 6.0),
            ]
        ],
    )
    assert polygon.type == "Polygon"
    assert polygon.geom == shapely.geometry.Polygon(
        [(1.0, 2.0), (3.0, 4.0), (5.0, 6.0)]
    )
    assert polygon.model_dump_json() == (
        '{"type":"Polygon","coordinates":[[[1.0,2.0],' "[3.0,4.0],[5.0,6.0]]]}"
    )


def test_multipoint_geometry():
    """Test the multipoint geometry schema."""
    multipoint = geometries.MultiPoint(
        coordinates=[(1.0, 2.0), (3.0, 4.0)],
    )
    assert multipoint.type == "MultiPoint"
    assert multipoint.geom == shapely.geometry.MultiPoint(
        [(1.0, 2.0), (3.0, 4.0)]
    )
    assert (
        multipoint.model_dump_json()
        == '{"type":"MultiPoint","coordinates":[[1.0,2.0],[3.0,4.0]]}'
    )


def test_multilinestring_geometry():
    """Test the multilinestring geometry schema."""
    multilinestring = geometries.MultiLineString(
        coordinates=[
            [(1.0, 2.0), (3.0, 4.0)],
            [(5.0, 6.0), (7.0, 8.0)],
        ],
    )
    assert multilinestring.type == "MultiLineString"
    assert multilinestring.geom == shapely.geometry.MultiLineString(
        [[(1.0, 2.0), (3.0, 4.0)], [(5.0, 6.0), (7.0, 8.0)]]
    )
    assert multilinestring.model_dump_json() == (
        '{"type":"MultiLineString","coordinates":[[[1.0,2.0],'
        "[3.0,4.0]],[[5.0,6.0],[7.0,8.0]]]}"
    )


def test_multipolygon_geometry():
    """Test the multipolygon geometry schema."""
    multipolygon = geometries.MultiPolygon(
        coordinates=[
            [[(1.0, 2.0), (3.0, 4.0), (5.0, 6.0)]],
            [[(7.0, 8.0), (9.0, 10.0), (11.0, 12.0)]],
        ],
    )
    assert multipolygon.type == "MultiPolygon"
    assert multipolygon.geom == shapely.geometry.MultiPolygon(
        [
            shapely.geometry.Polygon([(1.0, 2.0), (3.0, 4.0), (5.0, 6.0)]),
            shapely.geometry.Polygon([(7.0, 8.0), (9.0, 10.0), (11.0, 12.0)]),
        ]
    )
    assert multipolygon.model_dump_json() == (
        '{"type":"MultiPolygon","coordinates":[[[[1.0,2.0],'
        "[3.0,4.0],[5.0,6.0]]],[[[7.0,8.0],[9.0,10.0],[11.0,12.0]]]]}"
    )
