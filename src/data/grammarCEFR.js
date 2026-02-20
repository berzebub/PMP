/**
 * CEFR Grammar Question Bank
 *
 * ~150+ questions per CEFR level (A1-C2).
 * Mixed types: 'fill' (fill-in-the-blank) and 'sentence' (choose correct sentence).
 * Vocabulary drawn from vocabCEFR.js word bank.
 *
 * Each entry:
 * {
 *   type: 'fill' | 'sentence',
 *   sentence: string,          // the prompt (with ___ for fill type)
 *   correctAnswer: string,
 *   choices: string[],         // 4 options
 *   grammarPoint: string,
 *   relatedVocab: string[]     // vocab words used
 * }
 */

// ═══════════════════════════════════════════════════════════
//  A1 — Beginner
// ═══════════════════════════════════════════════════════════
export const A1 = [
  // ── to be ──
  { type: 'fill', sentence: 'She ___ a teacher.', correctAnswer: 'is', choices: ['is', 'am', 'are', 'be'], grammarPoint: 'to be', relatedVocab: ['teacher'] },
  { type: 'fill', sentence: 'I ___ happy today.', correctAnswer: 'am', choices: ['am', 'is', 'are', 'be'], grammarPoint: 'to be', relatedVocab: ['happy'] },
  { type: 'fill', sentence: 'They ___ my friends.', correctAnswer: 'are', choices: ['are', 'is', 'am', 'be'], grammarPoint: 'to be', relatedVocab: ['friend'] },
  { type: 'fill', sentence: 'He ___ a doctor.', correctAnswer: 'is', choices: ['is', 'am', 'are', 'be'], grammarPoint: 'to be', relatedVocab: ['doctor'] },
  { type: 'fill', sentence: 'We ___ students.', correctAnswer: 'are', choices: ['are', 'is', 'am', 'be'], grammarPoint: 'to be', relatedVocab: ['student'] },
  { type: 'fill', sentence: 'The cat ___ on the table.', correctAnswer: 'is', choices: ['is', 'am', 'are', 'be'], grammarPoint: 'to be', relatedVocab: ['cat', 'table'] },
  { type: 'fill', sentence: 'You ___ very kind.', correctAnswer: 'are', choices: ['are', 'is', 'am', 'be'], grammarPoint: 'to be', relatedVocab: ['kind'] },
  { type: 'fill', sentence: 'It ___ cold outside.', correctAnswer: 'is', choices: ['is', 'am', 'are', 'be'], grammarPoint: 'to be', relatedVocab: ['cold'] },
  { type: 'fill', sentence: 'My mother ___ a nurse.', correctAnswer: 'is', choices: ['is', 'am', 'are', 'be'], grammarPoint: 'to be', relatedVocab: ['mother', 'nurse'] },
  { type: 'fill', sentence: 'The children ___ in the garden.', correctAnswer: 'are', choices: ['are', 'is', 'am', 'be'], grammarPoint: 'to be', relatedVocab: ['child', 'garden'] },
  { type: 'sentence', sentence: 'Which sentence is correct?', correctAnswer: 'She is a student.', choices: ['She is a student.', 'She am a student.', 'She are a student.', 'She be a student.'], grammarPoint: 'to be', relatedVocab: ['student'] },
  { type: 'sentence', sentence: 'Which sentence is correct?', correctAnswer: 'I am from Thailand.', choices: ['I am from Thailand.', 'I is from Thailand.', 'I are from Thailand.', 'I be from Thailand.'], grammarPoint: 'to be', relatedVocab: ['Thailand'] },

  // ── articles ──
  { type: 'fill', sentence: 'This is ___ apple.', correctAnswer: 'an', choices: ['an', 'a', 'the', '---'], grammarPoint: 'articles', relatedVocab: ['apple'] },
  { type: 'fill', sentence: 'She has ___ cat.', correctAnswer: 'a', choices: ['a', 'an', 'the', '---'], grammarPoint: 'articles', relatedVocab: ['cat'] },
  { type: 'fill', sentence: 'I want ___ orange.', correctAnswer: 'an', choices: ['an', 'a', 'the', '---'], grammarPoint: 'articles', relatedVocab: ['orange'] },
  { type: 'fill', sentence: 'He is ___ engineer.', correctAnswer: 'an', choices: ['an', 'a', 'the', '---'], grammarPoint: 'articles', relatedVocab: ['engineer'] },
  { type: 'fill', sentence: 'There is ___ book on the desk.', correctAnswer: 'a', choices: ['a', 'an', 'the', '---'], grammarPoint: 'articles', relatedVocab: ['book', 'desk'] },
  { type: 'fill', sentence: '___ sun is very hot.', correctAnswer: 'The', choices: ['The', 'A', 'An', '---'], grammarPoint: 'articles', relatedVocab: ['sun', 'hot'] },
  { type: 'fill', sentence: 'I have ___ umbrella.', correctAnswer: 'an', choices: ['an', 'a', 'the', '---'], grammarPoint: 'articles', relatedVocab: ['umbrella'] },
  { type: 'fill', sentence: 'She is ___ good student.', correctAnswer: 'a', choices: ['a', 'an', 'the', '---'], grammarPoint: 'articles', relatedVocab: ['student'] },
  { type: 'sentence', sentence: 'Which sentence is correct?', correctAnswer: 'I have a dog.', choices: ['I have a dog.', 'I have an dog.', 'I have dog.', 'I have the dog.'], grammarPoint: 'articles', relatedVocab: ['dog'] },

  // ── pronouns ──
  { type: 'fill', sentence: '___ is my brother.', correctAnswer: 'He', choices: ['He', 'She', 'It', 'They'], grammarPoint: 'pronouns', relatedVocab: ['brother'] },
  { type: 'fill', sentence: '___ is a beautiful flower.', correctAnswer: 'It', choices: ['It', 'He', 'She', 'They'], grammarPoint: 'pronouns', relatedVocab: ['flower'] },
  { type: 'fill', sentence: '___ are going to school.', correctAnswer: 'They', choices: ['They', 'He', 'She', 'It'], grammarPoint: 'pronouns', relatedVocab: ['school'] },
  { type: 'fill', sentence: 'I gave ___ the book.', correctAnswer: 'her', choices: ['her', 'she', 'hers', 'herself'], grammarPoint: 'pronouns', relatedVocab: ['book'] },
  { type: 'fill', sentence: 'Can you help ___?', correctAnswer: 'me', choices: ['me', 'I', 'my', 'mine'], grammarPoint: 'pronouns', relatedVocab: ['help'] },
  { type: 'fill', sentence: 'That house is ___.', correctAnswer: 'ours', choices: ['ours', 'our', 'we', 'us'], grammarPoint: 'pronouns', relatedVocab: ['house'] },
  { type: 'fill', sentence: '___ name is Tom.', correctAnswer: 'His', choices: ['His', 'He', 'Him', 'Her'], grammarPoint: 'possessive adjectives', relatedVocab: ['name'] },
  { type: 'fill', sentence: 'Is this ___ pen?', correctAnswer: 'your', choices: ['your', 'you', 'yours', 'yourself'], grammarPoint: 'possessive adjectives', relatedVocab: ['pen'] },

  // ── present simple ──
  { type: 'fill', sentence: 'She ___ to school every day.', correctAnswer: 'goes', choices: ['goes', 'go', 'going', 'gone'], grammarPoint: 'present simple', relatedVocab: ['school'] },
  { type: 'fill', sentence: 'I ___ breakfast at 7 o\'clock.', correctAnswer: 'eat', choices: ['eat', 'eats', 'eating', 'ate'], grammarPoint: 'present simple', relatedVocab: ['breakfast'] },
  { type: 'fill', sentence: 'He ___ English very well.', correctAnswer: 'speaks', choices: ['speaks', 'speak', 'speaking', 'spoke'], grammarPoint: 'present simple', relatedVocab: ['English'] },
  { type: 'fill', sentence: 'The shop ___ at 9 AM.', correctAnswer: 'opens', choices: ['opens', 'open', 'opening', 'opened'], grammarPoint: 'present simple', relatedVocab: ['shop'] },
  { type: 'fill', sentence: 'They ___ football on Sundays.', correctAnswer: 'play', choices: ['play', 'plays', 'playing', 'played'], grammarPoint: 'present simple', relatedVocab: ['football'] },
  { type: 'fill', sentence: 'My father ___ coffee every morning.', correctAnswer: 'drinks', choices: ['drinks', 'drink', 'drinking', 'drank'], grammarPoint: 'present simple', relatedVocab: ['father', 'coffee'] },
  { type: 'fill', sentence: 'She ___ not like fish.', correctAnswer: 'does', choices: ['does', 'do', 'is', 'has'], grammarPoint: 'present simple negative', relatedVocab: ['fish'] },
  { type: 'fill', sentence: '___ you like music?', correctAnswer: 'Do', choices: ['Do', 'Does', 'Are', 'Is'], grammarPoint: 'present simple question', relatedVocab: ['music'] },
  { type: 'fill', sentence: '___ she have a car?', correctAnswer: 'Does', choices: ['Does', 'Do', 'Is', 'Has'], grammarPoint: 'present simple question', relatedVocab: ['car'] },
  { type: 'fill', sentence: 'Water ___ at 100 degrees.', correctAnswer: 'boils', choices: ['boils', 'boil', 'boiling', 'boiled'], grammarPoint: 'present simple', relatedVocab: ['water'] },
  { type: 'sentence', sentence: 'Which sentence is correct?', correctAnswer: 'He likes rice.', choices: ['He likes rice.', 'He like rice.', 'He liking rice.', 'He liked rice.'], grammarPoint: 'present simple', relatedVocab: ['rice'] },

  // ── there is / there are ──
  { type: 'fill', sentence: 'There ___ a book on the table.', correctAnswer: 'is', choices: ['is', 'are', 'am', 'be'], grammarPoint: 'there is/are', relatedVocab: ['book', 'table'] },
  { type: 'fill', sentence: 'There ___ three cats in the garden.', correctAnswer: 'are', choices: ['are', 'is', 'am', 'be'], grammarPoint: 'there is/are', relatedVocab: ['cat', 'garden'] },
  { type: 'fill', sentence: 'There ___ some milk in the fridge.', correctAnswer: 'is', choices: ['is', 'are', 'am', 'be'], grammarPoint: 'there is/are', relatedVocab: ['milk'] },
  { type: 'fill', sentence: 'There ___ many people in the park.', correctAnswer: 'are', choices: ['are', 'is', 'am', 'be'], grammarPoint: 'there is/are', relatedVocab: ['people', 'park'] },
  { type: 'sentence', sentence: 'Which sentence is correct?', correctAnswer: 'There are two dogs here.', choices: ['There are two dogs here.', 'There is two dogs here.', 'There am two dogs here.', 'There be two dogs here.'], grammarPoint: 'there is/are', relatedVocab: ['dog'] },

  // ── prepositions ──
  { type: 'fill', sentence: 'The keys are ___ the table.', correctAnswer: 'on', choices: ['on', 'in', 'at', 'under'], grammarPoint: 'prepositions of place', relatedVocab: ['table'] },
  { type: 'fill', sentence: 'She lives ___ Bangkok.', correctAnswer: 'in', choices: ['in', 'on', 'at', 'to'], grammarPoint: 'prepositions of place', relatedVocab: ['Bangkok'] },
  { type: 'fill', sentence: 'I am waiting ___ the bus stop.', correctAnswer: 'at', choices: ['at', 'in', 'on', 'to'], grammarPoint: 'prepositions of place', relatedVocab: ['bus'] },
  { type: 'fill', sentence: 'The cat is ___ the box.', correctAnswer: 'in', choices: ['in', 'on', 'at', 'under'], grammarPoint: 'prepositions of place', relatedVocab: ['cat', 'box'] },
  { type: 'fill', sentence: 'My birthday is ___ March.', correctAnswer: 'in', choices: ['in', 'on', 'at', 'to'], grammarPoint: 'prepositions of time', relatedVocab: ['birthday'] },
  { type: 'fill', sentence: 'I wake up ___ 6 o\'clock.', correctAnswer: 'at', choices: ['at', 'in', 'on', 'to'], grammarPoint: 'prepositions of time', relatedVocab: ['morning'] },
  { type: 'fill', sentence: 'We have a meeting ___ Monday.', correctAnswer: 'on', choices: ['on', 'in', 'at', 'to'], grammarPoint: 'prepositions of time', relatedVocab: ['meeting'] },
  { type: 'fill', sentence: 'The picture is ___ the wall.', correctAnswer: 'on', choices: ['on', 'in', 'at', 'under'], grammarPoint: 'prepositions of place', relatedVocab: ['picture'] },

  // ── singular / plural ──
  { type: 'fill', sentence: 'There are three ___ on the table.', correctAnswer: 'books', choices: ['books', 'book', 'bookes', 'bookies'], grammarPoint: 'plural nouns', relatedVocab: ['book', 'table'] },
  { type: 'fill', sentence: 'I see two ___ in the park.', correctAnswer: 'children', choices: ['children', 'childs', 'childrens', 'child'], grammarPoint: 'irregular plural', relatedVocab: ['child', 'park'] },
  { type: 'fill', sentence: 'She has five ___.', correctAnswer: 'teeth', choices: ['teeth', 'tooths', 'teeths', 'tooth'], grammarPoint: 'irregular plural', relatedVocab: ['tooth'] },
  { type: 'fill', sentence: 'There are many ___ in the lake.', correctAnswer: 'fish', choices: ['fish', 'fishes', 'fishs', 'fishies'], grammarPoint: 'irregular plural', relatedVocab: ['fish'] },
  { type: 'sentence', sentence: 'Which sentence is correct?', correctAnswer: 'I have two brothers.', choices: ['I have two brothers.', 'I have two brother.', 'I have two brotheres.', 'I has two brothers.'], grammarPoint: 'plural nouns', relatedVocab: ['brother'] },

  // ── possessives ──
  { type: 'fill', sentence: 'This is my ___\'s bag.', correctAnswer: 'sister', choices: ['sister', 'sisters', 'sister\'s', 'sisters\''], grammarPoint: 'possessive \'s', relatedVocab: ['sister', 'bag'] },
  { type: 'fill', sentence: 'The ___ toys are on the floor.', correctAnswer: 'children\'s', choices: ['children\'s', 'childrens', 'children', 'childs'], grammarPoint: 'possessive \'s', relatedVocab: ['child', 'toy'] },

  // ── can / can't ──
  { type: 'fill', sentence: 'I ___ swim very well.', correctAnswer: 'can', choices: ['can', 'cans', 'am can', 'do can'], grammarPoint: 'can / ability', relatedVocab: ['swim'] },
  { type: 'fill', sentence: 'She ___ speak three languages.', correctAnswer: 'can', choices: ['can', 'cans', 'is can', 'does can'], grammarPoint: 'can / ability', relatedVocab: ['speak'] },
  { type: 'fill', sentence: 'He ___ drive a car. He is too young.', correctAnswer: 'can\'t', choices: ['can\'t', 'can', 'don\'t', 'doesn\'t'], grammarPoint: 'can\'t / inability', relatedVocab: ['car'] },

  // ── imperatives ──
  { type: 'fill', sentence: '___ the door, please.', correctAnswer: 'Open', choices: ['Open', 'Opens', 'Opening', 'Opened'], grammarPoint: 'imperatives', relatedVocab: ['door'] },
  { type: 'fill', sentence: '___ sit on the chair.', correctAnswer: 'Please', choices: ['Please', 'Pleased', 'Pleasing', 'Pleasure'], grammarPoint: 'polite imperatives', relatedVocab: ['chair'] },

  // ── like / want / need ──
  { type: 'fill', sentence: 'I ___ to eat pizza.', correctAnswer: 'want', choices: ['want', 'wants', 'wanting', 'wanted'], grammarPoint: 'want + infinitive', relatedVocab: ['pizza'] },
  { type: 'fill', sentence: 'She ___ reading books.', correctAnswer: 'likes', choices: ['likes', 'like', 'liking', 'liked'], grammarPoint: 'like + gerund', relatedVocab: ['book'] },
  { type: 'fill', sentence: 'We ___ some water.', correctAnswer: 'need', choices: ['need', 'needs', 'needing', 'needed'], grammarPoint: 'need', relatedVocab: ['water'] },

  // ── have / has ──
  { type: 'fill', sentence: 'She ___ a big house.', correctAnswer: 'has', choices: ['has', 'have', 'having', 'had'], grammarPoint: 'have/has', relatedVocab: ['house'] },
  { type: 'fill', sentence: 'We ___ two dogs.', correctAnswer: 'have', choices: ['have', 'has', 'having', 'had'], grammarPoint: 'have/has', relatedVocab: ['dog'] },
  { type: 'fill', sentence: 'He ___ a red car.', correctAnswer: 'has', choices: ['has', 'have', 'having', 'had'], grammarPoint: 'have/has', relatedVocab: ['car', 'red'] },

  // ── this / that / these / those ──
  { type: 'fill', sentence: '___ is my pen. (near)', correctAnswer: 'This', choices: ['This', 'That', 'These', 'Those'], grammarPoint: 'demonstratives', relatedVocab: ['pen'] },
  { type: 'fill', sentence: '___ are my shoes. (near)', correctAnswer: 'These', choices: ['These', 'Those', 'This', 'That'], grammarPoint: 'demonstratives', relatedVocab: ['shoes'] },
  { type: 'fill', sentence: '___ house over there is beautiful.', correctAnswer: 'That', choices: ['That', 'This', 'These', 'Those'], grammarPoint: 'demonstratives', relatedVocab: ['house'] },

  // ── question words ──
  { type: 'fill', sentence: '___ is your name?', correctAnswer: 'What', choices: ['What', 'Who', 'Where', 'When'], grammarPoint: 'question words', relatedVocab: ['name'] },
  { type: 'fill', sentence: '___ do you live?', correctAnswer: 'Where', choices: ['Where', 'What', 'Who', 'When'], grammarPoint: 'question words', relatedVocab: ['live'] },
  { type: 'fill', sentence: '___ is your birthday?', correctAnswer: 'When', choices: ['When', 'What', 'Who', 'Where'], grammarPoint: 'question words', relatedVocab: ['birthday'] },
  { type: 'fill', sentence: '___ old are you?', correctAnswer: 'How', choices: ['How', 'What', 'Who', 'Where'], grammarPoint: 'question words', relatedVocab: ['old'] },

  // ── negative ──
  { type: 'fill', sentence: 'I ___ not understand.', correctAnswer: 'do', choices: ['do', 'does', 'am', 'is'], grammarPoint: 'negative sentences', relatedVocab: ['understand'] },
  { type: 'fill', sentence: 'She ___ not like spicy food.', correctAnswer: 'does', choices: ['does', 'do', 'is', 'are'], grammarPoint: 'negative sentences', relatedVocab: ['food'] },

  // ── more mixed ──
  { type: 'sentence', sentence: 'Which sentence is correct?', correctAnswer: 'My sister has long hair.', choices: ['My sister has long hair.', 'My sister have long hair.', 'My sister haves long hair.', 'My sister is have long hair.'], grammarPoint: 'have/has', relatedVocab: ['sister', 'hair'] },
  { type: 'sentence', sentence: 'Which sentence is correct?', correctAnswer: 'There is a cat under the bed.', choices: ['There is a cat under the bed.', 'There are a cat under the bed.', 'There a cat under the bed.', 'There is cat under the bed.'], grammarPoint: 'there is/are', relatedVocab: ['cat', 'bed'] },
  { type: 'sentence', sentence: 'Which sentence is correct?', correctAnswer: 'Do you speak English?', choices: ['Do you speak English?', 'Does you speak English?', 'Are you speak English?', 'Is you speak English?'], grammarPoint: 'present simple question', relatedVocab: ['English'] },
  { type: 'fill', sentence: 'My grandmother ___ very old.', correctAnswer: 'is', choices: ['is', 'are', 'am', 'be'], grammarPoint: 'to be', relatedVocab: ['grandmother'] },
  { type: 'fill', sentence: 'The baby ___ sleeping now.', correctAnswer: 'is', choices: ['is', 'are', 'am', 'be'], grammarPoint: 'to be', relatedVocab: ['baby'] },
  { type: 'fill', sentence: 'I ___ a student at this school.', correctAnswer: 'am', choices: ['am', 'is', 'are', 'be'], grammarPoint: 'to be', relatedVocab: ['student', 'school'] },
  { type: 'fill', sentence: 'My grandfather ___ in the garden.', correctAnswer: 'is', choices: ['is', 'am', 'are', 'be'], grammarPoint: 'to be', relatedVocab: ['grandfather', 'garden'] },
  { type: 'fill', sentence: 'I ___ hungry. Let\'s eat.', correctAnswer: 'am', choices: ['am', 'is', 'are', 'be'], grammarPoint: 'to be', relatedVocab: ['hungry', 'eat'] },
  { type: 'fill', sentence: '___ is the man at the door?', correctAnswer: 'Who', choices: ['Who', 'What', 'Where', 'When'], grammarPoint: 'question words', relatedVocab: ['man', 'door'] },
  { type: 'fill', sentence: 'The birds ___ in the tree.', correctAnswer: 'are', choices: ['are', 'is', 'am', 'be'], grammarPoint: 'to be', relatedVocab: ['bird', 'tree'] },
  { type: 'fill', sentence: 'My aunt ___ a doctor.', correctAnswer: 'is', choices: ['is', 'am', 'are', 'be'], grammarPoint: 'to be', relatedVocab: ['aunt', 'doctor'] },
  { type: 'fill', sentence: 'I always ___ my teeth before bed.', correctAnswer: 'brush', choices: ['brush', 'brushes', 'brushing', 'brushed'], grammarPoint: 'present simple', relatedVocab: ['teeth', 'bed'] },
  { type: 'fill', sentence: 'He ___ TV every evening.', correctAnswer: 'watches', choices: ['watches', 'watch', 'watching', 'watched'], grammarPoint: 'present simple', relatedVocab: ['TV'] },
  { type: 'fill', sentence: 'My uncle ___ in a hospital.', correctAnswer: 'works', choices: ['works', 'work', 'working', 'worked'], grammarPoint: 'present simple', relatedVocab: ['uncle', 'hospital'] },
  { type: 'fill', sentence: 'The train ___ at 8 AM.', correctAnswer: 'leaves', choices: ['leaves', 'leave', 'leaving', 'left'], grammarPoint: 'present simple', relatedVocab: ['train'] },
  { type: 'fill', sentence: 'We ___ dinner at 7 PM.', correctAnswer: 'have', choices: ['have', 'has', 'having', 'had'], grammarPoint: 'present simple', relatedVocab: ['dinner'] },
  { type: 'fill', sentence: 'The dog ___ fast.', correctAnswer: 'runs', choices: ['runs', 'run', 'running', 'ran'], grammarPoint: 'present simple', relatedVocab: ['dog'] },
  { type: 'fill', sentence: 'My cousin ___ near the school.', correctAnswer: 'lives', choices: ['lives', 'live', 'living', 'lived'], grammarPoint: 'present simple', relatedVocab: ['cousin', 'school'] },
  { type: 'sentence', sentence: 'Which sentence is correct?', correctAnswer: 'Can I have some water, please?', choices: ['Can I have some water, please?', 'Can I has some water, please?', 'Can I having some water, please?', 'Can I had some water, please?'], grammarPoint: 'can / request', relatedVocab: ['water'] },
  { type: 'fill', sentence: 'I ___ not have a bicycle.', correctAnswer: 'do', choices: ['do', 'does', 'am', 'is'], grammarPoint: 'negative sentences', relatedVocab: ['bicycle'] },
  { type: 'fill', sentence: 'She ___ not live here.', correctAnswer: 'does', choices: ['does', 'do', 'is', 'are'], grammarPoint: 'negative sentences', relatedVocab: ['live'] },
  { type: 'fill', sentence: 'I eat rice ___ lunch.', correctAnswer: 'for', choices: ['for', 'at', 'in', 'on'], grammarPoint: 'prepositions', relatedVocab: ['rice', 'lunch'] },
  { type: 'fill', sentence: 'The man ___ a hat is my father.', correctAnswer: 'with', choices: ['with', 'in', 'on', 'at'], grammarPoint: 'prepositions', relatedVocab: ['man', 'hat', 'father'] },
  { type: 'fill', sentence: 'I go to school ___ bus.', correctAnswer: 'by', choices: ['by', 'with', 'in', 'on'], grammarPoint: 'prepositions', relatedVocab: ['school', 'bus'] },
  { type: 'sentence', sentence: 'Which sentence is correct?', correctAnswer: 'These are my books.', choices: ['These are my books.', 'This are my books.', 'These is my books.', 'That are my books.'], grammarPoint: 'demonstratives', relatedVocab: ['book'] },
  { type: 'fill', sentence: 'What time ___ it?', correctAnswer: 'is', choices: ['is', 'are', 'am', 'do'], grammarPoint: 'telling time', relatedVocab: ['time'] },
  { type: 'fill', sentence: '___ much is this shirt?', correctAnswer: 'How', choices: ['How', 'What', 'Who', 'Where'], grammarPoint: 'question words', relatedVocab: ['shirt'] },
  { type: 'fill', sentence: '___ many brothers do you have?', correctAnswer: 'How', choices: ['How', 'What', 'Who', 'Where'], grammarPoint: 'question words', relatedVocab: ['brother'] },
]

// ═══════════════════════════════════════════════════════════
//  A2 — Elementary
// ═══════════════════════════════════════════════════════════
export const A2 = [
  // ── past simple — regular ──
  { type: 'fill', sentence: 'I ___ the movie last night.', correctAnswer: 'watched', choices: ['watched', 'watch', 'watches', 'watching'], grammarPoint: 'past simple — regular', relatedVocab: ['movie'] },
  { type: 'fill', sentence: 'She ___ her homework yesterday.', correctAnswer: 'finished', choices: ['finished', 'finish', 'finishes', 'finishing'], grammarPoint: 'past simple — regular', relatedVocab: ['homework'] },
  { type: 'fill', sentence: 'We ___ football last weekend.', correctAnswer: 'played', choices: ['played', 'play', 'plays', 'playing'], grammarPoint: 'past simple — regular', relatedVocab: ['football'] },
  { type: 'fill', sentence: 'They ___ to the beach last summer.', correctAnswer: 'traveled', choices: ['traveled', 'travel', 'travels', 'traveling'], grammarPoint: 'past simple — regular', relatedVocab: ['beach', 'summer'] },
  { type: 'fill', sentence: 'He ___ the door behind him.', correctAnswer: 'closed', choices: ['closed', 'close', 'closes', 'closing'], grammarPoint: 'past simple — regular', relatedVocab: ['door'] },

  // ── past simple — irregular ──
  { type: 'fill', sentence: 'I ___ to school by bus yesterday.', correctAnswer: 'went', choices: ['went', 'go', 'goes', 'going'], grammarPoint: 'past simple — irregular', relatedVocab: ['school', 'bus'] },
  { type: 'fill', sentence: 'She ___ breakfast at 7 AM.', correctAnswer: 'ate', choices: ['ate', 'eat', 'eats', 'eating'], grammarPoint: 'past simple — irregular', relatedVocab: ['breakfast'] },
  { type: 'fill', sentence: 'He ___ the newspaper this morning.', correctAnswer: 'read', choices: ['read', 'reads', 'reading', 'readed'], grammarPoint: 'past simple — irregular', relatedVocab: ['newspaper'] },
  { type: 'fill', sentence: 'They ___ a new car last month.', correctAnswer: 'bought', choices: ['bought', 'buy', 'buys', 'buying'], grammarPoint: 'past simple — irregular', relatedVocab: ['car'] },
  { type: 'fill', sentence: 'We ___ home at midnight.', correctAnswer: 'came', choices: ['came', 'come', 'comes', 'coming'], grammarPoint: 'past simple — irregular', relatedVocab: ['home'] },
  { type: 'fill', sentence: 'She ___ English in London.', correctAnswer: 'taught', choices: ['taught', 'teach', 'teaches', 'teaching'], grammarPoint: 'past simple — irregular', relatedVocab: ['English'] },
  { type: 'fill', sentence: 'I ___ a long letter to my friend.', correctAnswer: 'wrote', choices: ['wrote', 'write', 'writes', 'writing'], grammarPoint: 'past simple — irregular', relatedVocab: ['letter', 'friend'] },
  { type: 'fill', sentence: 'He ___ his keys at home.', correctAnswer: 'left', choices: ['left', 'leave', 'leaves', 'leaving'], grammarPoint: 'past simple — irregular', relatedVocab: ['keys', 'home'] },

  // ── past simple — negative / question ──
  { type: 'fill', sentence: 'I ___ not go to the party.', correctAnswer: 'did', choices: ['did', 'do', 'does', 'was'], grammarPoint: 'past simple negative', relatedVocab: ['party'] },
  { type: 'fill', sentence: '___ you see the doctor yesterday?', correctAnswer: 'Did', choices: ['Did', 'Do', 'Does', 'Were'], grammarPoint: 'past simple question', relatedVocab: ['doctor'] },
  { type: 'fill', sentence: 'She ___ not enjoy the concert.', correctAnswer: 'did', choices: ['did', 'do', 'does', 'was'], grammarPoint: 'past simple negative', relatedVocab: ['concert'] },

  // ── present continuous ──
  { type: 'fill', sentence: 'She ___ cooking dinner now.', correctAnswer: 'is', choices: ['is', 'are', 'am', 'was'], grammarPoint: 'present continuous', relatedVocab: ['dinner'] },
  { type: 'fill', sentence: 'I ___ reading a book at the moment.', correctAnswer: 'am', choices: ['am', 'is', 'are', 'was'], grammarPoint: 'present continuous', relatedVocab: ['book'] },
  { type: 'fill', sentence: 'They ___ playing in the garden.', correctAnswer: 'are', choices: ['are', 'is', 'am', 'was'], grammarPoint: 'present continuous', relatedVocab: ['garden'] },
  { type: 'fill', sentence: 'He is ___ to music right now.', correctAnswer: 'listening', choices: ['listening', 'listen', 'listens', 'listened'], grammarPoint: 'present continuous', relatedVocab: ['music'] },
  { type: 'fill', sentence: 'We are ___ for the bus.', correctAnswer: 'waiting', choices: ['waiting', 'wait', 'waits', 'waited'], grammarPoint: 'present continuous', relatedVocab: ['bus'] },
  { type: 'fill', sentence: 'Look! It ___ raining outside.', correctAnswer: 'is', choices: ['is', 'are', 'am', 'was'], grammarPoint: 'present continuous', relatedVocab: ['rain'] },
  { type: 'sentence', sentence: 'Which sentence is correct?', correctAnswer: 'She is watching TV now.', choices: ['She is watching TV now.', 'She watching TV now.', 'She are watching TV now.', 'She watch TV now.'], grammarPoint: 'present continuous', relatedVocab: ['TV'] },

  // ── comparatives ──
  { type: 'fill', sentence: 'A car is ___ than a bicycle.', correctAnswer: 'faster', choices: ['faster', 'fast', 'fastest', 'more fast'], grammarPoint: 'comparatives', relatedVocab: ['car', 'bicycle'] },
  { type: 'fill', sentence: 'An elephant is ___ than a cat.', correctAnswer: 'bigger', choices: ['bigger', 'big', 'biggest', 'more big'], grammarPoint: 'comparatives', relatedVocab: ['elephant', 'cat'] },
  { type: 'fill', sentence: 'This question is ___ than the last one.', correctAnswer: 'more difficult', choices: ['more difficult', 'difficulter', 'most difficult', 'difficult'], grammarPoint: 'comparatives', relatedVocab: ['question'] },
  { type: 'fill', sentence: 'She is ___ than her brother.', correctAnswer: 'taller', choices: ['taller', 'tall', 'tallest', 'more tall'], grammarPoint: 'comparatives', relatedVocab: ['brother'] },
  { type: 'fill', sentence: 'This book is ___ than that one.', correctAnswer: 'better', choices: ['better', 'gooder', 'more good', 'best'], grammarPoint: 'comparatives — irregular', relatedVocab: ['book'] },

  // ── superlatives ──
  { type: 'fill', sentence: 'He is the ___ student in the class.', correctAnswer: 'best', choices: ['best', 'better', 'good', 'most good'], grammarPoint: 'superlatives — irregular', relatedVocab: ['student'] },
  { type: 'fill', sentence: 'This is the ___ building in the city.', correctAnswer: 'tallest', choices: ['tallest', 'taller', 'tall', 'most tall'], grammarPoint: 'superlatives', relatedVocab: ['building', 'city'] },
  { type: 'fill', sentence: 'She is the ___ beautiful girl in school.', correctAnswer: 'most', choices: ['most', 'more', 'much', 'very'], grammarPoint: 'superlatives', relatedVocab: ['school'] },

  // ── prepositions of time ──
  { type: 'fill', sentence: 'I was born ___ 1999.', correctAnswer: 'in', choices: ['in', 'on', 'at', 'to'], grammarPoint: 'prepositions of time', relatedVocab: ['born'] },
  { type: 'fill', sentence: 'The meeting is ___ Friday.', correctAnswer: 'on', choices: ['on', 'in', 'at', 'to'], grammarPoint: 'prepositions of time', relatedVocab: ['meeting'] },
  { type: 'fill', sentence: 'I usually go to bed ___ 10 PM.', correctAnswer: 'at', choices: ['at', 'in', 'on', 'to'], grammarPoint: 'prepositions of time', relatedVocab: ['bed'] },
  { type: 'fill', sentence: 'We have a holiday ___ December.', correctAnswer: 'in', choices: ['in', 'on', 'at', 'to'], grammarPoint: 'prepositions of time', relatedVocab: ['holiday'] },

  // ── frequency adverbs ──
  { type: 'fill', sentence: 'She ___ goes to the gym on Mondays.', correctAnswer: 'always', choices: ['always', 'never', 'rarely', 'seldom'], grammarPoint: 'frequency adverbs', relatedVocab: ['gym'] },
  { type: 'fill', sentence: 'He is ___ late for class.', correctAnswer: 'never', choices: ['never', 'always', 'usually', 'often'], grammarPoint: 'frequency adverbs', relatedVocab: ['class'] },
  { type: 'fill', sentence: 'I ___ eat breakfast before school.', correctAnswer: 'usually', choices: ['usually', 'never', 'rarely', 'seldom'], grammarPoint: 'frequency adverbs', relatedVocab: ['breakfast', 'school'] },
  { type: 'sentence', sentence: 'Which sentence is correct?', correctAnswer: 'She always drinks coffee in the morning.', choices: ['She always drinks coffee in the morning.', 'She drinks always coffee in the morning.', 'Always she drinks coffee in the morning.', 'She drinks coffee always in the morning.'], grammarPoint: 'frequency adverbs', relatedVocab: ['coffee'] },

  // ── countable / uncountable ──
  { type: 'fill', sentence: 'How ___ water do you need?', correctAnswer: 'much', choices: ['much', 'many', 'lot', 'few'], grammarPoint: 'much/many', relatedVocab: ['water'] },
  { type: 'fill', sentence: 'How ___ eggs are in the fridge?', correctAnswer: 'many', choices: ['many', 'much', 'lot', 'few'], grammarPoint: 'much/many', relatedVocab: ['egg'] },
  { type: 'fill', sentence: 'There is ___ milk in the bottle.', correctAnswer: 'some', choices: ['some', 'many', 'a', 'few'], grammarPoint: 'some/any', relatedVocab: ['milk'] },
  { type: 'fill', sentence: 'Are there ___ oranges left?', correctAnswer: 'any', choices: ['any', 'some', 'much', 'a'], grammarPoint: 'some/any', relatedVocab: ['orange'] },
  { type: 'fill', sentence: 'I need a ___ of bread.', correctAnswer: 'loaf', choices: ['loaf', 'piece', 'cup', 'bowl'], grammarPoint: 'countable expressions', relatedVocab: ['bread'] },

  // ── going to (future) ──
  { type: 'fill', sentence: 'I ___ going to visit my grandmother tomorrow.', correctAnswer: 'am', choices: ['am', 'is', 'are', 'was'], grammarPoint: 'going to — future', relatedVocab: ['grandmother'] },
  { type: 'fill', sentence: 'She is ___ to start a new job next week.', correctAnswer: 'going', choices: ['going', 'go', 'gone', 'went'], grammarPoint: 'going to — future', relatedVocab: ['job'] },
  { type: 'fill', sentence: 'They ___ going to travel to Japan.', correctAnswer: 'are', choices: ['are', 'is', 'am', 'was'], grammarPoint: 'going to — future', relatedVocab: ['travel'] },
  { type: 'sentence', sentence: 'Which sentence is correct?', correctAnswer: 'We are going to have a party.', choices: ['We are going to have a party.', 'We going to have a party.', 'We is going to have a party.', 'We are go to have a party.'], grammarPoint: 'going to — future', relatedVocab: ['party'] },

  // ── was / were ──
  { type: 'fill', sentence: 'I ___ at home yesterday.', correctAnswer: 'was', choices: ['was', 'were', 'am', 'is'], grammarPoint: 'was/were', relatedVocab: ['home'] },
  { type: 'fill', sentence: 'They ___ at the park last Sunday.', correctAnswer: 'were', choices: ['were', 'was', 'are', 'is'], grammarPoint: 'was/were', relatedVocab: ['park'] },
  { type: 'fill', sentence: 'The weather ___ nice last week.', correctAnswer: 'was', choices: ['was', 'were', 'is', 'are'], grammarPoint: 'was/were', relatedVocab: ['weather'] },

  // ── adverbs of manner ──
  { type: 'fill', sentence: 'She sings very ___.', correctAnswer: 'beautifully', choices: ['beautifully', 'beautiful', 'beauty', 'beautify'], grammarPoint: 'adverbs of manner', relatedVocab: ['sing'] },
  { type: 'fill', sentence: 'He drives too ___.', correctAnswer: 'fast', choices: ['fast', 'fastly', 'faster', 'fastest'], grammarPoint: 'adverbs of manner', relatedVocab: ['drive'] },
  { type: 'fill', sentence: 'Please speak ___.', correctAnswer: 'slowly', choices: ['slowly', 'slow', 'slower', 'slowest'], grammarPoint: 'adverbs of manner', relatedVocab: ['speak'] },

  // ── conjunctions ──
  { type: 'fill', sentence: 'I like tea ___ coffee.', correctAnswer: 'and', choices: ['and', 'but', 'or', 'so'], grammarPoint: 'conjunctions', relatedVocab: ['tea', 'coffee'] },
  { type: 'fill', sentence: 'He is tired ___ he is still working.', correctAnswer: 'but', choices: ['but', 'and', 'or', 'so'], grammarPoint: 'conjunctions', relatedVocab: ['tired'] },
  { type: 'fill', sentence: 'Would you like tea ___ coffee?', correctAnswer: 'or', choices: ['or', 'and', 'but', 'so'], grammarPoint: 'conjunctions', relatedVocab: ['tea', 'coffee'] },

  // ── more mixed ──
  { type: 'sentence', sentence: 'Which sentence is correct?', correctAnswer: 'I didn\'t go to the cinema yesterday.', choices: ['I didn\'t go to the cinema yesterday.', 'I didn\'t went to the cinema yesterday.', 'I not go to the cinema yesterday.', 'I don\'t went to the cinema yesterday.'], grammarPoint: 'past simple negative', relatedVocab: ['cinema'] },
  { type: 'sentence', sentence: 'Which sentence is correct?', correctAnswer: 'She is taller than her sister.', choices: ['She is taller than her sister.', 'She is more taller than her sister.', 'She is tall than her sister.', 'She is tallest than her sister.'], grammarPoint: 'comparatives', relatedVocab: ['sister'] },
  { type: 'fill', sentence: 'I ___ my phone on the train.', correctAnswer: 'lost', choices: ['lost', 'lose', 'losing', 'losed'], grammarPoint: 'past simple — irregular', relatedVocab: ['phone', 'train'] },
  { type: 'fill', sentence: 'We ___ dinner at a restaurant last night.', correctAnswer: 'had', choices: ['had', 'have', 'has', 'having'], grammarPoint: 'past simple — irregular', relatedVocab: ['dinner', 'restaurant'] },
  { type: 'fill', sentence: 'She ___ a beautiful song at the concert.', correctAnswer: 'sang', choices: ['sang', 'sing', 'sings', 'singed'], grammarPoint: 'past simple — irregular', relatedVocab: ['song', 'concert'] },
  { type: 'fill', sentence: 'The children ___ running in the park.', correctAnswer: 'are', choices: ['are', 'is', 'am', 'was'], grammarPoint: 'present continuous', relatedVocab: ['child', 'park'] },
  { type: 'fill', sentence: 'I am ___ for my exam tomorrow.', correctAnswer: 'studying', choices: ['studying', 'study', 'studies', 'studied'], grammarPoint: 'present continuous', relatedVocab: ['exam'] },
  { type: 'fill', sentence: '___ it rain a lot in your city?', correctAnswer: 'Does', choices: ['Does', 'Do', 'Is', 'Are'], grammarPoint: 'present simple question', relatedVocab: ['rain', 'city'] },
  { type: 'fill', sentence: 'Whose bag is ___?', correctAnswer: 'this', choices: ['this', 'these', 'they', 'them'], grammarPoint: 'demonstratives', relatedVocab: ['bag'] },
  { type: 'fill', sentence: 'I saw ___ interesting movie last weekend.', correctAnswer: 'an', choices: ['an', 'a', 'the', '---'], grammarPoint: 'articles', relatedVocab: ['movie'] },
  { type: 'fill', sentence: 'She ___ born in 2001.', correctAnswer: 'was', choices: ['was', 'were', 'is', 'are'], grammarPoint: 'was/were', relatedVocab: ['born'] },
  { type: 'fill', sentence: 'The exam was ___ than I expected.', correctAnswer: 'harder', choices: ['harder', 'hard', 'hardest', 'more hard'], grammarPoint: 'comparatives', relatedVocab: ['exam'] },
  { type: 'fill', sentence: 'What ___ she doing right now?', correctAnswer: 'is', choices: ['is', 'are', 'does', 'do'], grammarPoint: 'present continuous question', relatedVocab: [] },
  { type: 'fill', sentence: 'He ___ to the market to buy vegetables.', correctAnswer: 'went', choices: ['went', 'go', 'goes', 'going'], grammarPoint: 'past simple — irregular', relatedVocab: ['market', 'vegetable'] },
  { type: 'sentence', sentence: 'Which sentence is correct?', correctAnswer: 'I am going to study tonight.', choices: ['I am going to study tonight.', 'I am go to study tonight.', 'I going to study tonight.', 'I am going study tonight.'], grammarPoint: 'going to — future', relatedVocab: ['study'] },
  { type: 'fill', sentence: 'Please ___ quiet in the library.', correctAnswer: 'be', choices: ['be', 'is', 'are', 'am'], grammarPoint: 'imperatives', relatedVocab: ['library'] },
  { type: 'fill', sentence: 'I ___ like vegetables when I was young.', correctAnswer: 'didn\'t', choices: ['didn\'t', 'don\'t', 'doesn\'t', 'wasn\'t'], grammarPoint: 'past simple negative', relatedVocab: ['vegetable'] },
]

// ═══════════════════════════════════════════════════════════
//  B1 — Intermediate
// ═══════════════════════════════════════════════════════════
export const B1 = [
  // ── present perfect ──
  { type: 'fill', sentence: 'I have ___ here for five years.', correctAnswer: 'lived', choices: ['lived', 'live', 'living', 'lives'], grammarPoint: 'present perfect', relatedVocab: ['live'] },
  { type: 'fill', sentence: 'She has ___ to Japan twice.', correctAnswer: 'been', choices: ['been', 'be', 'being', 'was'], grammarPoint: 'present perfect', relatedVocab: ['Japan'] },
  { type: 'fill', sentence: 'We have ___ finished our homework.', correctAnswer: 'already', choices: ['already', 'yet', 'never', 'ever'], grammarPoint: 'present perfect + adverbs', relatedVocab: ['homework'] },
  { type: 'fill', sentence: 'Have you ___ tried Thai food?', correctAnswer: 'ever', choices: ['ever', 'never', 'already', 'yet'], grammarPoint: 'present perfect + adverbs', relatedVocab: ['food'] },
  { type: 'fill', sentence: 'He hasn\'t arrived ___.', correctAnswer: 'yet', choices: ['yet', 'already', 'ever', 'never'], grammarPoint: 'present perfect + adverbs', relatedVocab: ['arrive'] },
  { type: 'fill', sentence: 'She ___ worked here since 2018.', correctAnswer: 'has', choices: ['has', 'have', 'had', 'is'], grammarPoint: 'present perfect', relatedVocab: ['work'] },
  { type: 'fill', sentence: 'I have known him ___ we were children.', correctAnswer: 'since', choices: ['since', 'for', 'already', 'yet'], grammarPoint: 'since/for', relatedVocab: ['child'] },
  { type: 'fill', sentence: 'They have been married ___ ten years.', correctAnswer: 'for', choices: ['for', 'since', 'already', 'yet'], grammarPoint: 'since/for', relatedVocab: ['married'] },
  { type: 'sentence', sentence: 'Which sentence is correct?', correctAnswer: 'I have never seen snow.', choices: ['I have never seen snow.', 'I have never see snow.', 'I never have seen snow.', 'I has never seen snow.'], grammarPoint: 'present perfect', relatedVocab: ['snow'] },
  { type: 'sentence', sentence: 'Which sentence is correct?', correctAnswer: 'She has just left the office.', choices: ['She has just left the office.', 'She has just leave the office.', 'She have just left the office.', 'She just has left the office.'], grammarPoint: 'present perfect + just', relatedVocab: ['office'] },

  // ── first conditional ──
  { type: 'fill', sentence: 'If it ___, I will take an umbrella.', correctAnswer: 'rains', choices: ['rains', 'rain', 'rained', 'will rain'], grammarPoint: 'first conditional', relatedVocab: ['rain', 'umbrella'] },
  { type: 'fill', sentence: 'If you study hard, you ___ pass the exam.', correctAnswer: 'will', choices: ['will', 'would', 'shall', 'can'], grammarPoint: 'first conditional', relatedVocab: ['exam'] },
  { type: 'fill', sentence: 'I will call you if I ___ late.', correctAnswer: 'am', choices: ['am', 'will be', 'was', 'were'], grammarPoint: 'first conditional', relatedVocab: ['call'] },
  { type: 'fill', sentence: 'If she ___ the bus, she will be late.', correctAnswer: 'misses', choices: ['misses', 'miss', 'missed', 'will miss'], grammarPoint: 'first conditional', relatedVocab: ['bus'] },
  { type: 'sentence', sentence: 'Which sentence is correct?', correctAnswer: 'If I have time, I will help you.', choices: ['If I have time, I will help you.', 'If I will have time, I will help you.', 'If I had time, I will help you.', 'If I have time, I would help you.'], grammarPoint: 'first conditional', relatedVocab: ['help'] },

  // ── modal verbs ──
  { type: 'fill', sentence: 'You ___ see a doctor. You look sick.', correctAnswer: 'should', choices: ['should', 'would', 'could', 'might'], grammarPoint: 'should — advice', relatedVocab: ['doctor', 'sick'] },
  { type: 'fill', sentence: 'You ___ not park here. It\'s illegal.', correctAnswer: 'must', choices: ['must', 'should', 'might', 'could'], grammarPoint: 'must — prohibition', relatedVocab: ['park'] },
  { type: 'fill', sentence: 'It ___ rain tomorrow. Take an umbrella just in case.', correctAnswer: 'might', choices: ['might', 'must', 'should', 'will'], grammarPoint: 'might — possibility', relatedVocab: ['rain', 'umbrella'] },
  { type: 'fill', sentence: 'You ___ wear a uniform at this school.', correctAnswer: 'must', choices: ['must', 'might', 'could', 'would'], grammarPoint: 'must — obligation', relatedVocab: ['uniform', 'school'] },
  { type: 'fill', sentence: '___ you help me with this box?', correctAnswer: 'Could', choices: ['Could', 'Must', 'Should', 'Might'], grammarPoint: 'could — polite request', relatedVocab: ['box'] },
  { type: 'fill', sentence: 'She ___ not be at home. Her car is gone.', correctAnswer: 'might', choices: ['might', 'must', 'should', 'will'], grammarPoint: 'might — possibility', relatedVocab: ['home', 'car'] },
  { type: 'sentence', sentence: 'Which sentence is correct?', correctAnswer: 'You should eat more vegetables.', choices: ['You should eat more vegetables.', 'You should to eat more vegetables.', 'You should eating more vegetables.', 'You should eats more vegetables.'], grammarPoint: 'should — advice', relatedVocab: ['vegetable'] },

  // ── passive voice ──
  { type: 'fill', sentence: 'The letter was ___ yesterday.', correctAnswer: 'sent', choices: ['sent', 'send', 'sending', 'sends'], grammarPoint: 'passive voice', relatedVocab: ['letter'] },
  { type: 'fill', sentence: 'English is ___ all over the world.', correctAnswer: 'spoken', choices: ['spoken', 'speak', 'speaking', 'spoke'], grammarPoint: 'passive voice', relatedVocab: ['English'] },
  { type: 'fill', sentence: 'The cake was ___ by my mother.', correctAnswer: 'made', choices: ['made', 'make', 'making', 'makes'], grammarPoint: 'passive voice', relatedVocab: ['cake', 'mother'] },
  { type: 'fill', sentence: 'This book ___ written in 1990.', correctAnswer: 'was', choices: ['was', 'is', 'has', 'were'], grammarPoint: 'passive voice', relatedVocab: ['book'] },
  { type: 'fill', sentence: 'The new hospital will be ___ next year.', correctAnswer: 'built', choices: ['built', 'build', 'building', 'builds'], grammarPoint: 'passive voice — future', relatedVocab: ['hospital'] },
  { type: 'sentence', sentence: 'Which sentence is correct?', correctAnswer: 'Rice is grown in many countries.', choices: ['Rice is grown in many countries.', 'Rice is grow in many countries.', 'Rice grown in many countries.', 'Rice is growing in many countries.'], grammarPoint: 'passive voice', relatedVocab: ['rice'] },

  // ── relative clauses ──
  { type: 'fill', sentence: 'The person ___ called you is my friend.', correctAnswer: 'who', choices: ['who', 'which', 'what', 'whom'], grammarPoint: 'relative clauses', relatedVocab: ['friend'] },
  { type: 'fill', sentence: 'The book ___ I read was very interesting.', correctAnswer: 'which', choices: ['which', 'who', 'whom', 'whose'], grammarPoint: 'relative clauses', relatedVocab: ['book'] },
  { type: 'fill', sentence: 'That is the restaurant ___ we ate last week.', correctAnswer: 'where', choices: ['where', 'which', 'who', 'when'], grammarPoint: 'relative clauses', relatedVocab: ['restaurant'] },
  { type: 'fill', sentence: 'She is the teacher ___ helped me pass the exam.', correctAnswer: 'who', choices: ['who', 'which', 'what', 'where'], grammarPoint: 'relative clauses', relatedVocab: ['teacher', 'exam'] },
  { type: 'fill', sentence: 'The car ___ is parked outside belongs to my uncle.', correctAnswer: 'that', choices: ['that', 'who', 'whom', 'whose'], grammarPoint: 'relative clauses', relatedVocab: ['car', 'uncle'] },

  // ── gerund vs infinitive ──
  { type: 'fill', sentence: 'I enjoy ___ in the morning.', correctAnswer: 'running', choices: ['running', 'to run', 'run', 'runs'], grammarPoint: 'gerund after enjoy', relatedVocab: ['run'] },
  { type: 'fill', sentence: 'She decided ___ abroad next year.', correctAnswer: 'to study', choices: ['to study', 'studying', 'study', 'studied'], grammarPoint: 'infinitive after decide', relatedVocab: ['study'] },
  { type: 'fill', sentence: 'He avoids ___ junk food.', correctAnswer: 'eating', choices: ['eating', 'to eat', 'eat', 'eats'], grammarPoint: 'gerund after avoid', relatedVocab: ['food'] },
  { type: 'fill', sentence: 'They want ___ a new language.', correctAnswer: 'to learn', choices: ['to learn', 'learning', 'learn', 'learned'], grammarPoint: 'infinitive after want', relatedVocab: ['language'] },
  { type: 'fill', sentence: 'I don\'t mind ___ late sometimes.', correctAnswer: 'working', choices: ['working', 'to work', 'work', 'works'], grammarPoint: 'gerund after mind', relatedVocab: ['work'] },
  { type: 'sentence', sentence: 'Which sentence is correct?', correctAnswer: 'She enjoys reading books.', choices: ['She enjoys reading books.', 'She enjoys to read books.', 'She enjoys read books.', 'She enjoying read books.'], grammarPoint: 'gerund after enjoy', relatedVocab: ['book'] },

  // ── used to ──
  { type: 'fill', sentence: 'I used to ___ near the beach.', correctAnswer: 'live', choices: ['live', 'lived', 'living', 'lives'], grammarPoint: 'used to', relatedVocab: ['beach'] },
  { type: 'fill', sentence: 'She ___ to play piano when she was young.', correctAnswer: 'used', choices: ['used', 'use', 'using', 'uses'], grammarPoint: 'used to', relatedVocab: ['piano'] },
  { type: 'fill', sentence: 'They didn\'t ___ to eat spicy food.', correctAnswer: 'use', choices: ['use', 'used', 'using', 'uses'], grammarPoint: 'used to — negative', relatedVocab: ['food'] },
  { type: 'sentence', sentence: 'Which sentence is correct?', correctAnswer: 'He used to smoke, but now he doesn\'t.', choices: ['He used to smoke, but now he doesn\'t.', 'He use to smoke, but now he doesn\'t.', 'He used to smoking, but now he doesn\'t.', 'He is used to smoke, but now he doesn\'t.'], grammarPoint: 'used to', relatedVocab: ['smoke'] },

  // ── present perfect vs past simple ──
  { type: 'fill', sentence: 'I ___ to London three times. (life experience)', correctAnswer: 'have been', choices: ['have been', 'went', 'was', 'go'], grammarPoint: 'present perfect vs past simple', relatedVocab: ['London'] },
  { type: 'fill', sentence: 'She ___ her keys yesterday. (specific time)', correctAnswer: 'lost', choices: ['lost', 'has lost', 'loses', 'is losing'], grammarPoint: 'present perfect vs past simple', relatedVocab: ['keys'] },

  // ── more mixed ──
  { type: 'fill', sentence: 'I\'m looking forward to ___ you again.', correctAnswer: 'seeing', choices: ['seeing', 'see', 'saw', 'seen'], grammarPoint: 'gerund after preposition', relatedVocab: ['see'] },
  { type: 'fill', sentence: 'The movie was so boring ___ I fell asleep.', correctAnswer: 'that', choices: ['that', 'than', 'then', 'which'], grammarPoint: 'so...that', relatedVocab: ['movie', 'sleep'] },
  { type: 'fill', sentence: 'He is ___ enough to drive a car.', correctAnswer: 'old', choices: ['old', 'older', 'oldest', 'olden'], grammarPoint: 'adjective + enough', relatedVocab: ['car'] },
  { type: 'fill', sentence: 'The test was too ___ for me to finish.', correctAnswer: 'difficult', choices: ['difficult', 'difficulty', 'difficultly', 'more difficult'], grammarPoint: 'too + adjective', relatedVocab: ['test'] },
  { type: 'fill', sentence: 'She has ___ eating. She is full now.', correctAnswer: 'finished', choices: ['finished', 'finish', 'finishing', 'finishes'], grammarPoint: 'present perfect', relatedVocab: ['eat'] },
  { type: 'fill', sentence: 'If you ___ to the party, you will meet many people.', correctAnswer: 'come', choices: ['come', 'will come', 'came', 'would come'], grammarPoint: 'first conditional', relatedVocab: ['party', 'people'] },
  { type: 'fill', sentence: 'I ___ been waiting for an hour.', correctAnswer: 'have', choices: ['have', 'has', 'had', 'am'], grammarPoint: 'present perfect continuous', relatedVocab: ['wait'] },
  { type: 'sentence', sentence: 'Which sentence is correct?', correctAnswer: 'He has been learning English for 5 years.', choices: ['He has been learning English for 5 years.', 'He has been learn English for 5 years.', 'He have been learning English for 5 years.', 'He has learning English for 5 years.'], grammarPoint: 'present perfect continuous', relatedVocab: ['English'] },
  { type: 'fill', sentence: 'I wish I ___ more about computers.', correctAnswer: 'knew', choices: ['knew', 'know', 'knows', 'knowing'], grammarPoint: 'wish + past simple', relatedVocab: ['computer'] },
  { type: 'fill', sentence: 'The food ___ delicious if you add more salt.', correctAnswer: 'will taste', choices: ['will taste', 'taste', 'tasted', 'tasting'], grammarPoint: 'first conditional', relatedVocab: ['food', 'salt'] },
]

// ═══════════════════════════════════════════════════════════
//  B2 — Upper-Intermediate
// ═══════════════════════════════════════════════════════════
export const B2 = [
  // ── past perfect ──
  { type: 'fill', sentence: 'She had ___ before I arrived.', correctAnswer: 'left', choices: ['left', 'leave', 'leaving', 'leaves'], grammarPoint: 'past perfect', relatedVocab: ['arrive'] },
  { type: 'fill', sentence: 'By the time we got there, the movie had already ___.', correctAnswer: 'started', choices: ['started', 'start', 'starting', 'starts'], grammarPoint: 'past perfect', relatedVocab: ['movie'] },
  { type: 'fill', sentence: 'I ___ never seen such a beautiful sunset before that day.', correctAnswer: 'had', choices: ['had', 'have', 'has', 'was'], grammarPoint: 'past perfect', relatedVocab: ['sunset'] },
  { type: 'fill', sentence: 'After he ___ finished his work, he went home.', correctAnswer: 'had', choices: ['had', 'has', 'have', 'was'], grammarPoint: 'past perfect', relatedVocab: ['work', 'home'] },
  { type: 'sentence', sentence: 'Which sentence is correct?', correctAnswer: 'She had already eaten when I arrived.', choices: ['She had already eaten when I arrived.', 'She already had eaten when I arrived.', 'She has already eaten when I arrived.', 'She had already eat when I arrived.'], grammarPoint: 'past perfect', relatedVocab: ['eat', 'arrive'] },

  // ── second conditional ──
  { type: 'fill', sentence: 'If I ___ rich, I would travel the world.', correctAnswer: 'were', choices: ['were', 'am', 'was', 'be'], grammarPoint: 'second conditional', relatedVocab: ['rich', 'travel'] },
  { type: 'fill', sentence: 'If she ___ harder, she would get better grades.', correctAnswer: 'studied', choices: ['studied', 'studies', 'study', 'will study'], grammarPoint: 'second conditional', relatedVocab: ['study'] },
  { type: 'fill', sentence: 'I would buy a house if I ___ enough money.', correctAnswer: 'had', choices: ['had', 'have', 'has', 'will have'], grammarPoint: 'second conditional', relatedVocab: ['house', 'money'] },
  { type: 'fill', sentence: 'If I ___ you, I would apologize immediately.', correctAnswer: 'were', choices: ['were', 'am', 'was', 'be'], grammarPoint: 'second conditional', relatedVocab: ['apologize'] },
  { type: 'sentence', sentence: 'Which sentence is correct?', correctAnswer: 'If I had more time, I would learn to play guitar.', choices: ['If I had more time, I would learn to play guitar.', 'If I have more time, I would learn to play guitar.', 'If I had more time, I will learn to play guitar.', 'If I would have more time, I would learn to play guitar.'], grammarPoint: 'second conditional', relatedVocab: ['guitar'] },

  // ── third conditional ──
  { type: 'fill', sentence: 'If I had studied harder, I ___ have passed the exam.', correctAnswer: 'would', choices: ['would', 'will', 'should', 'could'], grammarPoint: 'third conditional', relatedVocab: ['exam'] },
  { type: 'fill', sentence: 'If she ___ taken the train, she wouldn\'t have been late.', correctAnswer: 'had', choices: ['had', 'has', 'have', 'would'], grammarPoint: 'third conditional', relatedVocab: ['train'] },
  { type: 'fill', sentence: 'We would have won if the team ___ played better.', correctAnswer: 'had', choices: ['had', 'has', 'have', 'would'], grammarPoint: 'third conditional', relatedVocab: ['team'] },
  { type: 'sentence', sentence: 'Which sentence is correct?', correctAnswer: 'If I had known, I would have helped you.', choices: ['If I had known, I would have helped you.', 'If I knew, I would have helped you.', 'If I had known, I will have helped you.', 'If I have known, I would have helped you.'], grammarPoint: 'third conditional', relatedVocab: ['help'] },

  // ── reported speech ──
  { type: 'fill', sentence: 'She said she ___ tired.', correctAnswer: 'was', choices: ['was', 'is', 'were', 'be'], grammarPoint: 'reported speech', relatedVocab: ['tired'] },
  { type: 'fill', sentence: 'He told me he ___ come to the party.', correctAnswer: 'would', choices: ['would', 'will', 'can', 'shall'], grammarPoint: 'reported speech', relatedVocab: ['party'] },
  { type: 'fill', sentence: 'She asked me where I ___.', correctAnswer: 'lived', choices: ['lived', 'live', 'living', 'lives'], grammarPoint: 'reported speech — questions', relatedVocab: ['live'] },
  { type: 'fill', sentence: 'He said he ___ already finished the project.', correctAnswer: 'had', choices: ['had', 'has', 'have', 'was'], grammarPoint: 'reported speech', relatedVocab: ['project'] },
  { type: 'fill', sentence: 'She told me that she ___ been waiting for an hour.', correctAnswer: 'had', choices: ['had', 'has', 'have', 'was'], grammarPoint: 'reported speech', relatedVocab: ['wait'] },
  { type: 'sentence', sentence: 'Which sentence is correct?', correctAnswer: 'He said that he was leaving the next day.', choices: ['He said that he was leaving the next day.', 'He said that he is leaving tomorrow.', 'He said that he will leaving the next day.', 'He said that he was leave the next day.'], grammarPoint: 'reported speech', relatedVocab: ['leave'] },

  // ── wish / if only ──
  { type: 'fill', sentence: 'I wish I ___ speak French.', correctAnswer: 'could', choices: ['could', 'can', 'will', 'would'], grammarPoint: 'wish + past', relatedVocab: ['French'] },
  { type: 'fill', sentence: 'If only I ___ listened to my parents.', correctAnswer: 'had', choices: ['had', 'have', 'has', 'would'], grammarPoint: 'if only + past perfect', relatedVocab: ['parents'] },
  { type: 'fill', sentence: 'She wishes she ___ taller.', correctAnswer: 'were', choices: ['were', 'is', 'was', 'be'], grammarPoint: 'wish + past', relatedVocab: ['tall'] },
  { type: 'fill', sentence: 'I wish I ___ bought that car when it was cheaper.', correctAnswer: 'had', choices: ['had', 'have', 'has', 'would'], grammarPoint: 'wish + past perfect', relatedVocab: ['car'] },

  // ── relative clauses (advanced) ──
  { type: 'fill', sentence: 'The man ___ car was stolen reported it to the police.', correctAnswer: 'whose', choices: ['whose', 'who', 'which', 'that'], grammarPoint: 'relative clauses — whose', relatedVocab: ['car', 'police'] },
  { type: 'fill', sentence: 'The hotel ___ we stayed was by the sea.', correctAnswer: 'where', choices: ['where', 'which', 'that', 'who'], grammarPoint: 'relative clauses — where', relatedVocab: ['hotel', 'sea'] },
  { type: 'fill', sentence: 'The year ___ I graduated was 2020.', correctAnswer: 'when', choices: ['when', 'which', 'that', 'where'], grammarPoint: 'relative clauses — when', relatedVocab: ['graduate'] },

  // ── phrasal verbs in context ──
  { type: 'fill', sentence: 'Please ___ up the mess before the guests arrive.', correctAnswer: 'clean', choices: ['clean', 'cleaned', 'cleaning', 'cleans'], grammarPoint: 'phrasal verbs', relatedVocab: ['clean', 'guest'] },
  { type: 'fill', sentence: 'I need to ___ out what happened.', correctAnswer: 'find', choices: ['find', 'look', 'get', 'take'], grammarPoint: 'phrasal verbs', relatedVocab: ['find'] },
  { type: 'fill', sentence: 'She decided to ___ up smoking.', correctAnswer: 'give', choices: ['give', 'take', 'put', 'get'], grammarPoint: 'phrasal verbs', relatedVocab: ['smoke'] },
  { type: 'fill', sentence: 'The meeting has been ___ off until next week.', correctAnswer: 'put', choices: ['put', 'called', 'taken', 'set'], grammarPoint: 'phrasal verbs', relatedVocab: ['meeting'] },

  // ── have something done ──
  { type: 'fill', sentence: 'I need to ___ my car repaired.', correctAnswer: 'have', choices: ['have', 'get', 'make', 'do'], grammarPoint: 'have something done', relatedVocab: ['car'] },
  { type: 'fill', sentence: 'She is having her hair ___ at the salon.', correctAnswer: 'cut', choices: ['cut', 'cuts', 'cutting', 'cutted'], grammarPoint: 'have something done', relatedVocab: ['hair'] },
  { type: 'sentence', sentence: 'Which sentence is correct?', correctAnswer: 'I had my laptop fixed yesterday.', choices: ['I had my laptop fixed yesterday.', 'I had my laptop fix yesterday.', 'I have my laptop fixed yesterday.', 'I had fixed my laptop yesterday.'], grammarPoint: 'have something done', relatedVocab: ['laptop'] },

  // ── more mixed ──
  { type: 'fill', sentence: 'By next month, I ___ have completed the course.', correctAnswer: 'will', choices: ['will', 'would', 'shall', 'could'], grammarPoint: 'future perfect', relatedVocab: ['course'] },
  { type: 'fill', sentence: 'Despite ___ tired, she continued working.', correctAnswer: 'being', choices: ['being', 'be', 'was', 'been'], grammarPoint: 'despite + gerund', relatedVocab: ['tired', 'work'] },
  { type: 'fill', sentence: 'He succeeded ___ passing the exam.', correctAnswer: 'in', choices: ['in', 'at', 'on', 'to'], grammarPoint: 'preposition + gerund', relatedVocab: ['exam'] },
  { type: 'fill', sentence: 'I\'m not used ___ getting up early.', correctAnswer: 'to', choices: ['to', 'for', 'at', 'in'], grammarPoint: 'be used to + gerund', relatedVocab: ['morning'] },
  { type: 'fill', sentence: 'The more you practice, the ___ you will get.', correctAnswer: 'better', choices: ['better', 'best', 'good', 'well'], grammarPoint: 'the more...the more', relatedVocab: ['practice'] },
  { type: 'fill', sentence: 'Not only ___ she smart, but she is also kind.', correctAnswer: 'is', choices: ['is', 'does', 'was', 'has'], grammarPoint: 'not only...but also', relatedVocab: ['smart', 'kind'] },
  { type: 'fill', sentence: 'He spoke ___ quietly that nobody could hear him.', correctAnswer: 'so', choices: ['so', 'too', 'very', 'such'], grammarPoint: 'so...that', relatedVocab: ['speak', 'hear'] },
  { type: 'fill', sentence: 'It was ___ a difficult question that nobody answered it.', correctAnswer: 'such', choices: ['such', 'so', 'too', 'very'], grammarPoint: 'such...that', relatedVocab: ['question'] },
  { type: 'fill', sentence: 'She ___ rather not go to the party.', correctAnswer: 'would', choices: ['would', 'will', 'should', 'could'], grammarPoint: 'would rather', relatedVocab: ['party'] },
  { type: 'fill', sentence: 'Neither the teacher ___ the students were happy with the result.', correctAnswer: 'nor', choices: ['nor', 'or', 'and', 'but'], grammarPoint: 'neither...nor', relatedVocab: ['teacher', 'student'] },
  { type: 'sentence', sentence: 'Which sentence is correct?', correctAnswer: 'I\'d rather stay home than go out tonight.', choices: ['I\'d rather stay home than go out tonight.', 'I\'d rather to stay home than go out tonight.', 'I\'d rather staying home than going out tonight.', 'I\'d rather stay home that go out tonight.'], grammarPoint: 'would rather', relatedVocab: ['home'] },
  { type: 'fill', sentence: 'The project needs ___ by Friday.', correctAnswer: 'to be finished', choices: ['to be finished', 'finishing', 'to finish', 'finished'], grammarPoint: 'passive infinitive', relatedVocab: ['project'] },
  { type: 'fill', sentence: 'He denied ___ the window.', correctAnswer: 'breaking', choices: ['breaking', 'to break', 'break', 'broke'], grammarPoint: 'gerund after deny', relatedVocab: ['window'] },
  { type: 'fill', sentence: 'She insisted ___ paying for dinner.', correctAnswer: 'on', choices: ['on', 'in', 'at', 'to'], grammarPoint: 'insist on + gerund', relatedVocab: ['dinner'] },
]

// ═══════════════════════════════════════════════════════════
//  C1 — Advanced
// ═══════════════════════════════════════════════════════════
export const C1 = [
  // ── mixed conditionals ──
  { type: 'fill', sentence: 'If I had studied medicine, I ___ a doctor now.', correctAnswer: 'would be', choices: ['would be', 'will be', 'am', 'was'], grammarPoint: 'mixed conditional', relatedVocab: ['medicine', 'doctor'] },
  { type: 'fill', sentence: 'If she spoke better English, she ___ have gotten that job.', correctAnswer: 'would', choices: ['would', 'will', 'could', 'should'], grammarPoint: 'mixed conditional', relatedVocab: ['English', 'job'] },
  { type: 'fill', sentence: 'If he hadn\'t missed the flight, he ___ in Tokyo now.', correctAnswer: 'would be', choices: ['would be', 'will be', 'is', 'was'], grammarPoint: 'mixed conditional', relatedVocab: ['flight', 'Tokyo'] },
  { type: 'sentence', sentence: 'Which sentence is correct?', correctAnswer: 'If I were taller, I would have been selected for the team.', choices: ['If I were taller, I would have been selected for the team.', 'If I was taller, I will have been selected for the team.', 'If I am taller, I would have been selected for the team.', 'If I were taller, I will be selected for the team.'], grammarPoint: 'mixed conditional', relatedVocab: ['team'] },

  // ── inversion ──
  { type: 'fill', sentence: '___ had I known about the problem, I would have helped.', correctAnswer: 'Had', choices: ['Had', 'If', 'Should', 'Were'], grammarPoint: 'inversion — conditional', relatedVocab: ['problem', 'help'] },
  { type: 'fill', sentence: 'Not until she arrived ___ we start the meeting.', correctAnswer: 'did', choices: ['did', 'do', 'were', 'had'], grammarPoint: 'inversion — not until', relatedVocab: ['meeting'] },
  { type: 'fill', sentence: 'Rarely ___ I seen such a beautiful view.', correctAnswer: 'have', choices: ['have', 'had', 'do', 'did'], grammarPoint: 'inversion — rarely', relatedVocab: ['view'] },
  { type: 'fill', sentence: 'Seldom ___ he attend meetings on time.', correctAnswer: 'does', choices: ['does', 'do', 'is', 'has'], grammarPoint: 'inversion — seldom', relatedVocab: ['meeting'] },
  { type: 'fill', sentence: '___ sooner had she left than it started raining.', correctAnswer: 'No', choices: ['No', 'Not', 'Never', 'Nor'], grammarPoint: 'inversion — no sooner', relatedVocab: ['rain'] },
  { type: 'sentence', sentence: 'Which sentence is correct?', correctAnswer: 'Never before had I experienced such kindness.', choices: ['Never before had I experienced such kindness.', 'Never before I had experienced such kindness.', 'Never before have I experience such kindness.', 'Never before did I experienced such kindness.'], grammarPoint: 'inversion — never', relatedVocab: ['kindness'] },

  // ── cleft sentences ──
  { type: 'fill', sentence: 'It ___ John who broke the window.', correctAnswer: 'was', choices: ['was', 'is', 'were', 'has'], grammarPoint: 'cleft sentences', relatedVocab: ['window'] },
  { type: 'fill', sentence: 'What I need ___ a good night\'s sleep.', correctAnswer: 'is', choices: ['is', 'are', 'was', 'were'], grammarPoint: 'cleft sentences', relatedVocab: ['sleep'] },
  { type: 'fill', sentence: 'It was the noise that ___ me awake.', correctAnswer: 'kept', choices: ['kept', 'keep', 'keeping', 'keeps'], grammarPoint: 'cleft sentences', relatedVocab: ['noise'] },
  { type: 'fill', sentence: 'What ___ matters is your effort, not the result.', correctAnswer: 'really', choices: ['really', 'real', 'reality', 'realism'], grammarPoint: 'cleft sentences', relatedVocab: ['effort', 'result'] },

  // ── advanced passive ──
  { type: 'fill', sentence: 'The project is expected to ___ completed by June.', correctAnswer: 'be', choices: ['be', 'being', 'been', 'is'], grammarPoint: 'advanced passive', relatedVocab: ['project'] },
  { type: 'fill', sentence: 'She is said ___ be the best candidate.', correctAnswer: 'to', choices: ['to', 'for', 'as', 'that'], grammarPoint: 'advanced passive', relatedVocab: ['candidate'] },
  { type: 'fill', sentence: 'He is believed ___ have left the country.', correctAnswer: 'to', choices: ['to', 'for', 'that', 'as'], grammarPoint: 'advanced passive', relatedVocab: ['country'] },
  { type: 'fill', sentence: 'The building is ___ to have been built in the 18th century.', correctAnswer: 'thought', choices: ['thought', 'think', 'thinking', 'thinks'], grammarPoint: 'advanced passive', relatedVocab: ['building'] },
  { type: 'sentence', sentence: 'Which sentence is correct?', correctAnswer: 'The suspect is reported to have fled the country.', choices: ['The suspect is reported to have fled the country.', 'The suspect is reported to had fled the country.', 'The suspect is reported having fled the country.', 'The suspect is reported to flee the country.'], grammarPoint: 'advanced passive', relatedVocab: ['country'] },

  // ── subjunctive ──
  { type: 'fill', sentence: 'I suggest that he ___ the meeting.', correctAnswer: 'attend', choices: ['attend', 'attends', 'attending', 'attended'], grammarPoint: 'subjunctive', relatedVocab: ['meeting'] },
  { type: 'fill', sentence: 'It is essential that she ___ on time.', correctAnswer: 'be', choices: ['be', 'is', 'was', 'being'], grammarPoint: 'subjunctive', relatedVocab: ['time'] },
  { type: 'fill', sentence: 'The doctor recommended that he ___ more exercise.', correctAnswer: 'do', choices: ['do', 'does', 'did', 'doing'], grammarPoint: 'subjunctive', relatedVocab: ['doctor', 'exercise'] },
  { type: 'fill', sentence: 'It is vital that the report ___ submitted by Friday.', correctAnswer: 'be', choices: ['be', 'is', 'was', 'being'], grammarPoint: 'subjunctive', relatedVocab: ['report'] },

  // ── participle clauses ──
  { type: 'fill', sentence: '___ the door, she noticed something strange.', correctAnswer: 'Opening', choices: ['Opening', 'Opened', 'Open', 'Opens'], grammarPoint: 'participle clauses', relatedVocab: ['door'] },
  { type: 'fill', sentence: '___ by the news, she sat down quietly.', correctAnswer: 'Shocked', choices: ['Shocked', 'Shocking', 'Shock', 'Shocks'], grammarPoint: 'participle clauses', relatedVocab: ['news'] },
  { type: 'fill', sentence: '___ in a small village, he had few friends.', correctAnswer: 'Living', choices: ['Living', 'Lived', 'Live', 'Lives'], grammarPoint: 'participle clauses', relatedVocab: ['village', 'friend'] },
  { type: 'fill', sentence: 'The letter, ___ in French, was difficult to understand.', correctAnswer: 'written', choices: ['written', 'writing', 'write', 'wrote'], grammarPoint: 'participle clauses', relatedVocab: ['letter', 'French'] },

  // ── formal / informal register ──
  { type: 'fill', sentence: 'I would be ___ if you could send me the report.', correctAnswer: 'grateful', choices: ['grateful', 'happy', 'glad', 'nice'], grammarPoint: 'formal register', relatedVocab: ['report'] },
  { type: 'fill', sentence: '___ to the above, I wish to add the following.', correctAnswer: 'In addition', choices: ['In addition', 'Also', 'And', 'Plus'], grammarPoint: 'formal register', relatedVocab: [] },
  { type: 'fill', sentence: 'I am writing to ___ about the service I received.', correctAnswer: 'complain', choices: ['complain', 'moan', 'grumble', 'whine'], grammarPoint: 'formal register', relatedVocab: ['service'] },

  // ── more mixed ──
  { type: 'fill', sentence: 'Much ___ I admire her, I can\'t agree with her decision.', correctAnswer: 'as', choices: ['as', 'like', 'than', 'so'], grammarPoint: 'concession — much as', relatedVocab: ['decision'] },
  { type: 'fill', sentence: 'Were she to ___ earlier, she would catch the train.', correctAnswer: 'leave', choices: ['leave', 'left', 'leaving', 'leaves'], grammarPoint: 'inversion — were', relatedVocab: ['train'] },
  { type: 'fill', sentence: 'Little ___ he know what awaited him.', correctAnswer: 'did', choices: ['did', 'do', 'does', 'had'], grammarPoint: 'inversion — little', relatedVocab: [] },
  { type: 'fill', sentence: 'Only after the meeting ___ I understand the problem.', correctAnswer: 'did', choices: ['did', 'do', 'was', 'had'], grammarPoint: 'inversion — only after', relatedVocab: ['meeting', 'problem'] },
  { type: 'fill', sentence: 'However hard she ___, she couldn\'t solve the puzzle.', correctAnswer: 'tried', choices: ['tried', 'try', 'tries', 'trying'], grammarPoint: 'however + adjective/adverb', relatedVocab: ['puzzle'] },
  { type: 'fill', sentence: 'No sooner had I sat down ___ the phone rang.', correctAnswer: 'than', choices: ['than', 'that', 'when', 'then'], grammarPoint: 'no sooner...than', relatedVocab: ['phone'] },
  { type: 'fill', sentence: 'She couldn\'t help ___ when she heard the joke.', correctAnswer: 'laughing', choices: ['laughing', 'laugh', 'to laugh', 'laughed'], grammarPoint: 'can\'t help + gerund', relatedVocab: ['joke'] },
  { type: 'fill', sentence: 'There is no point ___ about it now.', correctAnswer: 'in worrying', choices: ['in worrying', 'to worry', 'worry', 'worried'], grammarPoint: 'no point in + gerund', relatedVocab: [] },
  { type: 'sentence', sentence: 'Which sentence is correct?', correctAnswer: 'Had I been told earlier, I would have prepared.', choices: ['Had I been told earlier, I would have prepared.', 'Had I been told earlier, I will have prepared.', 'Had I told earlier, I would have prepared.', 'If had I been told earlier, I would have prepared.'], grammarPoint: 'inversion — conditional', relatedVocab: ['prepare'] },
  { type: 'fill', sentence: 'He prides himself ___ being punctual.', correctAnswer: 'on', choices: ['on', 'in', 'at', 'for'], grammarPoint: 'preposition + gerund', relatedVocab: ['punctual'] },
]

// ═══════════════════════════════════════════════════════════
//  C2 — Proficiency
// ═══════════════════════════════════════════════════════════
export const C2 = [
  // ── complex inversion ──
  { type: 'fill', sentence: 'Not only ___ he pass the exam, but he excelled.', correctAnswer: 'did', choices: ['did', 'does', 'has', 'was'], grammarPoint: 'inversion — not only', relatedVocab: ['exam'] },
  { type: 'fill', sentence: 'Under no circumstances ___ this information be disclosed.', correctAnswer: 'should', choices: ['should', 'would', 'could', 'will'], grammarPoint: 'inversion — under no circumstances', relatedVocab: ['information'] },
  { type: 'fill', sentence: 'At no point ___ I consider giving up.', correctAnswer: 'did', choices: ['did', 'do', 'was', 'have'], grammarPoint: 'inversion — at no point', relatedVocab: [] },
  { type: 'fill', sentence: 'On no account ___ you touch that equipment.', correctAnswer: 'must', choices: ['must', 'can', 'will', 'would'], grammarPoint: 'inversion — on no account', relatedVocab: ['equipment'] },
  { type: 'fill', sentence: 'In no way ___ this be considered acceptable.', correctAnswer: 'can', choices: ['can', 'does', 'is', 'has'], grammarPoint: 'inversion — in no way', relatedVocab: [] },
  { type: 'sentence', sentence: 'Which sentence is correct?', correctAnswer: 'So impressive was the performance that the audience gave a standing ovation.', choices: ['So impressive was the performance that the audience gave a standing ovation.', 'So impressive the performance was that the audience gave a standing ovation.', 'So the performance was impressive that the audience gave a standing ovation.', 'So impressive was the performance than the audience gave a standing ovation.'], grammarPoint: 'inversion — so...that', relatedVocab: ['performance'] },

  // ── advanced subjunctive ──
  { type: 'fill', sentence: 'It is imperative that the committee ___ immediately.', correctAnswer: 'convene', choices: ['convene', 'convenes', 'convened', 'convening'], grammarPoint: 'subjunctive', relatedVocab: ['committee'] },
  { type: 'fill', sentence: 'The board demanded that the CEO ___ his position.', correctAnswer: 'resign', choices: ['resign', 'resigns', 'resigned', 'resigning'], grammarPoint: 'subjunctive', relatedVocab: ['CEO'] },
  { type: 'fill', sentence: 'Be that ___ it may, we still need to address the issue.', correctAnswer: 'as', choices: ['as', 'how', 'what', 'like'], grammarPoint: 'subjunctive — fixed expression', relatedVocab: ['issue'] },
  { type: 'fill', sentence: 'If need ___, I will handle it personally.', correctAnswer: 'be', choices: ['be', 'is', 'was', 'been'], grammarPoint: 'subjunctive — fixed expression', relatedVocab: [] },

  // ── nominalization ──
  { type: 'fill', sentence: 'The ___ of the project was attributed to poor planning.', correctAnswer: 'failure', choices: ['failure', 'fail', 'failing', 'failed'], grammarPoint: 'nominalization', relatedVocab: ['project'] },
  { type: 'fill', sentence: 'The ___ of new employees has been postponed.', correctAnswer: 'recruitment', choices: ['recruitment', 'recruit', 'recruiting', 'recruited'], grammarPoint: 'nominalization', relatedVocab: ['employee'] },
  { type: 'fill', sentence: 'His ___ to the proposal surprised everyone.', correctAnswer: 'objection', choices: ['objection', 'object', 'objecting', 'objected'], grammarPoint: 'nominalization', relatedVocab: ['proposal'] },
  { type: 'fill', sentence: 'The ___ between the two parties has been ongoing for months.', correctAnswer: 'dispute', choices: ['dispute', 'disputing', 'disputed', 'disputes'], grammarPoint: 'nominalization', relatedVocab: ['party'] },

  // ── ellipsis & substitution ──
  { type: 'fill', sentence: 'She can play the piano, and her brother can ___.', correctAnswer: 'too', choices: ['too', 'also', 'either', 'neither'], grammarPoint: 'ellipsis', relatedVocab: ['piano'] },
  { type: 'fill', sentence: 'I\'d like to help, but I\'m afraid I\'m unable to ___.', correctAnswer: 'do so', choices: ['do so', 'do it', 'doing', 'did'], grammarPoint: 'substitution', relatedVocab: ['help'] },
  { type: 'fill', sentence: '"Will she attend?" "I believe ___.".', correctAnswer: 'so', choices: ['so', 'it', 'that', 'yes'], grammarPoint: 'substitution', relatedVocab: ['attend'] },
  { type: 'fill', sentence: 'He said he would finish the report, and ___ he did.', correctAnswer: 'so', choices: ['so', 'thus', 'then', 'such'], grammarPoint: 'substitution', relatedVocab: ['report'] },

  // ── nuanced modal usage ──
  { type: 'fill', sentence: 'She ___ have been more considerate. (criticism)', correctAnswer: 'could', choices: ['could', 'would', 'should', 'might'], grammarPoint: 'modal — criticism', relatedVocab: [] },
  { type: 'fill', sentence: 'He ___ not have taken the money. He is honest. (deduction)', correctAnswer: 'can', choices: ['can', 'could', 'should', 'would'], grammarPoint: 'modal — deduction', relatedVocab: ['money', 'honest'] },
  { type: 'fill', sentence: 'You ___ have told me earlier! (annoyance)', correctAnswer: 'might', choices: ['might', 'must', 'can', 'would'], grammarPoint: 'modal — annoyance', relatedVocab: [] },
  { type: 'fill', sentence: 'She ___ well be the next CEO. (strong possibility)', correctAnswer: 'may', choices: ['may', 'must', 'should', 'would'], grammarPoint: 'modal — may well', relatedVocab: ['CEO'] },
  { type: 'fill', sentence: 'They needn\'t ___ worried so much. It was fine.', correctAnswer: 'have', choices: ['have', 'had', 'has', 'be'], grammarPoint: 'needn\'t have + past participle', relatedVocab: [] },

  // ── discourse markers ──
  { type: 'fill', sentence: '___, the data suggests a downward trend.', correctAnswer: 'Furthermore', choices: ['Furthermore', 'However', 'Despite', 'Although'], grammarPoint: 'discourse markers', relatedVocab: ['data'] },
  { type: 'fill', sentence: 'The plan failed. ___, we learned valuable lessons.', correctAnswer: 'Nevertheless', choices: ['Nevertheless', 'Therefore', 'Furthermore', 'Moreover'], grammarPoint: 'discourse markers', relatedVocab: ['plan', 'lesson'] },
  { type: 'fill', sentence: 'The results were inconclusive; ___, more research is needed.', correctAnswer: 'consequently', choices: ['consequently', 'nevertheless', 'moreover', 'albeit'], grammarPoint: 'discourse markers', relatedVocab: ['research'] },
  { type: 'fill', sentence: 'It was, ___, the worst decision they could have made.', correctAnswer: 'arguably', choices: ['arguably', 'arguably not', 'actually', 'indeed'], grammarPoint: 'discourse markers', relatedVocab: ['decision'] },

  // ── advanced structures ──
  { type: 'fill', sentence: '___ it not for her support, I would have failed.', correctAnswer: 'Were', choices: ['Were', 'Was', 'Had', 'Should'], grammarPoint: 'inversion — conditional', relatedVocab: ['support'] },
  { type: 'fill', sentence: 'Try ___ he might, he couldn\'t open the jar.', correctAnswer: 'as', choices: ['as', 'like', 'how', 'though'], grammarPoint: 'concession — try as', relatedVocab: ['jar'] },
  { type: 'fill', sentence: 'Strange as it may ___, the story is true.', correctAnswer: 'seem', choices: ['seem', 'seems', 'seemed', 'seeming'], grammarPoint: 'concession — as it may', relatedVocab: ['story'] },
  { type: 'fill', sentence: 'The fact ___ he survived is remarkable.', correctAnswer: 'that', choices: ['that', 'which', 'what', 'how'], grammarPoint: 'noun clause', relatedVocab: ['survive'] },
  { type: 'fill', sentence: 'Not ___ did she win, she also broke the record.', correctAnswer: 'only', choices: ['only', 'just', 'merely', 'simply'], grammarPoint: 'not only...but also', relatedVocab: ['record'] },
  { type: 'fill', sentence: 'Scarcely ___ we arrived when the storm hit.', correctAnswer: 'had', choices: ['had', 'have', 'did', 'were'], grammarPoint: 'inversion — scarcely', relatedVocab: ['storm'] },
  { type: 'sentence', sentence: 'Which sentence is correct?', correctAnswer: 'Hardly had she finished speaking when the alarm went off.', choices: ['Hardly had she finished speaking when the alarm went off.', 'Hardly she had finished speaking when the alarm went off.', 'Hardly had she finished speaking than the alarm went off.', 'Hardly she finished speaking when the alarm went off.'], grammarPoint: 'inversion — hardly...when', relatedVocab: ['alarm'] },
  { type: 'fill', sentence: 'The proposal, controversial ___ it was, eventually passed.', correctAnswer: 'though', choices: ['though', 'although', 'despite', 'however'], grammarPoint: 'concession — adjective + though', relatedVocab: ['proposal'] },
  { type: 'fill', sentence: 'She is anything ___ stupid.', correctAnswer: 'but', choices: ['but', 'and', 'or', 'than'], grammarPoint: 'anything but', relatedVocab: [] },
  { type: 'fill', sentence: 'He ___ sooner resign than compromise his principles.', correctAnswer: 'would', choices: ['would', 'will', 'could', 'should'], grammarPoint: 'would sooner...than', relatedVocab: ['principle'] },
  { type: 'fill', sentence: 'There is no ___ that the economy is improving.', correctAnswer: 'denying', choices: ['denying', 'deny', 'denied', 'denial'], grammarPoint: 'there is no + gerund', relatedVocab: ['economy'] },
  { type: 'sentence', sentence: 'Which sentence is correct?', correctAnswer: 'Were it not for his generosity, the charity would have closed.', choices: ['Were it not for his generosity, the charity would have closed.', 'Were it not for his generosity, the charity will have closed.', 'Was it not for his generosity, the charity would have closed.', 'Were it not his generosity, the charity would have closed.'], grammarPoint: 'inversion — conditional', relatedVocab: ['charity'] },
  { type: 'fill', sentence: 'All things ___, the proposal is reasonable.', correctAnswer: 'considered', choices: ['considered', 'considering', 'consider', 'considers'], grammarPoint: 'participle clause', relatedVocab: ['proposal'] },
  { type: 'fill', sentence: '___ the circumstances, I think we did well.', correctAnswer: 'Given', choices: ['Given', 'Giving', 'Gave', 'Give'], grammarPoint: 'participle clause', relatedVocab: [] },
]

// ═══════════════════════════════════════════════════════════
//  Shared exports
// ═══════════════════════════════════════════════════════════

export const grammarByLevel = { A1, A2, B1, B2, C1, C2 }

export const GRAMMAR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

export const GRAMMAR_LEVEL_META = {
  A1: { name: 'Beginner', color: '#66bb6a', icon: 'sentiment_satisfied' },
  A2: { name: 'Elementary', color: '#42a5f5', icon: 'school' },
  B1: { name: 'Intermediate', color: '#ffa726', icon: 'psychology' },
  B2: { name: 'Upper-Intermediate', color: '#ef5350', icon: 'military_tech' },
  C1: { name: 'Advanced', color: '#ab47bc', icon: 'workspace_premium' },
  C2: { name: 'Proficiency', color: '#ec407a', icon: 'diamond' },
}

// ═══════════════════════════════════════════════════════════
//  Utility & generation functions
// ═══════════════════════════════════════════════════════════

function shuffleArray(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * Generate a single grammar question for a given CEFR level.
 * Returns a question object with shuffled choices.
 */
export function generateGrammarQuestion(level) {
  const pool = grammarByLevel[level]
  if (!pool || pool.length < 4) return null

  const q = pool[Math.floor(Math.random() * pool.length)]
  const shuffledChoices = shuffleArray(q.choices)

  return {
    type: q.type,
    sentence: q.sentence,
    correctAnswer: q.correctAnswer,
    choices: shuffledChoices,
    correctIndex: shuffledChoices.indexOf(q.correctAnswer),
    grammarPoint: q.grammarPoint,
    relatedVocab: q.relatedVocab,
  }
}

/**
 * Generate a batch of grammar questions for a game session.
 * Avoids repeating the same question within a batch.
 */
export function generateGrammarBatch(level, count = 50) {
  const pool = grammarByLevel[level]
  if (!pool || pool.length < 4) return []

  const shuffledPool = shuffleArray(pool)
  const questions = []

  for (let i = 0; i < Math.min(count, shuffledPool.length); i++) {
    const q = shuffledPool[i]
    const shuffledChoices = shuffleArray(q.choices)

    questions.push({
      type: q.type,
      sentence: q.sentence,
      correctAnswer: q.correctAnswer,
      choices: shuffledChoices,
      correctIndex: shuffledChoices.indexOf(q.correctAnswer),
      grammarPoint: q.grammarPoint,
      relatedVocab: q.relatedVocab,
    })
  }

  return questions
}

/**
 * Generate one question for the adaptive CEFR grammar test.
 * Avoids questions already used (tracked by `usedIds` Set of sentence strings).
 * Returns { question, questionKey } or null if pool exhausted.
 */
export function generateAdaptiveGrammarQuestion(level, usedIds = new Set()) {
  const pool = grammarByLevel[level]
  if (!pool || pool.length < 4) return null

  const available = pool.filter(q => !usedIds.has(q.sentence))
  if (available.length === 0) return null

  const q = available[Math.floor(Math.random() * available.length)]
  const shuffledChoices = shuffleArray(q.choices)

  return {
    question: {
      type: q.type,
      sentence: q.sentence,
      correctAnswer: q.correctAnswer,
      choices: shuffledChoices,
      correctIndex: shuffledChoices.indexOf(q.correctAnswer),
      grammarPoint: q.grammarPoint,
      relatedVocab: q.relatedVocab,
      level,
    },
    questionKey: q.sentence,
  }
}
