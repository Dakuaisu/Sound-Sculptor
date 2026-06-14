import { useEffect } from 'react'
import api from '@/services/api'
import useStore from '@/stores/useStore'

/**
 * Hydrate auth state once on app boot. Failure simply means "not connected".
 * Does not change any backend contract — reuses GET /api/me.
 */
export function useAuthBootstrap() {
  const setUser = useStore((s) => s.setUser)
  const setAuthReady = useStore((s) => s.setAuthReady)

  useEffect(() => {
    let active = true
    api
      .getUser()
      .then((u) => active && setUser(u))
      .catch(() => {})
      .finally(() => active && setAuthReady(true))
    return () => {
      active = false
    }
  }, [setUser, setAuthReady])
}
