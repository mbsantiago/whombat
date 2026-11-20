"""HTTP endpoints for dataset export."""

from io import BytesIO
from uuid import UUID

from fastapi import APIRouter
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel

from whombat_tflm_export.export import build_export, load_profile

from whombat.routes.dependencies import Session, WhombatSettings

router = APIRouter()


class ExportRequest(BaseModel):
    project_uuid: UUID


@router.post("/export/")
async def export_project(
    request: ExportRequest, session: Session, settings: WhombatSettings
):
    result = await build_export(
        session, settings.audio_dir, request.project_uuid, load_profile()
    )
    return StreamingResponse(
        BytesIO(result.zip_bytes),
        media_type="application/zip",
        headers={
            "X-Integrity-Report": __import__("json").dumps(result.report)
        },
    )


@router.post("/export/report/")
async def export_report(
    request: ExportRequest, session: Session, settings: WhombatSettings
):
    result = await build_export(
        session, settings.audio_dir, request.project_uuid, load_profile()
    )
    return JSONResponse(result.report)
