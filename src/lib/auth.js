/**
 * Authentication management for Heirloom
 */

const AUTH_KEY = 'heirloom_auth_user'
const listeners = new Set()

function getStoredUser() {
  try {
    const raw = localStorage.getItem(AUTH_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) {
    console.error('Failed to load user', e)
  }
  // Default guest user account
  const defaultUser = {
    id: 'user_heirloom_collector',
    email: 'collector@heirloom.app',
    displayName: 'Estate Collector',
  }
  try {
    localStorage.setItem(AUTH_KEY, JSON.stringify(defaultUser))
  } catch {}
  return defaultUser
}

let currentUser = getStoredUser()

export const auth = {
  getCurrentUser() {
    return currentUser
  },

  isAuthenticated() {
    return !!currentUser
  },

  signIn(customUser = null) {
    currentUser = customUser || {
      id: 'user_heirloom_collector',
      email: 'collector@heirloom.app',
      displayName: 'Estate Collector',
    }
    try {
      localStorage.setItem(AUTH_KEY, JSON.stringify(currentUser))
    } catch {}
    listeners.forEach((fn) => {
      try { fn(currentUser) } catch (e) { console.error(e) }
    })
    return currentUser
  },

  signOut() {
    currentUser = null
    try {
      localStorage.removeItem(AUTH_KEY)
    } catch {}
    listeners.forEach((fn) => {
      try { fn(null) } catch (e) { console.error(e) }
    })
  },

  onAuthChange(callback) {
    listeners.add(callback)
    callback(currentUser)
    return () => {
      listeners.delete(callback)
    }
  },
}

export const adoptSession = () => currentUser
export default auth
