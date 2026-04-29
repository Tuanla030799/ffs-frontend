<template>
  <div class="space-y-6">
    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><div v-for="card in cards" :key="card.label" class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p class="text-sm font-bold text-slate-500">{{ card.label }}</p><p class="mt-3 text-3xl font-black">{{ card.value }}</p><p class="mt-2 text-xs text-slate-400">{{ card.hint }}</p></div></div>
    <div class="rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-slate-600">Nếu backend chưa có thống kê riêng, dashboard lấy số lượng từ list endpoints với `limit` nhỏ để làm overview.</div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { productApi } from '@/modules/catalog/product/api'
import { orderApi } from '@/modules/sales/order/api'
import { customerApi } from '@/modules/customer/api'
import { couponApi } from '@/modules/promotion/coupon/api'
const cards = ref([{ label: 'Sản phẩm', value: '-', hint: 'GET /api/admin/products' }, { label: 'Đơn hàng', value: '-', hint: 'GET /api/admin/orders' }, { label: 'Khách hàng', value: '-', hint: 'GET /api/admin/customers' }, { label: 'Coupon', value: '-', hint: 'GET /api/admin/coupons' }])
onMounted(async () => {
  const [p, o, c, co] = await Promise.allSettled([productApi.adminList({ limit: 1 }), orderApi.adminList({ limit: 1 }), customerApi.list({ limit: 1 }), couponApi.adminList({ limit: 1 })])
  cards.value = cards.value.map((card, index) => {
    const result = [p, o, c, co][index]
    return { ...card, value: result?.status === 'fulfilled' ? String(result.value.total) : '-' }
  })
})
</script>
