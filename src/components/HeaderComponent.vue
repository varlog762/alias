<script setup lang="ts">
import { useRoundStore } from '@/stores/round'
import { storeToRefs } from 'pinia'

const { roundCount } = storeToRefs(useRoundStore())
</script>

<template>
  <header>
    <div class="container mx-auto py-5 flex items-center justify-between">
      <h1 class="logo" aria-label="Alias">
        <span class="logo-letter" style="--i: 0">A</span>
        <span class="logo-letter" style="--i: 1">l</span>
        <span class="logo-letter" style="--i: 2">i</span>
        <span class="logo-letter" style="--i: 3">a</span>
        <span class="logo-letter" style="--i: 4">s</span>
        <span class="logo-sparkle">✨</span>
      </h1>
      <div v-if="roundCount" class="text-white text-2xl font-bold">Round: {{ roundCount }}</div>
    </div>
  </header>
</template>

<style scoped>
.logo {
  display: inline-flex;
  align-items: baseline;
  gap: 2px;
  padding: 8px 22px 8px 18px;
  border-radius: 16px;
  background: linear-gradient(135deg, #a855f7, #ec4899, #f59e0b);
  box-shadow:
    0 0 20px rgba(168, 85, 247, 0.5),
    0 0 40px rgba(236, 72, 153, 0.3);
  cursor: default;
  user-select: none;
  animation: float 3s ease-in-out infinite;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.logo:hover {
  transform: scale(1.08);
  box-shadow:
    0 0 28px rgba(168, 85, 247, 0.7),
    0 0 56px rgba(236, 72, 153, 0.45);
}

.logo:hover .logo-letter {
  animation: bounce 0.5s ease calc(var(--i) * 0.07s) both;
}

.logo-letter {
  font-size: 2.6rem;
  font-weight: 900;
  font-family: 'Segoe UI', system-ui, sans-serif;
  color: #fff;
  text-shadow: 2px 2px 0 rgba(0, 0, 0, 0.25);
  display: inline-block;
  transform: rotate(calc(var(--i) * 4deg - 8deg));
}

.logo-sparkle {
  font-size: 1.4rem;
  margin-left: 4px;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

@keyframes bounce {
  0%   { transform: rotate(calc(var(--i) * 4deg - 8deg)) translateY(0); }
  40%  { transform: rotate(calc(var(--i) * 4deg - 8deg)) translateY(-10px); }
  60%  { transform: rotate(calc(var(--i) * 4deg - 8deg)) translateY(-4px); }
  100% { transform: rotate(calc(var(--i) * 4deg - 8deg)) translateY(0); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.3); }
}
</style>
