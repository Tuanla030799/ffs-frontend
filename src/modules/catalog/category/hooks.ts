import { ref } from 'vue'
import { categoryApi } from './api'
import type { Category } from './types'
export function useCategories() { const categories = ref<Category[]>([]); async function loadPublicCategories() { categories.value = await categoryApi.publicList(); return categories.value } return { categories, loadPublicCategories } }
