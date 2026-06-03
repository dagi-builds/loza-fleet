const BASE = (import.meta.env.VITE_API_URL || '') + '/api'

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

// Owner
export function ownerLogin(password) {
  return request('/owner/login', { method: 'POST', body: JSON.stringify({ password }) })
}

export function createDriver(data) {
  return request('/owner/drivers', { method: 'POST', body: JSON.stringify(data) })
}

export function getOwnerRequests() {
  return request('/owner/requests')
}

export function approveRequest(id) {
  return request(`/owner/requests/${id}/approve`, { method: 'POST' })
}

export function denyRequest(id) {
  return request(`/owner/requests/${id}/deny`, { method: 'POST' })
}

export function addNoteToRequest(id, note) {
  return request(`/owner/requests/${id}/note`, {
    method: 'POST',
    body: JSON.stringify({ note }),
  })
}

export function getOwnerTripRequests() {
  return request('/owner/trip-requests')
}

export function approveTripRequest(id) {
  return request(`/owner/trip-requests/${id}/approve`, { method: 'POST' })
}

export function denyTripRequest(id) {
  return request(`/owner/trip-requests/${id}/deny`, { method: 'POST' })
}

// Also used by manager
export function getTripRequests() {
  return request('/owner/trip-requests')
}

// Manager
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

// Driver
export function loginWithPin(pin) {
  return request('/drivers/login', { method: 'POST', body: JSON.stringify({ pin }) })
}

export function requestTrip(driverId, note = '') {
  return request('/trips/request', { method: 'POST', body: JSON.stringify({ driverId, note }) })
}

export function getDriverTripRequests(driverId) {
  return request(`/drivers/${driverId}/trip-requests`)
}

export function submitRequest(data) {
  return request('/drivers/request', { method: 'POST', body: JSON.stringify(data) })
}

export function getDriverRequests(driverId) {
  return request(`/drivers/${driverId}/requests`)
}

export function logFuel(driverId, amount) {
  return request('/fuel', { method: 'POST', body: JSON.stringify({ driverId, amount }) })
}

// Fleet
export function getFleet() {
  return request('/fleet')
}

export function getActivity() {
  return request('/fleet/activity')
}

// Export
export function exportExcel() {
  window.open((import.meta.env.VITE_API_URL || '') + '/api/export/excel', '_blank')
}

export function exportPDF() {
  window.open((import.meta.env.VITE_API_URL || '') + '/api/export/pdf', '_blank')
}