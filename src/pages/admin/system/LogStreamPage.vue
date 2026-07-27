<template>
  <div class="space-y-4">
    <section class="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-xl">
      <header class="border-b border-slate-800 px-4 py-4 sm:px-5">
        <div class="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2">
              <h2 class="text-base font-bold text-white">Backend logs</h2>
              <UiBadge :variant="statusBadgeVariant" dot>{{ statusLabel }}</UiBadge>
            </div>
            <div class="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-400">
              <span
                >File:
                <strong class="font-medium text-slate-200">{{ logFile || '—' }}</strong></span
              >
              <span>
                Heartbeat:
                <strong class="font-medium text-slate-200">{{ lastHeartbeat || '—' }}</strong>
              </span>
              <span>
                Đang hiển thị:
                <strong class="font-medium text-slate-200">{{ logLines.length }}</strong>
                / {{ MAX_VISIBLE_LINES }} dòng
              </span>
            </div>
          </div>

          <div class="flex flex-wrap items-end gap-2">
            <label class="block">
              <span class="mb-1 block text-xs font-medium text-slate-300">Số dòng ban đầu</span>
              <select
                :value="initialLines"
                class="h-9 rounded-xl border border-slate-700 bg-slate-900 px-3 text-sm text-white transition outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                @change="changeInitialLines"
              >
                <option v-for="option in INITIAL_LINE_OPTIONS" :key="option" :value="option">
                  {{ option }}
                </option>
              </select>
            </label>
            <UiButton size="sm" variant="secondary" @click="clearLogs">Clear</UiButton>
            <UiButton size="sm" variant="primary" @click="reconnect">Reconnect</UiButton>
          </div>
        </div>

        <p v-if="errorMessage" class="mt-3 text-sm text-red-400">
          {{ errorMessage }}
        </p>
      </header>

      <div
        ref="logViewport"
        class="h-[calc(100dvh-20rem)] min-h-80 overflow-auto overscroll-contain bg-[#090d14] p-4 text-[13px] leading-5 sm:h-[calc(100dvh-17rem)]"
        role="log"
        aria-label="Backend logs realtime"
        @scroll="handleScroll"
      >
        <div v-if="logLines.length === 0" class="font-mono text-slate-500">
          {{ status === 'connected' ? 'Đang chờ log mới…' : 'Chưa có log để hiển thị.' }}
        </div>
        <pre
          v-for="line in logLines"
          :key="line.id"
          class="m-0 min-w-max font-mono whitespace-pre"
          :class="logLineClass(line.level)"
          >{{ line.text || ' ' }}</pre
        >
      </div>
    </section>

    <p class="px-1 text-xs text-slate-500">
      Clear chỉ xóa nội dung đang hiển thị trên trình duyệt, không xóa file log ở backend.
      Auto-scroll sẽ tạm dừng khi bạn cuộn lên đọc log cũ.
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { UiBadge, UiButton } from '@/components/ui'
import { env } from '@/config/env'
import { useAppStore } from '@/stores/app'

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error'
type LogLevel = 'error' | 'warn' | 'info' | 'debug'
type InitialLineCount = (typeof INITIAL_LINE_OPTIONS)[number]
type LogLine = { id: number; text: string; level: LogLevel }

const INITIAL_LINE_OPTIONS = [100, 200, 500, 1000] as const
const MAX_VISIBLE_LINES = 5000
const NEAR_BOTTOM_THRESHOLD = 80
const STREAM_PATH = '/admin/logs/stream'

const appStore = useAppStore()
const initialLines = ref<InitialLineCount>(200)
const status = ref<ConnectionStatus>('disconnected')
const logFile = ref('')
const lastHeartbeat = ref('')
const errorMessage = ref('')
const logLines = ref<LogLine[]>([])
const logViewport = ref<HTMLElement | null>(null)

let controller: AbortController | null = null
let connectionId = 0
let lineId = 0
let frameId: number | null = null
let pendingLines: LogLine[] = []
let stickToBottom = true
let unmounted = false

const statusLabel = computed(
  () =>
    ({
      connecting: 'Connecting',
      connected: 'Connected',
      disconnected: 'Disconnected',
      error: 'Error',
    })[status.value],
)

const statusBadgeVariant = computed(
  () =>
    ({
      connecting: 'warning',
      connected: 'success',
      disconnected: 'neutral',
      error: 'danger',
    })[status.value] as 'warning' | 'success' | 'neutral' | 'danger',
)

function detectLogLevel(text: string): LogLevel {
  if (/\bERROR\b/i.test(text)) return 'error'
  if (/\bWARN(?:ING)?\b/i.test(text)) return 'warn'
  if (/\bDEBUG\b/i.test(text)) return 'debug'
  return 'info'
}

function logLineClass(level: LogLevel) {
  return {
    error: 'text-red-400',
    warn: 'text-amber-300',
    info: 'text-slate-200',
    debug: 'text-slate-500',
  }[level]
}

function isNearBottom() {
  const viewport = logViewport.value
  if (!viewport) return true
  return viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight <= NEAR_BOTTOM_THRESHOLD
}

function handleScroll() {
  stickToBottom = isNearBottom()
}

function scrollToBottom() {
  const viewport = logViewport.value
  if (viewport) viewport.scrollTop = viewport.scrollHeight
}

function flushPendingLines() {
  frameId = null
  if (pendingLines.length === 0 || unmounted) return

  const shouldScroll = stickToBottom
  const nextLines = logLines.value.concat(pendingLines)
  pendingLines = []
  logLines.value =
    nextLines.length > MAX_VISIBLE_LINES
      ? nextLines.slice(nextLines.length - MAX_VISIBLE_LINES)
      : nextLines

  if (shouldScroll) {
    void nextTick(scrollToBottom)
  }
}

function appendLogLine(text: string) {
  pendingLines.push({ id: ++lineId, text, level: detectLogLevel(text) })
  if (pendingLines.length > MAX_VISIBLE_LINES) {
    pendingLines = pendingLines.slice(pendingLines.length - MAX_VISIBLE_LINES)
  }
  if (frameId === null) frameId = window.requestAnimationFrame(flushPendingLines)
}

function dispatchSseEvent(block: string) {
  let eventName = 'message'
  const data: string[] = []

  for (const line of block.split(/\r\n|\r|\n/)) {
    if (!line || line.startsWith(':')) continue
    const separatorIndex = line.indexOf(':')
    const field = separatorIndex === -1 ? line : line.slice(0, separatorIndex)
    let value = separatorIndex === -1 ? '' : line.slice(separatorIndex + 1)
    if (value.startsWith(' ')) value = value.slice(1)

    if (field === 'event') eventName = value
    if (field === 'data') data.push(value)
  }

  const eventData = data.join('\n')
  if (eventName === 'ready') {
    logFile.value = eventData
  } else if (eventName === 'log') {
    appendLogLine(eventData)
  } else if (eventName === 'heartbeat') {
    lastHeartbeat.value = eventData
  }
}

function consumeSseBuffer(buffer: string) {
  while (true) {
    const separator = buffer.match(/(?:\r\n|\r|\n){2}/)
    if (!separator || separator.index === undefined) return buffer

    const block = buffer.slice(0, separator.index)
    buffer = buffer.slice(separator.index + separator[0].length)
    if (block) dispatchSseEvent(block)
  }
}

function abortCurrentConnection(setDisconnected = true) {
  connectionId += 1
  controller?.abort()
  controller = null
  if (setDisconnected && !unmounted) status.value = 'disconnected'
}

async function connect() {
  abortCurrentConnection(false)
  const ownConnectionId = connectionId
  const nextController = new AbortController()
  controller = nextController
  status.value = 'connecting'
  errorMessage.value = ''
  logFile.value = ''
  lastHeartbeat.value = ''

  try {
    const apiBaseUrl = env.apiBaseUrl.replace(/\/+$/, '')
    const response = await fetch(`${apiBaseUrl}${STREAM_PATH}?lines=${initialLines.value}`, {
      method: 'GET',
      signal: nextController.signal,
      headers: {
        Authorization: `Bearer ${appStore.accessToken}`,
        Accept: 'text/event-stream',
      },
      cache: 'no-store',
    })

    if (!response.ok) throw new Error(`SSE failed: ${response.status}`)
    const contentType = response.headers.get('content-type') || ''
    if (!contentType.toLowerCase().includes('text/event-stream')) {
      throw new Error(`SSE trả về Content-Type không hợp lệ: ${contentType || 'không có'}`)
    }
    if (!response.body) throw new Error('Trình duyệt không hỗ trợ response streaming.')
    if (ownConnectionId !== connectionId || unmounted) return

    status.value = 'connected'
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      if (ownConnectionId !== connectionId || unmounted) {
        await reader.cancel()
        return
      }

      buffer += decoder.decode(value, { stream: true })
      buffer = consumeSseBuffer(buffer)
    }

    buffer += decoder.decode()
    consumeSseBuffer(buffer)
    if (ownConnectionId === connectionId && !unmounted) status.value = 'disconnected'
  } catch (error) {
    if (ownConnectionId !== connectionId || unmounted) return
    if (nextController.signal.aborted) return
    status.value = 'error'
    errorMessage.value = error instanceof Error ? error.message : 'Không thể kết nối SSE.'
  } finally {
    if (ownConnectionId === connectionId) controller = null
  }
}

function reconnect() {
  void connect()
}

function clearLogs() {
  if (frameId !== null) window.cancelAnimationFrame(frameId)
  frameId = null
  pendingLines = []
  logLines.value = []
  stickToBottom = true
}

function changeInitialLines(event: Event) {
  const value = Number((event.target as HTMLSelectElement).value)
  if (!INITIAL_LINE_OPTIONS.includes(value as InitialLineCount)) return
  initialLines.value = value as InitialLineCount
  clearLogs()
  reconnect()
}

onMounted(() => {
  appStore.hydrate()
  void connect()
})

onBeforeUnmount(() => {
  unmounted = true
  abortCurrentConnection(false)
  if (frameId !== null) window.cancelAnimationFrame(frameId)
  frameId = null
  pendingLines = []
})
</script>
