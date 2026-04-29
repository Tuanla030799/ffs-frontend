export type NoticeState<T extends string = string> = {
  type: T
  text: string
} | null

export interface TableColumn<T extends Record<string, unknown> = Record<string, unknown>> {
  key: Extract<keyof T, string> | string
  label: string
}
