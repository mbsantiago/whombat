"""API functions to interact with notes."""

from uuid import UUID

from soundevent import data
from sqlalchemy.ext.asyncio import AsyncSession

from whombat import exceptions, models, schemas
from whombat.api.common import BaseAPI
from whombat.api.users import users

__all__ = [
    "NoteAPI",
    "notes",
]


class NoteAPI(
    BaseAPI[
        UUID,
        models.Note,
        schemas.Note,
        schemas.NoteCreate,
        schemas.NoteUpdate,
    ]
):
    _model = models.Note
    _schema = schemas.Note

    async def create(
        self,
        session: AsyncSession,
        message: str,
        is_issue: bool = False,
        created_by: schemas.SimpleUser | None = None,
        **kwargs,
    ) -> schemas.Note:
        """Create a note.

        Parameters
        ----------
        session
            The database session to use.
        message
            The note message.
        is_issue
            Whether the note is an issue. Defaults to False. Used to indicate
            that the note is an issue that needs to be resolved.
        created_by
            The user that created the note. Defaults to None.
        **kwargs
            Additional keyword arguments to use when creating the note,
            (e.g. `uuid` or `created_on`.)

        Returns
        -------
        note : schemas.Note
            The created note.
        """
        return await self.create_from_data(
            session,
            schemas.NoteCreate(
                message=message,
                is_issue=is_issue,
            ),
            created_by_id=created_by.id if created_by is not None else None,
            **kwargs,
        )

    async def from_soundevent(
        self,
        session: AsyncSession,
        data: data.Note,
    ) -> schemas.Note:
        """Create a note from a soundevent Note object.

        Parameters
        ----------
        session
            The database session to use.
        data
            The soundevent Note object.

        Returns
        -------
        note : schemas.Note
            The created note.
        """
        try:
            return await self.get(session, data.uuid)
        except exceptions.NotFoundError:
            pass

        user_id = None
        if data.created_by is not None:
            user = await users.from_soundevent(session, data.created_by)
            user_id = user.id

        return await self.create_from_data(
            session,
            schemas.NoteCreate(
                message=data.message,
                is_issue=data.is_issue,
            ),
            created_by_id=user_id,
            uuid=data.uuid,
            created_on=data.created_on,
        )

    def to_soundevent(
        self,
        obj: schemas.Note,
    ) -> data.Note:
        """Create a soundevent Note object from a note.

        Parameters
        ----------
        obj
            The note.

        Returns
        -------
        note : data.Note
            The soundevent Note object.
        """
        user = obj.created_by
        created_by = None
        if user is not None:
            created_by = data.User(
                uuid=user.id,
                email=user.email,
                username=user.username,
                name=user.name,
            )

        return data.Note(
            uuid=obj.uuid,
            created_on=obj.created_on,
            message=obj.message,
            created_by=created_by,
            is_issue=obj.is_issue,
        )


notes = NoteAPI()
