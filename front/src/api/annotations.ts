

//
// class AnnotationCreate(BaseSchema):
//     """Schema for data required to create an Annotation."""
//
//     uuid: UUID = Field(default_factory=uuid4)
//     """UUID of this annotation."""
//
//     task_id: int
//     """ID of the task this annotation belongs to."""
//
//     created_by_id: UUID
//     """ID of the user who created this annotation."""
//
//     sound_event_id: int
//     """Sound event this annotation is about."""
//
//
// class Annotation(AnnotationCreate):
//     """Schema for an Annotation."""
//
//     id: int
//     """Database ID of this annotation."""
//
//     created_by: SimpleUser
//     """User who created this annotation."""
//
//     sound_event: SoundEvent
//
//     notes: list[Note] = Field(default_factory=list)
//     """Notes attached to this annotation."""
//
//     tags: list[Tag] = Field(default_factory=list)
//     """Tags attached to this annotation."""
