type DateTimeInput = string | Date | null | undefined

function isValidDate(date: Date): boolean {
  return !Number.isNaN(date.getTime())
}

function toDate(value: DateTimeInput): Date | null {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  return isValidDate(date) ? date : null
}

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

export function parseBackendDateTime(value: string | null): Date | null {
  return toDate(value)
}

export function toBackendDateTime(value: string | Date | null): string | null {
  const date = toDate(value)
  return date ? date.toISOString() : null
}

export function toDateTimeLocalInput(value: DateTimeInput): string {
  const date = toDate(value)
  if (!date) return ''

  return [
    date.getFullYear(),
    '-',
    pad(date.getMonth() + 1),
    '-',
    pad(date.getDate()),
    'T',
    pad(date.getHours()),
    ':',
    pad(date.getMinutes()),
  ].join('')
}

export function formatLocalDateTime(value: DateTimeInput): string {
  const date = toDate(value)
  if (!date) return '-'

  return [
    pad(date.getDate()),
    '/',
    pad(date.getMonth() + 1),
    '/',
    date.getFullYear(),
    ' ',
    pad(date.getHours()),
    ':',
    pad(date.getMinutes()),
    ':',
    pad(date.getSeconds()),
  ].join('')
}
