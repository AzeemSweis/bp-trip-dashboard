import logging

from sqlalchemy.orm import Session

from app.auth import hash_password
from app.config import settings
from app.models import AdminUser

logger = logging.getLogger(__name__)


def seed_admin(db: Session) -> None:
    existing = db.query(AdminUser).first()
    if existing:
        logger.info("Admin user already exists, skipping seed.")
        return

    admin = AdminUser(
        email=settings.admin_email,
        password_hash=hash_password(settings.admin_password),
    )
    db.add(admin)
    db.commit()
    logger.info("Admin user seeded: %s", settings.admin_email)
