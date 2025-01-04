<script setup lang="ts">
import { ref } from 'vue'

import type { GameStatus } from '@/models'
import wordsData from '@/assets/json/top1000.json'
import { useScoreStore } from '@/stores/score'

const gameStatus = ref<GameStatus>('notStarted')
const timer = ref<number>(0)
const words = ref<string[]>([])
const playedWords = ref<string[]>([])

const currentWord = ref<string | null>(null)
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

  updatePlayedWords()
  checkIsGameOver()
  showRandomWord()
}

const updatePlayedWords = () => {
  if (currentWord.value) {
    playedWords.value.push(currentWord.value)
    currentWord.value = null
  }
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
  <div class="flex flex-col min-h-screen">
    <header class="bg-black">
      <div class="container mx-auto py-5">
        <h1 class="text-violet-400 text-3xl">Alias</h1>
      </div>
    </header>
    <main class="flex-grow flex flex-col">
      <!-- Start Game -->
      <div
        class="flex-grow flex items-center justify-center h-full"
        v-if="gameStatus === 'notStarted'"
      >
        <button
          type="button"
          class="text-white bg-blue-500 hover:bg-blue-400 py-4 px-6 text-2xl rounded-lg"
          @click="startGame"
        >
          Start Game
        </button>
      </div>
      <!-- Game -->
      <div
        class="flex-grow flex flex-col items-center justify-center h-full"
        v-if="gameStatus === 'inProgress'"
      >
        <div class="text-white text-3xl mb-12">{{ timer }}</div>
        <div class="text-white text-4xl mb-12 font-bold">{{ currentWord }}</div>
        <div class="flex gap-4">
          <button
            class="text-white bg-red-500 hover:bg-red-400 py-4 px-6 text-2xl rounded-lg"
            @click="skipCurrentWord"
          >
            Skip
          </button>
          <button
            class="text-white bg-green-500 hover:bg-green-400 py-4 px-6 text-2xl rounded-lg"
            @click="handleWordSuccess"
          >
            Success!
          </button>
        </div>
      </div>
      <!-- Results -->
      <div
        class="flex-grow flex flex-col items-center justify-center h-full"
        v-if="gameStatus === 'finished'"
      >
        <div class="text-white text-3xl mb-12">Total Score: {{ scoreStore.totalScore }}</div>
        <button
          type="button"
          class="text-white bg-violet-500 hover:bg-violet-400 py-4 px-6 text-2xl rounded-lg"
          @click="startGame"
        >
          Play Again
        </button>
      </div>
    </main>
  </div>
</template>
