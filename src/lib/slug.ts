export function slugify(value?: string | null) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function syncAutoSlug(
  currentSlug: string | null | undefined,
  previousSource: string | null | undefined,
  nextSource: string | null | undefined,
) {
  const slug = currentSlug || ''
  const trimmedSlug = slug.trim()
  if (!trimmedSlug || trimmedSlug === slugify(previousSource)) return slugify(nextSource)
  return slug
}
