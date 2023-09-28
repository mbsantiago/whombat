"""Schemas for handling Prediction Runs."""
from uuid import UUID, uuid4

from pydantic import Field, computed_field, model_validator

from whombat.schemas.base import BaseSchema
from whombat.schemas.evaluation_sets import EvaluationSet
from whombat.schemas.evaluations import Evaluation
from whombat.schemas.users import SimpleUser

__all__ = [
    "PredictionRunUpdate",
    "PredictionRunCreate",
    "PredictionRun",
]


class PredictionRunCreate(BaseSchema):
    """Model Run creation schema."""

    uuid: UUID = Field(default_factory=uuid4)
    """Unique identifier of the model run."""

    user_id: UUID | None = None
    """If this is a user training run, the user ID of the user."""

    model_name: str | None = None
    """If this is a model run, the name of the model."""

    model_version: str | None = None
    """If this is a model run, the version of the model."""

    evaluation_set_id: int
    """The evaluation set ID to which this model run belongs."""

    @model_validator(mode="after")
    def validate_evaluation_set_id(self):
        """Make sure that either created_by_id or name is specified."""
        if not self.user_id and not self.model_name:
            raise ValueError("Either created_by_id or name must be specified.")

        if self.user_id and self.model_name:
            raise ValueError(
                "Only one of created_by_id or name can be specified."
            )

        return self


class PredictionRun(PredictionRunCreate):
    """Schema of a model run as returned to the user."""

    id: int
    """The databset identifier of the model run."""

    user: SimpleUser | None
    """If this is a user training run, the user ID of the user."""

    evaluation: Evaluation | None
    """The evaluation of the model run."""

    @computed_field
    @property
    def is_user_run(self) -> bool:
        """Return whether this is a user training run."""
        return self.user_id is not None

    @computed_field
    @property
    def is_model_run(self) -> bool:
        """Return whether this is a model run."""
        return self.model_name is not None


class PredictionRunUpdate(BaseSchema):
    """Model Run update schema."""

    model_name: str | None = None
    """If this is a model run, the name of the model."""

    model_version: str | None = None
    """If this is a model run, the version of the model."""
