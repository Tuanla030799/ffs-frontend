<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

onMounted(() => {
  void router.replace({ path: '/products', query: { brand: String(route.params.slug) } })
})
</script>

<template>
  <main class="grid min-h-72 place-items-center text-black/60">
    Đang chuyển tới danh sách sản phẩm...
  </main>
</template>
