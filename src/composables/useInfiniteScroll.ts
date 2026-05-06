import { onBeforeUnmount, onMounted, watch, type Ref } from 'vue'

type UseInfiniteScrollOptions = {
  target: Ref<Element | HTMLElement | null>
  canLoadMore: Ref<boolean>
  loading: Ref<boolean>
  onLoadMore: () => void | Promise<void>
  rootMargin?: string
}

export function useInfiniteScroll({
  target,
  canLoadMore,
  loading,
  onLoadMore,
  rootMargin = '480px 0px',
}: UseInfiniteScrollOptions) {
  let observer: IntersectionObserver | null = null

  function observe() {
    observer?.disconnect()
    if (!target.value || typeof IntersectionObserver === 'undefined') return

    observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || loading.value || !canLoadMore.value) return
        void onLoadMore()
      },
      { rootMargin },
    )
    observer.observe(target.value)
  }

  onMounted(observe)
  onBeforeUnmount(() => observer?.disconnect())
  watch([target, canLoadMore, loading], observe)
}
