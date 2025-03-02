import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useRoundStore = defineStore('round-store', () => {
  const roundCount = ref<number>(0)

  const incrementRoundCount = () => roundCount.value++

  return { roundCount, incrementRoundCount }
})
