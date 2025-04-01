"""Avoid cascading deletes of annotation tasks related to a clip.

Revision ID: a8a44e0eea11
Revises: bb3d93018481
Create Date: 2025-04-01 15:04:38.122087

"""

from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "a8a44e0eea11"
down_revision: Union[str, None] = "bb3d93018481"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table("annotation_task") as batch_op:
        batch_op.drop_constraint(
            "fk_annotation_task_clip_id_clip",
            type_="foreignkey",
        )
        batch_op.create_foreign_key(
            op.f("fk_annotation_task_clip_id_clip"),
            "clip",
            ["clip_id"],
            ["id"],
            ondelete="RESTRICT",
        )

    with op.batch_alter_table("clip") as batch_op:
        batch_op.drop_constraint(
            "fk_clip_recording_id_recording",
            type_="foreignkey",
        )
        batch_op.create_foreign_key(
            op.f("fk_clip_recording_id_recording"),
            "recording",
            ["recording_id"],
            ["id"],
            ondelete="CASCADE",
        )


def downgrade() -> None:
    with op.batch_alter_table("clip") as batch_op:
        batch_op.drop_constraint(
            op.f("fk_clip_recording_id_recording"),
            type_="foreignkey",
        )
        batch_op.create_foreign_key(
            "fk_clip_recording_id_recording",
            "recording",
            ["recording_id"],
            ["id"],
        )

    with op.batch_alter_table("annotation_task") as batch_op:
        batch_op.drop_constraint(
            op.f("fk_annotation_task_clip_id_clip"),
            type_="foreignkey",
        )
        batch_op.create_foreign_key(
            "fk_annotation_task_clip_id_clip",
            "clip",
            ["clip_id"],
            ["id"],
        )
