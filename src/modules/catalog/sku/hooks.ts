export function useSkuHelpers() {
  function makeSkuCode(productSlug: string, color: string, size: string) {
    return `${productSlug}-${color}-${size}`.replace(/\s+/g, '-').toUpperCase()
  }
  return { makeSkuCode }
}
