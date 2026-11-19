export const ENGLISH_LEVELS = [
  { id: 'starter', label: 'Starter', cefr: 'Pre-A1', tagline: 'First words and simple sentences', color: 'from-fuchsia-500 to-violet-600' },
  { id: 'a1', label: 'A1 Beginner', cefr: 'A1', tagline: 'Everyday language and simple exchanges', color: 'from-violet-500 to-indigo-600' },
  { id: 'a2', label: 'A2 Elementary', cefr: 'A2', tagline: 'Routines, travel and past events', color: 'from-indigo-500 to-sky-600' },
  { id: 'b1', label: 'B1 Intermediate', cefr: 'B1', tagline: 'Opinions, stories and clear arguments', color: 'from-sky-500 to-cyan-600' },
  { id: 'b2', label: 'B2 Upper Intermediate', cefr: 'B2', tagline: 'Nuance, discussion and precision', color: 'from-cyan-500 to-teal-600' },
  { id: 'c1', label: 'C1 Advanced', cefr: 'C1', tagline: 'Complex ideas and flexible expression', color: 'from-teal-500 to-emerald-600' },
  { id: 'c2', label: 'C2 Proficiency', cefr: 'C2', tagline: 'Mastery, style and idiomatic command', color: 'from-emerald-500 to-lime-600' },
]

export const MATH_LEVELS = [
  { id: 'math-zero', label: 'Mathematics from Zero', tagline: 'Numbers, counting and the four operations', color: 'from-violet-500 to-fuchsia-600' },
  { id: 'math-elementary', label: 'Elementary Mathematics', tagline: 'Fractions, decimals, shapes and measurement', color: 'from-sky-500 to-indigo-600' },
  { id: 'math-intermediate', label: 'Intermediate Mathematics', tagline: 'Algebra, equations, functions and data', color: 'from-cyan-500 to-teal-600' },
  { id: 'math-advanced', label: 'Advanced Mathematics', tagline: 'Proof, probability, modelling and reasoning', color: 'from-emerald-500 to-amber-500' },
]

export const EXAM_SYSTEMS = [
  {
    id: 'cefr', label: 'CEFR', tagline: 'A1 → C2 level checks with canonical task types',
    sections: ENGLISH_LEVELS.filter((l) => l.id !== 'starter').map((l) => ({ id: l.id, label: `${l.cefr} ${l.label}`, description: `${l.tagline}. Reading, grammar and vocabulary check.` })),
  },
  {
    id: 'ielts', label: 'IELTS', tagline: 'Academic practice: Listening, Reading, Writing, Speaking',
    sections: [
      { id: 'ielts-listening', label: 'Listening', description: 'Listen to a short monologue or conversation and answer questions.' },
      { id: 'ielts-reading', label: 'Reading', description: 'Skim, scan and answer detail and inference questions.' },
      { id: 'ielts-writing-1', label: 'Writing Task 1', description: 'Describe visual data in at least 150 words.' },
      { id: 'ielts-writing-2', label: 'Writing Task 2', description: 'Write a balanced essay of at least 250 words.' },
      { id: 'ielts-speaking-1', label: 'Speaking Part 1', description: 'Short answers about familiar topics.' },
      { id: 'ielts-speaking-2', label: 'Speaking Part 2', description: 'One-minute cue card talk.' },
      { id: 'ielts-speaking-3', label: 'Speaking Part 3', description: 'Abstract discussion with follow-up questions.' },
      { id: 'ielts-grammar', label: 'Grammar & Vocabulary', description: 'Accuracy and range checks with instant feedback.' },
    ],
  },
  {
    id: 'toefl', label: 'TOEFL', tagline: 'Academic English practice for the iBT',
    sections: [
      { id: 'toefl-reading', label: 'Reading', description: 'Academic passage with detail, inference and vocabulary questions.' },
      { id: 'toefl-listening', label: 'Listening', description: 'Campus conversation and lecture comprehension.' },
      { id: 'toefl-speaking', label: 'Speaking', description: 'Independent and integrated response prompts.' },
      { id: 'toefl-writing', label: 'Writing', description: 'Integrated and independent writing tasks.' },
      { id: 'toefl-vocabulary', label: 'Academic Vocabulary', description: 'High-frequency academic word families in context.' },
    ],
  },
]

export const VOICES = [
  { id: 'en-female', label: 'English female', locale: 'en-US', gender: 'FEMALE' },
  { id: 'en-male', label: 'English male', locale: 'en-US', gender: 'MALE' },
  { id: 'uz-female', label: 'Oʻzbekcha ayol', locale: 'uz-UZ', gender: 'FEMALE' },
  { id: 'uz-male', label: 'Oʻzbekcha erkak', locale: 'uz-UZ', gender: 'MALE' },
]

export const lessonId = (subject, level, slug) => `${subject}-${level}-${slug}`

export const getEnglishLevel = (id) => ENGLISH_LEVELS.find((l) => l.id === id)
export const getMathLevel = (id) => MATH_LEVELS.find((l) => l.id === id)
