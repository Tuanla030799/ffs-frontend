// Đánh dấu request có lỗi khi lấy dữ liệu SSR (useAsyncData) để server/plugins/edge-cache.ts
// không lưu trang lỗi tạm thời vào cache edge.
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:rendered', ({ ssrContext }) => {
    const asyncDataErrors = Object.values(nuxtApp.payload._errors || {})
    if (ssrContext && (nuxtApp.payload.error || asyncDataErrors.some(Boolean))) {
      ssrContext.event.context.skipEdgeCache = true
    }
  })
})
