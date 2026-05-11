/**
 * Saves an array of words to the user's localStorage.
 * @param {string[]} wordsToSave The words to save.
 */
export const saveWordsToLocalStorage = (wordsToSave: string[]): void => {
  try {
    localStorage.setItem('words', JSON.stringify(wordsToSave))
  } catch (error) {
    console.error('Failed to update localStorage', error)
  }
}

/**
 * Retrieves an array of words from the user's localStorage.
 * If the localStorage is either empty, or the words key is not an array,
 * an empty array is returned. If the localStorage fails to parse, an
 * empty array is returned.
 *
 * @returns {string[]} An array of words.
 */
export const getWordsFromLocalStorage = (): string[] => {
  try {
    const storedWords = JSON.parse(localStorage.getItem('words') || '[]')

    if (!Array.isArray(storedWords)) {
      return []
    }

    return storedWords
  } catch {
    return []
  }
}

/**
 * Updates the user's localStorage words by removing the given words.
 * @param {string[]} wordsToRemove The words to remove from localStorage.
 */
export const updateWordsInLocalStorage = (wordsToRemove: string[]): void => {
  const currentWords = getWordsFromLocalStorage()
  const filteredWords = currentWords.filter((word) => !wordsToRemove.includes(word))
  saveWordsToLocalStorage(filteredWords)
}

export const savePoorWords = (poorWords: string[]) => {
  try {
    const storedWords = JSON.parse(localStorage.getItem('poor-words') || '[]')

    const result = [...poorWords, ...storedWords]

    localStorage.setItem('poor-words', JSON.stringify(result))
  } catch (error) {
    console.error('Failed to save poor words to localStorage', error)
  }
}
