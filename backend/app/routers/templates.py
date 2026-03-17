import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth import get_current_admin
from app.database import get_db
from app.models import AdminUser, ChecklistTemplate, TemplateItem
from app.schemas import TemplateCreate, TemplateOut

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/templates", tags=["templates"])

AdminDep = Annotated[AdminUser, Depends(get_current_admin)]
DBDep = Annotated[Session, Depends(get_db)]


def _get_template_or_404(template_id: int, db: Session) -> ChecklistTemplate:
    tmpl = db.query(ChecklistTemplate).filter(ChecklistTemplate.id == template_id).first()
    if not tmpl:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Template {template_id} not found",
        )
    return tmpl


@router.get("", response_model=list[TemplateOut])
def list_templates(db: DBDep, _admin: AdminDep) -> list[TemplateOut]:
    templates = db.query(ChecklistTemplate).order_by(ChecklistTemplate.created_at.desc()).all()
    return [TemplateOut.model_validate(t) for t in templates]


@router.post("", response_model=TemplateOut, status_code=status.HTTP_201_CREATED)
def create_template(payload: TemplateCreate, db: DBDep, _admin: AdminDep) -> TemplateOut:
    tmpl = ChecklistTemplate(name=payload.name)
    db.add(tmpl)
    db.flush()

    for item_data in payload.items:
        db.add(
            TemplateItem(
                template_id=tmpl.id,
                label=item_data.label,
                sort_order=item_data.sort_order,
            )
        )

    db.commit()
    db.refresh(tmpl)
    logger.info("Created template id=%d name=%s", tmpl.id, tmpl.name)
    return TemplateOut.model_validate(tmpl)


@router.get("/{template_id}", response_model=TemplateOut)
def get_template(template_id: int, db: DBDep, _admin: AdminDep) -> TemplateOut:
    tmpl = _get_template_or_404(template_id, db)
    return TemplateOut.model_validate(tmpl)


@router.delete("/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_template(template_id: int, db: DBDep, _admin: AdminDep) -> None:
    tmpl = _get_template_or_404(template_id, db)
    db.delete(tmpl)
    db.commit()
    logger.info("Deleted template id=%d", template_id)
