<script setup lang="ts">
import { computed, ref } from 'vue'

import type { GameStatus } from '@/models'
import wordsData from '@/assets/json/top1000.json'
import { useScoreStore } from '@/stores/score'
import {
  saveWordsToLocalStorage,
  getWordsFromLocalStorage,
  updateWordsInLocalStorage,
} from '@/utils/localStorageManager'
import ButtonComponent from '@/components/ui/ButtonComponent.vue'

const gameStatus = ref<GameStatus>('notStarted')
const timer = ref<number>(0)
const words = ref<string[]>([])
const playedWords = ref<string[]>([])

const currentWord = ref<string | null>(null)
const capitalizedWord = computed<string | null>(() => {
  if (!currentWord.value) {
    return ''
  }

  return currentWord.value.charAt(0).toUpperCase() + currentWord.value.slice(1)
})

const scoreStore = useScoreStore()

/**
 * Initializes the words array by either retrieving it from localStorage or
 * creating a new one from the wordsData array.
 */
const initializeWords = (): void => {
  const storedWords = getWordsFromLocalStorage()
  console.log(storedWords.length)

  if (!storedWords.length) {
    words.value = wordsData.words.map(({ english }) => english)
    saveWordsToLocalStorage(words.value)

    return
  }

  words.value = storedWords
}

/**
 * Shows a new random word from the words array. If the words array is empty, it
 * calls checkIsGameOver to finish the game.
 */
const showRandomWord = (): void => {
  if (!words.value.length) {
    checkIsGameOver()
    return
  }
  const randomIndex = Math.floor(Math.random() * words.value.length)
  currentWord.value = words.value[randomIndex]
}

/**
 * Resets the game state and starts a new game.
 *
 * Initializes the words array from local storage or the wordsData array,
 * resets the score store, sets the game status to 'inProgress', and starts
 * a 10 second timer interval. When the timer reaches 0, the interval is
 * cleared. After starting the timer, a random word is selected and set as
 * the current word.
 */
const startGame = (): void => {
  initializeWords()
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

/**
 * Removes the current word from the words array.
 *
 * This is done by creating a new array from the words array that excludes
 * the current word. The new array is then set as the new words array.
 */
const filterOutCurrentWord = (): void => {
  words.value = words.value.filter((word) => word !== currentWord.value)
}

/**
 * Processes the current word based on the user's action.
 *
 * If the user was successful, it increments the guessedWords score in the
 * score store. If not, it increments the skippedWords score. It then filters
 * the current word out of the words array, updates the playedWords array,
 * checks if the game is over, and shows a new random word.
 *
 * @param {boolean} isSuccess Whether the user was successful or not.
 */
const processWord = (isSuccess: boolean): void => {
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

/**
 * Updates the playedWords array by adding the current word to it.
 *
 * If there is a current word, it is pushed to the playedWords array
 * and then the currentWord is set to null.
 */

const updatePlayedWords = (): void => {
  if (currentWord.value) {
    playedWords.value.push(currentWord.value)
    currentWord.value = null
  }
}

/**
 * Checks if the game is over based on the timer value and the length of the
 * words array.
 *
 * If the timer has reached 0 or if the words array is empty, the gameStatus
 * is set to 'finished'.
 */
const checkIsGameOver = (): void => {
  if (timer.value === 0 || words.value.length === 0) {
    gameStatus.value = 'finished'
  }
}

/**
 * Skips the current word by processing it as unsuccessful.
 *
 * This function calls processWord with a false value indicating that the
 * current word was not guessed successfully. It increments the skippedWords
 * score, updates the playedWords array, checks if the game is over, and
 * selects a new random word to display.
 */
const skipCurrentWord = (): void => {
  processWord(false)
}

/**
 * Processes the current word as a successful guess.
 *
 * This function calls processWord with a true value indicating that the
 * current word was guessed successfully. It increments the guessedWords
 * score, updates the playedWords array, checks if the game is over, and
 * selects a new random word to display.
 */
const handleWordSuccess = (): void => {
  processWord(true)
}

const restartGame = (): void => {
  updateWordsInLocalStorage(playedWords.value)
  playedWords.value = []
  startGame()
}
</script>

<template>
  <div class="flex flex-col min-h-screen bg-black">
    <header>
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
        <ButtonComponent color="blue" :cb="startGame">Start Game</ButtonComponent>
      </div>
      <!-- Game -->
      <div
        class="flex-grow flex flex-col items-center justify-center h-full"
        v-if="gameStatus === 'inProgress'"
      >
        <div class="text-white text-3xl mb-12">{{ timer }}</div>
        <div class="text-white text-4xl mb-12 font-bold">{{ capitalizedWord }}</div>
        <div class="flex gap-4">
          <ButtonComponent color="red" :cb="skipCurrentWord">Skip</ButtonComponent>
          <ButtonComponent color="green" :cb="handleWordSuccess">Success!</ButtonComponent>
        </div>
      </div>
      <!-- Results -->
      <div
        class="flex-grow flex flex-col items-center justify-center h-full"
        v-if="gameStatus === 'finished'"
      >
        <div class="text-white text-3xl mb-12">Total Score: {{ scoreStore.totalScore }}</div>
        <ButtonComponent color="violet" :cb="restartGame">Play Again</ButtonComponent>
      </div>
    </main>
  </div>
</template>
