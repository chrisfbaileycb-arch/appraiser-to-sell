/**
 * Gate management helper for Heirloom
 */
export const clearGateToken = () => {}
export const gateSeedIsOpen = () => true
export const setGateSeed = () => {}
export const handleGatedResponse = () => {}
export const popMagicKey = () => null
export const fetchGateStatus = async () => ({ ok: true, unlocked: true })
export const submitGateCode = async () => ({ ok: true })

export default {
  clearGateToken,
  gateSeedIsOpen,
  setGateSeed,
  handleGatedResponse,
  popMagicKey,
  fetchGateStatus,
  submitGateCode,
}
