import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export const useScoreStore = defineStore('score', () => {
  const guessedWords = ref<number>(0)
  const skippedWords = ref<number>(0)
  const totalScore = computed<number>(() => {
    const currentScore = guessedWords.value - skippedWords.value
    return Math.max(currentScore, 0)
  })

  const incrementGuessedWords = () => {
    guessedWords.value++
  }

  const incrementSkippedWords = () => {
    skippedWords.value++
  }
  const reset = () => {
    guessedWords.value = 0
    skippedWords.value = 0
  }

  return { totalScore, reset, incrementGuessedWords, incrementSkippedWords }
})
