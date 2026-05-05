import { ref } from 'vue'
import { orderApi } from './api'
import type { Order } from './types'
export function useOrders() {
  const orders = ref<Order[]>([])
  async function load() {
    const page = await orderApi.adminList({ limit: 20 })
    orders.value = page.items
    return page
  }
  return { orders, load }
}
