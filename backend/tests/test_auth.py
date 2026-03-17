def test_health(client):
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


def test_login_success(client):
    resp = client.post(
        "/api/auth/login",
        json={"email": "admin@test.com", "password": "testpass123"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_wrong_password(client):
    resp = client.post(
        "/api/auth/login",
        json={"email": "admin@test.com", "password": "wrong"},
    )
    assert resp.status_code == 401


def test_login_wrong_email(client):
    resp = client.post(
        "/api/auth/login",
        json={"email": "nobody@example.com", "password": "testpass123"},
    )
    assert resp.status_code == 401


def test_protected_route_no_token(client):
    resp = client.get("/api/trips")
    assert resp.status_code == 403


def test_protected_route_bad_token(client):
    resp = client.get("/api/trips", headers={"Authorization": "Bearer badtoken"})
    assert resp.status_code == 401
