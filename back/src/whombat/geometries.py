"""Schemas for the geometry types used to mark sound events.

Sound events are identified and localized using geometries, which are defined
by specifying their coordinates. Coordinates are composed of a moment in time
and/or a frequency, with seconds used for time and Hertz used for frequency as
universal units throughout Whombat.

This module defines Pydantic models for the available geometry types, providing
easy and fast validation of the geometries.

The geometries are stored in the Whombat database as JSON strings, allowing for
flexible storage and retrieval of the geometries.
"""
from abc import ABC, abstractmethod
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, PrivateAttr, field_validator
from shapely import geometry
from shapely.geometry.base import BaseGeometry

MAX_FREQUENCY = 5_000_000
"""The absolute maximum frequency that can be used in a geometry.

Whombat does not expect to be used with sounds that have frequencies above
5 MHz, so this is the maximum frequency that can be used in a geometry.
"""


__all__ = [
    "MAX_FREQUENCY",
    "GeometryType",
    "Time",
    "Frequency",
    "Geometry",
    "TimeStamp",
    "TimeInterval",
    "BoundingBox",
    "Point",
    "LineString",
    "Polygon",
    "MultiPoint",
    "MultiLineString",
    "MultiPolygon",
    "validate_geometry",
]

GeometryType = Literal[
    "TimeStamp",
    "TimeInterval",
    "BoundingBox",
    "Point",
    "LineString",
    "Polygon",
    "MultiPoint",
    "MultiLineString",
    "MultiPolygon",
]

Time = float
"""Time in seconds."""

Frequency = float
"""Frequency in Hertz."""


class Geometry(BaseModel, ABC):
    """Base class for geometry types."""

    model_config = ConfigDict(arbitrary_types_allowed=True, frozen=False)

    type: GeometryType = Field(
        ...,
        description="The type of geometry used to mark the sound event.",
    )

    _geom: BaseGeometry = PrivateAttr()
    """The Shapely geometry object representing the mark."""

    @classmethod
    @property
    def geom_type(cls) -> str:
        """Get the geometry type.

        Returns
        -------
        str
            The Shapely geometry type.
        """
        type_field = cls.model_fields["type"]
        return type_field.default

    @property
    def geom(self) -> BaseGeometry:
        """Get the Shapely geometry object representing the mark.

        Returns
        -------
            The Shapely geometry object representing the mark.
        """
        return self._geom

    @property
    def bounds(self) -> tuple[Time, Frequency, Time, Frequency]:
        """Get the bounds of the mark.

        Returns
        -------
        tuple[Time, Frequency, Time, Frequency]
            The bounds of the mark.
        """
        return self._geom.bounds

    def __init__(self, **data):
        """Initialize the geometry."""
        super().__init__(**data)
        self._geom = self._get_shapely_geometry()

    @abstractmethod
    def _get_shapely_geometry(self) -> BaseGeometry:
        """Get the Shapely geometry object representing the mark.

        Returns
        -------
            The Shapely geometry object representing the mark.
        """
        raise NotImplementedError


class TimeStamp(Geometry):
    """TimeStamp geometry type.

    This geometry type is used to mark a sound event with a single time stamp.
    Useful for very short sound events that are not well represented by a
    time interval.
    """

    type: Literal["TimeStamp"] = "TimeStamp"

    coordinates: Time = Field(
        ...,
        description="The time stamp of the mark.",
    )
    """The time stamp of the mark.

    The time stamp is relative to the start of the recording.
    """

    def _get_shapely_geometry(self) -> BaseGeometry:
        """Get the Shapely geometry object representing the mark.

        Returns
        -------
            The Shapely geometry object representing the mark.
        """
        return geometry.box(
            self.coordinates,
            0,
            self.coordinates,
            MAX_FREQUENCY,
        )


class TimeInterval(Geometry):
    """TimeInterval geometry type.

    This geometry type is used to mark a sound event with a time interval.
    Useful for sound events that have a clear start and end time, but that do
    not have a clear frequency range.
    """

    type: Literal["TimeInterval"] = "TimeInterval"

    coordinates: tuple[Time, Time] = Field(
        ...,
        description="The time interval of the mark.",
    )
    """The time interval of the mark.

    The time interval is relative to the start of the recording.
    """

    @field_validator("coordinates")
    def validate_time_interval(cls, v: tuple[Time, Time]) -> tuple[Time, Time]:
        """Validate that the time interval is valid.

        Parameters
        ----------
        v : tuple[Time, Time]
            The time interval to validate.

        Returns
        -------
            The validated time interval.

        Raises
        ------
            ValueError: If the time interval is invalid (i.e. the start time is
                after the end time).
        """
        if v[0] > v[1]:
            raise ValueError("The start time must be before the end time.")
        return v

    def _get_shapely_geometry(self) -> BaseGeometry:
        """Get the Shapely geometry object representing the mark.

        Returns
        -------
            The Shapely geometry object representing the mark.
        """
        start_time, end_time = self.coordinates
        return geometry.box(start_time, 0, end_time, MAX_FREQUENCY)


class Point(Geometry):
    """Point geometry type.

    This geometry type is used to mark a sound event with a single point in time
    and frequency. Useful to mark interesting points in spectrograms.
    """

    type: Literal["Point"] = "Point"

    coordinates: tuple[Time, Frequency] = Field(
        ...,
        description="The point of the mark.",
    )
    """The point of the mark.

    The time is relative to the start of the recording.

    """

    def _get_shapely_geometry(self) -> BaseGeometry:
        """Get the Shapely geometry object representing the mark.

        Returns
        -------
            The Shapely geometry object representing the mark.
        """
        return geometry.Point(self.coordinates)


class LineString(Geometry):
    """LineString geometry type.

    This geometry type is used to mark a sound event with a line in time and
    frequency. Useful to mark in detail sounds that have a clear frequency
    trajectory.
    """

    type: Literal["LineString"] = "LineString"

    coordinates: list[tuple[Time, Frequency]] = Field(
        ...,
        description="The line of the mark.",
    )
    """The line of the mark.

    Each line should be ordered by time.

    All times are relative to the start of the recording."""

    def _get_shapely_geometry(self) -> BaseGeometry:
        """Get the Shapely geometry object representing the mark.

        Returns
        -------
            The Shapely geometry object representing the mark.
        """
        return geometry.LineString(self.coordinates)

    @field_validator("coordinates")
    def has_at_least_two_points(
        cls, v: list[tuple[Time, Frequency]]
    ) -> list[tuple[Time, Frequency]]:
        """Validate that the line has at least two points."""
        if len(v) < 2:
            raise ValueError("The line must have at least two points.")
        return v

    @field_validator("coordinates")
    def is_ordered_by_time(
        cls, v: list[tuple[Time, Frequency]]
    ) -> list[tuple[Time, Frequency]]:
        """Validate that the line is ordered by time."""
        if not all(v[i][0] <= v[i + 1][0] for i in range(len(v) - 1)):
            raise ValueError("The line must be ordered by time.")
        return v


class Polygon(Geometry):
    """Polygon geometry type.

    This geometry type is used to mark a sound event with a polygon in time and
    frequency. Useful to mark in detail sounds that have a clear frequency
    trajectory and that are bounded by a clear start and end time.
    """

    type: Literal["Polygon"] = "Polygon"

    coordinates: list[list[tuple[Time, Frequency]]] = Field(
        ...,
        description="The polygon of the mark.",
    )
    """The polygon of the mark.

    All times are relative to the start of the recording."""

    @field_validator("coordinates")
    def has_at_least_one_ring(
        cls, v: list[list[tuple[Time, Frequency]]]
    ) -> list[list[tuple[Time, Frequency]]]:
        """Validate that the polygon has at least one ring."""
        if len(v) == 0:
            raise ValueError("The polygon must have at least one ring.")
        return v

    def _get_shapely_geometry(self) -> BaseGeometry:
        """Get the Shapely geometry object representing the mark.

        Returns
        -------
            The Shapely geometry object representing the mark.
        """
        shell = self.coordinates[0]
        holes = self.coordinates[1:]
        return geometry.Polygon(shell, holes)


class BoundingBox(Geometry):
    """BoundingBox geometry type.

    This geometry type is used to mark a sound event with a bounding box in
    time and frequency. Useful to mark sounds that have a clear frequency
    range and start and stop times.
    """

    type: Literal["BoundingBox"] = "BoundingBox"

    coordinates: tuple[Time, Frequency, Time, Frequency] = Field(
        ...,
        description="The bounding box of the mark.",
    )
    """The bounding box of the mark.

    The format is (start time, start frequency, end time, end frequency).
    All times are relative to the start of the recording.
    """

    @field_validator("coordinates")
    def validate_bounding_box(
        cls,
        v: tuple[Time, Frequency, Time, Frequency],
    ) -> tuple[Time, Frequency, Time, Frequency]:
        """Validate that the bounding box is valid."""
        if v[0] > v[2]:
            raise ValueError("The start time must be before the end time.")

        if v[1] > v[3]:
            raise ValueError(
                "The start frequency must be before the end frequency."
            )

        return v

    def _get_shapely_geometry(self) -> BaseGeometry:
        """Get the Shapely geometry object representing the mark."""
        start_time, start_frequency, end_time, end_frequency = self.coordinates
        return geometry.box(
            start_time,
            start_frequency,
            end_time,
            end_frequency,
        )


class MultiPoint(Geometry):
    """MultiPoint geometry type.

    This geometry type is used to mark a sound event with multiple points in
    time and frequency. Useful to mark multiple interesting points that
    together form a sound event.
    """

    type: Literal["MultiPoint"] = "MultiPoint"

    coordinates: list[tuple[Time, Frequency]] = Field(
        ...,
        description="The points of the mark.",
    )
    """The points of the mark.

    All times are relative to the start of the recording."""

    def _get_shapely_geometry(self) -> BaseGeometry:
        """Get the Shapely geometry object representing the mark.

        Returns
        -------
            The Shapely geometry object representing the mark.
        """
        return geometry.MultiPoint(self.coordinates)


class MultiLineString(Geometry):
    """MultiLineString geometry type.

    This geometry type is used to mark a sound event with multiple lines in
    time and frequency. Useful to mark multiple interesting lines that
    together form a sound event. For example, a sound event that has multiple
    harmonics.
    """

    type: Literal["MultiLineString"] = "MultiLineString"

    coordinates: list[list[tuple[Time, Frequency]]] = Field(
        ...,
        description="The lines of the mark.",
    )
    """The lines of the mark.

    All times are relative to the start of the recording."""

    def _get_shapely_geometry(self) -> BaseGeometry:
        """Get the Shapely geometry object representing the mark.

        Returns
        -------
            The Shapely geometry object representing the mark.
        """
        return geometry.MultiLineString(self.coordinates)

    @field_validator("coordinates")
    def has_at_least_one_line(
        cls, v: list[list[tuple[Time, Frequency]]]
    ) -> list[list[tuple[Time, Frequency]]]:
        """Validate that the multiline has at least one line."""
        if len(v) == 0:
            raise ValueError("The multiline must have at least one line.")
        return v

    @field_validator("coordinates")
    def each_line_has_at_least_two_points(
        cls, v: list[list[tuple[Time, Frequency]]]
    ) -> list[list[tuple[Time, Frequency]]]:
        """Validate that each line has at least two points."""
        if not all(len(line) >= 2 for line in v):
            raise ValueError("Each line must have at least two points.")
        return v

    @field_validator("coordinates")
    def each_line_is_ordered_by_time(
        cls, v: list[list[tuple[Time, Frequency]]]
    ) -> list[list[tuple[Time, Frequency]]]:
        """Validate that each line is ordered by time."""
        for line in v:
            if not all(
                line[i][0] <= line[i + 1][0] for i in range(len(line) - 1)
            ):
                raise ValueError("Each line must be ordered by time.")
        return v


class MultiPolygon(Geometry):
    """MultiPolygon geometry type.

    This geometry type is used to mark a sound event with multiple polygons in
    time and frequency. Useful to mark multiple interesting polygons that
    together form a sound event. For example sound events that have been
    occluded by other sound events and that are therefore split into multiple
    polygons.
    """

    type: Literal["MultiPolygon"] = "MultiPolygon"

    coordinates: list[list[list[tuple[Time, Frequency]]]] = Field(
        ...,
        description="The polygons of the mark.",
    )
    """The polygons of the mark.

    All times are relative to the start of the recording."""

    @field_validator("coordinates")
    def has_at_least_one_polygon(
        cls, v: list[list[list[tuple[Time, Frequency]]]]
    ) -> list[list[list[tuple[Time, Frequency]]]]:
        """Validate that the multipolygon has at least one polygon."""
        if len(v) == 0:
            raise ValueError(
                "The multipolygon must have at least one polygon."
            )
        return v

    @field_validator("coordinates")
    def each_polygon_has_at_least_one_ring(
        cls, v: list[list[list[tuple[Time, Frequency]]]]
    ) -> list[list[list[tuple[Time, Frequency]]]]:
        """Validate that each polygon has at least one ring."""
        for polygon in v:
            if len(polygon) == 0:
                raise ValueError("Each polygon must have at least one ring.")
        return v

    def _get_shapely_geometry(self) -> BaseGeometry:
        """Get the Shapely geometry object representing the mark.

        Returns
        -------
            The Shapely geometry object representing the mark.
        """
        polgons = []
        for poly in self.coordinates:
            shell = poly[0]
            holes = poly[1:]
            polygon = geometry.Polygon(shell, holes)
            polgons.append(polygon)
        return geometry.MultiPolygon(polgons)


def validate_geometry(
    geometry_type: str,
    json_geometry: str,
) -> tuple[GeometryType, Geometry]:
    """Parse and validate a geometry from a JSON string."""
    if geometry_type not in GEOMETRIES:
        raise ValueError(f"Unknown geometry type: {geometry_type}")

    geometry_cls = GEOMETRIES[geometry_type]
    return geometry_type, geometry_cls.model_validate_json(json_geometry)


GEOMETRIES: dict[GeometryType, type[Geometry]] = {
    "TimeStamp": TimeStamp,
    "TimeInterval": TimeInterval,
    "BoundingBox": BoundingBox,
    "Point": Point,
    "LineString": LineString,
    "Polygon": Polygon,
    "MultiPoint": MultiPoint,
    "MultiLineString": MultiLineString,
    "MultiPolygon": MultiPolygon,
}
