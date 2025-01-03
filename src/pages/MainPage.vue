<script setup lang="ts">
import { ref } from 'vue'

import type { GameStatus } from '@/models'
import wordsData from '@/assets/json/top1000.json'
import { useScoreStore } from '@/stores/score'

const gameStatus = ref<GameStatus>('notStarted')
const timer = ref<number>(0)
const words = ref<string[]>([])

const currentWord = ref<string>('')
const scoreStore = useScoreStore()

const showRandomWord = () => {
  const randomIndex = Math.floor(Math.random() * words.value.length)
  currentWord.value = words.value[randomIndex]
}

const startGame = () => {
  try {
    words.value = wordsData.words.map((word) => word.english)
  } catch (error) {
    console.error('Failed to load words:', error)
  }

  scoreStore.reset()
  gameStatus.value = 'inProgress'
  timer.value = 10

  const timerInterval = setInterval(() => {
    timer.value--
    if (timer.value === 0) {
      clearInterval(timerInterval)
    }
  }, 1000)

  showRandomWord()
}

const filterOutCurrentWord = () => {
  words.value = words.value.filter((word) => word !== currentWord.value)
}

const processWord = (isSuccess: boolean) => {
  filterOutCurrentWord()

  if (isSuccess) {
    scoreStore.incrementGuessedWords()
  } else {
    scoreStore.incrementSkippedWords()
  }

  checkIsGameOver()
  showRandomWord()
}
const checkIsGameOver = () => {
  if (timer.value === 0 || words.value.length === 0) {
    gameStatus.value = 'finished'
  }
}
const skipCurrentWord = () => {
  processWord(false)
}

const handleWordSuccess = () => {
  processWord(true)
}
</script>

<template>
  <main class="main">
    <h1 class="text-red-300">Alias</h1>
    <div class="container" v-if="gameStatus === 'notStarted'">
      <button type="button" class="btn" @click="startGame">Start Game</button>
    </div>
    <div class="game" v-if="gameStatus === 'inProgress'">
      <div class="timer text">{{ timer }}</div>
      <div class="word text">{{ currentWord }}</div>
      <div class="controls">
        <button class="btn" @click="skipCurrentWord">Skip</button>
        <button class="btn" @click="handleWordSuccess">Success!</button>
      </div>
    </div>
    <div class="results" v-if="gameStatus === 'finished'">
      <div class="total-score text">Total Score: {{ scoreStore.totalScore }}</div>
      <button type="button" class="btn" @click="startGame">Play Again</button>
    </div>
  </main>
</template>

<style lang="scss" scoped>
.btn {
  padding: 10px;
}

.text {
  font-size: 24px;
}
</style>
