import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useRoundStore = defineStore('round-store', () => {
  const roundCount = ref<number>(0)

  const incrementRoundCount = () => roundCount.value++
  const resetRoundCount = () => (roundCount.value = 0)

  return { roundCount, incrementRoundCount, resetRoundCount }
})
