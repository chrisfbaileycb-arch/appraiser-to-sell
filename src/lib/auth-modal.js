/**
 * Auth modal helper for Heirloom
 */
import { auth } from './auth'

export const showAuthModal = () => {
  return auth.signIn()
}

export default showAuthModal
