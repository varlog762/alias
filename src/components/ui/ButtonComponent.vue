<template>
  <button
    type="button"
    class="min-w-44 text-white py-4 px-6 text-2xl rounded-lg border-4"
    :class="getColorClasses(color)"
    @click="cb"
  >
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
import { getColorClasses } from '@/utils'

const { color, cb } = defineProps<{
  cb: () => void
  color: string
}>()
</script>

<style scoped></style>
