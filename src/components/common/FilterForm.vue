<template>
  <UiCard v-if="card" :title="title" :padding="padding">
    <UiForm as="form" layout="none" :class="classes" @submit.prevent="$emit('search')">
      <UiInput
        v-if="searchable"
        :model-value="keyword"
        :class="keywordClass"
        :placeholder="searchPlaceholder"
        :label="searchLabel"
        @update:model-value="$emit('update:keyword', String($event))"
      />
      <UiSelect
        v-if="statusFilter"
        :model-value="status"
        :class="statusClass"
        :label="statusLabel"
        @update:model-value="$emit('update:status', String($event))"
      >
        <option value="">
          {{ statusPlaceholder }}
        </option>
        <option v-for="option in normalizedStatusOptions" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </UiSelect>

      <slot />

      <slot name="actions">
        <UiButton native-type="submit" :variant="submitVariant" class="self-end">
          {{ submitLabel }}
        </UiButton>
      </slot>
    </UiForm>
  </UiCard>

  <UiForm v-else as="form" layout="none" :class="classes" @submit.prevent="$emit('search')">
    <UiInput
      v-if="searchable"
      :model-value="keyword"
      :class="keywordClass"
      :placeholder="searchPlaceholder"
      :label="searchLabel"
      @update:model-value="$emit('update:keyword', String($event))"
    />
    <UiSelect
      v-if="statusFilter"
      :model-value="status"
      :class="statusClass"
      :label="statusLabel"
      @update:model-value="$emit('update:status', String($event))"
    >
      <option value="">
        {{ statusPlaceholder }}
      </option>
      <option v-for="option in normalizedStatusOptions" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </UiSelect>

    <slot />

    <slot name="actions">
      <UiButton native-type="submit" :variant="submitVariant" class="self-end">
        {{ submitLabel }}
      </UiButton>
    </slot>
  </UiForm>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { UiButton, UiCard, UiForm, UiInput, UiSelect } from '@/components/ui'
import { cn } from '@/utils/cn'

defineOptions({
  inheritAttrs: false,
})

type FilterOption = string | { value: string; label: string }

const props = withDefaults(
  defineProps<{
    keyword?: string
    status?: string
    searchable?: boolean
    statusFilter?: boolean
    searchPlaceholder?: string
    searchLabel?: string
    statusPlaceholder?: string
    statusLabel?: string
    statusOptions?: FilterOption[]
    keywordClass?: string
    statusClass?: string
    submitLabel?: string
    submitVariant?: 'primary' | 'secondary' | 'dark' | 'danger' | 'ghost' | 'outline'
    title?: string
    card?: boolean
    padding?: 'none' | 'sm' | 'md' | 'lg'
  }>(),
  {
    keyword: '',
    status: '',
    searchable: true,
    statusFilter: false,
    searchPlaceholder: 'Tìm kiếm...',
    searchLabel: '',
    statusPlaceholder: 'Tất cả trạng thái',
    statusLabel: '',
    statusOptions: () => [],
    keywordClass: '',
    statusClass: '',
    submitLabel: 'Tìm kiếm',
    submitVariant: 'primary',
    title: 'Bộ lọc',
    card: true,
    padding: 'sm',
  },
)

defineEmits<{
  search: []
  'update:keyword': [value: string]
  'update:status': [value: string]
}>()

const attrs = useAttrs()

const classes = computed(() =>
  cn(
    (attrs.class as string | undefined) ||
      cn(
        'grid gap-3',
        'items-end',
        props.statusFilter
          ? 'md:grid-cols-[minmax(220px,1fr)_180px_auto]'
          : 'md:grid-cols-[minmax(220px,1fr)_auto]',
      ),
  ),
)

const normalizedStatusOptions = computed(() =>
  props.statusOptions.map((option) =>
    typeof option === 'string' ? { value: option, label: option } : option,
  ),
)
</script>
