/**
 * In-app payment and credits service for Heirloom
 */

const PURCHASES_KEY = 'heirloom_purchases'
const paymentListeners = new Set()

function getStoredPurchases() {
  try {
    const raw = localStorage.getItem(PURCHASES_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) {
    console.error('Failed to read purchases', e)
  }
  return {}
}

function savePurchases(purchases) {
  try {
    localStorage.setItem(PURCHASES_KEY, JSON.stringify(purchases))
  } catch (e) {
    console.error('Failed to save purchases', e)
  }
}

export const payments = {
  async getEntitlements() {
    const records = getStoredPurchases()
    const purchases = Object.entries(records).map(([sku, count]) => ({
      sku,
      count,
    }))
    return { purchases }
  },

  async checkout({ sku, name, amount }) {
    // Record the purchase in localStorage
    const records = getStoredPurchases()
    records[sku] = (records[sku] || 0) + 1
    savePurchases(records)

    // Notify listeners so wallet updates automatically
    paymentListeners.forEach((fn) => {
      try {
        fn({ sku, name, amount, count: records[sku] })
      } catch (e) {
        console.error('Error in payment listener', e)
      }
    })

    return {
      success: true,
      sku,
      name,
      amount,
    }
  },

  onPayment(callback) {
    paymentListeners.add(callback)
    return {
      unsubscribe: () => {
        paymentListeners.delete(callback)
      },
    }
  },
}

export const _internal = payments
export default payments
