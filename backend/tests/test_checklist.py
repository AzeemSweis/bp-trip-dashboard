def test_get_checklist_empty(client, auth_headers, sample_guest):
    guest_id = sample_guest["id"]
    resp = client.get(f"/api/guests/{guest_id}/checklist", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json() == []


def test_add_checklist_item(client, auth_headers, sample_guest):
    guest_id = sample_guest["id"]
    resp = client.post(
        f"/api/guests/{guest_id}/checklist",
        json={"label": "Tent", "sort_order": 0},
        headers=auth_headers,
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["label"] == "Tent"
    assert data["is_checked"] is False
    assert data["guest_id"] == guest_id


def test_update_checklist_item(client, auth_headers, sample_guest):
    guest_id = sample_guest["id"]
    create_resp = client.post(
        f"/api/guests/{guest_id}/checklist",
        json={"label": "Old Label", "sort_order": 0},
        headers=auth_headers,
    )
    item_id = create_resp.json()["id"]

    update_resp = client.put(
        f"/api/guests/{guest_id}/checklist/{item_id}",
        json={"label": "New Label", "sort_order": 5},
        headers=auth_headers,
    )
    assert update_resp.status_code == 200
    data = update_resp.json()
    assert data["label"] == "New Label"
    assert data["sort_order"] == 5


def test_delete_checklist_item(client, auth_headers, sample_guest):
    guest_id = sample_guest["id"]
    create_resp = client.post(
        f"/api/guests/{guest_id}/checklist",
        json={"label": "To Delete", "sort_order": 0},
        headers=auth_headers,
    )
    item_id = create_resp.json()["id"]

    del_resp = client.delete(
        f"/api/guests/{guest_id}/checklist/{item_id}", headers=auth_headers
    )
    assert del_resp.status_code == 204

    list_resp = client.get(f"/api/guests/{guest_id}/checklist", headers=auth_headers)
    assert list_resp.json() == []


def test_public_guest_dashboard(client, auth_headers, sample_trip, sample_guest):
    guest_id = sample_guest["id"]
    guest_token = sample_guest["token"]

    client.post(
        f"/api/guests/{guest_id}/checklist",
        json={"label": "Water filter", "sort_order": 0},
        headers=auth_headers,
    )

    resp = client.get(f"/api/guest/{guest_token}")
    assert resp.status_code == 200
    data = resp.json()
    assert data["guest_name"] == "Jake"
    assert data["trip"]["name"] == "Test Trip"
    assert len(data["checklist"]) == 1
    assert data["checklist"][0]["label"] == "Water filter"
    assert data["checklist"][0]["is_checked"] is False


def test_public_toggle_checklist(client, auth_headers, sample_guest):
    guest_id = sample_guest["id"]
    guest_token = sample_guest["token"]

    create_resp = client.post(
        f"/api/guests/{guest_id}/checklist",
        json={"label": "Tent", "sort_order": 0},
        headers=auth_headers,
    )
    item_id = create_resp.json()["id"]

    toggle_resp = client.patch(
        f"/api/guest/{guest_token}/checklist/{item_id}",
        json={"is_checked": True},
    )
    assert toggle_resp.status_code == 200
    assert toggle_resp.json()["is_checked"] is True

    # Toggle back
    toggle_resp2 = client.patch(
        f"/api/guest/{guest_token}/checklist/{item_id}",
        json={"is_checked": False},
    )
    assert toggle_resp2.json()["is_checked"] is False


def test_public_wrong_token(client):
    resp = client.get("/api/guest/nonexistent-token-xyz")
    assert resp.status_code == 404


def test_public_cannot_toggle_other_guest_item(client, auth_headers, sample_trip, sample_guest):
    """Guest A's token cannot toggle guest B's checklist item."""
    guest_a_token = sample_guest["token"]

    # Create guest B
    guest_b_resp = client.post(
        f"/api/trips/{sample_trip['id']}/guests",
        json={"name": "Guest B"},
        headers=auth_headers,
    )
    guest_b_id = guest_b_resp.json()["id"]

    # Add item to guest B
    item_resp = client.post(
        f"/api/guests/{guest_b_id}/checklist",
        json={"label": "Guest B's tent", "sort_order": 0},
        headers=auth_headers,
    )
    item_id = item_resp.json()["id"]

    # Try to toggle with guest A's token
    resp = client.patch(
        f"/api/guest/{guest_a_token}/checklist/{item_id}",
        json={"is_checked": True},
    )
    assert resp.status_code == 404


def test_apply_template_to_guest(client, auth_headers, sample_guest):
    guest_id = sample_guest["id"]

    # Create a template
    tmpl_resp = client.post(
        "/api/templates",
        json={
            "name": "Base Gear",
            "items": [
                {"label": "Tent", "sort_order": 0},
                {"label": "Sleeping bag", "sort_order": 1},
                {"label": "Water filter", "sort_order": 2},
            ],
        },
        headers=auth_headers,
    )
    assert tmpl_resp.status_code == 201
    template_id = tmpl_resp.json()["id"]

    # Apply to guest
    apply_resp = client.post(
        f"/api/guests/{guest_id}/checklist/from-template/{template_id}",
        headers=auth_headers,
    )
    assert apply_resp.status_code == 201
    items = apply_resp.json()
    assert len(items) == 3
    labels = [i["label"] for i in items]
    assert "Tent" in labels
    assert "Water filter" in labels

    # Verify they appear in the checklist
    list_resp = client.get(f"/api/guests/{guest_id}/checklist", headers=auth_headers)
    assert len(list_resp.json()) == 3


def test_templates_crud(client, auth_headers):
    # Create
    create_resp = client.post(
        "/api/templates",
        json={"name": "Overnight Pack", "items": [{"label": "Headlamp", "sort_order": 0}]},
        headers=auth_headers,
    )
    assert create_resp.status_code == 201
    tmpl = create_resp.json()
    assert tmpl["name"] == "Overnight Pack"
    assert len(tmpl["items"]) == 1
    template_id = tmpl["id"]

    # List
    list_resp = client.get("/api/templates", headers=auth_headers)
    assert list_resp.status_code == 200
    assert len(list_resp.json()) == 1

    # Get one
    get_resp = client.get(f"/api/templates/{template_id}", headers=auth_headers)
    assert get_resp.status_code == 200
    assert get_resp.json()["id"] == template_id

    # Delete
    del_resp = client.delete(f"/api/templates/{template_id}", headers=auth_headers)
    assert del_resp.status_code == 204

    list_resp2 = client.get("/api/templates", headers=auth_headers)
    assert list_resp2.json() == []
