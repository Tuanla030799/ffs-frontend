import { resolveFileUrl } from '@/lib/fileUrl'

type EditorJsBlock = {
  type?: string
  data?: Record<string, unknown>
}

type EditorJsData = {
  blocks?: EditorJsBlock[]
}

const HTML_PATTERN = /<\/?[a-z][\s\S]*>/i

export function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function parseEditorJs(value: unknown): EditorJsData | null {
  if (!value) return null

  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed || HTML_PATTERN.test(trimmed)) return null
    try {
      const parsed = JSON.parse(trimmed) as EditorJsData
      return Array.isArray(parsed?.blocks) ? parsed : null
    } catch {
      return null
    }
  }

  if (typeof value === 'object' && Array.isArray((value as EditorJsData).blocks)) {
    return value as EditorJsData
  }

  return null
}

export function isEditorJsContent(value: unknown) {
  return Boolean(parseEditorJs(value))
}

function listItemText(item: unknown): string {
  if (typeof item === 'string') return item
  if (item && typeof item === 'object') {
    const row = item as Record<string, unknown>
    return listItemText(row.content || row.text || '')
  }
  return ''
}

function editorJsBlockToHtml(block: EditorJsBlock) {
  const data = block.data || {}

  if (block.type === 'paragraph') {
    return `<p>${escapeHtml(data.text)}</p>`
  }

  if (block.type === 'header') {
    const level = Number(data.level || 2)
    const tag = level <= 1 ? 'h1' : level === 3 ? 'h3' : level === 4 ? 'h4' : 'h2'
    return `<${tag}>${escapeHtml(data.text)}</${tag}>`
  }

  if (block.type === 'list') {
    const items = Array.isArray(data.items) ? data.items : []
    const tag = data.style === 'ordered' ? 'ol' : 'ul'
    const html = items.map((item) => `<li>${escapeHtml(listItemText(item))}</li>`).join('')
    return html ? `<${tag}>${html}</${tag}>` : ''
  }

  if (block.type === 'quote') {
    const caption = data.caption ? `<cite>${escapeHtml(data.caption)}</cite>` : ''
    return `<blockquote>${escapeHtml(data.text)}${caption}</blockquote>`
  }

  if (block.type === 'table') {
    const content = Array.isArray(data.content) ? data.content : []
    const rows = content
      .filter(Array.isArray)
      .map(
        (row) => `<tr>${row.map((cell: unknown) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`,
      )
      .join('')
    return rows ? `<table><tbody>${rows}</tbody></table>` : ''
  }

  if (block.type === 'delimiter') {
    return '<hr />'
  }

  if (block.type === 'image') {
    const file =
      data.file && typeof data.file === 'object' ? (data.file as Record<string, unknown>) : {}
    const rawUrl = file.rawUrl || file.url || data.url
    const url = resolveFileUrl(typeof rawUrl === 'string' ? rawUrl : '')
    if (!url) return ''
    const caption = data.caption ? `<figcaption>${escapeHtml(data.caption)}</figcaption>` : ''
    const fileId = file.fileId ? ` data-file-id="${escapeHtml(file.fileId)}"` : ''
    const path = file.path ? ` data-path="${escapeHtml(file.path)}"` : ''
    return `<figure><img src="${escapeHtml(url)}"${fileId}${path} alt="" />${caption}</figure>`
  }

  return ''
}

export function editorJsToHtml(value: unknown) {
  const data = parseEditorJs(value)
  if (!data?.blocks?.length) return ''
  return data.blocks.map(editorJsBlockToHtml).filter(Boolean).join('\n')
}

export function normalizeRichTextInput(value: unknown) {
  if (isEditorJsContent(value)) return editorJsToHtml(value)
  if (typeof value === 'string') return value
  return ''
}
