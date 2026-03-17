def test_list_trips_empty(client, auth_headers):
    resp = client.get("/api/trips", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json() == []


def test_create_trip(client, auth_headers):
    resp = client.post(
        "/api/trips",
        json={
            "name": "Mt. Whitney",
            "start_date": "2026-08-01",
            "end_date": "2026-08-03",
            "start_time": "06:00:00",
            "meeting_point_name": "Walmart parking lot",
            "meeting_point_lat": 36.57,
            "meeting_point_lng": -118.29,
            "trail_links": [
                {"label": "AllTrails", "url": "https://alltrails.com/trail/1"}
            ],
        },
        headers=auth_headers,
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == "Mt. Whitney"
    assert data["status"] == "planning"
    assert len(data["trail_links"]) == 1
    assert data["trail_links"][0]["label"] == "AllTrails"


def test_create_trip_with_status(client, auth_headers):
    resp = client.post(
        "/api/trips",
        json={"name": "Day Hike", "start_date": "2026-09-01", "status": "ready"},
        headers=auth_headers,
    )
    assert resp.status_code == 201
    assert resp.json()["status"] == "ready"


def test_get_trip(client, auth_headers, sample_trip):
    trip_id = sample_trip["id"]
    resp = client.get(f"/api/trips/{trip_id}", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["id"] == trip_id
    assert data["name"] == "Test Trip"
    assert "guests" in data


def test_get_trip_not_found(client, auth_headers):
    resp = client.get("/api/trips/9999", headers=auth_headers)
    assert resp.status_code == 404


def test_update_trip(client, auth_headers, sample_trip):
    trip_id = sample_trip["id"]
    resp = client.put(
        f"/api/trips/{trip_id}",
        json={"name": "Updated Name", "status": "completed"},
        headers=auth_headers,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["name"] == "Updated Name"
    assert data["status"] == "completed"


def test_delete_trip(client, auth_headers, sample_trip):
    trip_id = sample_trip["id"]
    resp = client.delete(f"/api/trips/{trip_id}", headers=auth_headers)
    assert resp.status_code == 204

    resp = client.get(f"/api/trips/{trip_id}", headers=auth_headers)
    assert resp.status_code == 404


def test_list_trips_shows_guest_count(client, auth_headers, sample_trip, sample_guest):
    resp = client.get("/api/trips", headers=auth_headers)
    assert resp.status_code == 200
    trips = resp.json()
    assert len(trips) == 1
    assert trips[0]["guest_count"] == 1


def test_add_trail_link(client, auth_headers, sample_trip):
    trip_id = sample_trip["id"]
    resp = client.post(
        f"/api/trips/{trip_id}/links",
        json={"label": "CalTopo", "url": "https://caltopo.com/map/ABC"},
        headers=auth_headers,
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["label"] == "CalTopo"
    assert data["trip_id"] == trip_id


def test_delete_trail_link(client, auth_headers, sample_trip):
    trip_id = sample_trip["id"]
    create_resp = client.post(
        f"/api/trips/{trip_id}/links",
        json={"label": "AllTrails", "url": "https://alltrails.com/1"},
        headers=auth_headers,
    )
    link_id = create_resp.json()["id"]

    del_resp = client.delete(f"/api/trips/{trip_id}/links/{link_id}", headers=auth_headers)
    assert del_resp.status_code == 204


def test_invalid_trip_status(client, auth_headers):
    resp = client.post(
        "/api/trips",
        json={"name": "Bad Status", "start_date": "2026-09-01", "status": "invalid_value"},
        headers=auth_headers,
    )
    assert resp.status_code == 422
