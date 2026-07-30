<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'

import type { GameStatusType, WordLanguagesType } from '@/models'
import wordsData from '@/assets/json/russian.json'
import { useScoreStore } from '@/stores/score'
import { useRoundStore } from '@/stores/round'
import ButtonComponent from '@/components/ui/ButtonComponent.vue'
import {
  saveWordsToLocalStorage,
  getWordsFromLocalStorage,
  updateWordsInLocalStorage,
} from '@/utils'
import { GameStatusEnum } from '@/enums'

const gameStatus = ref<GameStatusType>('notStarted')
const timer = ref<number>(0)
const timerInterval = ref<ReturnType<typeof setInterval> | null>(null)
const isPaused = ref<boolean>(false)
const words = ref<string[]>([])
const playedWords = ref<string[]>([])

const currentWord = ref<string | null>(null)
const capitalizedWord = computed<string | null>(() => {
  if (!currentWord.value) {
    return null
  }

  return currentWord.value.charAt(0).toUpperCase() + currentWord.value.slice(1)
})

const wordsLanguage = ref<WordLanguagesType>('russian')

const roundStore = useRoundStore()
const scoreStore = useScoreStore()

/**
 * Initializes the words array by either retrieving it from localStorage or
 * creating a new one from the wordsData array.
 */
const initializeWords = (): void => {
  const storedWords = getWordsFromLocalStorage()

  if (!storedWords.length) {
    words.value = wordsData.words.map(({ russian }) => russian)
    saveWordsToLocalStorage(words.value)

    return
  }

  words.value = storedWords
}

/**
 * Selects a random word from the words array and assigns it to the currentWord
 * reactive reference.
 *
 * If the words array is empty, an error is logged to the console.
 */
const showRandomWord = (): void => {
  if (!words.value.length) {
    console.error('Error: no words available!')
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
const startCountdown = (): void => {
  if (timerInterval.value) clearInterval(timerInterval.value)

  timerInterval.value = setInterval(() => {
    timer.value--
    if (timer.value === 0) {
      clearInterval(timerInterval.value!)
      timerInterval.value = null
      finishRound()
    }
  }, 1000)
}

const startGame = (): void => {
  roundStore.incrementRoundCount()

  initializeWords()
  scoreStore.reset()
  gameStatus.value = GameStatusEnum.IN_PROGRESS
  isPaused.value = false
  timer.value = 60

  startCountdown()

  showRandomWord()
}

/**
 * Processes the current word based on the user's action.
 *
 * Captures the current word upfront to avoid fragile ordering dependencies.
 * Removes only the first occurrence of the word from the available words,
 * updates the score, tracks the word as played, and either finishes the
 * round or shows a new random word.
 *
 * @param {boolean} isSuccess Whether the user was successful or not.
 */
const processWord = (isSuccess: boolean): void => {
  if (gameStatus.value !== GameStatusEnum.IN_PROGRESS || isPaused.value) return

  const word = currentWord.value
  if (!word) return

  // Update score
  if (isSuccess) {
    scoreStore.incrementGuessedWords()
  } else {
    scoreStore.incrementSkippedWords()
  }

  // Remove only the first occurrence from available words
  const index = words.value.indexOf(word)
  if (index !== -1) {
    words.value.splice(index, 1)
  }

  // Track played word and clear current
  playedWords.value.push(word)
  currentWord.value = null

  if (isGameOver()) {
    finishRound()
    return
  }
  showRandomWord()
}

/**
 * Determines if the game is over.
 *
 * The game is considered over if the timer has reached 0 or if there
 * are no more words left in the words array.
 *
 * @returns {boolean} True if the game is over, false otherwise.
 */

const isGameOver = (): boolean => {
  return timer.value === 0 || words.value.length === 0
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

/**
 * Finishes the game by updating the localStorage words and resetting
 * the playedWords array and game status.
 *
 * This function is called when the game is over. It removes the playedWords
 * from the localStorage words and resets the playedWords array and game
 * status to their initial values.
 */
const finishRound = (): void => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
    timerInterval.value = null
  }
  updateWordsInLocalStorage(playedWords.value)
  playedWords.value = []
  gameStatus.value = GameStatusEnum.FINISHED
}

/**
 * Pauses the game by clearing the timer interval.
 */
const pauseGame = (): void => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
    timerInterval.value = null
  }
  isPaused.value = true
}

/**
 * Resumes the game by restarting the timer interval.
 */
const resumeGame = (): void => {
  isPaused.value = false
  startCountdown()
}

const exitGame = (): void => {
  roundStore.resetRoundCount()
  gameStatus.value = GameStatusEnum.NOT_STARTED
}

onUnmounted(() => {
  if (timerInterval.value) clearInterval(timerInterval.value)
})
</script>

<template>
  <main class="flex-grow flex flex-col">
    <!-- Start Game -->
    <div
      class="flex-grow flex flex-col items-center justify-center h-full"
      v-if="gameStatus === GameStatusEnum.NOT_STARTED"
    >
      <div class="flex gap-4 mb-5">
        <div>
          <input
            v-model="wordsLanguage"
            class="mr-1"
            type="radio"
            id="russian-words"
            name="words-language"
            value="russian"
          />
          <label for="russian-words" class="text-white text-xl">Russian</label>
        </div>
        <div>
          <input
            v-model="wordsLanguage"
            class="mr-1"
            type="radio"
            id="english-words"
            name="words-language"
            value="english"
          />
          <label for="english-words" class="text-white text-xl">English</label>
        </div>
      </div>
      <ButtonComponent color="blue" :cb="startGame">Start Game</ButtonComponent>
    </div>
    <!-- Game -->
    <div
      class="flex-grow flex flex-col items-center justify-center h-full"
      v-if="gameStatus === GameStatusEnum.IN_PROGRESS"
    >
      <div
        class="text-white text-6xl font-bold mb-12"
        :class="{ 'timer-pulse': timer <= 10 && timer > 0 }"
        :key="timer"
      >{{ timer }}</div>
      <div v-if="!isPaused" class="text-white text-4xl mb-12 font-bold">{{ capitalizedWord }}</div>
      <div v-if="!isPaused" class="flex gap-4 mb-6">
        <ButtonComponent color="red" :cb="skipCurrentWord">Skip</ButtonComponent>
        <ButtonComponent color="green" :cb="handleWordSuccess">Success!</ButtonComponent>
      </div>
      <ButtonComponent v-if="isPaused" color="blue" :cb="resumeGame">Resume</ButtonComponent>
      <ButtonComponent v-else color="amber" :cb="pauseGame">Pause</ButtonComponent>
    </div>
    <!-- Results -->
    <div
      class="flex-grow flex flex-col items-center justify-center h-full"
      v-if="gameStatus === GameStatusEnum.FINISHED"
    >
      <div class="text-white text-3xl mb-12">Total Score: {{ scoreStore.totalScore }}</div>
      <div class="flex flex-col gap-4">
        <ButtonComponent color="violet" :cb="startGame">Play Again</ButtonComponent>
        <ButtonComponent color="amber" :cb="exitGame">Exit</ButtonComponent>
      </div>
    </div>
  </main>
</template>

<style scoped>
.timer-pulse {
  color: #f87171;
  animation: timer-ping 0.4s ease-out;
}

@keyframes timer-ping {
  0% { transform: scale(1.3); opacity: 0.7; }
  100% { transform: scale(1); opacity: 1; }
}
</style>
