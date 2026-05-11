<template>
  <main class="mx-auto max-w-4xl px-4 py-10 sm:px-6 md:py-14 lg:px-8">
    <BreadcrumbNav
      class="mb-5"
      :items="[{ label: 'Cửa hàng', to: '/products' }, { label: 'Hoàn tất' }]"
    />

    <section class="border border-black/10 bg-[#f7f7f5] p-6 text-center md:p-12">
      <p class="text-sm font-bold tracking-[0.18em] text-black/45 uppercase">Order received</p>
      <h1 class="mt-3 text-3xl leading-tight font-black text-black md:text-5xl">Cảm ơn bạn</h1>
      <p class="mx-auto mt-5 max-w-2xl text-base leading-8 text-black/60">
        Shop đã nhận thông tin và sẽ liên hệ xác nhận đơn trong thời gian sớm nhất.
      </p>
      <p v-if="orderCode" class="mt-5 text-sm font-bold text-black/55">
        Mã đơn: <span class="text-black">{{ orderCode }}</span>
      </p>

      <div class="mt-8 flex flex-wrap justify-center gap-3">
        <UiButton variant="dark" @click="goShopping">Tiếp tục mua hàng</UiButton>
        <UiButton variant="secondary" @click="goHome">Về trang chủ</UiButton>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BreadcrumbNav from '@/components/common/BreadcrumbNav.vue'
import { UiButton } from '@/components/ui'

const route = useRoute()
const router = useRouter()
const orderCode = computed(() => String(route.query.code || ''))

function goShopping() {
  void router.push({ name: 'products' })
}

function goHome() {
  void router.push({ name: 'home' })
}
</script>
