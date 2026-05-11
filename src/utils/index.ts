export * from './localStorageManager'
export * from './timer'

export const getColorClasses = (color: string): string => {
  switch (color) {
    case 'red':
      return 'border-red-600 bg-red-500 hover:bg-red-400'
    case 'green':
      return 'border-green-600 bg-green-500 hover:bg-green-400'
    case 'blue':
      return 'border-blue-600 bg-blue-500 hover:bg-blue-400'
    case 'amber':
      return 'border-amber-600 bg-amber-500 hover:bg-amber-400'
    case 'violet':
      return 'border-violet-600 bg-violet-500 hover:bg-violet-400'
    default:
      return 'border-blue-600 bg-blue-500 hover:bg-blue-400'
  }
}
