const mcq = (id, question, options, answer, explanation) => ({ id, type: 'mcq', question, options, answer, explanation })

const cefrPassages = {
  a1: {
    passage: 'My name is Dilshod. I am twelve years old. I live in Samarkand with my mother and father. I go to school every day. My favourite subject is maths. I like playing football with my friends after school.',
    questions: [
      mcq('a1-1', 'How old is Dilshod?', ['10', '12', '14', '16'], '12', '"I am twelve years old."'),
      mcq('a1-2', 'Where does he live?', ['Tashkent', 'Bukhara', 'Samarkand', 'Andijan'], 'Samarkand', '"I live in Samarkand."'),
      mcq('a1-3', 'What is his favourite subject?', ['English', 'History', 'Maths', 'Science'], 'Maths', '"My favourite subject is maths."'),
      mcq('a1-4', 'Choose the correct sentence.', ['He go to school every day.', 'He goes to school every day.', 'He going to school every day.', 'He gone to school every day.'], 'He goes to school every day.', 'Third person singular present simple takes -s.'),
      mcq('a1-5', 'What does he do after school?', ['He sleeps.', 'He watches TV.', 'He plays football.', 'He cooks.'], 'He plays football.', '"I like playing football with my friends after school."'),
      mcq('a1-6', '"Favourite" means:', ['most liked', 'very big', 'new', 'difficult'], 'most liked', 'Favourite = the one you like best.'),
    ],
  },
  a2: {
    passage: 'Last Saturday, Sara and her brother went to the park. The weather was sunny but windy. They played tennis for an hour and then had a picnic. Sara took photos of the lake. In the afternoon, they visited their grandmother and helped her in the garden.',
    questions: [
      mcq('a2-1', 'When did they go to the park?', ['Last Friday', 'Last Saturday', 'Last Sunday', 'Yesterday'], 'Last Saturday', 'First sentence of the passage.'),
      mcq('a2-2', 'What was the weather like?', ['Rainy and cold', 'Sunny but windy', 'Cloudy', 'Snowy'], 'Sunny but windy', '"The weather was sunny but windy."'),
      mcq('a2-3', 'What did they do first?', ['Had a picnic', 'Visited grandmother', 'Played tennis', 'Took photos'], 'Played tennis', '"They played tennis for an hour and then had a picnic."'),
      mcq('a2-4', 'Choose the correct negative form: They ___ tennis.', ['did not played', 'did not play', 'was not play', 'do not played'], 'did not play', 'After did not, use the base verb.'),
      mcq('a2-5', 'Who did they visit in the afternoon?', ['A friend', 'Their teacher', 'Their grandmother', 'A neighbour'], 'Their grandmother', 'Last sentence.'),
      mcq('a2-6', '"Picnic" in this text means:', ['a meal eaten outside', 'a long walk', 'a game', 'a photograph'], 'a meal eaten outside', 'Context: they ate after playing tennis in the park.'),
    ],
  },
  b1: {
    passage: 'Many people believe that learning a language is only about memorising words. In fact, regular practice matters more than intense, occasional study. Short daily sessions help the brain consolidate new information. Reading texts you enjoy also exposes you to grammar in context, which is far more useful than isolated rules.',
    questions: [
      mcq('b1-1', 'What is the main idea of the passage?', ['Vocabulary is irrelevant', 'Consistent practice beats occasional cramming', 'Grammar rules are useless', 'Only children can learn languages'], 'Consistent practice beats occasional cramming', 'Second sentence states the central claim.'),
      mcq('b1-2', 'According to the text, what does reading do?', ['Replaces speaking practice', 'Shows grammar in context', 'Makes rules unnecessary', 'Slows progress'], 'Shows grammar in context', 'Final sentence.'),
      mcq('b1-3', 'Choose the correct word: She has lived here ___ 2019.', ['for', 'since', 'from', 'during'], 'since', 'Use since with a point in time.'),
      mcq('b1-4', '"Consolidate" is closest in meaning to:', ['forget', 'strengthen', 'confuse', 'translate'], 'strengthen', 'Consolidate = make stronger or more solid.'),
      mcq('b1-5', 'Which statement is true?', ['Intense occasional study is best', 'Daily short sessions help memory', 'Only words matter', 'Children learn differently'], 'Daily short sessions help memory', 'Third sentence.'),
      mcq('b1-6', 'The writer would probably recommend:', ['one long lesson a month', 'a grammar book only', 'short daily reading and practice', 'memorising lists only'], 'short daily reading and practice', 'Follows from the argument.'),
    ],
  },
  b2: {
    passage: 'Urban green spaces are often treated as decoration, yet evidence suggests they are critical infrastructure. Parks reduce heat islands, absorb rainwater and improve mental wellbeing. Critics argue that maintenance costs are prohibitive, but the long-term savings in healthcare and flood management are substantial.',
    questions: [
      mcq('b2-1', 'What is the writer’s main argument?', ['Parks are decorative', 'Green spaces are essential infrastructure', 'Cities should remove parks', 'Maintenance is cheap'], 'Green spaces are essential infrastructure', 'First sentence with "yet" signals the claim.'),
      mcq('b2-2', 'Which benefit is NOT mentioned?', ['Cooling cities', 'Absorbing rainwater', 'Improving wellbeing', 'Increasing car sales'], 'Increasing car sales', 'Benefits listed in second sentence.'),
      mcq('b2-3', 'Choose the correct linker: ___ the costs, the benefits are clear.', ['Despite', 'Because', 'So', 'Therefore'], 'Despite', 'Contrast requires a concessive linker.'),
      mcq('b2-4', '"Prohibitive" means:', ['very expensive', 'very small', 'unusual', 'necessary'], 'very expensive', 'Prohibitive costs prevent action.'),
      mcq('b2-5', 'How does the writer answer critics?', ['By ignoring them', 'By citing long-term savings', 'By agreeing completely', 'By changing the topic'], 'By citing long-term savings', 'Final clause presents counter-evidence.'),
      mcq('b2-6', 'The tone of the passage is:', ['emotional', 'analytical', 'humorous', 'hostile'], 'analytical', 'Evidence-based argument with balanced counterpoint.'),
    ],
  },
  c1: {
    passage: 'The assumption that technological convenience inevitably erodes deep reading deserves scrutiny. Admittedly, fragmented attention makes sustained concentration harder; nevertheless, digital texts can foster new forms of close engagement when readers annotate, compare and revisit them. The decisive factor is not the medium but the intention brought to it.',
    questions: [
      mcq('c1-1', 'The writer’s position is that:', ['screens always harm reading', 'medium matters less than intention', 'paper is always superior', 'attention cannot be trained'], 'medium matters less than intention', 'Final sentence states the thesis.'),
      mcq('c1-2', '"Deserves scrutiny" means:', ['should be examined carefully', 'is obviously false', 'must be accepted', 'is too difficult'], 'should be examined carefully', 'Scrutiny = careful examination.'),
      mcq('c1-3', 'Choose the correct inverted form: Never ___ such engagement before.', ['I have seen', 'have I seen', 'I saw', 'did I saw'], 'have I seen', 'Negative adverbial at start requires inversion.'),
      mcq('c1-4', 'What function does "Admittedly" serve?', ['Adds a contrasting concession', 'Introduces a consequence', 'Gives an example', 'Summarises'], 'Adds a contrasting concession', 'Concessive discourse marker.'),
      mcq('c1-5', '"Inevitably" could be replaced by:', ['possibly', 'necessarily', 'rarely', 'partly'], 'necessarily', 'Inevitable = certain to happen.'),
      mcq('c1-6', 'Which is an implied claim?', ['Digital tools may support analysis', 'All digital reading is shallow', 'Intent is irrelevant', 'Only books work'], 'Digital tools may support analysis', 'Follows from "can foster new forms of close engagement".'),
    ],
  },
  c2: {
    passage: 'To conflate efficiency with wisdom is a category error of considerable currency. Efficiency asks whether a process minimises waste; wisdom asks whether the process ought to exist at all. A system may be impeccably optimised and yet profoundly misguided, a distinction that political discourse routinely elides in favour of measurable outputs.',
    questions: [
      mcq('c2-1', 'The central distinction is between:', ['speed and cost', 'efficiency and wisdom', 'data and opinion', 'theory and practice'], 'efficiency and wisdom', 'First sentence.'),
      mcq('c2-2', '"Elides" most nearly means:', ['highlights', 'conceals or omits', 'measures', 'criticises'], 'conceals or omits', 'Elide = omit or blur a distinction.'),
      mcq('c2-3', 'Choose the correct subjunctive: It is vital that the distinction ___ clear.', ['is', 'be', 'was', 'were going'], 'be', 'Mandative subjunctive after "it is vital that".'),
      mcq('c2-4', 'The phrase "category error" suggests:', ['a minor typo', 'a logical mistake about kinds of thing', 'a statistical result', 'a translation issue'], 'a logical mistake about kinds of thing', 'Philosophical usage of category mistake.'),
      mcq('c2-5', 'The writer implies that political discourse:', ['is too philosophical', 'focuses on measurable outputs', 'rejects efficiency', 'values wisdom above all'], 'focuses on measurable outputs', 'Final clause.'),
      mcq('c2-6', '"Impeccably" means:', ['flawlessly', 'poorly', 'rarely', 'partially'], 'flawlessly', 'Impeccable = without fault.'),
    ],
  },
}

const ieltsListening = {
  script: 'Good morning. Welcome to the city library orientation. The library opens at nine on weekdays and closes at eight in the evening. On Saturdays it closes at five. You can borrow up to six books for three weeks. The study rooms on the second floor must be booked in advance at the front desk. Free printing is available for students with a valid card. Please note that food is not permitted in the reading area. If you need help, ask at the information desk near the entrance.',
  questions: [
    mcq('il-1', 'What time does the library open on weekdays?', ['8 am', '9 am', '10 am', '7 am'], '9 am', '"opens at nine on weekdays"'),
    mcq('il-2', 'When does it close on Saturdays?', ['5 pm', '8 pm', '6 pm', '9 pm'], '5 pm', '"On Saturdays it closes at five."'),
    mcq('il-3', 'How many books can you borrow?', ['Three', 'Four', 'Six', 'Ten'], 'Six', '"up to six books"'),
    mcq('il-4', 'Where are the study rooms?', ['First floor', 'Second floor', 'Basement', 'Third floor'], 'Second floor', '"study rooms on the second floor"'),
    mcq('il-5', 'What do you need for free printing?', ['A laptop', 'A valid card', 'Cash', 'A booking'], 'A valid card', '"with a valid card"'),
    mcq('il-6', 'What is not allowed in the reading area?', ['Silence', 'Food', 'Books', 'Printing'], 'Food', '"food is not permitted"'),
  ],
}

const ieltsReading = {
  passage: 'Passenger pigeons were once the most abundant birds in North America, travelling in flocks so vast they darkened the sky for hours. Their numbers collapsed during the nineteenth century as commercial hunting and habitat loss intensified. The last known individual died in 1914 in Cincinnati. The species is now cited in conservation biology as a cautionary example of how quickly an apparently inexhaustible population can vanish.',
  questions: [
    mcq('ir-1', 'What does the passage say about the flocks?', ['They were small', 'They were enormous', 'They migrated at night only', 'They lived in Europe'], 'They were enormous', '"flocks so vast they darkened the sky"'),
    mcq('ir-2', 'What caused the collapse?', ['Disease alone', 'Hunting and habitat loss', 'Climate change only', 'Natural predators'], 'Hunting and habitat loss', 'Second sentence.'),
    mcq('ir-3', 'When did the last known bird die?', ['1814', '1890', '1914', '1940'], '1914', 'Third sentence.'),
    mcq('ir-4', '"Abundant" means:', ['very plentiful', 'rare', 'endangered', 'migratory'], 'very plentiful', 'Abundant = existing in large quantities.'),
    mcq('ir-5', 'Why is the species cited today?', ['As a model of recovery', 'As a warning example', 'As a food source', 'As a migration study'], 'As a warning example', '"a cautionary example"'),
    mcq('ir-6', 'The writer’s attitude is best described as:', ['celebratory', 'neutral and factual', 'angry', 'humorous'], 'neutral and factual', 'The passage reports facts without emotional language.'),
  ],
}

const toeflReading = {
  passage: 'In ecology, a niche describes the role and position a species has in its environment: what it eats, where it lives and how it interacts with other organisms. The competitive exclusion principle states that two species cannot occupy exactly the same niche indefinitely. If resources are limited, one species will outcompete the other, or the species will adapt to use different resources. This principle helps explain the remarkable diversity of adaptations observed in shared habitats.',
  questions: [
    mcq('tr-1', 'What is a niche?', ['A physical location only', 'A species’ role and position', 'A type of climate', 'A predator'], 'A species’ role and position', 'First sentence defines the term.'),
    mcq('tr-2', 'What does the competitive exclusion principle claim?', ['Species never compete', 'Identical niches cannot persist indefinitely', 'Resources are unlimited', 'Diversity is impossible'], 'Identical niches cannot persist indefinitely', 'Second sentence.'),
    mcq('tr-3', 'What may happen when resources are limited?', ['Both species disappear', 'One outcompetes the other or they adapt', 'Nothing changes', 'They merge'], 'One outcompetes the other or they adapt', 'Third sentence.'),
    mcq('tr-4', '"Indefinitely" means:', ['permanently', 'for a short time', 'rarely', 'quickly'], 'permanently', 'Indefinite = without a fixed end.'),
    mcq('tr-5', 'The passage mainly explains:', ['How to classify climates', 'Why species develop different roles', 'How to measure populations', 'Where to find fossils'], 'Why species develop different roles', 'The final sentence links niche differentiation to diversity.'),
    mcq('tr-6', 'The word "remarkable" is closest to:', ['ordinary', 'extraordinary', 'small', 'hidden'], 'extraordinary', 'Remarkable = surprisingly impressive.'),
  ],
}

const toeflListening = {
  script: 'Professor: Today we will discuss pollination. Many people assume that only insects pollinate plants, but wind and birds also play important roles. Wind-pollinated plants usually produce small, lightweight pollen in large quantities because the chance of any single grain reaching a flower is low. In contrast, bird-pollinated flowers are often bright red and produce abundant nectar, since birds are attracted by colour and need a rich energy source. Let us compare these strategies with insect pollination, where scent and shape are especially important.',
  questions: [
    mcq('tl-1', 'What is the main topic?', ['Plant diseases', 'Pollination strategies', 'Bird migration', 'Insect classification'], 'Pollination strategies', 'First sentence of the lecture.'),
    mcq('tl-2', 'Why do wind-pollinated plants produce lots of pollen?', ['Birds eat it', 'The chance per grain is low', 'It is colourful', 'It needs nectar'], 'The chance per grain is low', 'Explicitly stated.'),
    mcq('tl-3', 'What colour are many bird-pollinated flowers?', ['Blue', 'White', 'Bright red', 'Green'], 'Bright red', '"often bright red"'),
    mcq('tl-4', 'What attracts birds according to the lecture?', ['Scent only', 'Colour and nectar', 'Wind', 'Shape only'], 'Colour and nectar', '"attracted by colour and need a rich energy source"'),
    mcq('tl-5', 'Which factor matters especially for insect pollination?', ['Loud sound', 'Scent and shape', 'Large size', 'Cold weather'], 'Scent and shape', 'Final sentence.'),
    mcq('tl-6', 'What assumption does the professor challenge?', ['That plants need sunlight', 'That only insects pollinate', 'That birds are rare', 'That wind is strong'], 'That only insects pollinate', '"Many people assume that only insects pollinate..."'),
  ],
}

const grammarTest = {
  questions: [
    mcq('g-1', 'Choose the correct option: If I ___ more time, I would travel.', ['have', 'had', 'will have', 'would have'], 'had', 'Second conditional uses past simple in the if-clause.'),
    mcq('g-2', 'Choose the correct option: She has worked here ___ 2021.', ['for', 'since', 'from', 'in'], 'since', 'Since marks the starting point.'),
    mcq('g-3', 'Choose the correct option: The report ___ by the team last week.', ['wrote', 'was written', 'is writing', 'has wrote'], 'was written', 'Past passive: was + past participle.'),
    mcq('g-4', 'Choose the correct option: Despite ___ hard, they failed.', ['to try', 'trying', 'tried', 'they try'], 'trying', 'Despite is followed by a noun or -ing form.'),
    mcq('g-5', 'Choose the word with the closest meaning to "significant":', ['minor', 'major', 'sudden', 'quiet'], 'major', 'Significant = important or substantial.'),
    mcq('g-6', 'Choose the correct collocation: make a ___', ['decision', 'advice', 'information', 'homework'], 'decision', 'We make a decision; we do homework.'),
  ],
}

const academicVocab = {
  passage: 'The study examined whether structured feedback influences retention. Participants who received explanatory comments recalled significantly more than those who received only scores. The findings suggest that the quality of feedback matters more than its quantity.',
  questions: [
    mcq('v-1', '"Retention" means:', ['the act of keeping information', 'a quick guess', 'a written test', 'a group of people'], 'the act of keeping information', 'Retention = keeping what was learned.'),
    mcq('v-2', '"Significantly" in an academic text means:', ['statistically or meaningfully', 'loudly', 'rarely', 'accidentally'], 'statistically or meaningfully', 'Academic use of significantly.'),
    mcq('v-3', '"Findings" refers to:', ['the results of research', 'the introduction', 'the participants', 'the questions'], 'the results of research', 'Findings = research results.'),
    mcq('v-4', '"Influences" is closest to:', ['affects', 'ignores', 'copies', 'measures'], 'affects', 'Influence = have an effect on.'),
    mcq('v-5', '"Structured" suggests:', ['organised', 'random', 'hidden', 'brief'], 'organised', 'Structured = arranged in a clear system.'),
    mcq('v-6', '"Quality" here refers to:', ['how good something is', 'how many there are', 'when it happened', 'who made it'], 'how good something is', 'Quality contrasts with quantity.'),
  ],
}

export const EXAM_TESTS = {
  cefr: Object.fromEntries(Object.entries(cefrPassages).map(([level, data]) => [
    level,
    { id: `cefr-${level}`, title: `${level.toUpperCase()} Level Check`, kind: 'reading', passage: data.passage, questions: data.questions, timeLimit: 15 },
  ])),
  ielts: {
    'ielts-listening': { id: 'ielts-listening', title: 'IELTS Listening Practice', kind: 'listening', script: ieltsListening.script, questions: ieltsListening.questions, timeLimit: 12 },
    'ielts-reading': { id: 'ielts-reading', title: 'IELTS Reading Practice', kind: 'reading', passage: ieltsReading.passage, questions: ieltsReading.questions, timeLimit: 20 },
    'ielts-writing-1': { id: 'ielts-writing-1', title: 'IELTS Writing Task 1', kind: 'writing', prompt: 'The chart below shows changes in public transport use in a city between 2015 and 2025. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.', criteria: ['Task achievement', 'Coherence and cohesion', 'Lexical resource', 'Grammatical range and accuracy'], minWords: 150, timeLimit: 20 },
    'ielts-writing-2': { id: 'ielts-writing-2', title: 'IELTS Writing Task 2', kind: 'writing', prompt: 'Some people believe that online learning will replace traditional classrooms. Others think that face-to-face education remains essential. Discuss both views and give your own opinion. Write at least 250 words.', criteria: ['Task response', 'Coherence and cohesion', 'Lexical resource', 'Grammatical range and accuracy'], minWords: 250, timeLimit: 30 },
    'ielts-speaking-1': { id: 'ielts-speaking-1', title: 'IELTS Speaking Part 1', kind: 'speaking', prompts: ['Tell me about your hometown.', 'What do you usually do in your free time?', 'Do you prefer mornings or evenings? Why?'], timeLimit: 5 },
    'ielts-speaking-2': { id: 'ielts-speaking-2', title: 'IELTS Speaking Part 2', kind: 'speaking', prompts: ['Describe a book that you enjoyed reading. You should say: what the book was, when you read it, why you chose it, and explain how it affected you.'], timeLimit: 5 },
    'ielts-speaking-3': { id: 'ielts-speaking-3', title: 'IELTS Speaking Part 3', kind: 'speaking', prompts: ['How does technology change the way children learn?', 'Do you think reading is still important in the digital age?', 'What can governments do to encourage lifelong learning?'], timeLimit: 8 },
    'ielts-grammar': { id: 'ielts-grammar', title: 'IELTS Grammar & Vocabulary', kind: 'reading', passage: '', questions: grammarTest.questions, timeLimit: 10 },
  },
  toefl: {
    'toefl-reading': { id: 'toefl-reading', title: 'TOEFL Reading Practice', kind: 'reading', passage: toeflReading.passage, questions: toeflReading.questions, timeLimit: 18 },
    'toefl-listening': { id: 'toefl-listening', title: 'TOEFL Listening Practice', kind: 'listening', script: toeflListening.script, questions: toeflListening.questions, timeLimit: 12 },
    'toefl-speaking': { id: 'toefl-speaking', title: 'TOEFL Speaking Practice', kind: 'speaking', prompts: ['Describe a person who has influenced you and explain why.', 'Some students prefer studying alone; others prefer groups. Which do you prefer and why?'], timeLimit: 8 },
    'toefl-writing': { id: 'toefl-writing', title: 'TOEFL Writing Practice', kind: 'writing', prompt: 'Do you agree or disagree with the following statement? Students learn more effectively when they have frequent short tests rather than one final exam. Use specific reasons and examples to support your answer. Write at least 250 words.', criteria: ['Development of ideas', 'Organisation', 'Language use', 'Mechanics'], minWords: 250, timeLimit: 30 },
    'toefl-vocabulary': { id: 'toefl-vocabulary', title: 'TOEFL Academic Vocabulary', kind: 'reading', passage: academicVocab.passage, questions: academicVocab.questions, timeLimit: 10 },
  },
}

export const WRITING_RUBRIC = [
  { criterion: 'Task achievement', max: 9, description: 'All parts of the task are addressed and the response is relevant.' },
  { criterion: 'Coherence and cohesion', max: 9, description: 'Ideas are arranged logically with clear linking and paragraphing.' },
  { criterion: 'Lexical resource', max: 9, description: 'A wide range of vocabulary is used accurately and appropriately.' },
  { criterion: 'Grammar range and accuracy', max: 9, description: 'A variety of structures is used with good control.' },
]

export const PLACEMENT_QUESTIONS = [
  mcq('p-1', 'I ___ from Uzbekistan.', ['am', 'is', 'are', 'be'], 'am', 'Basic be form.', 1),
  mcq('p-2', 'She ___ to school every day.', ['go', 'goes', 'going', 'gone'], 'goes', 'Third person -s.', 1),
  mcq('p-3', 'They ___ football now.', ['play', 'plays', 'are playing', 'played'], 'are playing', 'Present continuous.', 2),
  mcq('p-4', 'I have lived here ___ five years.', ['since', 'for', 'from', 'during'], 'for', 'For + period.', 2),
  mcq('p-5', 'If I ___ rich, I would travel.', ['am', 'was', 'were', 'will be'], 'were', 'Second conditional.', 3),
  mcq('p-6', 'The book ___ by a famous author.', ['wrote', 'was written', 'is wrote', 'has write'], 'was written', 'Passive voice.', 3),
  mcq('p-7', 'Hardly ___ home when it started to rain.', ['I had reached', 'had I reached', 'I reached', 'did I reach'], 'had I reached', 'Inversion.', 4),
  mcq('p-8', 'It is essential that he ___ on time.', ['is', 'be', 'was', 'will be'], 'be', 'Subjunctive.', 4),
]

export function scorePlacement(answers) {
  let band = 0
  let count = 0
  PLACEMENT_QUESTIONS.forEach((question, i) => {
    if (answers[question.id] === question.answer) { band += question[5] || 1; count++ }
  })
  const ratio = count / PLACEMENT_QUESTIONS.length
  const level = ratio < 0.3 ? 'starter' : ratio < 0.5 ? 'a1' : ratio < 0.65 ? 'a2' : ratio < 0.8 ? 'b1' : ratio < 0.92 ? 'b2' : 'c1'
  return { level, correct: count, total: PLACEMENT_QUESTIONS.length, band, percent: Math.round(ratio * 100) }
}
