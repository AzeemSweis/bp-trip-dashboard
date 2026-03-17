def test_add_guest(client, auth_headers, sample_trip):
    trip_id = sample_trip["id"]
    resp = client.post(
        f"/api/trips/{trip_id}/guests",
        json={"name": "Sarah"},
        headers=auth_headers,
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == "Sarah"
    assert "token" in data
    assert data["trip_id"] == trip_id
    assert data["checklist_progress"] == {"total": 0, "checked": 0}


def test_add_guest_with_notes(client, auth_headers, sample_trip):
    trip_id = sample_trip["id"]
    resp = client.post(
        f"/api/trips/{trip_id}/guests",
        json={"name": "Mike", "notes": "Has bear canister"},
        headers=auth_headers,
    )
    assert resp.status_code == 201
    assert resp.json()["notes"] == "Has bear canister"


def test_add_guest_trip_not_found(client, auth_headers):
    resp = client.post(
        "/api/trips/9999/guests",
        json={"name": "Ghost"},
        headers=auth_headers,
    )
    assert resp.status_code == 404


def test_remove_guest(client, auth_headers, sample_trip, sample_guest):
    trip_id = sample_trip["id"]
    guest_id = sample_guest["id"]
    resp = client.delete(f"/api/trips/{trip_id}/guests/{guest_id}", headers=auth_headers)
    assert resp.status_code == 204


def test_trip_detail_shows_guest_progress(client, auth_headers, sample_trip, sample_guest):
    trip_id = sample_trip["id"]
    guest_id = sample_guest["id"]

    # Add 2 checklist items
    client.post(
        f"/api/guests/{guest_id}/checklist",
        json={"label": "Tent", "sort_order": 0},
        headers=auth_headers,
    )
    client.post(
        f"/api/guests/{guest_id}/checklist",
        json={"label": "Sleeping bag", "sort_order": 1},
        headers=auth_headers,
    )

    resp = client.get(f"/api/trips/{trip_id}", headers=auth_headers)
    assert resp.status_code == 200
    guests = resp.json()["guests"]
    assert len(guests) == 1
    progress = guests[0]["checklist_progress"]
    assert progress["total"] == 2
    assert progress["checked"] == 0
