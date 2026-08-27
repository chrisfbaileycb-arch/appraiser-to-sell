/**
 * User identifier utilities for Heirloom
 */
import { auth } from './auth'

export const getAppUserId = () => {
  const user = auth.getCurrentUser()
  return user?.id || 'user_heirloom_collector'
}

export const getAnonymousId = () => {
  let id = localStorage.getItem('heirloom_anon_id')
  if (!id) {
    id = 'anon_' + Math.random().toString(36).slice(2, 10)
    try {
      localStorage.setItem('heirloom_anon_id', id)
    } catch {}
  }
  return id
}

export default { getAppUserId, getAnonymousId }
