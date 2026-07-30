<template>
  <button
    type="button"
    class="btn min-w-44 text-white py-4 px-6 text-2xl rounded-lg border-4"
    :class="getColorClasses(color)"
    @click="cb"
  >
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
import type { ButtonColorType } from '@/models'
import { getColorClasses } from '@/utils'

const { color, cb } = defineProps<{
  cb: () => void
  color: ButtonColorType
}>()
</script>

<style scoped>
.btn {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.btn:active {
  transform: translateY(0) scale(0.97);
  box-shadow: none;
}
</style>
