import { ref } from 'vue'
import { customerApi } from './api'
import type { Customer } from './types'
export function useCustomers() {
  const customers = ref<Customer[]>([])
  async function load() {
    const page = await customerApi.list({ limit: 20 })
    customers.value = page.items
    return page
  }
  return { customers, load }
}
