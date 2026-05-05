<template>
  <main class="grid min-h-screen place-items-center bg-slate-950 p-4">
    <form class="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-2xl" @submit.prevent="submit">
      <h1 class="text-3xl font-black">Admin login</h1>
      <p class="mt-2 text-slate-500">Đăng nhập bằng API admin auth.</p>
      <div class="mt-6 space-y-4">
        <UiInput
          v-model="email"
          class="w-full rounded-xl border p-3"
          placeholder="Email"
          label="Email"
        />

        <UiInput
          v-model="password"
          type="password"
          class="round e d-xl w-full border p-3"
          placeholder="Password"
          label="Password"
        />

        <UiButton native-type="submit" variant="dark" block :disabled="loading">
          {{ loading ? 'Đang login...' : 'Login' }}
        </UiButton>
        <p v-if="error" class="text-sm font-semibold text-red-600">
          {{ error }}
        </p>
      </div>
    </form>
  </main>
</template>
<script setup lang="ts">
import { UiButton, UiInput } from '@/components/ui'
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { adminAuthService } from '@/services/admin/auth.service'
import { useAppStore } from '@/stores/app'
import { getErrorMessage } from '@/modules/shared/hooks'
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const router = useRouter()
const route = useRoute()
const appStore = useAppStore()
async function submit() {
  loading.value = true
  error.value = ''
  try {
    appStore.setAuthSession(
      await adminAuthService.login({
        email: email.value,
        password: password.value,
      }),
    )
    await router.replace(String(route.query.redirect || '/admin/dashboard'))
  } catch (err) {
    error.value = getErrorMessage(err)
  } finally {
    loading.value = false
  }
}
</script>
