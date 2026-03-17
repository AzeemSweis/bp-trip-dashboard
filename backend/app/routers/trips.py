import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth import get_current_admin
from app.database import get_db
from app.models import AdminUser, Guest, Trip, TrailLink
from app.schemas import (
    ChecklistProgress,
    GuestCreate,
    GuestSummary,
    TripCreate,
    TripDetailOut,
    TripListOut,
    TripOut,
    TripUpdate,
    TrailLinkCreate,
    TrailLinkOut,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/trips", tags=["trips"])

AdminDep = Annotated[AdminUser, Depends(get_current_admin)]
DBDep = Annotated[Session, Depends(get_db)]


def _guest_summary(guest: Guest) -> GuestSummary:
    total = len(guest.checklist_items)
    checked = sum(1 for item in guest.checklist_items if item.is_checked)
    return GuestSummary(
        id=guest.id,
        name=guest.name,
        token=guest.token,
        trip_id=guest.trip_id,
        notes=guest.notes,
        checklist_progress=ChecklistProgress(total=total, checked=checked),
    )


def _get_trip_or_404(trip_id: int, db: Session) -> Trip:
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Trip {trip_id} not found",
        )
    return trip


# ── List ──────────────────────────────────────────────────────────────────────

@router.get("", response_model=list[TripListOut])
def list_trips(db: DBDep, _admin: AdminDep) -> list[TripListOut]:
    trips = db.query(Trip).order_by(Trip.start_date.desc()).all()
    result = []
    for trip in trips:
        out = TripListOut(
            **TripOut.model_validate(trip).model_dump(),
            guest_count=len(trip.guests),
        )
        result.append(out)
    return result


# ── Create ────────────────────────────────────────────────────────────────────

@router.post("", response_model=TripOut, status_code=status.HTTP_201_CREATED)
def create_trip(payload: TripCreate, db: DBDep, _admin: AdminDep) -> TripOut:
    trip = Trip(
        name=payload.name,
        description=payload.description,
        start_date=payload.start_date,
        end_date=payload.end_date,
        start_time=payload.start_time,
        meeting_point_name=payload.meeting_point_name,
        meeting_point_lat=payload.meeting_point_lat,
        meeting_point_lng=payload.meeting_point_lng,
        trail_lat=payload.trail_lat,
        trail_lng=payload.trail_lng,
        status=payload.status,
    )
    db.add(trip)
    db.flush()

    for link_data in payload.trail_links:
        db.add(TrailLink(trip_id=trip.id, label=link_data.label, url=link_data.url))

    db.commit()
    db.refresh(trip)
    logger.info("Created trip id=%d name=%s", trip.id, trip.name)
    return TripOut.model_validate(trip)


# ── Get one ───────────────────────────────────────────────────────────────────

@router.get("/{trip_id}", response_model=TripDetailOut)
def get_trip(trip_id: int, db: DBDep, _admin: AdminDep) -> TripDetailOut:
    trip = _get_trip_or_404(trip_id, db)
    guests = [_guest_summary(g) for g in trip.guests]
    base = TripOut.model_validate(trip)
    return TripDetailOut(**base.model_dump(), guests=guests)


# ── Update ────────────────────────────────────────────────────────────────────

@router.put("/{trip_id}", response_model=TripOut)
def update_trip(trip_id: int, payload: TripUpdate, db: DBDep, _admin: AdminDep) -> TripOut:
    trip = _get_trip_or_404(trip_id, db)
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(trip, field, value)
    db.commit()
    db.refresh(trip)
    logger.info("Updated trip id=%d", trip.id)
    return TripOut.model_validate(trip)


# ── Delete ────────────────────────────────────────────────────────────────────

@router.delete("/{trip_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_trip(trip_id: int, db: DBDep, _admin: AdminDep) -> None:
    trip = _get_trip_or_404(trip_id, db)
    db.delete(trip)
    db.commit()
    logger.info("Deleted trip id=%d", trip_id)


# ── Trail Links ───────────────────────────────────────────────────────────────

@router.post("/{trip_id}/links", response_model=TrailLinkOut, status_code=status.HTTP_201_CREATED)
def add_trail_link(
    trip_id: int, payload: TrailLinkCreate, db: DBDep, _admin: AdminDep
) -> TrailLinkOut:
    _get_trip_or_404(trip_id, db)
    link = TrailLink(trip_id=trip_id, label=payload.label, url=payload.url)
    db.add(link)
    db.commit()
    db.refresh(link)
    return TrailLinkOut.model_validate(link)


@router.delete("/{trip_id}/links/{link_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_trail_link(trip_id: int, link_id: int, db: DBDep, _admin: AdminDep) -> None:
    link = (
        db.query(TrailLink)
        .filter(TrailLink.id == link_id, TrailLink.trip_id == trip_id)
        .first()
    )
    if not link:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trail link not found")
    db.delete(link)
    db.commit()


# ── Guests ────────────────────────────────────────────────────────────────────

@router.post(
    "/{trip_id}/guests",
    response_model=GuestSummary,
    status_code=status.HTTP_201_CREATED,
)
def add_guest(
    trip_id: int,
    payload: GuestCreate,
    db: DBDep,
    _admin: AdminDep,
) -> GuestSummary:
    _get_trip_or_404(trip_id, db)
    guest = Guest(trip_id=trip_id, name=payload.name, notes=payload.notes)
    db.add(guest)
    db.commit()
    db.refresh(guest)
    logger.info("Added guest id=%d name=%s to trip id=%d", guest.id, guest.name, trip_id)
    return _guest_summary(guest)


@router.delete("/{trip_id}/guests/{guest_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_guest(trip_id: int, guest_id: int, db: DBDep, _admin: AdminDep) -> None:
    guest = (
        db.query(Guest)
        .filter(Guest.id == guest_id, Guest.trip_id == trip_id)
        .first()
    )
    if not guest:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Guest not found")
    db.delete(guest)
    db.commit()
    logger.info("Removed guest id=%d from trip id=%d", guest_id, trip_id)
