import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import ChecklistItem, Guest
from app.schemas import (
    ChecklistItemOut,
    ChecklistItemToggle,
    GuestDashboardOut,
    PublicChecklistItem,
    PublicTripInfo,
    TrailLinkOut,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/guest", tags=["public"])


def _get_guest_by_token(token: str, db: Session) -> Guest:
    guest = db.query(Guest).filter(Guest.token == token).first()
    if not guest:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Guest not found",
        )
    return guest


@router.get("/{guest_token}", response_model=GuestDashboardOut)
def get_guest_dashboard(guest_token: str, db: Session = Depends(get_db)) -> GuestDashboardOut:
    guest = _get_guest_by_token(guest_token, db)
    trip = guest.trip

    trail_links = [
        TrailLinkOut(id=link.id, trip_id=link.trip_id, label=link.label, url=link.url)
        for link in trip.trail_links
    ]

    trip_info = PublicTripInfo(
        name=trip.name,
        description=trip.description,
        start_date=trip.start_date,
        end_date=trip.end_date,
        start_time=trip.start_time,
        meeting_point_name=trip.meeting_point_name,
        meeting_point_lat=trip.meeting_point_lat,
        meeting_point_lng=trip.meeting_point_lng,
        trail_lat=trip.trail_lat,
        trail_lng=trip.trail_lng,
        trail_links=trail_links,
    )

    checklist = [
        PublicChecklistItem(
            id=item.id,
            label=item.label,
            is_checked=item.is_checked,
            sort_order=item.sort_order,
        )
        for item in sorted(guest.checklist_items, key=lambda x: (x.sort_order, x.id))
    ]

    return GuestDashboardOut(
        trip=trip_info,
        guest_name=guest.name,
        checklist=checklist,
    )


@router.patch("/{guest_token}/checklist/{item_id}", response_model=ChecklistItemOut)
def toggle_checklist_item(
    guest_token: str,
    item_id: int,
    payload: ChecklistItemToggle,
    db: Session = Depends(get_db),
) -> ChecklistItemOut:
    guest = _get_guest_by_token(guest_token, db)

    item = (
        db.query(ChecklistItem)
        .filter(ChecklistItem.id == item_id, ChecklistItem.guest_id == guest.id)
        .first()
    )
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Checklist item not found",
        )

    item.is_checked = payload.is_checked
    db.commit()
    db.refresh(item)
    logger.info(
        "Guest token=%s toggled item id=%d is_checked=%s",
        guest_token[:8],
        item_id,
        payload.is_checked,
    )
    return ChecklistItemOut.model_validate(item)
