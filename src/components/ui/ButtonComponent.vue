<template>
  <button
    type="button"
    :class="[
      'min-w-44 text-white py-4 px-6 text-2xl rounded-lg border-4',
      `bg-${color}-500 hover:bg-${color}-400`,
      `border-${color}-900`,
    ]"
    @click="cb"
  >
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  cb: () => void
  color: string
}>()
</script>

<style scoped></style>
