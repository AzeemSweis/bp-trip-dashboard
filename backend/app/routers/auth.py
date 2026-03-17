from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.auth import create_access_token, verify_password
from app.database import get_db
from app.models import AdminUser
from app.rate_limit import check_rate_limit, record_attempt
from app.schemas import LoginRequest, TokenResponse

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, request: Request, db: Session = Depends(get_db)) -> TokenResponse:
    check_rate_limit(request)
    record_attempt(request)

    user = db.query(AdminUser).filter(AdminUser.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    token = create_access_token({"sub": user.email})
    return TokenResponse(access_token=token)
