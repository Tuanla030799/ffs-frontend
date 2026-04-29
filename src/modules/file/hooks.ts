import { fileApi } from './api'
export function useFileUpload() { return { uploadFile: fileApi.upload } }
