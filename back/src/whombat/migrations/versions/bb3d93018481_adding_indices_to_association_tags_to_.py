"""Adding indices to association tags to speed up queries.

Revision ID: bb3d93018481
Revises: b9f0f5a64c37
Create Date: 2024-09-25 00:31:39.388156
"""

from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "bb3d93018481"
down_revision: Union[str, None] = "b9f0f5a64c37"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table("sound_event_annotation_tag") as batch_op:
        batch_op.create_index(
            op.f("ix_sound_event_annotation_tag_created_by_id"),
            ["created_by_id"],
            unique=False,
        )
        batch_op.create_index(
            op.f("ix_sound_event_annotation_tag_sound_event_annotation_id"),
            ["sound_event_annotation_id"],
            unique=False,
        )
        batch_op.create_index(
            op.f("ix_sound_event_annotation_tag_tag_id"),
            ["tag_id"],
            unique=False,
        )
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table("sound_event_annotation_tag") as batch_op:
        batch_op.drop_index(
            op.f("ix_sound_event_annotation_tag_tag_id"),
        )
        batch_op.drop_index(
            op.f("ix_sound_event_annotation_tag_sound_event_annotation_id"),
        )
        batch_op.drop_index(
            op.f("ix_sound_event_annotation_tag_created_by_id"),
        )
    # ### end Alembic commands ###
