<script setup lang="ts">
import { ref } from 'vue'

const isGameStarted = ref<boolean>(false)

const startGame = () => {
  isGameStarted.value = true
}
</script>

<template>
  <main>
    <h1>Alias</h1>
    <div class="container" v-if="!isGameStarted">
      <button type="button" class="btn" @click="startGame">Start Game</button>
    </div>
  </main>
</template>

<style lang="scss" scoped>
.btn {
  padding: 10px;
}
</style>
