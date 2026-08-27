import { useEffect, useState } from 'react'
import { db } from './db'

export function useLive(collection, options = {}) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true

    const handleUpdate = (rawItems) => {
      if (!alive) return
      let items = [...rawItems]
      if (options.order) {
        const isDesc = options.order.startsWith('-')
        const field = isDesc ? options.order.slice(1) : options.order
        items.sort((a, b) => {
          const valA = a[field] || ''
          const valB = b[field] || ''
          return isDesc ? (valB > valA ? 1 : -1) : (valA > valB ? 1 : -1)
        })
      }
      setData(items)
      setLoading(false)
    }

    const unsub = db.subscribe(collection, handleUpdate)
    return () => {
      alive = false
      unsub()
    }
  }, [collection, options.order])

  return { data, loading }
}

export const useLiveShared = useLive
export default useLive
