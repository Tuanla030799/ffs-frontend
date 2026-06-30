import { useRoute, useRouter } from '#imports'
import type { LocationQueryRaw } from 'vue-router'

export function usePageQuery() {
  const route = useRoute()
  const router = useRouter()

  function value(fallback = 1) {
    const page = Number(route.query.page || fallback)
    return Number.isFinite(page) && page > 0 ? page : fallback
  }

  function replace(page: number, query: LocationQueryRaw = route.query) {
    return router.replace({
      query: {
        ...query,
        page: page > 1 ? String(page) : undefined,
      },
    })
  }

  return { value, replace }
}
