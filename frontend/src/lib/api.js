import { getToken, clearToken } from './auth.js'

const BASE = import.meta.env.VITE_API_URL || '/api'

/**
 * Core fetch wrapper. Adds Bearer token for admin routes.
 * Throws an Error with message from the API on non-2xx responses.
 *
 * @param {string} path - API path (relative to /api)
 * @param {RequestInit} options - fetch options
 * @param {boolean} [auth=true] - whether to attach Bearer token
 */
async function request(path, options = {}, auth = true) {
  const headers = { 'Content-Type': 'application/json', ...options.headers }

  if (auth) {
    const token = getToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
  }

  const res = await fetch(`${BASE}${path}`, { ...options, headers })

  if (res.status === 401) {
    clearToken()
    window.location.href = '/login'
    throw new Error('Unauthorized')
  }

  if (!res.ok) {
    let message = `HTTP ${res.status}`
    try {
      const body = await res.json()
      message = body.detail || body.error || message
    } catch (_) {
      // ignore parse errors
    }
    throw new Error(message)
  }

  // 204 No Content
  if (res.status === 204) return null

  return res.json()
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export function login(email, password) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }, false)
}

// ── Trips ─────────────────────────────────────────────────────────────────────

export function getTrips() {
  return request('/trips')
}

export function getTrip(tripId) {
  return request(`/trips/${tripId}`)
}

export function createTrip(data) {
  return request('/trips', { method: 'POST', body: JSON.stringify(data) })
}

export function updateTrip(tripId, data) {
  return request(`/trips/${tripId}`, { method: 'PUT', body: JSON.stringify(data) })
}

export function deleteTrip(tripId) {
  return request(`/trips/${tripId}`, { method: 'DELETE' })
}

// ── Trail Links ───────────────────────────────────────────────────────────────

export function addTrailLink(tripId, data) {
  return request(`/trips/${tripId}/links`, { method: 'POST', body: JSON.stringify(data) })
}

export function deleteTrailLink(tripId, linkId) {
  return request(`/trips/${tripId}/links/${linkId}`, { method: 'DELETE' })
}

// ── Guests ────────────────────────────────────────────────────────────────────

export function addGuest(tripId, data) {
  return request(`/trips/${tripId}/guests`, { method: 'POST', body: JSON.stringify(data) })
}

export function deleteGuest(tripId, guestId) {
  return request(`/trips/${tripId}/guests/${guestId}`, { method: 'DELETE' })
}

// ── Checklist (admin) ─────────────────────────────────────────────────────────

export function getChecklist(guestId) {
  return request(`/guests/${guestId}/checklist`)
}

export function addChecklistItem(guestId, data) {
  return request(`/guests/${guestId}/checklist`, { method: 'POST', body: JSON.stringify(data) })
}

export function updateChecklistItem(guestId, itemId, data) {
  return request(`/guests/${guestId}/checklist/${itemId}`, { method: 'PUT', body: JSON.stringify(data) })
}

export function deleteChecklistItem(guestId, itemId) {
  return request(`/guests/${guestId}/checklist/${itemId}`, { method: 'DELETE' })
}

export function applyTemplate(guestId, templateId) {
  return request(`/guests/${guestId}/checklist/from-template/${templateId}`, { method: 'POST' })
}

// ── Templates ─────────────────────────────────────────────────────────────────

export function getTemplates() {
  return request('/templates')
}

export function createTemplate(data) {
  return request('/templates', { method: 'POST', body: JSON.stringify(data) })
}

export function deleteTemplate(templateId) {
  return request(`/templates/${templateId}`, { method: 'DELETE' })
}

// ── Public guest endpoints ────────────────────────────────────────────────────

export function getGuestDashboard(guestToken) {
  return request(`/guest/${guestToken}`, {}, false)
}

export function toggleChecklistItem(guestToken, itemId, isChecked) {
  return request(`/guest/${guestToken}/checklist/${itemId}`, {
    method: 'PATCH',
    body: JSON.stringify({ is_checked: isChecked }),
  }, false)
}
