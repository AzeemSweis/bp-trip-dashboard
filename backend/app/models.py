import enum
import uuid
from datetime import datetime, date, time
from typing import Optional, List

from sqlalchemy import (
    Boolean,
    DateTime,
    Date,
    Enum,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    Time,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class TripStatus(str, enum.Enum):
    planning = "planning"
    ready = "ready"
    completed = "completed"
    cancelled = "cancelled"


class AdminUser(Base):
    __tablename__ = "admin_user"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String, nullable=False)


class Trip(Base):
    __tablename__ = "trips"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    start_time: Mapped[Optional[time]] = mapped_column(Time, nullable=True)
    meeting_point_name: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    meeting_point_lat: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    meeting_point_lng: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    trail_lat: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    trail_lng: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    status: Mapped[TripStatus] = mapped_column(
        Enum(TripStatus), nullable=False, default=TripStatus.planning
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, server_default=func.now(), onupdate=func.now()
    )

    trail_links: Mapped[List["TrailLink"]] = relationship(
        "TrailLink", back_populates="trip", cascade="all, delete-orphan"
    )
    guests: Mapped[List["Guest"]] = relationship(
        "Guest", back_populates="trip", cascade="all, delete-orphan"
    )


class TrailLink(Base):
    __tablename__ = "trail_links"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    trip_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("trips.id", ondelete="CASCADE"), nullable=False
    )
    label: Mapped[str] = mapped_column(String, nullable=False)
    url: Mapped[str] = mapped_column(Text, nullable=False)

    trip: Mapped["Trip"] = relationship("Trip", back_populates="trail_links")


class Guest(Base):
    __tablename__ = "guests"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    trip_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("trips.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String, nullable=False)
    token: Mapped[str] = mapped_column(
        String, unique=True, nullable=False, default=lambda: str(uuid.uuid4())
    )
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, server_default=func.now()
    )

    trip: Mapped["Trip"] = relationship("Trip", back_populates="guests")
    checklist_items: Mapped[List["ChecklistItem"]] = relationship(
        "ChecklistItem", back_populates="guest", cascade="all, delete-orphan"
    )


class ChecklistItem(Base):
    __tablename__ = "checklist_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    guest_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("guests.id", ondelete="CASCADE"), nullable=False
    )
    label: Mapped[str] = mapped_column(String, nullable=False)
    is_checked: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    guest: Mapped["Guest"] = relationship("Guest", back_populates="checklist_items")


class ChecklistTemplate(Base):
    __tablename__ = "checklist_templates"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, server_default=func.now()
    )

    items: Mapped[List["TemplateItem"]] = relationship(
        "TemplateItem", back_populates="template", cascade="all, delete-orphan"
    )


class TemplateItem(Base):
    __tablename__ = "template_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    template_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("checklist_templates.id", ondelete="CASCADE"), nullable=False
    )
    label: Mapped[str] = mapped_column(String, nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    template: Mapped["ChecklistTemplate"] = relationship(
        "ChecklistTemplate", back_populates="items"
    )
