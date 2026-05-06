<template>
  <section class="border-b border-black/10">
    <button
      type="button"
      class="flex w-full items-center justify-between gap-3 py-4 text-left"
      :aria-expanded="open"
      @click="open = !open"
    >
      <span class="text-base font-bold text-black">{{ title }}</span>
      <span
        class="h-2.5 w-2.5 shrink-0 border-r-2 border-b-2 border-black transition-transform"
        :class="open ? 'rotate-[225deg]' : 'rotate-45'"
        aria-hidden="true"
      />
    </button>

    <Transition
      @before-enter="beforeEnter"
      @enter="enter"
      @after-enter="afterEnter"
      @before-leave="beforeLeave"
      @leave="leave"
    >
      <div v-show="open" class="overflow-hidden">
        <div class="pb-5">
          <slot />
        </div>
      </div>
    </Transition>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = withDefaults(
  defineProps<{
    title: string
    defaultOpen?: boolean
  }>(),
  {
    defaultOpen: true,
  },
)

const open = ref(props.defaultOpen)

function beforeEnter(element: Element) {
  const el = element as HTMLElement
  el.style.height = '0'
  el.style.opacity = '0'
}

function enter(element: Element) {
  const el = element as HTMLElement
  el.style.transition = 'height 180ms ease, opacity 180ms ease'
  el.style.height = `${el.scrollHeight}px`
  el.style.opacity = '1'
}

function afterEnter(element: Element) {
  const el = element as HTMLElement
  el.style.height = 'auto'
  el.style.transition = ''
}

function beforeLeave(element: Element) {
  const el = element as HTMLElement
  el.style.height = `${el.scrollHeight}px`
  el.style.opacity = '1'
}

function leave(element: Element) {
  const el = element as HTMLElement
  el.style.transition = 'height 160ms ease, opacity 160ms ease'
  requestAnimationFrame(() => {
    el.style.height = '0'
    el.style.opacity = '0'
  })
}
</script>
