from datetime import date, datetime, time
from typing import Optional

from pydantic import BaseModel, ConfigDict, field_validator

from app.models import TripStatus


# ── Auth ──────────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ── Trail Links ───────────────────────────────────────────────────────────────

class TrailLinkCreate(BaseModel):
    label: str
    url: str

    @field_validator("url")
    @classmethod
    def url_must_be_http(cls, v: str) -> str:
        if not v.startswith(("http://", "https://")):
            raise ValueError("URL must start with http:// or https://")
        return v


class TrailLinkOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    trip_id: int
    label: str
    url: str


# ── Checklist Items ───────────────────────────────────────────────────────────

class ChecklistItemCreate(BaseModel):
    label: str
    sort_order: int = 0


class ChecklistItemUpdate(BaseModel):
    label: Optional[str] = None
    sort_order: Optional[int] = None
    is_checked: Optional[bool] = None


class ChecklistItemToggle(BaseModel):
    is_checked: bool


class ChecklistItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    guest_id: int
    label: str
    is_checked: bool
    sort_order: int


# ── Guests ────────────────────────────────────────────────────────────────────

class GuestCreate(BaseModel):
    name: str
    notes: Optional[str] = None


class GuestUpdate(BaseModel):
    notes: Optional[str] = None


class ChecklistProgress(BaseModel):
    total: int
    checked: int


class GuestSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    token: str
    trip_id: int
    notes: Optional[str] = None
    checklist_progress: ChecklistProgress


class GuestOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    token: str
    trip_id: int
    notes: Optional[str] = None
    created_at: datetime


# ── Trips ─────────────────────────────────────────────────────────────────────

class TripCreate(BaseModel):
    name: str
    description: Optional[str] = None
    start_date: date
    end_date: Optional[date] = None
    start_time: Optional[time] = None
    meeting_point_name: Optional[str] = None
    meeting_point_lat: Optional[float] = None
    meeting_point_lng: Optional[float] = None
    trail_lat: Optional[float] = None
    trail_lng: Optional[float] = None
    status: TripStatus = TripStatus.planning
    trail_links: list[TrailLinkCreate] = []


class TripUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    start_time: Optional[time] = None
    meeting_point_name: Optional[str] = None
    meeting_point_lat: Optional[float] = None
    meeting_point_lng: Optional[float] = None
    trail_lat: Optional[float] = None
    trail_lng: Optional[float] = None
    status: Optional[TripStatus] = None


class TripOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: Optional[str] = None
    start_date: date
    end_date: Optional[date] = None
    start_time: Optional[time] = None
    meeting_point_name: Optional[str] = None
    meeting_point_lat: Optional[float] = None
    meeting_point_lng: Optional[float] = None
    trail_lat: Optional[float] = None
    trail_lng: Optional[float] = None
    status: TripStatus
    created_at: datetime
    updated_at: datetime
    trail_links: list[TrailLinkOut] = []


class TripListOut(TripOut):
    guest_count: int


class TripDetailOut(TripOut):
    guests: list[GuestSummary] = []


# ── Templates ─────────────────────────────────────────────────────────────────

class TemplateItemCreate(BaseModel):
    label: str
    sort_order: int = 0


class TemplateItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    template_id: int
    label: str
    sort_order: int


class TemplateCreate(BaseModel):
    name: str
    items: list[TemplateItemCreate] = []


class TemplateOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    created_at: datetime
    items: list[TemplateItemOut] = []


# ── Public guest endpoint ─────────────────────────────────────────────────────

class PublicTripInfo(BaseModel):
    name: str
    description: Optional[str] = None
    start_date: date
    end_date: Optional[date] = None
    start_time: Optional[time] = None
    meeting_point_name: Optional[str] = None
    meeting_point_lat: Optional[float] = None
    meeting_point_lng: Optional[float] = None
    trail_lat: Optional[float] = None
    trail_lng: Optional[float] = None
    trail_links: list[TrailLinkOut] = []


class PublicChecklistItem(BaseModel):
    id: int
    label: str
    is_checked: bool
    sort_order: int


class GuestDashboardOut(BaseModel):
    trip: PublicTripInfo
    guest_name: str
    checklist: list[PublicChecklistItem]


# ── Error ─────────────────────────────────────────────────────────────────────

class ErrorResponse(BaseModel):
    error: str
    code: str
