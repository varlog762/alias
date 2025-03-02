<script setup lang="ts">
import { computed, ref } from 'vue'

import type { GameStatusType, WordLanguagesType } from '@/models'
import wordsData from '@/assets/json/russian.json'
import { useScoreStore } from '@/stores/score'
import ButtonComponent from '@/components/ui/ButtonComponent.vue'
import {
  saveWordsToLocalStorage,
  getWordsFromLocalStorage,
  updateWordsInLocalStorage,
  savePoorWords,
  // startTimer,
  // stopTimer,
} from '@/utils'
import { useRoundStore } from '@/stores/round'

const gameStatus = ref<GameStatusType>('notStarted')
const timer = ref<number>(0)
const words = ref<string[]>([])
const playedWords = ref<string[]>([])
// TODO: remove this variable
const poorWords = ref<string[]>([])

const currentWord = ref<string | null>(null)
const capitalizedWord = computed<string | null>(() => {
  if (!currentWord.value) {
    return ''
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
  console.log(storedWords.length)

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
const startGame = (): void => {
  roundStore.incrementRoundCount()

  initializeWords()
  scoreStore.reset()
  gameStatus.value = 'inProgress'
  timer.value = 60

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

  if (isGameOver()) {
    finishRound()
    return
  }
  showRandomWord()
}

// TODO: remove this method
const handlePoorWord = () => {
  filterOutCurrentWord()

  if (currentWord.value) {
    poorWords.value.push(currentWord.value)
  }
  updatePlayedWords()

  if (isGameOver()) {
    finishRound()
    return
  }
  showRandomWord()
}

/**
 * Updates the playedWords array by adding the current word.
 *
 * If there is a current word set, this function pushes it onto the
 * playedWords array and then clears the current word. This helps
 * track all words that have been played during the game.
 */

const updatePlayedWords = (): void => {
  if (currentWord.value) {
    playedWords.value.push(currentWord.value)
    currentWord.value = null
  }
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
  updateWordsInLocalStorage(playedWords.value)
  // TODO: remove this
  savePoorWords(poorWords.value)
  playedWords.value = []
  // TODO: remove this
  poorWords.value = []
  gameStatus.value = 'finished'
}

const exitGame = (): void => {
  roundStore.resetRoundCount()
  gameStatus.value = 'notStarted'
}
</script>

<template>
  <main class="flex-grow flex flex-col">
    <!-- Start Game -->
    <div
      class="flex-grow flex flex-col items-center justify-center h-full"
      v-if="gameStatus === 'notStarted'"
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
      v-if="gameStatus === 'inProgress'"
    >
      <div class="text-white text-3xl mb-12">{{ timer }}</div>
      <div class="text-white text-4xl mb-12 font-bold">{{ capitalizedWord }}</div>
      <div class="flex gap-4">
        <ButtonComponent color="red" :cb="skipCurrentWord">Skip</ButtonComponent>
        <ButtonComponent color="green" :cb="handleWordSuccess">Success!</ButtonComponent>
        <!-- TODO: remove this component -->
        <ButtonComponent color="amber" :cb="handlePoorWord">Poor Word...</ButtonComponent>
      </div>
    </div>
    <!-- Results -->
    <div
      class="flex-grow flex flex-col items-center justify-center h-full"
      v-if="gameStatus === 'finished'"
    >
      <div class="text-white text-3xl mb-12">Total Score: {{ scoreStore.totalScore }}</div>
      <div class="flex flex-col gap-4">
        <ButtonComponent color="violet" :cb="startGame">Play Again</ButtonComponent>
        <ButtonComponent color="amber" :cb="exitGame">Exit</ButtonComponent>
      </div>
    </div>
  </main>
</template>
