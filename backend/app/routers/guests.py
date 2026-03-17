import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth import get_current_admin
from app.database import get_db
from app.models import AdminUser, ChecklistItem, Guest
from app.schemas import (
    ChecklistItemCreate,
    ChecklistItemOut,
    ChecklistItemUpdate,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/guests", tags=["guests"])

AdminDep = Annotated[AdminUser, Depends(get_current_admin)]
DBDep = Annotated[Session, Depends(get_db)]


def _get_guest_or_404(guest_id: int, db: Session) -> Guest:
    guest = db.query(Guest).filter(Guest.id == guest_id).first()
    if not guest:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Guest {guest_id} not found",
        )
    return guest


def _get_item_or_404(guest_id: int, item_id: int, db: Session) -> ChecklistItem:
    item = (
        db.query(ChecklistItem)
        .filter(ChecklistItem.id == item_id, ChecklistItem.guest_id == guest_id)
        .first()
    )
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Checklist item not found",
        )
    return item


# ── Checklist CRUD ────────────────────────────────────────────────────────────

@router.get("/{guest_id}/checklist", response_model=list[ChecklistItemOut])
def get_checklist(guest_id: int, db: DBDep, _admin: AdminDep) -> list[ChecklistItemOut]:
    _get_guest_or_404(guest_id, db)
    items = (
        db.query(ChecklistItem)
        .filter(ChecklistItem.guest_id == guest_id)
        .order_by(ChecklistItem.sort_order, ChecklistItem.id)
        .all()
    )
    return [ChecklistItemOut.model_validate(i) for i in items]


@router.post(
    "/{guest_id}/checklist",
    response_model=ChecklistItemOut,
    status_code=status.HTTP_201_CREATED,
)
def add_checklist_item(
    guest_id: int, payload: ChecklistItemCreate, db: DBDep, _admin: AdminDep
) -> ChecklistItemOut:
    _get_guest_or_404(guest_id, db)
    item = ChecklistItem(
        guest_id=guest_id,
        label=payload.label,
        sort_order=payload.sort_order,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    logger.info("Added checklist item id=%d to guest id=%d", item.id, guest_id)
    return ChecklistItemOut.model_validate(item)


@router.put(
    "/{guest_id}/checklist/{item_id}",
    response_model=ChecklistItemOut,
)
def update_checklist_item(
    guest_id: int,
    item_id: int,
    payload: ChecklistItemUpdate,
    db: DBDep,
    _admin: AdminDep,
) -> ChecklistItemOut:
    item = _get_item_or_404(guest_id, item_id, db)
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return ChecklistItemOut.model_validate(item)


@router.delete("/{guest_id}/checklist/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_checklist_item(
    guest_id: int, item_id: int, db: DBDep, _admin: AdminDep
) -> None:
    item = _get_item_or_404(guest_id, item_id, db)
    db.delete(item)
    db.commit()
    logger.info("Deleted checklist item id=%d from guest id=%d", item_id, guest_id)


# ── Apply template to guest ───────────────────────────────────────────────────

@router.post(
    "/{guest_id}/checklist/from-template/{template_id}",
    response_model=list[ChecklistItemOut],
    status_code=status.HTTP_201_CREATED,
)
def apply_template_to_guest(
    guest_id: int,
    template_id: int,
    db: DBDep,
    _admin: AdminDep,
) -> list[ChecklistItemOut]:
    from app.models import ChecklistTemplate

    _get_guest_or_404(guest_id, db)
    template = db.query(ChecklistTemplate).filter(ChecklistTemplate.id == template_id).first()
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Template {template_id} not found",
        )

    created: list[ChecklistItem] = []
    for t_item in sorted(template.items, key=lambda x: x.sort_order):
        item = ChecklistItem(
            guest_id=guest_id,
            label=t_item.label,
            sort_order=t_item.sort_order,
        )
        db.add(item)
        created.append(item)

    db.commit()
    for item in created:
        db.refresh(item)

    logger.info(
        "Applied template id=%d to guest id=%d, added %d items",
        template_id,
        guest_id,
        len(created),
    )
    return [ChecklistItemOut.model_validate(i) for i in created]
