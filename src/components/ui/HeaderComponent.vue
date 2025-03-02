<script setup lang="ts">
import { useRoundStore } from '@/stores/round'
import { storeToRefs } from 'pinia'

const { roundCount } = storeToRefs(useRoundStore())
</script>

<template>
  <header>
    <div class="container mx-auto py-5 flex items-center justify-between">
      <h1 class="text-violet-400 text-3xl">Alias</h1>
      <div v-if="roundCount" class="text-white text-2xl font-bold">Round: {{ roundCount }}</div>
    </div>
  </header>
</template>

<style lang="scss" scoped></style>
