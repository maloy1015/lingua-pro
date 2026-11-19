import { getSeeds } from '../data/lessonSeeds'
import { lessonId as makeId } from '../data/catalog'
import { estimateDurations, buildVtt, totalDuration } from './subtitles'

const hash = (str) => {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) }
  return Math.abs(h)
}

function shuffle(list, seed) {
  const arr = [...list]
  let s = seed || 1
  for (let i = arr.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff
    const j = s % (i + 1)
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function distinct(pool, answer, count, seed) {
  const others = shuffle(pool.filter((x) => x !== answer), seed + 7)
  const picked = []
  for (const item of others) {
    if (!picked.includes(item)) picked.push(item)
    if (picked.length === count) break
  }
  return picked
}

function normaliseOptions(id, question, options, answer, explanation) {
  const order = shuffle(options, hash(id))
  return {
    id, question,
    options: order.map((text, i) => ({ key: String.fromCharCode(65 + i), text })),
    answerKey: order.indexOf(answer),
    explanation,
  }
}

function englishScript(seed) {
  const [first, second] = seed.examples
  const vocab = seed.words.map((w) => `${w.term} means ${w.meaning}.`).join(' ')
  return [
    `Welcome to ${seed.title}. In this lesson you will focus on ${seed.focus.toLowerCase()}.`,
    `Here is the main idea. ${seed.concept}`,
    `Listen carefully to two examples. The first example is: ${first} The second example is: ${second}`,
    `Now look at the grammar. ${seed.grammar}. This structure helps you speak accurately and understand what you read.`,
    `Let's build vocabulary. ${vocab}`,
    `Try a short exercise. Complete this sentence: ${first.replace(/\b\w+\b/, '____')} Pause the lesson and say your answer aloud.`,
    `One more practice task: use "${seed.words[0].term}" in a sentence about your own life.`,
    `Let's review. ${seed.concept}`,
    `Well done. You have finished ${seed.title}. Complete the quiz to check your understanding, then move on to the next lesson.`,
  ]
}

function mathScript(seed) {
  return [
    `Welcome to ${seed.title}. This lesson belongs to ${seed.category}. By the end, you will be able to solve problems of this type with confidence.`,
    `Here is the idea. ${seed.concept}`,
    `Let us look at a worked example: ${seed.example}. The answer is ${seed.answer}.`,
    ...seed.steps.map((step, i) => `Step ${i + 1}: ${step}.`),
    `A common mistake is rushing the setup. Always write down what is given and what you need to find before calculating.`,
    `Now try a similar problem on your own. Use the same method: ${seed.steps[0]}.`,
    `Check your working against the steps we just covered. If your answer differs, find the first step where you diverged.`,
    `To summarise: ${seed.concept}`,
    `Excellent work. You have completed ${seed.title}. Take the quiz to confirm that you can apply the method independently.`,
  ]
}

function englishQuiz(seed, peers) {
  const ids = `${seed.id}-${hash(seed.title)}`
  const questions = []
  seed.words.forEach((w, i) => {
    const distractors = distinct(peers.flatMap((p) => p.words.map((x) => x.meaning)), w.meaning, 3, hash(ids + i))
    questions.push(normaliseOptions(`q-${ids}-v${i}`, `What does "${w.term}" mean?`, [w.meaning, ...distractors], w.meaning, `${w.term}: ${w.meaning}`))
  })
  const conceptOptions = distinct(peers.map((p) => p.concept), seed.concept, 3, hash(ids + 'c'))
  questions.push(normaliseOptions(`q-${ids}-concept`, `Which statement best describes "${seed.title}"?`, [seed.concept, ...conceptOptions], seed.concept, seed.concept))
  const exampleOptions = distinct(peers.flatMap((p) => p.examples), seed.examples[0], 3, hash(ids + 'e'))
  questions.push(normaliseOptions(`q-${ids}-example`, `Which sentence is an example of ${seed.title}?`, [seed.examples[0], ...exampleOptions], seed.examples[0], seed.examples[0]))
  const grammarOptions = distinct(peers.map((p) => p.grammar), seed.grammar, 3, hash(ids + 'g'))
  questions.push(normaliseOptions(`q-${ids}-grammar`, `Which grammar point belongs to this lesson?`, [seed.grammar, ...grammarOptions], seed.grammar, seed.grammar))
  const reverse = seed.words[1] || seed.words[0]
  const wordOptions = distinct(peers.flatMap((p) => p.words.map((x) => x.term)), reverse.term, 3, hash(ids + 'w'))
  questions.push(normaliseOptions(`q-${ids}-reverse`, `Which English word means "${reverse.meaning}"?`, [reverse.term, ...wordOptions], reverse.term, `${reverse.term} = ${reverse.meaning}`))
  return questions.slice(0, 8)
}

function mathQuiz(seed, peers) {
  const ids = `${seed.id}-${hash(seed.title)}`
  const answerOptions = distinct(peers.map((p) => p.answer), seed.answer, 3, hash(ids + 'a'))
  const questions = [
    normaliseOptions(`q-${ids}-answer`, `What is the answer to ${seed.example}?`, [seed.answer, ...answerOptions], seed.answer, `Worked answer: ${seed.answer}. ${seed.steps.join('. ')}.`),
  ]
  const conceptOptions = distinct(peers.map((p) => p.concept), seed.concept, 3, hash(ids + 'c'))
  questions.push(normaliseOptions(`q-${ids}-concept`, `Which rule applies in "${seed.title}"?`, [seed.concept, ...conceptOptions], seed.concept, seed.concept))
  const stepOptions = distinct(peers.flatMap((p) => p.steps), seed.steps[0] || seed.concept, 3, hash(ids + 's'))
  questions.push(normaliseOptions(`q-${ids}-step`, `Which step comes first in this method?`, [seed.steps[0] || seed.concept, ...stepOptions], seed.steps[0] || seed.concept, seed.steps.join(' → ')))
  const categoryOptions = distinct(peers.map((p) => p.category), seed.category, 3, hash(ids + 'cat'))
  questions.push(normaliseOptions(`q-${ids}-category`, `Which topic does this lesson belong to?`, [seed.category, ...categoryOptions], seed.category, `${seed.title} is part of ${seed.category}.`))
  const exampleOptions = distinct(peers.map((p) => p.example), seed.example, 3, hash(ids + 'ex'))
  questions.push(normaliseOptions(`q-${ids}-example`, `Which problem is solved in this lesson?`, [seed.example, ...exampleOptions], seed.example, `${seed.example} = ${seed.answer}`))
  questions.push(normaliseOptions(`q-${ids}-summary`, `Which sentence summarises the method?`, [seed.concept, ...conceptOptions], seed.concept, seed.concept))
  return questions
}

function englishExercises(seed) {
  return [
    { id: `${seed.id}-e1`, type: 'fill', prompt: `Complete the example: ${seed.examples[0].replace(/\b\w+\b/, '____')}`, answer: seed.examples[0], hint: seed.grammar },
    { id: `${seed.id}-e2`, type: 'vocab', prompt: `Write an English sentence using "${seed.words[0].term}".`, answer: seed.examples[0], hint: seed.words[0].meaning },
    { id: `${seed.id}-e3`, type: 'explain', prompt: `Explain the rule from this lesson in your own words.`, answer: seed.concept, hint: 'Use the key idea from the explanation slide.' },
  ]
}

function mathExercises(seed) {
  return [
    { id: `${seed.id}-e1`, type: 'solve', prompt: `Solve: ${seed.example}`, answer: seed.answer, hint: seed.steps[0] },
    { id: `${seed.id}-e2`, type: 'steps', prompt: `List the steps used to solve ${seed.example}.`, answer: seed.steps.join(' → '), hint: `There are ${seed.steps.length} steps.` },
    { id: `${seed.id}-e3`, type: 'explain', prompt: `In one sentence, explain the rule behind this lesson.`, answer: seed.concept, hint: seed.category },
  ]
}

function englishSlides(seed, exercises) {
  return [
    { title: seed.title, subtitle: seed.focus, bullets: ['Original narrated lesson', 'Examples, vocabulary and grammar', 'Practice and quiz'] },
    { title: 'Learning objective', bullets: [`Understand: ${seed.concept}`, `Use the structure: ${seed.grammar}`] },
    { title: 'Key idea', bullets: [seed.concept] },
    { title: 'Examples', bullets: seed.examples },
    { title: 'Grammar focus', bullets: [seed.grammar, seed.examples[0]] },
    { title: 'Vocabulary', bullets: seed.words.map((w) => `${w.term} — ${w.meaning}`) },
    { title: 'Guided practice', bullets: exercises.map((e) => e.prompt) },
    { title: 'Answers to check', bullets: exercises.map((e) => `${e.prompt.split(':')[0]}: ${e.answer}`) },
    { title: 'Summary', bullets: [seed.concept, seed.grammar] },
    { title: 'Next step', bullets: ['Take the quiz', 'Mark the lesson complete', 'Continue to the next lesson'] },
  ]
}

function mathSlides(seed, exercises) {
  return [
    { title: seed.title, subtitle: seed.category, bullets: ['Concept', 'Worked example', 'Practice'] },
    { title: 'Learning objective', bullets: [`Solve problems in ${seed.category.toLowerCase()}`] },
    { title: 'Key idea', bullets: [seed.concept] },
    { title: 'Worked example', bullets: [`${seed.example} = ${seed.answer}`] },
    { title: 'Method', bullets: seed.steps.map((s, i) => `${i + 1}. ${s}`) },
    { title: 'Common mistakes', bullets: ['Write down the given values first', 'Check each step before calculating'] },
    { title: 'Practice', bullets: exercises.map((e) => e.prompt) },
    { title: 'Answers', bullets: [`${seed.example} = ${seed.answer}`, seed.steps.join(' → ')] },
    { title: 'Summary', bullets: [seed.concept] },
    { title: 'Next step', bullets: ['Take the quiz', 'Mark the lesson complete'] },
  ]
}

export function buildLesson(subject, level, seed, peers) {
  const group = peers || getSeeds(subject, level)
  const script = subject === 'math' ? mathScript(seed) : englishScript(seed)
  const exercises = subject === 'math' ? mathExercises(seed) : englishExercises(seed)
  const timed = estimateDurations(script)
  const quiz = subject === 'math' ? mathQuiz(seed, group.filter((s) => s.id !== seed.id)) : englishQuiz(seed, group.filter((s) => s.id !== seed.id))
  const lesson = {
    id: makeId(subject, level, seed.id),
    seedId: seed.id,
    subject,
    level,
    title: seed.title,
    category: seed.category || seed.focus,
    concept: seed.concept,
    grammar: seed.grammar || '',
    focus: seed.focus || '',
    examples: seed.examples || [seed.example],
    vocabulary: seed.words || [],
    steps: seed.steps || [],
    example: seed.example || '',
    answer: seed.answer || '',
    script: timed.map((t, i) => ({ id: `s${i + 1}`, text: t.text, start: t.start, end: t.end })),
    slides: subject === 'math' ? mathSlides(seed, exercises) : englishSlides(seed, exercises),
    exercises,
    quiz,
    objectives: [`Understand ${seed.title}`, `Apply ${subject === 'math' ? seed.category : seed.grammar} in practice`, 'Pass the lesson quiz'],
    durationSeconds: Math.round(totalDuration(timed)),
    vtt: buildVtt(timed),
    generatedAt: new Date().toISOString(),
    schemaVersion: 1,
  }
  return lesson
}

export function getLesson(subject, level, seedId) {
  const seeds = getSeeds(subject, level)
  const seed = seeds.find((s) => s.id === seedId)
  return seed ? buildLesson(subject, level, seed, seeds) : null
}

export function getLevelLessons(subject, level) {
  const seeds = getSeeds(subject, level)
  return seeds.map((s) => buildLesson(subject, level, s, seeds))
}

export function lessonNotes(lesson) {
  const lines = [
    `# ${lesson.title}`,
    '',
    `**Course:** ${lesson.subject} · ${lesson.level}`,
    `**Duration:** ${Math.round(lesson.durationSeconds / 60)} min`,
    '',
    '## Learning objectives',
    ...lesson.objectives.map((o) => `- ${o}`),
    '',
    '## Key idea',
    lesson.concept,
    '',
    '## Examples',
    ...lesson.examples.map((e, i) => `${i + 1}. ${e}`),
    '',
  ]
  if (lesson.vocabulary.length) {
    lines.push('## Vocabulary', '', ...lesson.vocabulary.map((w) => `- **${w.term}** — ${w.meaning}`), '')
  }
  if (lesson.grammar) lines.push('## Grammar', lesson.grammar, '')
  if (lesson.steps.length) lines.push('## Method', '', ...lesson.steps.map((s, i) => `${i + 1}. ${s}`), '')
  lines.push('## Exercises', '', ...lesson.exercises.map((e, i) => `${i + 1}. ${e.prompt}\n   Answer: ${e.answer}`), '')
  lines.push('## Transcript', '', ...lesson.script.map((s) => s.text), '')
  return lines.join('\n')
}
