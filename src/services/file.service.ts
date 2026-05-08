import { httpClient } from '@/lib/http/httpClient'
import { resolveFileUrl } from '@/lib/fileUrl'
import type { ApiEnvelope } from '@/types/http'

export type FileUploadScope = 'admin' | 'client'

export interface UploadedFile {
  fileId: string | number
  url: string
  rawUrl?: string
  path: string
  name?: string
  mimeType?: string
  size?: number
}

export interface UploadFileOptions {
  scope?: FileUploadScope
  fieldName?: string
}

function normalizeUploadedFile(row: Record<string, any>): UploadedFile {
  const path = row.path || row.filePath || row.file_path || ''
  const url = row.url || row.fileUrl || row.file_url || path

  return {
    fileId: row.fileId || row.file_id || row.id,
    url: resolveFileUrl(url),
    rawUrl: url,
    path,
    name: row.name || row.originalName || row.original_name,
    mimeType: row.mimeType || row.mime_type || row.mimetype,
    size: row.size,
  }
}

export const fileService = {
  async upload(file: File, options: UploadFileOptions = {}) {
    const scope = options.scope || 'client'
    const endpoint = scope === 'admin' ? '/api/admin/files/upload' : '/api/files/upload'
    const formData = new FormData()
    formData.append(options.fieldName || 'file', file)

    const response = await httpClient.post<ApiEnvelope<Record<string, any>>>(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return normalizeUploadedFile(response.data.data || {})
  },
}
