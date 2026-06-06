const BASE = 'https://loza-fleet-demi.vercel.app/api'

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(err.error || 'Request failed')
  }
  return res.json()
}

// ── Owner ──────────────────────────────────────────────────────
export function ownerLogin(password) {
  return request('/owner/login', { method: 'POST', body: JSON.stringify({ password }) })
}

export function changePassword(currentPassword, newPassword) {
  return request('/owner/change-password', { method: 'POST', body: JSON.stringify({ currentPassword, newPassword }) })
}

export function createDriver(data) {
  return request('/owner/drivers', { method: 'POST', body: JSON.stringify(data) })
}

export function getOwnerRequests() {
  return request('/owner/requests')
}

export function getNotifications() {
  return request('/owner/notifications')
}

export function approveRequest(id) {
  return request(`/owner/requests/${id}/approve`, { method: 'POST' })
}

export function denyRequestWithNote(id, note) {
  return request(`/owner/requests/${id}/deny-with-note`, { method: 'POST', body: JSON.stringify({ note }) })
}

// ── Manager ────────────────────────────────────────────────────
export function managerLogin(username, password) {
  return request('/manager/login', { method: 'POST', body: JSON.stringify({ username, password }) })
}

export function createManager(data) {
  return request('/owner/managers', { method: 'POST', body: JSON.stringify(data) })
}

export function getManagers() {
  return request('/owner/managers')
}

export function deleteManager(id) {
  return request(`/owner/managers/${id}`, { method: 'DELETE' })
}

// ── Driver ─────────────────────────────────────────────────────
export function loginWithPin(pin) {
  return request('/drivers/login', { method: 'POST', body: JSON.stringify({ pin }) })
}

export function submitRequest(data) {
  return request('/drivers/request', { method: 'POST', body: JSON.stringify(data) })
}

export function getDriverRequests(driverId) {
  return request(`/drivers/${driverId}/requests`)
}

export function getDriverHistory(driverId) {
  return request(`/drivers/${driverId}/history`)
}

export function logFuel(driverId, amount) {
  return request('/fuel', { method: 'POST', body: JSON.stringify({ driverId, amount }) })
}

export function rateDriver(driverId, rating, note) {
  return request(`/drivers/${driverId}/rate`, { method: 'POST', body: JSON.stringify({ rating, note }) })
}

// ── Trip Verification ──────────────────────────────────────────
export function requestTrip(driverId) {
  return request('/trips/request', { method: 'POST', body: JSON.stringify({ driverId }) })
}

export function getTripRequests() {
  return request('/trips/requests')
}

export function approveTripRequest(id) {
  return request(`/trips/requests/${id}/approve`, { method: 'POST' })
}

export function denyTripRequest(id) {
  return request(`/trips/requests/${id}/deny`, { method: 'POST' })
}

export function getPendingTripCount() {
  return request('/trips/requests/pending/count')
}

// ── Fleet & Charts ─────────────────────────────────────────────
export function getFleet() {
  return request('/fleet')
}

export function getActivity() {
  return request('/fleet/activity')
}

export function getChartStats() {
  return request('/stats/charts')
}

export function getDailyTrips() {
  return request('/stats/daily-trips')
}