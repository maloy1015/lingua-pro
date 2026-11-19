import { ENGLISH_STARTER_A2 } from './englishSeedsA'
import { ENGLISH_B1_B2 } from './englishSeedsB'
import { ENGLISH_C1_C2 } from './englishSeedsC'
import { MATH_SEEDS } from './mathSeeds'

export const ENGLISH_SEEDS = { ...ENGLISH_STARTER_A2, ...ENGLISH_B1_B2, ...ENGLISH_C1_C2 }
export { MATH_SEEDS }

export const ALL_SEEDS = { english: ENGLISH_SEEDS, math: MATH_SEEDS }

export const TOTAL_ENGLISH_LESSONS = Object.values(ENGLISH_SEEDS).reduce((n, list) => n + list.length, 0)
export const TOTAL_MATH_LESSONS = Object.values(MATH_SEEDS).reduce((n, list) => n + list.length, 0)

export function getSeeds(subject, level) {
  return ALL_SEEDS[subject]?.[level] || []
}
