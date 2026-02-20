/**
 * CEFR Reading Comprehension Passage Bank
 *
 * 6 passages per CEFR level (A1-C2), 36 total.
 * Each passage includes the reading text and 3-4 multiple-choice
 * comprehension questions with exactly one correct answer.
 *
 * Passage object shape:
 * {
 *   id: string,              // unique identifier, e.g. 'a1-r-001'
 *   title: string,           // passage title
 *   passage: string,         // the reading text
 *   wordCount: number,       // approximate word count
 *   topic: string,           // thematic category
 *   questions: Array<{
 *     question: string,
 *     choices: string[],     // exactly 4 options
 *     correctAnswer: string, // must match one of the choices
 *   }>
 * }
 *
 * Exports:
 *   readingPassages        - object keyed by level (A1-C2), each an array of passages
 *   READING_LEVEL_META     - display metadata per level
 *   READING_LEVELS         - ordered array of level keys
 *   generateReadingBlock() - picks a random unused passage from a level
 */

export const READING_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

export const READING_LEVEL_META = {
  A1: { name: 'Beginner', color: '#66bb6a', icon: 'sentiment_satisfied' },
  A2: { name: 'Elementary', color: '#42a5f5', icon: 'school' },
  B1: { name: 'Intermediate', color: '#ffa726', icon: 'psychology' },
  B2: { name: 'Upper-Intermediate', color: '#ef5350', icon: 'military_tech' },
  C1: { name: 'Advanced', color: '#ab47bc', icon: 'workspace_premium' },
  C2: { name: 'Proficiency', color: '#ec407a', icon: 'diamond' },
}

// ═══════════════════════════════════════════════════════════
//  A1 — Beginner (50-80 words, 3 questions each)
// ═══════════════════════════════════════════════════════════

const A1 = [
  {
    id: 'a1-r-001',
    title: 'My Morning',
    passage: `I wake up at seven o'clock every day. I wash my face and brush my teeth. Then I eat breakfast. I like bread and milk for breakfast. After that, I walk to school. My school is near my house. It takes ten minutes. I like mornings because they are quiet and fresh.`,
    wordCount: 52,
    topic: 'daily routine',
    questions: [
      {
        question: 'What time does the person wake up?',
        choices: ['Six o\'clock', 'Seven o\'clock', 'Eight o\'clock', 'Nine o\'clock'],
        correctAnswer: 'Seven o\'clock',
      },
      {
        question: 'What does the person eat for breakfast?',
        choices: ['Rice and eggs', 'Bread and milk', 'Cereal and juice', 'Toast and tea'],
        correctAnswer: 'Bread and milk',
      },
      {
        question: 'How does the person go to school?',
        choices: ['By bus', 'By car', 'On foot', 'By bicycle'],
        correctAnswer: 'On foot',
      },
    ],
  },
  {
    id: 'a1-r-002',
    title: 'My Family',
    passage: `There are five people in my family. My father is a teacher. My mother works in a hospital. I have one brother and one sister. My brother is older than me. My sister is younger. We live in a small house with a garden. We are a happy family.`,
    wordCount: 50,
    topic: 'family',
    questions: [
      {
        question: 'How many people are in the family?',
        choices: ['Three', 'Four', 'Five', 'Six'],
        correctAnswer: 'Five',
      },
      {
        question: 'Where does the mother work?',
        choices: ['At a school', 'In a hospital', 'In an office', 'At a shop'],
        correctAnswer: 'In a hospital',
      },
      {
        question: 'What is true about the sister?',
        choices: ['She is the oldest', 'She is a teacher', 'She is younger than the writer', 'She does not live with the family'],
        correctAnswer: 'She is younger than the writer',
      },
    ],
  },
  {
    id: 'a1-r-003',
    title: 'The Weather Today',
    passage: `Today is Monday. It is sunny and warm. The sky is blue and there are no clouds. I am wearing a T-shirt and shorts. My friend Sara is wearing a dress. We are sitting in the park. We like sunny days. It is a very nice day.`,
    wordCount: 48,
    topic: 'weather',
    questions: [
      {
        question: 'What day is it?',
        choices: ['Sunday', 'Monday', 'Friday', 'Saturday'],
        correctAnswer: 'Monday',
      },
      {
        question: 'What is the weather like?',
        choices: ['Cold and rainy', 'Sunny and warm', 'Cloudy and windy', 'Snowy and cold'],
        correctAnswer: 'Sunny and warm',
      },
      {
        question: 'Where are the two friends?',
        choices: ['At school', 'At home', 'In the park', 'At the beach'],
        correctAnswer: 'In the park',
      },
    ],
  },
  {
    id: 'a1-r-004',
    title: 'At the Shop',
    passage: `I go to the shop near my house. I want to buy some food. I get apples, bananas, and bread. The apples are red and big. The bread is fresh. I pay five dollars. The shopkeeper is a friendly man. He says "Thank you" and I go home.`,
    wordCount: 51,
    topic: 'food',
    questions: [
      {
        question: 'What fruit does the person buy?',
        choices: ['Oranges and grapes', 'Apples and bananas', 'Pears and peaches', 'Mangoes and plums'],
        correctAnswer: 'Apples and bananas',
      },
      {
        question: 'How much does the person pay?',
        choices: ['Three dollars', 'Four dollars', 'Five dollars', 'Six dollars'],
        correctAnswer: 'Five dollars',
      },
      {
        question: 'What is the shopkeeper like?',
        choices: ['He is angry', 'He is friendly', 'He is quiet', 'He is busy'],
        correctAnswer: 'He is friendly',
      },
    ],
  },
  {
    id: 'a1-r-005',
    title: 'My Pet Dog',
    passage: `I have a dog. His name is Max. He is brown and white. Max is two years old. He likes to play with a ball in the garden. Every evening, I take him for a walk. He is very friendly. He likes other dogs and people. Max is my best friend.`,
    wordCount: 52,
    topic: 'daily life',
    questions: [
      {
        question: 'What is the dog\'s name?',
        choices: ['Buddy', 'Rex', 'Max', 'Sam'],
        correctAnswer: 'Max',
      },
      {
        question: 'What colour is the dog?',
        choices: ['Black and white', 'Brown and white', 'Brown and black', 'All white'],
        correctAnswer: 'Brown and white',
      },
      {
        question: 'When does the person walk the dog?',
        choices: ['Every morning', 'Every afternoon', 'Every evening', 'Every weekend'],
        correctAnswer: 'Every evening',
      },
    ],
  },
  {
    id: 'a1-r-006',
    title: 'My Classroom',
    passage: `My classroom is big. There are twenty desks and twenty chairs. The walls are white. There is a large board at the front. Our teacher, Mr. Lee, writes on the board every day. There are two windows in the room. I sit near the window. I can see trees from my desk.`,
    wordCount: 52,
    topic: 'daily life',
    questions: [
      {
        question: 'How many desks are in the classroom?',
        choices: ['Ten', 'Fifteen', 'Twenty', 'Thirty'],
        correctAnswer: 'Twenty',
      },
      {
        question: 'What colour are the walls?',
        choices: ['Blue', 'Yellow', 'Green', 'White'],
        correctAnswer: 'White',
      },
      {
        question: 'What can the writer see from the desk?',
        choices: ['A park', 'Trees', 'Cars', 'A river'],
        correctAnswer: 'Trees',
      },
    ],
  },
]

// ═══════════════════════════════════════════════════════════
//  A2 — Elementary (80-120 words, 3 questions each)
// ═══════════════════════════════════════════════════════════

const A2 = [
  {
    id: 'a2-r-001',
    title: 'A Weekend Trip',
    passage: `Last Saturday, my family went to the beach. We left early in the morning and arrived before lunch. The water was clean and blue. My brother and I swam in the sea while our parents relaxed under an umbrella. After swimming, we built a sandcastle together. For lunch, we ate fish and chips from a small restaurant near the beach. In the afternoon, we walked along the shore and collected shells. We were tired but happy when we drove home in the evening.`,
    wordCount: 82,
    topic: 'travel',
    questions: [
      {
        question: 'When did the family go to the beach?',
        choices: ['Last Friday', 'Last Saturday', 'Last Sunday', 'Last Monday'],
        correctAnswer: 'Last Saturday',
      },
      {
        question: 'What did the parents do while the children swam?',
        choices: ['They also swam', 'They played volleyball', 'They relaxed under an umbrella', 'They went for a walk'],
        correctAnswer: 'They relaxed under an umbrella',
      },
      {
        question: 'How did the family probably feel at the end of the day?',
        choices: ['Bored and sad', 'Tired but happy', 'Angry and hungry', 'Excited and energetic'],
        correctAnswer: 'Tired but happy',
      },
    ],
  },
  {
    id: 'a2-r-002',
    title: 'Anna\'s New Hobby',
    passage: `Anna started painting three months ago. She takes a class every Wednesday evening at the community centre. Her teacher, Mrs. Rivera, says she is learning quickly. Anna likes painting landscapes best, especially mountains and lakes. She uses watercolour paints because they are easy to mix. Last week, she finished her first big painting. It was a picture of a sunset over a lake. Her friends liked it very much. Anna wants to sell some of her paintings at the local market next month.`,
    wordCount: 85,
    topic: 'hobbies',
    questions: [
      {
        question: 'How long has Anna been painting?',
        choices: ['One month', 'Two months', 'Three months', 'Six months'],
        correctAnswer: 'Three months',
      },
      {
        question: 'What kind of paintings does Anna prefer?',
        choices: ['Portraits', 'Abstract art', 'Landscapes', 'Still life'],
        correctAnswer: 'Landscapes',
      },
      {
        question: 'What does Anna plan to do with her paintings?',
        choices: ['Give them to her teacher', 'Hang them at school', 'Sell them at the local market', 'Send them to a gallery'],
        correctAnswer: 'Sell them at the local market',
      },
    ],
  },
  {
    id: 'a2-r-003',
    title: 'An Email to a Friend',
    passage: `Hi Tom,

How are you? I am writing to tell you about my new flat. I moved last week. The flat is on the third floor of a building in Park Street. It has two bedrooms, a kitchen, and a small living room. The best thing is the balcony. I can see the park from there. The neighbours are quiet and friendly. The only problem is that the kitchen is very small. Would you like to visit me next weekend? We can have lunch together.

See you soon,
Maria`,
    wordCount: 93,
    topic: 'simple emails',
    questions: [
      {
        question: 'Why is Maria writing to Tom?',
        choices: ['To ask about his holiday', 'To tell him about her new flat', 'To invite him to a party', 'To ask for help with moving'],
        correctAnswer: 'To tell him about her new flat',
      },
      {
        question: 'What does Maria like most about the flat?',
        choices: ['The big kitchen', 'The two bedrooms', 'The balcony', 'The friendly neighbours'],
        correctAnswer: 'The balcony',
      },
      {
        question: 'What is the problem with the flat?',
        choices: ['The neighbours are noisy', 'The kitchen is very small', 'There is no balcony', 'It is far from the park'],
        correctAnswer: 'The kitchen is very small',
      },
    ],
  },
  {
    id: 'a2-r-004',
    title: 'At the Doctor',
    passage: `Ben did not feel well yesterday. He had a headache and a sore throat. This morning, he went to the doctor. The doctor asked him some questions and checked his temperature. His temperature was a little high. The doctor told him he had a cold and should rest at home for two days. She also gave him some medicine to take three times a day after meals. Ben thanked the doctor and went to the pharmacy to get his medicine. He hopes to feel better soon.`,
    wordCount: 87,
    topic: 'health',
    questions: [
      {
        question: 'What symptoms did Ben have?',
        choices: ['A cough and fever', 'A headache and sore throat', 'A stomachache and cough', 'Back pain and fever'],
        correctAnswer: 'A headache and sore throat',
      },
      {
        question: 'How long should Ben rest at home?',
        choices: ['One day', 'Two days', 'Three days', 'One week'],
        correctAnswer: 'Two days',
      },
      {
        question: 'When should Ben take his medicine?',
        choices: ['Before breakfast only', 'Before sleeping', 'Three times a day after meals', 'Once in the morning'],
        correctAnswer: 'Three times a day after meals',
      },
    ],
  },
  {
    id: 'a2-r-005',
    title: 'Shopping for Clothes',
    passage: `Lisa went to the shopping centre on Saturday. She wanted to buy a new dress for her friend's birthday party. She looked in three different shops. The first shop had nice dresses, but they were too expensive. The second shop did not have her size. In the third shop, she found a beautiful blue dress that was on sale. It cost thirty dollars instead of fifty. Lisa was very pleased. She also bought a pair of silver earrings to match the dress.`,
    wordCount: 82,
    topic: 'shopping',
    questions: [
      {
        question: 'Why did Lisa want a new dress?',
        choices: ['For a job interview', 'For her birthday', 'For a friend\'s birthday party', 'For a school event'],
        correctAnswer: 'For a friend\'s birthday party',
      },
      {
        question: 'Why didn\'t Lisa buy from the first shop?',
        choices: ['The dresses were ugly', 'They were too expensive', 'They didn\'t have blue dresses', 'The shop was closed'],
        correctAnswer: 'They were too expensive',
      },
      {
        question: 'How much did Lisa pay for the dress?',
        choices: ['Twenty dollars', 'Thirty dollars', 'Forty dollars', 'Fifty dollars'],
        correctAnswer: 'Thirty dollars',
      },
    ],
  },
  {
    id: 'a2-r-006',
    title: 'My Favourite Season',
    passage: `My favourite season is autumn. The weather is cool and comfortable. I don't need heavy winter clothes, just a light jacket. The leaves change colour to red, orange, and yellow. I think it is the most beautiful time of the year. In autumn, I like to go hiking in the forest near my town. The air smells fresh, and the paths are covered with colourful leaves. I also enjoy drinking hot chocolate after my walks. Autumn makes me feel calm and happy.`,
    wordCount: 82,
    topic: 'daily life',
    questions: [
      {
        question: 'What season does the writer like best?',
        choices: ['Spring', 'Summer', 'Autumn', 'Winter'],
        correctAnswer: 'Autumn',
      },
      {
        question: 'What does the writer do in autumn?',
        choices: ['Goes swimming', 'Goes hiking', 'Goes skiing', 'Goes fishing'],
        correctAnswer: 'Goes hiking',
      },
      {
        question: 'How does the writer feel during autumn?',
        choices: ['Excited and busy', 'Sad and lonely', 'Calm and happy', 'Tired and bored'],
        correctAnswer: 'Calm and happy',
      },
    ],
  },
]

// ═══════════════════════════════════════════════════════════
//  B1 — Intermediate (120-200 words, 4 questions each)
// ═══════════════════════════════════════════════════════════

const B1 = [
  {
    id: 'b1-r-001',
    title: 'Working from Home',
    passage: `In recent years, working from home has become much more common. Many companies now allow their employees to work remotely at least a few days a week. There are several advantages to this arrangement. Workers save time because they do not need to travel to an office. They can also organise their day more freely and take breaks when they need to. However, working from home is not perfect. Some people find it difficult to concentrate because of distractions at home, such as noise from family members or the temptation to watch television. Others feel lonely because they miss talking to colleagues face to face. Experts suggest that a combination of home and office work may be the best solution. This allows people to enjoy the flexibility of remote work while still having regular contact with their team.`,
    wordCount: 136,
    topic: 'career',
    questions: [
      {
        question: 'According to the passage, what is one advantage of working from home?',
        choices: ['Employees earn more money', 'Workers save travel time', 'Companies can hire fewer people', 'Workers get longer holidays'],
        correctAnswer: 'Workers save travel time',
      },
      {
        question: 'What problem do some home workers have?',
        choices: ['They work too many hours', 'They cannot use technology properly', 'They find it hard to concentrate', 'They do not like their jobs'],
        correctAnswer: 'They find it hard to concentrate',
      },
      {
        question: 'What do experts recommend?',
        choices: ['Everyone should work from home', 'People should always work in an office', 'A mix of home and office work is best', 'Companies should close their offices'],
        correctAnswer: 'A mix of home and office work is best',
      },
      {
        question: 'What is the main idea of this passage?',
        choices: ['Working from home has only benefits', 'Remote work has advantages and disadvantages', 'Offices are no longer needed', 'Most people prefer working in an office'],
        correctAnswer: 'Remote work has advantages and disadvantages',
      },
    ],
  },
  {
    id: 'b1-r-002',
    title: 'Plastic in the Ocean',
    passage: `Every year, millions of tonnes of plastic waste end up in the world's oceans. This pollution is a serious threat to marine life. Sea animals such as turtles and fish sometimes eat small pieces of plastic because they look like food. This can make them very sick or even kill them. Plastic waste also damages coral reefs and pollutes beaches. Many countries are now trying to reduce the amount of plastic they produce. Some have banned single-use plastic bags and bottles. Environmental groups encourage people to recycle more and to use reusable shopping bags and water bottles. Scientists are also developing new materials that break down more easily in nature. Although progress is being made, solving the problem of ocean plastic will require effort from governments, businesses, and ordinary people around the world.`,
    wordCount: 133,
    topic: 'environment',
    questions: [
      {
        question: 'Why do sea animals eat plastic?',
        choices: ['They are very hungry', 'It looks like food to them', 'They cannot find other food', 'Humans feed it to them'],
        correctAnswer: 'It looks like food to them',
      },
      {
        question: 'What have some countries done to help?',
        choices: ['Closed all factories', 'Stopped fishing completely', 'Banned single-use plastic items', 'Built more beaches'],
        correctAnswer: 'Banned single-use plastic items',
      },
      {
        question: 'What are scientists working on?',
        choices: ['Machines to clean the ocean', 'Ways to make fish stronger', 'Materials that break down more easily', 'New types of plastic bags'],
        correctAnswer: 'Materials that break down more easily',
      },
      {
        question: 'What does the author believe is needed to solve the problem?',
        choices: ['Only governments need to act', 'Only scientists can fix it', 'Effort from many different groups', 'People should stop going to the beach'],
        correctAnswer: 'Effort from many different groups',
      },
    ],
  },
  {
    id: 'b1-r-003',
    title: 'A Travel Blog: Lisbon',
    passage: `I visited Lisbon last spring and fell in love with the city. The first thing I noticed was the light. Lisbon has a warm, golden light that makes everything look beautiful, especially in the late afternoon. I spent three days exploring the old neighbourhoods, riding the famous yellow trams, and eating delicious pastries called pasteis de nata. One of my favourite places was the Alfama district, with its narrow streets and traditional fado music coming from small restaurants. I also took a day trip to Sintra, a small town about thirty minutes from Lisbon by train. The palaces and gardens there were incredible. What surprised me most about Lisbon was how affordable it was compared to other European capitals. I would definitely recommend it to anyone looking for a city break that combines history, culture, and great food.`,
    wordCount: 143,
    topic: 'travel',
    questions: [
      {
        question: 'What is the first thing the writer noticed about Lisbon?',
        choices: ['The food', 'The music', 'The light', 'The people'],
        correctAnswer: 'The light',
      },
      {
        question: 'What are pasteis de nata?',
        choices: ['A type of music', 'A type of tram', 'A type of pastry', 'A type of street'],
        correctAnswer: 'A type of pastry',
      },
      {
        question: 'How long does it take to get to Sintra from Lisbon by train?',
        choices: ['About ten minutes', 'About thirty minutes', 'About one hour', 'About two hours'],
        correctAnswer: 'About thirty minutes',
      },
      {
        question: 'What surprised the writer about Lisbon?',
        choices: ['It was very crowded', 'It was quite affordable', 'It was hard to find food', 'The trams were uncomfortable'],
        correctAnswer: 'It was quite affordable',
      },
    ],
  },
  {
    id: 'b1-r-004',
    title: 'The Rise of Online Learning',
    passage: `Online learning has grown rapidly in the past few years. Platforms like Coursera and Khan Academy offer thousands of courses on subjects from programming to history. Students can learn at their own pace and choose when to study, which makes online education very flexible. Many people who work full-time find this especially useful because they can study in the evenings or at weekends. On the other hand, online learning requires strong self-discipline. Without a teacher physically present, some students lose motivation and stop before finishing their course. Another concern is that practical subjects, such as medicine or engineering, are difficult to learn fully through a screen. Despite these challenges, most educators agree that online learning will continue to play an important role in education, particularly as technology improves and more interactive tools become available.`,
    wordCount: 137,
    topic: 'technology',
    questions: [
      {
        question: 'Why is online learning popular with working people?',
        choices: ['It is free', 'They can choose when to study', 'Their employer pays for it', 'Courses are shorter'],
        correctAnswer: 'They can choose when to study',
      },
      {
        question: 'What is one problem with online learning?',
        choices: ['There are not enough courses', 'It costs too much money', 'Some students lose motivation', 'It is only available in English'],
        correctAnswer: 'Some students lose motivation',
      },
      {
        question: 'Which subjects are hard to learn fully online?',
        choices: ['History and art', 'Languages and music', 'Medicine and engineering', 'Business and marketing'],
        correctAnswer: 'Medicine and engineering',
      },
      {
        question: 'What is the author\'s overall view of online learning?',
        choices: ['It will replace all schools', 'It is a waste of time', 'It will remain important in education', 'It is only useful for young people'],
        correctAnswer: 'It will remain important in education',
      },
    ],
  },
  {
    id: 'b1-r-005',
    title: 'Sleep and Health',
    passage: `Getting enough sleep is essential for good health, but many people do not realise how much it affects their daily life. Adults need between seven and nine hours of sleep each night. When people sleep less than this regularly, they may have trouble concentrating, feel irritable, and even get sick more often. Research has shown that lack of sleep can weaken the immune system and increase the risk of heart disease. Despite knowing the importance of sleep, many people stay up late using their phones or watching television. Doctors recommend putting away electronic devices at least thirty minutes before bedtime and keeping the bedroom dark and quiet. Establishing a regular sleep schedule, where you go to bed and wake up at the same time every day, can also help improve the quality of your sleep significantly.`,
    wordCount: 139,
    topic: 'health',
    questions: [
      {
        question: 'How many hours of sleep do adults need each night?',
        choices: ['Five to six', 'Six to seven', 'Seven to nine', 'Nine to eleven'],
        correctAnswer: 'Seven to nine',
      },
      {
        question: 'What can happen when people do not sleep enough?',
        choices: ['They eat more food', 'They feel happier', 'Their immune system gets weaker', 'They become more creative'],
        correctAnswer: 'Their immune system gets weaker',
      },
      {
        question: 'What do doctors suggest doing before bedtime?',
        choices: ['Exercising for one hour', 'Reading the news online', 'Putting away electronic devices', 'Drinking a cup of coffee'],
        correctAnswer: 'Putting away electronic devices',
      },
      {
        question: 'What does the passage say about sleep schedules?',
        choices: ['They are not important', 'Going to bed at the same time helps', 'Only children need them', 'Weekends should have different schedules'],
        correctAnswer: 'Going to bed at the same time helps',
      },
    ],
  },
  {
    id: 'b1-r-006',
    title: 'Local News: New Library Opens',
    passage: `A brand new public library opened in the centre of Greenfield last Monday. The modern building has three floors and contains over fifty thousand books in various languages. In addition to books, the library offers free internet access, a children's reading area, and several meeting rooms that local groups can reserve. The mayor, Mrs. Chen, gave a speech at the opening ceremony and said she hoped the library would become the heart of the community. During the first week, more than two thousand people visited. The head librarian, Mr. Ortiz, told reporters that the most popular section so far has been the children's area. He also mentioned that the library will host free workshops on topics such as creative writing and digital skills. The library is open from nine in the morning until eight in the evening, Monday to Saturday.`,
    wordCount: 144,
    topic: 'news',
    questions: [
      {
        question: 'When did the library open?',
        choices: ['Last Friday', 'Last Monday', 'Last Wednesday', 'Last Saturday'],
        correctAnswer: 'Last Monday',
      },
      {
        question: 'How many books does the library have?',
        choices: ['Over ten thousand', 'Over twenty thousand', 'Over fifty thousand', 'Over one hundred thousand'],
        correctAnswer: 'Over fifty thousand',
      },
      {
        question: 'Which section has been the most popular?',
        choices: ['The meeting rooms', 'The internet area', 'The children\'s area', 'The workshop space'],
        correctAnswer: 'The children\'s area',
      },
      {
        question: 'What did the mayor hope the library would become?',
        choices: ['A tourist attraction', 'The heart of the community', 'A place for students only', 'A technology centre'],
        correctAnswer: 'The heart of the community',
      },
    ],
  },
]

// ═══════════════════════════════════════════════════════════
//  B2 — Upper-Intermediate (200-300 words, 4 questions each)
// ═══════════════════════════════════════════════════════════

const B2 = [
  {
    id: 'b2-r-001',
    title: 'The Psychology of First Impressions',
    passage: `Research in social psychology has consistently shown that first impressions are formed within the first few seconds of meeting someone. These initial judgements are based on a variety of cues, including physical appearance, body language, and tone of voice. What is particularly striking is how persistent these impressions tend to be. Once we have formed an opinion about someone, we often interpret their subsequent behaviour in a way that confirms our initial assessment, a phenomenon known as confirmation bias.

This has significant implications in professional settings. Studies have demonstrated that job interviewers frequently make their decision about a candidate within the first four minutes of an interview, spending the remaining time looking for evidence to support that initial feeling. Similarly, teachers may form expectations about students early in the school year that influence how they grade their work.

However, psychologists emphasise that first impressions can be misleading. People who are shy, for example, may come across as cold or uninterested, when in reality they are simply nervous. Cultural differences can also lead to misunderstandings, as norms around eye contact, personal space, and greetings vary widely across societies. Being aware of these biases can help us make more fair and accurate judgements about the people we meet.`,
    wordCount: 196,
    topic: 'social issues',
    questions: [
      {
        question: 'What is "confirmation bias" as described in the passage?',
        choices: ['Judging someone by their appearance alone', 'Interpreting behaviour to confirm an initial impression', 'Forming an impression in the first few seconds', 'Changing your opinion after learning new information'],
        correctAnswer: 'Interpreting behaviour to confirm an initial impression',
      },
      {
        question: 'According to the passage, how quickly do job interviewers often decide about a candidate?',
        choices: ['In the first thirty seconds', 'Within the first four minutes', 'After asking all the questions', 'At the end of the interview'],
        correctAnswer: 'Within the first four minutes',
      },
      {
        question: 'Why might a shy person be misjudged?',
        choices: ['They talk too much', 'They may seem cold when they are actually nervous', 'They avoid cultural norms intentionally', 'They have poor body language training'],
        correctAnswer: 'They may seem cold when they are actually nervous',
      },
      {
        question: 'What is the main message of the final paragraph?',
        choices: ['First impressions are always correct', 'We should avoid meeting new people', 'Awareness of biases leads to fairer judgements', 'Cultural differences do not matter'],
        correctAnswer: 'Awareness of biases leads to fairer judgements',
      },
    ],
  },
  {
    id: 'b2-r-002',
    title: 'Renewable Energy: Progress and Challenges',
    passage: `The global transition towards renewable energy has accelerated dramatically over the past decade. Solar and wind power now account for a growing share of electricity generation in many countries, driven by falling costs and increasing environmental awareness. In some regions, renewable energy is already cheaper than fossil fuels, making it an economically attractive option as well as an environmentally responsible one.

Despite this progress, significant challenges remain. One of the most pressing issues is energy storage. Solar panels only generate electricity when the sun is shining, and wind turbines only work when there is sufficient wind. Without effective storage solutions, such as advanced batteries, it is difficult to ensure a reliable supply of electricity at all times. Current battery technology, while improving, is still expensive and has a limited lifespan.

Another challenge is the infrastructure required to distribute renewable energy. Many existing power grids were designed for centralised fossil fuel plants and need substantial upgrades to handle the decentralised nature of renewable sources. Additionally, the production of solar panels and batteries requires mining rare minerals, which raises its own environmental and ethical concerns. Nevertheless, most energy experts remain optimistic that continued investment in research and development will overcome these obstacles within the coming decades.`,
    wordCount: 196,
    topic: 'science',
    questions: [
      {
        question: 'What has driven the growth of renewable energy?',
        choices: ['Government mandates alone', 'Falling costs and environmental awareness', 'The discovery of new energy sources', 'A decrease in electricity demand'],
        correctAnswer: 'Falling costs and environmental awareness',
      },
      {
        question: 'What is described as one of the most pressing issues?',
        choices: ['Public opposition to wind farms', 'Energy storage', 'A shortage of engineers', 'Rising costs of solar panels'],
        correctAnswer: 'Energy storage',
      },
      {
        question: 'Why do power grids need upgrades?',
        choices: ['They are too old to carry electricity', 'They were designed for centralised fossil fuel plants', 'Renewable energy uses more electricity', 'Batteries cannot connect to grids'],
        correctAnswer: 'They were designed for centralised fossil fuel plants',
      },
      {
        question: 'What concern is raised about solar panel production?',
        choices: ['Panels are too heavy to transport', 'It requires mining rare minerals', 'There are not enough factories', 'The technology is patented'],
        correctAnswer: 'It requires mining rare minerals',
      },
    ],
  },
  {
    id: 'b2-r-003',
    title: 'The Changing Face of Education',
    passage: `Traditional education systems, built around lectures, textbooks, and standardised exams, are increasingly being questioned by educators and students alike. Critics argue that this model, which was designed during the industrial age to produce compliant workers, fails to develop the skills most needed in the modern economy: creativity, critical thinking, and adaptability.

In response, a number of schools and universities worldwide have begun experimenting with alternative approaches. Project-based learning, for instance, encourages students to work in teams on real-world problems rather than memorising facts for tests. Finland, often cited as a leader in educational reform, has restructured its curriculum around interdisciplinary topics, allowing students to explore subjects like climate change or urbanisation from scientific, economic, and social perspectives simultaneously.

Technology has also opened up new possibilities. Artificial intelligence can now personalise learning paths for individual students, identifying their strengths and weaknesses and adjusting the difficulty of tasks accordingly. Virtual reality allows students to take field trips to historical sites or explore the human body from the inside. Despite these innovations, some educators caution that technology should complement rather than replace human teachers, whose role in inspiring and mentoring students remains irreplaceable. The challenge lies in finding the right balance between tradition and innovation.`,
    wordCount: 197,
    topic: 'education',
    questions: [
      {
        question: 'What criticism is made of traditional education?',
        choices: ['It is too expensive', 'It fails to develop creativity and critical thinking', 'It uses too much technology', 'It does not have enough exams'],
        correctAnswer: 'It fails to develop creativity and critical thinking',
      },
      {
        question: 'What approach has Finland taken?',
        choices: ['Removed all exams permanently', 'Focused only on science education', 'Restructured the curriculum around interdisciplinary topics', 'Replaced teachers with artificial intelligence'],
        correctAnswer: 'Restructured the curriculum around interdisciplinary topics',
      },
      {
        question: 'How can AI help in education according to the passage?',
        choices: ['By replacing textbooks entirely', 'By personalising learning for each student', 'By grading exams automatically', 'By teaching classes online'],
        correctAnswer: 'By personalising learning for each student',
      },
      {
        question: 'What do some educators caution about technology?',
        choices: ['It is too difficult for students to use', 'It should complement, not replace, human teachers', 'It is too expensive for most schools', 'It makes students less creative'],
        correctAnswer: 'It should complement, not replace, human teachers',
      },
    ],
  },
  {
    id: 'b2-r-004',
    title: 'Urban Green Spaces and Mental Health',
    passage: `As cities continue to grow and become more densely populated, researchers have turned their attention to the impact of urban green spaces on residents' mental health. A growing body of evidence suggests that access to parks, gardens, and tree-lined streets can significantly reduce stress, anxiety, and symptoms of depression. A landmark study conducted in Denmark, which tracked over nine hundred thousand people over several decades, found that children who grew up in areas with more green space had a considerably lower risk of developing mental health disorders later in life.

The mechanisms behind this relationship are thought to be both physiological and psychological. Spending time in nature has been shown to lower cortisol levels, the body's primary stress hormone, and to reduce heart rate and blood pressure. Psychologically, green spaces provide opportunities for social interaction, physical exercise, and a sense of escape from the noise and pace of urban living.

Despite these well-documented benefits, green spaces are not equally distributed within cities. Wealthier neighbourhoods tend to have more parks and trees, while lower-income areas often lack adequate green infrastructure. Urban planners are increasingly recognising this disparity and calling for more equitable distribution of green spaces as a matter of public health.`,
    wordCount: 200,
    topic: 'social issues',
    questions: [
      {
        question: 'What did the Danish study find?',
        choices: ['Adults prefer living near parks', 'Children near green spaces had lower risk of mental health disorders', 'Green spaces reduce air pollution significantly', 'Urban populations are growing faster than expected'],
        correctAnswer: 'Children near green spaces had lower risk of mental health disorders',
      },
      {
        question: 'What happens to cortisol levels when people spend time in nature?',
        choices: ['They increase', 'They stay the same', 'They decrease', 'They fluctuate unpredictably'],
        correctAnswer: 'They decrease',
      },
      {
        question: 'What inequality does the passage highlight?',
        choices: ['Rich and poor countries have different climates', 'Wealthier areas have more green spaces than poorer areas', 'Children have less access to parks than adults', 'Rural areas have fewer trees than cities'],
        correctAnswer: 'Wealthier areas have more green spaces than poorer areas',
      },
      {
        question: 'What are urban planners calling for?',
        choices: ['Building more hospitals', 'Reducing the size of cities', 'More equitable distribution of green spaces', 'Limiting population growth'],
        correctAnswer: 'More equitable distribution of green spaces',
      },
    ],
  },
  {
    id: 'b2-r-005',
    title: 'The Business of Fast Fashion',
    passage: `Fast fashion refers to the rapid production of inexpensive clothing that replicates current trends. Brands like Zara and H&M have built their success on the ability to move designs from the runway to store shelves in a matter of weeks. Consumers are drawn to these brands because they offer trendy clothing at low prices, allowing them to refresh their wardrobes frequently without spending a fortune.

However, the environmental and social costs of fast fashion are becoming increasingly difficult to ignore. The fashion industry is one of the world's largest polluters, responsible for approximately ten percent of global carbon emissions. The production process consumes vast quantities of water and often involves toxic chemicals that pollute rivers and soil. Furthermore, garment workers in developing countries frequently endure poor working conditions, long hours, and extremely low wages.

A growing counter-movement known as "slow fashion" encourages consumers to buy fewer, higher-quality garments and to support brands that prioritise ethical manufacturing. Some companies have introduced clothing rental and resale platforms, while others are investing in sustainable materials such as organic cotton and recycled polyester. Changing consumer habits, however, remains the greatest challenge, as the convenience and affordability of fast fashion continue to appeal to a broad audience.`,
    wordCount: 199,
    topic: 'business',
    questions: [
      {
        question: 'What makes fast fashion appealing to consumers?',
        choices: ['High quality materials', 'Trendy clothing at low prices', 'Unique handmade designs', 'Long-lasting garments'],
        correctAnswer: 'Trendy clothing at low prices',
      },
      {
        question: 'What percentage of global carbon emissions comes from the fashion industry?',
        choices: ['Approximately five percent', 'Approximately ten percent', 'Approximately twenty percent', 'Approximately thirty percent'],
        correctAnswer: 'Approximately ten percent',
      },
      {
        question: 'What does "slow fashion" encourage?',
        choices: ['Buying more clothes at lower prices', 'Wearing the same outfit every day', 'Buying fewer, higher-quality garments', 'Avoiding all clothing brands'],
        correctAnswer: 'Buying fewer, higher-quality garments',
      },
      {
        question: 'According to the passage, what is the greatest challenge?',
        choices: ['Finding sustainable materials', 'Changing consumer habits', 'Training garment workers', 'Reducing production speed'],
        correctAnswer: 'Changing consumer habits',
      },
    ],
  },
  {
    id: 'b2-r-006',
    title: 'Bilingualism and the Brain',
    passage: `For much of the twentieth century, bilingualism was viewed with suspicion in many Western countries. Parents were often advised that raising children with two languages would confuse them and delay their cognitive development. However, decades of research have thoroughly debunked this myth. Not only does bilingualism cause no harm, but it actually appears to confer several cognitive advantages.

Studies have shown that bilingual individuals tend to outperform monolinguals on tasks requiring attention control and cognitive flexibility. This is thought to result from the constant need to manage two language systems, suppressing one while using the other. This mental juggling acts as a form of brain training that strengthens executive function, the set of cognitive processes responsible for planning, problem-solving, and multitasking.

Perhaps most remarkably, research suggests that bilingualism may delay the onset of dementia by several years. A study of over six hundred patients diagnosed with Alzheimer's disease found that those who had spoken two or more languages throughout their lives developed symptoms an average of four to five years later than monolingual patients. While bilingualism is certainly not a cure for neurodegenerative diseases, it appears to build cognitive reserves that help the brain compensate for age-related decline.`,
    wordCount: 198,
    topic: 'science',
    questions: [
      {
        question: 'What was the old belief about bilingualism?',
        choices: ['It made children smarter', 'It confused children and delayed development', 'It had no effect on the brain', 'It improved physical health'],
        correctAnswer: 'It confused children and delayed development',
      },
      {
        question: 'Why do bilingual people perform well on attention tasks?',
        choices: ['They read more books', 'They have larger brains', 'They constantly manage two language systems', 'They receive better education'],
        correctAnswer: 'They constantly manage two language systems',
      },
      {
        question: 'What did the Alzheimer\'s study find?',
        choices: ['Bilingual patients recovered faster', 'Bilingual patients developed symptoms four to five years later', 'Monolingual patients had milder symptoms', 'Language ability had no effect on the disease'],
        correctAnswer: 'Bilingual patients developed symptoms four to five years later',
      },
      {
        question: 'What is the author\'s overall conclusion about bilingualism?',
        choices: ['It is harmful to children', 'It cures neurodegenerative diseases', 'It provides cognitive advantages and protection', 'It only benefits people who learn languages as adults'],
        correctAnswer: 'It provides cognitive advantages and protection',
      },
    ],
  },
]

// ═══════════════════════════════════════════════════════════
//  C1 — Advanced (300-400 words, 4 questions each)
// ═══════════════════════════════════════════════════════════

const C1 = [
  {
    id: 'c1-r-001',
    title: 'The Ethics of Artificial Intelligence',
    passage: `As artificial intelligence systems become increasingly integrated into decision-making processes that directly affect human lives, the ethical implications of their deployment demand urgent and rigorous examination. From automated hiring tools that screen job applicants to algorithms that determine prison sentences, AI is quietly reshaping the boundaries between human judgement and machine logic.

One of the most contentious issues is algorithmic bias. Because AI systems learn from historical data, they inevitably absorb the biases present in that data. For instance, a hiring algorithm trained on a company's past recruitment decisions may systematically disadvantage women or minorities if those groups were historically underrepresented. The opacity of many AI models, often described as "black boxes," compounds this problem: even the engineers who build them may struggle to explain precisely how a particular decision was reached.

Proponents of AI argue that algorithms, when properly designed, can actually reduce human bias by applying consistent criteria to every case. A well-calibrated sentencing algorithm, they contend, might be fairer than a human judge whose decisions are influenced by fatigue, mood, or unconscious prejudice. However, critics counter that delegating morally significant decisions to machines risks creating an illusion of objectivity that obscures the subjective choices embedded in the system's design, from the selection of training data to the definition of what constitutes a desirable outcome.

The regulatory landscape remains fragmented. The European Union has proposed legislation requiring transparency and human oversight for high-risk AI applications, while other jurisdictions have adopted a more permissive approach, prioritising innovation over precaution. What is clear is that the conversation about AI ethics can no longer be confined to academic circles. As these systems become more powerful and pervasive, societies must grapple collectively with fundamental questions about accountability, fairness, and the values we choose to encode in our technology.`,
    wordCount: 272,
    topic: 'AI ethics',
    questions: [
      {
        question: 'What does the term "black boxes" refer to in this context?',
        choices: ['Physical hardware components of AI systems', 'AI models whose decision-making processes are opaque', 'Devices used to record AI failures', 'Secure storage systems for AI training data'],
        correctAnswer: 'AI models whose decision-making processes are opaque',
      },
      {
        question: 'According to proponents of AI, how might algorithms reduce bias?',
        choices: ['By eliminating the need for any criteria', 'By applying consistent standards to all cases', 'By replacing all human judges immediately', 'By using only the most recent data'],
        correctAnswer: 'By applying consistent standards to all cases',
      },
      {
        question: 'What do critics argue about delegating decisions to machines?',
        choices: ['Machines always produce fair outcomes', 'It eliminates all forms of prejudice', 'It creates an illusion of objectivity hiding subjective design choices', 'It is only a problem in the justice system'],
        correctAnswer: 'It creates an illusion of objectivity hiding subjective design choices',
      },
      {
        question: 'What does the passage imply about the future of AI regulation?',
        choices: ['All countries will soon adopt identical regulations', 'The issue needs broad societal engagement, not just academic discussion', 'Regulation will inevitably stifle innovation', 'The European Union opposes all AI regulation'],
        correctAnswer: 'The issue needs broad societal engagement, not just academic discussion',
      },
    ],
  },
  {
    id: 'c1-r-002',
    title: 'The Paradox of Choice in Consumer Culture',
    passage: `In his influential work "The Paradox of Choice," psychologist Barry Schwartz challenged the deeply held Western assumption that more options invariably lead to greater satisfaction. Drawing on extensive research in behavioural economics and psychology, Schwartz argued that while some degree of choice is essential for autonomy and well-being, an overabundance of options can paradoxically lead to anxiety, indecision, and diminished happiness.

The mechanism behind this counterintuitive phenomenon is multifaceted. When faced with an overwhelming number of alternatives, individuals experience what researchers call "choice overload." The cognitive effort required to evaluate numerous options becomes exhausting, often leading to decision paralysis, where the person either defers the decision indefinitely or defaults to the most familiar option regardless of its suitability. Even when a decision is eventually made, the awareness of all the rejected alternatives breeds regret and second-guessing. Schwartz distinguished between "maximisers," who compulsively seek the absolute best option, and "satisficers," who are content with an option that meets their criteria. His research indicated that maximisers, despite often making objectively better choices, tend to be less satisfied with their decisions.

The implications extend well beyond consumer purchases. In healthcare, patients now face an unprecedented array of treatment options, and studies suggest that this can lead to poorer decision-making and increased anxiety. In the labour market, the seemingly limitless career paths available to graduates in affluent societies can produce a paralysing sense of possibility rather than liberation.

Critics of Schwartz's thesis argue that the problem lies not with choice itself but with inadequate decision-making frameworks. They suggest that educating people to set clear priorities and accept "good enough" outcomes would mitigate the negative effects without reducing the options available. Nevertheless, Schwartz's work has prompted important conversations about the design of institutions and marketplaces, pushing designers and policymakers to consider how choices are structured and presented to the public.`,
    wordCount: 290,
    topic: 'economics',
    questions: [
      {
        question: 'What is "choice overload" as described in the passage?',
        choices: ['The inability to find any suitable options', 'The cognitive exhaustion caused by evaluating too many alternatives', 'A marketing strategy to increase sales', 'The tendency to always choose the cheapest option'],
        correctAnswer: 'The cognitive exhaustion caused by evaluating too many alternatives',
      },
      {
        question: 'How do "maximisers" differ from "satisficers"?',
        choices: ['Maximisers make faster decisions', 'Maximisers compulsively seek the best option and tend to be less satisfied', 'Satisficers always choose the most expensive option', 'Satisficers spend more time evaluating alternatives'],
        correctAnswer: 'Maximisers compulsively seek the best option and tend to be less satisfied',
      },
      {
        question: 'What problem does the passage identify in healthcare?',
        choices: ['Doctors have too few treatment options', 'Many treatment options can lead to poorer decision-making and anxiety', 'Patients refuse to make any decisions', 'Healthcare costs are too high for most people'],
        correctAnswer: 'Many treatment options can lead to poorer decision-making and anxiety',
      },
      {
        question: 'What do critics of Schwartz suggest?',
        choices: ['All choices should be eliminated', 'People need better decision-making frameworks', 'The research methodology was fundamentally flawed', 'Choice overload only affects consumers, not patients'],
        correctAnswer: 'People need better decision-making frameworks',
      },
    ],
  },
  {
    id: 'c1-r-003',
    title: 'Language Extinction and Cultural Loss',
    passage: `Linguists estimate that of the approximately seven thousand languages currently spoken worldwide, nearly half are at risk of disappearing by the end of this century. A language is considered endangered when it is no longer being transmitted to younger generations, and moribund when only elderly speakers remain. The rate of language death has accelerated dramatically in the era of globalisation, as dominant languages, particularly English, Mandarin, and Spanish, expand their reach through education, media, and economic opportunity.

The extinction of a language represents far more than the loss of a communication system. Each language encodes a unique worldview, a distinct way of categorising experience, expressing relationships, and understanding the natural environment. The Yupik languages of Alaska, for example, contain dozens of terms for different types of sea ice, reflecting centuries of accumulated ecological knowledge that has no equivalent in English. When such a language vanishes, this body of knowledge vanishes with it, often irretrievably.

Efforts to preserve endangered languages take various forms. Documentation projects, often led by university linguists in collaboration with native speaker communities, create comprehensive recordings and grammars. Language revitalisation programmes seek to reintroduce endangered languages into daily use, particularly among children, through immersion schools and community-based initiatives. The revival of Hebrew from a primarily liturgical language to a thriving spoken tongue is frequently cited as evidence that language revitalisation can succeed even in seemingly impossible circumstances.

However, preservation efforts face formidable obstacles. Many endangered languages have tiny speaker populations scattered across remote regions with limited resources. Furthermore, the economic incentives overwhelmingly favour the adoption of global languages, making it difficult to persuade younger generations to invest the considerable effort required to achieve fluency in a language with a limited sphere of use. The tension between linguistic diversity and economic pragmatism remains one of the defining cultural challenges of our era.`,
    wordCount: 296,
    topic: 'linguistics',
    questions: [
      {
        question: 'What does the passage mean by a "moribund" language?',
        choices: ['A language spoken only in schools', 'A language with only elderly speakers remaining', 'A language that has been fully documented', 'A language used mainly in religious contexts'],
        correctAnswer: 'A language with only elderly speakers remaining',
      },
      {
        question: 'Why does the passage mention the Yupik languages?',
        choices: ['To show that Alaskan languages are the oldest in the world', 'To illustrate how a language encodes unique ecological knowledge', 'To argue that indigenous languages should replace English', 'To demonstrate that ice terminology is important for science'],
        correctAnswer: 'To illustrate how a language encodes unique ecological knowledge',
      },
      {
        question: 'What example of successful language revitalisation is given?',
        choices: ['Latin', 'Sanskrit', 'Hebrew', 'Gaelic'],
        correctAnswer: 'Hebrew',
      },
      {
        question: 'What does the author identify as a central tension?',
        choices: ['Academic research versus community involvement', 'Linguistic diversity versus economic pragmatism', 'Documentation versus revitalisation', 'Eastern languages versus Western languages'],
        correctAnswer: 'Linguistic diversity versus economic pragmatism',
      },
    ],
  },
  {
    id: 'c1-r-004',
    title: 'The Neuroscience of Decision-Making',
    passage: `The traditional economic model of human decision-making, often called the "rational actor" model, assumes that individuals make choices by logically weighing costs and benefits to maximise their utility. However, advances in neuroscience over the past three decades have revealed a far more complex picture, one in which emotion, intuition, and unconscious processing play central roles.

The work of neuroscientist Antonio Damasio has been particularly influential. His "somatic marker hypothesis" proposes that emotional responses, manifested as bodily sensations, serve as crucial guides in decision-making. Damasio studied patients with damage to the ventromedial prefrontal cortex, a brain region involved in processing emotion. Despite retaining their intellectual abilities, these patients exhibited profoundly impaired decision-making in real-life situations, often making choices that were clearly against their own interests. This suggested that the capacity for rational thought alone is insufficient for effective decision-making; emotional input is not a hindrance to rationality but a necessary component of it.

Research using functional magnetic resonance imaging has further complicated the picture by revealing that different types of decisions activate distinct neural networks. Decisions involving immediate rewards tend to engage the limbic system, which processes emotion, while decisions requiring long-term planning activate the prefrontal cortex. The interplay between these systems helps explain why people often struggle with choices that pit short-term gratification against long-term benefit, such as saving money for retirement versus making an impulsive purchase.

These findings have significant practical implications. In fields ranging from public health to financial regulation, policymakers are increasingly drawing on behavioural neuroscience to design interventions that account for the way people actually make decisions rather than the way classical economics assumes they do. "Nudge" strategies, which structure choices to guide people towards beneficial outcomes without restricting their freedom, represent one prominent application of this research.`,
    wordCount: 285,
    topic: 'research',
    questions: [
      {
        question: 'What did Damasio\'s research on brain-damaged patients demonstrate?',
        choices: ['Emotional processing is unnecessary for good decisions', 'Intelligence alone is sufficient for effective decision-making', 'Emotional input is a necessary component of rational decision-making', 'Brain damage always improves decision-making ability'],
        correctAnswer: 'Emotional input is a necessary component of rational decision-making',
      },
      {
        question: 'Which brain system processes decisions involving immediate rewards?',
        choices: ['The prefrontal cortex', 'The limbic system', 'The ventromedial prefrontal cortex', 'The cerebellum'],
        correctAnswer: 'The limbic system',
      },
      {
        question: 'What are "nudge" strategies?',
        choices: ['Laws that prohibit certain choices', 'Approaches that structure choices to guide beneficial outcomes', 'Psychological therapies for decision-making disorders', 'Economic models that predict consumer behaviour'],
        correctAnswer: 'Approaches that structure choices to guide beneficial outcomes',
      },
      {
        question: 'What is the main argument of the passage?',
        choices: ['The rational actor model accurately describes human behaviour', 'Emotions always lead to poor decisions', 'Decision-making involves emotion, intuition, and reason working together', 'Neuroscience has little practical application to policy'],
        correctAnswer: 'Decision-making involves emotion, intuition, and reason working together',
      },
    ],
  },
  {
    id: 'c1-r-005',
    title: 'The Gig Economy and Worker Protections',
    passage: `The rapid growth of the gig economy, driven by platforms such as Uber, Deliveroo, and Fiverr, has fundamentally altered the relationship between workers and employers. Millions of people worldwide now earn their living through short-term contracts and freelance work rather than traditional permanent employment. Advocates of this model celebrate the flexibility it offers: workers can choose their own hours, take on multiple projects simultaneously, and avoid the constraints of a conventional workplace.

However, this flexibility comes at a considerable cost. Gig workers are typically classified as independent contractors rather than employees, which means they are excluded from protections that permanent workers take for granted, including minimum wage guarantees, paid sick leave, holiday entitlements, and employer-contributed pension schemes. The financial precariousness of gig work is compounded by its unpredictability; demand for services can fluctuate dramatically, leaving workers with little income during slow periods.

Legal systems around the world are struggling to adapt to this new reality. In a landmark ruling, the UK Supreme Court determined that Uber drivers should be classified as workers rather than independent contractors, entitling them to minimum wage and holiday pay. Similar legal battles are unfolding in the United States, the European Union, and across Asia. The central question in each case is the same: to what extent do platforms control the conditions of work, and at what point does that control create an employment relationship regardless of how the contract is labelled?

The debate exposes a fundamental tension between innovation and worker welfare. Overly strict regulation risks stifling the platforms that provide millions of people with income opportunities, while insufficient regulation allows companies to externalise labour costs and shift risk onto individual workers. Finding a regulatory framework that preserves the genuine benefits of flexible work while ensuring basic protections and dignity for those who depend on it remains one of the most pressing policy challenges of the contemporary economy.`,
    wordCount: 299,
    topic: 'economics',
    questions: [
      {
        question: 'Why are gig workers often denied traditional employment benefits?',
        choices: ['They refuse to accept them', 'They are classified as independent contractors', 'Platforms cannot afford to provide them', 'Governments have abolished worker protections'],
        correctAnswer: 'They are classified as independent contractors',
      },
      {
        question: 'What was the significance of the UK Supreme Court ruling on Uber?',
        choices: ['It banned Uber from operating in the UK', 'It classified drivers as workers, granting them minimum wage and holiday pay', 'It required Uber to provide company cars', 'It established that all gig workers are employees'],
        correctAnswer: 'It classified drivers as workers, granting them minimum wage and holiday pay',
      },
      {
        question: 'What central question do legal systems face regarding gig platforms?',
        choices: ['Whether platforms should pay higher taxes', 'Whether platforms control work conditions enough to create an employment relationship', 'Whether workers should be allowed to use multiple platforms', 'Whether platforms should be owned by governments'],
        correctAnswer: 'Whether platforms control work conditions enough to create an employment relationship',
      },
      {
        question: 'What does the passage imply about the ideal regulatory approach?',
        choices: ['All gig work should be banned', 'Platforms should self-regulate without government involvement', 'A balance between innovation and worker protection is needed', 'Current regulations are already adequate'],
        correctAnswer: 'A balance between innovation and worker protection is needed',
      },
    ],
  },
  {
    id: 'c1-r-006',
    title: 'The Philosophy of Scientific Revolutions',
    passage: `Thomas Kuhn's "The Structure of Scientific Revolutions," published in 1962, introduced the concept of the paradigm shift and fundamentally changed the way philosophers and historians understand the progress of science. Before Kuhn, the prevailing view was that science advanced through the steady, cumulative accumulation of knowledge, each discovery building neatly upon the last. Kuhn argued instead that scientific progress is punctuated by revolutionary upheavals in which an established framework of understanding, or paradigm, is replaced by a radically different one.

According to Kuhn, most scientific activity takes place within what he termed "normal science," a phase in which researchers work within an accepted paradigm, solving puzzles and refining theories without questioning the fundamental assumptions of their field. Anomalies, observations that the existing paradigm cannot adequately explain, are initially dismissed or accommodated through minor modifications. However, as anomalies accumulate and become increasingly difficult to ignore, the field enters a period of crisis. It is during these crises that revolutionary new theories emerge, offering fundamentally different explanations that resolve the accumulated anomalies.

The transition from Newtonian mechanics to Einstein's theory of relativity is perhaps the most frequently cited example of a paradigm shift. Newton's laws, which had provided an extraordinarily successful framework for understanding motion and gravity for over two centuries, proved unable to account for certain observations, such as the precession of Mercury's orbit. Einstein's general relativity resolved these anomalies but did so by replacing the very concepts of absolute space and time that lay at the foundation of Newtonian physics.

Kuhn's work was controversial because it implied that paradigm shifts involve not merely new theories but new ways of seeing the world. Scientists working within different paradigms, he argued, effectively inhabit different intellectual worlds, a claim that led some critics to accuse him of relativism. Nevertheless, the concept of the paradigm shift has become one of the most widely used frameworks for understanding how fundamental change occurs, not only in science but in business, politics, and culture more broadly.`,
    wordCount: 308,
    topic: 'philosophy',
    questions: [
      {
        question: 'What was the prevailing view of scientific progress before Kuhn?',
        choices: ['Science progressed through periodic revolutions', 'Science advanced through steady cumulative accumulation', 'Scientific theories were never replaced', 'Progress depended on individual genius alone'],
        correctAnswer: 'Science advanced through steady cumulative accumulation',
      },
      {
        question: 'What does Kuhn mean by "normal science"?',
        choices: ['Science conducted by ordinary rather than exceptional researchers', 'Research that works within an accepted paradigm without questioning fundamentals', 'Experiments that produce expected results', 'Science that is taught in schools'],
        correctAnswer: 'Research that works within an accepted paradigm without questioning fundamentals',
      },
      {
        question: 'Why is the shift from Newton to Einstein cited as a paradigm shift?',
        choices: ['Einstein simply corrected a few of Newton\'s equations', 'Einstein replaced fundamental concepts of space and time, not just individual theories', 'Newton\'s laws were proven entirely wrong', 'The scientific community immediately accepted Einstein\'s theory'],
        correctAnswer: 'Einstein replaced fundamental concepts of space and time, not just individual theories',
      },
      {
        question: 'Why was Kuhn\'s work controversial?',
        choices: ['He denied that science made any progress', 'He was accused of relativism for suggesting paradigms create different intellectual worlds', 'He claimed Einstein was wrong about relativity', 'He argued that normal science was a waste of time'],
        correctAnswer: 'He was accused of relativism for suggesting paradigms create different intellectual worlds',
      },
    ],
  },
]

// ═══════════════════════════════════════════════════════════
//  C2 — Proficiency (400-500 words, 4 questions each)
// ═══════════════════════════════════════════════════════════

const C2 = [
  {
    id: 'c2-r-001',
    title: 'The Epistemological Limits of Empiricism',
    passage: `Empiricism, the philosophical doctrine that all knowledge derives ultimately from sensory experience, has served as the bedrock of scientific methodology since the Enlightenment. Yet the very success of empirical science has, paradoxically, exposed the limits of a strictly empiricist epistemology. The difficulty becomes apparent when one considers the status of the theoretical entities that populate modern physics: quarks, dark matter, the Higgs field. None of these can be directly observed; their existence is inferred from complex chains of reasoning that depend on sophisticated instrumentation, mathematical models, and a web of background assumptions.

The philosopher Pierre Duhem articulated one dimension of this problem in the early twentieth century with what has since become known as the Duhem-Quine thesis. Duhem argued that no scientific hypothesis can be tested in isolation. Any experimental test involves not only the hypothesis under scrutiny but also a host of auxiliary assumptions about the reliability of instruments, the absence of confounding variables, and the validity of the theoretical framework within which the experiment is interpreted. When an experiment yields results that conflict with a hypothesis, the scientist faces an underdetermination problem: the failure could lie with the hypothesis itself, with any of the auxiliary assumptions, or with some combination thereof. Willard Van Orman Quine later extended this insight, arguing that our entire system of beliefs confronts experience as a corporate body, and that in principle any statement can be held true in the face of recalcitrant experience by making adjustments elsewhere in the system.

This holistic view of scientific knowledge challenges the naively empiricist picture in which individual hypotheses are straightforwardly confirmed or refuted by observation. It does not, however, necessitate a descent into wholesale scepticism. The physicist and philosopher of science Michael Polanyi proposed that scientific knowledge rests in part on what he called "tacit knowledge," the unarticulated skills, intuitions, and judgements that experienced researchers bring to bear when evaluating evidence and choosing among competing theories. This tacit dimension, acquired through apprenticeship within a scientific community, cannot be fully formalised or communicated propositionally, yet it plays an indispensable role in the production of reliable knowledge.

The implications of these philosophical reflections extend beyond the academy. In an era of contested expertise, understanding that scientific knowledge is not simply "read off" from nature but is constructed through a sophisticated interplay of observation, theory, and communal judgement is crucial. It allows for a more nuanced appreciation of scientific authority, one that recognises science as our most reliable method of inquiry while acknowledging the inherent fallibility and revisability of its conclusions. This perspective neither undermines science nor absolutises it, but rather situates it as a deeply human enterprise, subject to the same epistemic constraints that characterise all forms of knowing.`,
    wordCount: 395,
    topic: 'epistemology',
    questions: [
      {
        question: 'What is the "underdetermination problem" described in the passage?',
        choices: ['The impossibility of building sufficiently sensitive instruments', 'The difficulty of determining whether experimental failure lies with the hypothesis or auxiliary assumptions', 'The inability of scientists to agree on any theory', 'The problem of having too many competing hypotheses in any field'],
        correctAnswer: 'The difficulty of determining whether experimental failure lies with the hypothesis or auxiliary assumptions',
      },
      {
        question: 'How did Quine extend Duhem\'s insight?',
        choices: ['He argued that only physics faces the problem of underdetermination', 'He proposed that our entire belief system confronts experience holistically', 'He demonstrated that auxiliary assumptions are always reliable', 'He rejected all forms of empiricism as fundamentally flawed'],
        correctAnswer: 'He proposed that our entire belief system confronts experience holistically',
      },
      {
        question: 'What role does Polanyi\'s "tacit knowledge" play in science?',
        choices: ['It replaces the need for experimental evidence', 'It is a source of bias that should be eliminated', 'It provides unarticulated skills and judgements essential for evaluating evidence', 'It allows scientists to communicate their findings more clearly'],
        correctAnswer: 'It provides unarticulated skills and judgements essential for evaluating evidence',
      },
      {
        question: 'What position does the author ultimately take on scientific knowledge?',
        choices: ['Science is unreliable and should be distrusted', 'Science produces absolute and infallible truths', 'Science is our most reliable inquiry method but inherently fallible and revisable', 'Empiricism has been entirely discredited by modern philosophy'],
        correctAnswer: 'Science is our most reliable inquiry method but inherently fallible and revisable',
      },
    ],
  },
  {
    id: 'c2-r-002',
    title: 'Irony and Unreliable Narration in Modern Fiction',
    passage: `The unreliable narrator, a figure whose account of events the reader has reason to doubt, has been a staple of literary fiction at least since the publication of Henry James's "The Turn of the Screw" in 1898, though its roots arguably extend much further into the history of storytelling. What distinguishes the modern deployment of this technique from its earlier manifestations is the degree to which it foregrounds the epistemological uncertainty inherent in all narrative acts. When we encounter a narrator whose perceptions are demonstrably skewed, whether by self-interest, psychological instability, or simple ignorance, we are forced to confront an uncomfortable truth: all narration is, to some extent, an act of construction rather than transparent representation.

Wayne C. Booth, in his seminal study "The Rhetoric of Fiction," coined the term "unreliable narrator" and argued that the reader's recognition of unreliability depends on a perceived discrepancy between the narrator's account and the "implied author's" norms, the values and perspectives that the text as a whole appears to endorse. This formulation is elegant but raises its own difficulties. The implied author is itself a construct inferred by the reader, which means that judgements of reliability are inevitably shaped by the reader's own cultural assumptions, literary competence, and ideological commitments.

Consider Kazuo Ishiguro's "The Remains of the Day," in which the butler Stevens narrates his life of service with an emotional restraint that borders on repression. The brilliance of the novel lies in the gap between what Stevens says and what the reader gradually comes to understand: that his unwavering devotion to duty has come at the cost of moral complicity and personal fulfilment. The irony is not merely local but structural; the entire narrative is suffused with meanings that Stevens himself cannot or will not acknowledge. The reader must actively construct an alternative reading, one that runs parallel to Stevens's own account but diverges from it at nearly every significant point.

This kind of sustained dramatic irony places considerable interpretive demands on the reader and raises questions about the ethics of reading itself. To what extent is it appropriate to override a narrator's self-understanding in favour of our own interpretation? The unreliable narrator thus serves as a potent reminder that meaning in literature, as in life, is never simply given but always negotiated between teller and listener, writer and reader.`,
    wordCount: 357,
    topic: 'literary criticism',
    questions: [
      {
        question: 'What does the author argue distinguishes the modern unreliable narrator from earlier versions?',
        choices: ['Modern narrators are always psychologically unstable', 'It highlights the epistemological uncertainty in all narration', 'Modern fiction avoids using first-person narration', 'Earlier narrators were always reliable and trustworthy'],
        correctAnswer: 'It highlights the epistemological uncertainty in all narration',
      },
      {
        question: 'What difficulty does the author identify with Booth\'s concept of the "implied author"?',
        choices: ['The implied author cannot be distinguished from the real author', 'It assumes all narrators are unreliable', 'Judgements of reliability are shaped by the reader\'s own assumptions', 'Booth never provided examples to support his theory'],
        correctAnswer: 'Judgements of reliability are shaped by the reader\'s own assumptions',
      },
      {
        question: 'What is the structural irony in "The Remains of the Day"?',
        choices: ['Stevens deliberately deceives the reader', 'The novel reveals that Stevens was never actually a butler', 'The entire narrative carries meanings Stevens cannot acknowledge', 'Ishiguro uses multiple narrators who contradict each other'],
        correctAnswer: 'The entire narrative carries meanings Stevens cannot acknowledge',
      },
      {
        question: 'What broader point does the passage make about meaning in literature?',
        choices: ['Authors always control the meaning of their texts', 'Meaning is fixed and objective across all readers', 'Meaning is negotiated between writer and reader, never simply given', 'Only literary critics can determine the correct interpretation'],
        correctAnswer: 'Meaning is negotiated between writer and reader, never simply given',
      },
    ],
  },
  {
    id: 'c2-r-003',
    title: 'Quantum Entanglement and the Nature of Reality',
    passage: `Few phenomena in physics have generated as much philosophical perplexity as quantum entanglement, the peculiar correlation between particles that persists regardless of the spatial distance separating them. When two particles become entangled, a measurement performed on one instantaneously determines the state of the other, even if they are light-years apart. Einstein famously dismissed this as "spooky action at a distance," convinced that it indicated an incompleteness in quantum theory rather than a genuine feature of physical reality. He and his colleagues Boris Podolsky and Nathan Rosen proposed a thought experiment, now known as the EPR paradox, arguing that the correlations could be explained by "hidden variables," predetermined properties that the particles carry with them from the moment of their creation.

The debate remained largely philosophical until 1964, when the physicist John Stewart Bell formulated a theorem that made it possible to distinguish experimentally between quantum mechanics and any hidden-variable theory that preserved locality, the principle that physical influences cannot travel faster than light. Bell's theorem established mathematical inequalities that local hidden-variable theories must satisfy but that quantum mechanics predicts will be violated. Beginning with the pioneering experiments of Alain Aspect in the 1980s and culminating in a series of increasingly rigorous "loophole-free" tests in 2015, the experimental verdict has been unequivocal: Bell's inequalities are violated, precisely as quantum mechanics predicts.

The implications are profound and deeply counterintuitive. If we accept the experimental results, we must abandon at least one of two deeply held assumptions: either locality, the idea that distant events cannot instantaneously influence each other, or realism, the assumption that physical properties exist independently of measurement. Most physicists accept the standard interpretation, in which entangled particles do not possess definite properties until they are measured, and the act of measurement on one particle instantaneously collapses the joint quantum state. This does not permit faster-than-light communication, since the outcomes of individual measurements remain random, but it does imply that the universe is fundamentally non-local at the quantum level.

The philosophical ramifications continue to reverberate. Some interpretations, such as the many-worlds hypothesis, avoid non-locality by positing that every quantum measurement causes the universe to split into branches corresponding to each possible outcome, a metaphysically extravagant proposal that nevertheless has serious defenders among physicists. Others, following the physicist David Bohm, maintain that hidden variables do exist but accept non-locality as a fundamental feature of reality. What unites these competing interpretations is an acknowledgement that quantum entanglement has irrevocably undermined the classical conception of a universe composed of independent objects interacting through local causes.`,
    wordCount: 384,
    topic: 'quantum physics',
    questions: [
      {
        question: 'Why did Einstein object to quantum entanglement?',
        choices: ['He believed it violated the conservation of energy', 'He thought it indicated incompleteness in quantum theory rather than a real phenomenon', 'He proved mathematically that it was impossible', 'He considered it a purely mathematical artefact with no physical significance'],
        correctAnswer: 'He thought it indicated incompleteness in quantum theory rather than a real phenomenon',
      },
      {
        question: 'What did the experimental tests of Bell\'s theorem demonstrate?',
        choices: ['That Einstein\'s hidden-variable theory was correct', 'That quantum entanglement does not actually exist', 'That Bell\'s inequalities are violated, confirming quantum mechanical predictions', 'That faster-than-light communication is possible'],
        correctAnswer: 'That Bell\'s inequalities are violated, confirming quantum mechanical predictions',
      },
      {
        question: 'According to the passage, what must be abandoned if we accept the experimental results?',
        choices: ['Either the theory of relativity or quantum mechanics', 'Either the concept of measurement or the concept of particles', 'Either locality or realism, or both', 'Either Bell\'s theorem or the EPR paradox'],
        correctAnswer: 'Either locality or realism, or both',
      },
      {
        question: 'What does the author suggest all competing interpretations of entanglement share?',
        choices: ['Agreement that faster-than-light communication is possible', 'Rejection of all experimental evidence', 'Acknowledgement that entanglement undermines the classical view of independent local objects', 'Acceptance of the many-worlds hypothesis'],
        correctAnswer: 'Acknowledgement that entanglement undermines the classical view of independent local objects',
      },
    ],
  },
  {
    id: 'c2-r-004',
    title: 'Bioethics and the Boundaries of Human Enhancement',
    passage: `The convergence of advances in genetic engineering, neuropharmacology, and prosthetic technology has brought the prospect of radical human enhancement from the realm of science fiction into serious ethical and policy discourse. At stake is nothing less than the definition of what it means to be human, and the question of whether there are boundaries that ought not to be crossed, even when the technology permits it.

The spectrum of enhancement technologies ranges from the relatively uncontroversial to the profoundly disruptive. Corrective interventions, such as cochlear implants or gene therapies for hereditary diseases, are widely accepted because they restore individuals to a baseline of normal functioning. The ethical terrain becomes considerably more contentious when the aim shifts from restoration to augmentation: enhancing cognitive abilities beyond the normal human range through pharmacological or genetic means, implanting neural interfaces that provide direct access to digital information, or engineering germline modifications that would be inherited by future generations.

Proponents of enhancement, often associated with the transhumanist movement, argue that the distinction between therapy and enhancement is ultimately arbitrary. They point out that technologies we now consider unremarkable, such as eyeglasses, vaccines, and education itself, were once novel interventions that extended human capabilities beyond their "natural" limits. From this perspective, cognitive enhancers and genetic modifications are simply the next step in a continuum of human self-improvement that stretches back millennia. The philosopher Julian Savulescu has gone further, arguing that we have a moral obligation to enhance our children if doing so would give them better lives, a position he terms "procreative beneficence."

Critics raise several formidable objections. The bioethicist Michael Sandel argues that the drive to enhance reflects a corrosive disposition of mastery and control over the given world, one that erodes the virtues of humility, solidarity, and gratitude for human gifts that are not of our own making. Others focus on distributive justice, warning that if enhancement technologies remain expensive, they will exacerbate existing social inequalities, creating what some commentators have termed a "genetic underclass." There is also the concern that modifications to the human germline, once made, would be irreversible and could have unforeseen consequences across subsequent generations, raising questions about our right to make such momentous decisions on behalf of those who cannot consent.

The debate resists easy resolution because it engages fundamental disagreements about the nature of human flourishing, the scope of parental authority, the meaning of equality, and the proper relationship between humanity and technology. What is clear is that the decisions made in the coming decades will shape not only individual lives but the trajectory of the human species itself.`,
    wordCount: 393,
    topic: 'bioethics',
    questions: [
      {
        question: 'What does the author identify as the key ethical boundary in enhancement technology?',
        choices: ['The difference between digital and biological technologies', 'The shift from restoration of normal function to augmentation beyond it', 'The cost of the technology', 'The difference between adult and child patients'],
        correctAnswer: 'The shift from restoration of normal function to augmentation beyond it',
      },
      {
        question: 'How do transhumanists counter the argument that enhancement is unnatural?',
        choices: ['They deny that enhancement technology actually works', 'They argue it continues a long continuum of human self-improvement including eyeglasses and education', 'They claim natural limits do not exist', 'They propose banning all medical interventions to be consistent'],
        correctAnswer: 'They argue it continues a long continuum of human self-improvement including eyeglasses and education',
      },
      {
        question: 'What is Sandel\'s core objection to human enhancement?',
        choices: ['Enhancement technologies are too expensive to develop', 'The drive to enhance reflects a corrosive disposition of mastery that erodes humility and solidarity', 'Genetic modifications are technically unreliable', 'Enhancement will make humans less intelligent over time'],
        correctAnswer: 'The drive to enhance reflects a corrosive disposition of mastery that erodes humility and solidarity',
      },
      {
        question: 'What concern is raised about germline modifications specifically?',
        choices: ['They are too painful for patients', 'They only work on certain genetic conditions', 'They are irreversible and affect future generations who cannot consent', 'They require too much computing power to design'],
        correctAnswer: 'They are irreversible and affect future generations who cannot consent',
      },
    ],
  },
  {
    id: 'c2-r-005',
    title: 'Sociolinguistic Variation and the Politics of Standard Language',
    passage: `The notion of a "standard" language, a codified variety that is taught in schools, used in official documents, and held up as the prestige norm, is so deeply embedded in most literate societies that it is rarely questioned by non-specialists. Yet sociolinguists have long argued that standard languages are not natural phenomena but ideological constructs, the products of deliberate selection, codification, and promotion by powerful institutions. The variety that becomes "standard" is typically the dialect of the politically and economically dominant group, and its elevation to official status serves to reinforce existing hierarchies of power.

This perspective challenges the common assumption that non-standard dialects are corruptions or deficiencies. The linguist William Labov's pioneering studies of African American Vernacular English demonstrated that it possesses a fully systematic grammar, with rules governing tense, aspect, and negation that are every bit as regular and logical as those of Standard American English, merely different. Labov's research was instrumental in establishing the principle that all natural language varieties are linguistically equal in terms of their structural complexity and expressive capacity. The stigmatisation of certain dialects, therefore, reflects social prejudice rather than any intrinsic linguistic inferiority.

The implications of this insight extend into education, law, and public policy. In educational contexts, children who speak non-standard dialects are frequently penalised for using grammatical structures that are perfectly systematic within their home variety but that diverge from the written standard. Research consistently shows that this can undermine educational achievement, not because of any cognitive limitation associated with non-standard speech, but because of the institutional devaluation of the child's linguistic identity. The challenge for educators is to develop pedagogical approaches that teach proficiency in the standard variety while respecting and validating the student's home language.

In the legal domain, studies have documented how dialect prejudice can affect courtroom proceedings. Witnesses and defendants who speak non-standard varieties may be perceived as less credible or less intelligent, judgements that have no linguistic basis but can have real consequences for the administration of justice. The intersection of language, identity, and power thus remains one of the most politically charged domains of linguistic inquiry, with implications that touch on fundamental questions of equity, representation, and the right to linguistic self-determination.`,
    wordCount: 344,
    topic: 'sociolinguistics',
    questions: [
      {
        question: 'What do sociolinguists argue about standard languages?',
        choices: ['They emerge naturally as the most efficient form of communication', 'They are ideological constructs promoted by powerful institutions', 'They are always based on the oldest known dialect', 'They represent the most grammatically complex variety'],
        correctAnswer: 'They are ideological constructs promoted by powerful institutions',
      },
      {
        question: 'What did Labov\'s research on African American Vernacular English demonstrate?',
        choices: ['It lacks systematic grammatical rules', 'It is a simplified version of Standard American English', 'It possesses fully systematic grammar equal in complexity to the standard', 'It should replace Standard American English in schools'],
        correctAnswer: 'It possesses fully systematic grammar equal in complexity to the standard',
      },
      {
        question: 'Why does the passage say non-standard dialect speakers may underperform in education?',
        choices: ['Their dialects lack sufficient vocabulary for academic work', 'They have cognitive limitations associated with non-standard speech', 'Institutional devaluation of their linguistic identity undermines achievement', 'They refuse to learn the standard variety'],
        correctAnswer: 'Institutional devaluation of their linguistic identity undermines achievement',
      },
      {
        question: 'What does the author imply about the relationship between dialect prejudice and justice?',
        choices: ['Courts have successfully eliminated all dialect bias', 'Dialect prejudice is irrelevant in legal settings', 'Judgements of credibility based on dialect are linguistically unfounded but consequential', 'Only written language matters in legal proceedings'],
        correctAnswer: 'Judgements of credibility based on dialect are linguistically unfounded but consequential',
      },
    ],
  },
  {
    id: 'c2-r-006',
    title: 'The Metaphysics of Personal Identity Over Time',
    passage: `The problem of personal identity over time, the question of what makes a person at one point in time the same person at a later point, is among the most enduring puzzles in Western philosophy. Its difficulty becomes apparent the moment one considers that every cell in the human body is replaced over the course of roughly seven to ten years, that memories are reconstructed rather than replayed, and that personality, beliefs, and values can change profoundly over a lifetime. In what sense, then, is the octogenarian the "same person" as the infant from whom they developed?

John Locke, writing in the seventeenth century, proposed that personal identity is constituted by continuity of consciousness, specifically by memory. A person at time T2 is identical to a person at time T1 if and only if the person at T2 can remember the experiences of the person at T1. This elegant criterion was immediately challenged by Thomas Reid, who pointed out that it yields paradoxical results. A general who remembers his exploits as a young officer, who in turn remembered being flogged as a schoolboy, but who himself has no memory of the flogging, is and is not the same person as the schoolboy, depending on which link in the chain one examines.

Later philosophers attempted to rescue Locke's insight by appealing to overlapping chains of psychological continuity rather than direct memory connections. Derek Parfit, in his influential "Reasons and Persons," radicalised this approach by arguing that what matters in survival is not identity per se but psychological continuity and connectedness. Parfit invited readers to consider thought experiments involving teleportation and brain fission, scenarios in which a person's psychological states are perfectly preserved but distributed across two or more bodies. If psychological continuity is what we care about, Parfit argued, then identity is not what matters; what matters is the degree and kind of psychological connection between person-stages, a relation that admits of degrees in a way that identity, being all-or-nothing, does not.

The implications of Parfit's view are both liberating and unsettling. If personal identity is not a deep, metaphysical fact but rather a conventional way of describing overlapping psychological connections, then many of our most deeply held attitudes, about self-interest, moral responsibility, and the fear of death, may require fundamental revision. The self, on this account, is not a persisting entity that underlies change but a narrative construction, a story we tell to impose coherence on the flux of experience. Whether this conclusion represents a profound philosophical insight or an unacceptable affront to common sense remains, as with so many questions in the philosophy of mind, vigorously contested.`,
    wordCount: 403,
    topic: 'philosophy',
    questions: [
      {
        question: 'What problem does Reid\'s objection expose in Locke\'s memory criterion?',
        choices: ['That memories are always unreliable', 'That identity through memory can produce contradictory results across indirect chains', 'That Locke did not believe in personal identity', 'That physical continuity is the only valid criterion'],
        correctAnswer: 'That identity through memory can produce contradictory results across indirect chains',
      },
      {
        question: 'What is Parfit\'s central claim about personal identity?',
        choices: ['Identity is the most important thing in survival', 'Physical continuity is the only criterion that matters', 'What matters is psychological continuity and connectedness, not identity per se', 'Personal identity is a simple and straightforward concept'],
        correctAnswer: 'What matters is psychological continuity and connectedness, not identity per se',
      },
      {
        question: 'Why does the author describe Parfit\'s view as both "liberating and unsettling"?',
        choices: ['It simplifies ethics but complicates physics', 'It resolves all philosophical problems but creates new scientific ones', 'It challenges deeply held attitudes about self-interest, responsibility, and death', 'It proves that teleportation is possible'],
        correctAnswer: 'It challenges deeply held attitudes about self-interest, responsibility, and death',
      },
      {
        question: 'What is the author\'s stance on whether Parfit\'s conclusion is correct?',
        choices: ['The author firmly endorses Parfit\'s position', 'The author rejects Parfit in favour of Locke', 'The author presents it as vigorously contested and does not take a definitive side', 'The author argues that only Reid\'s objection matters'],
        correctAnswer: 'The author presents it as vigorously contested and does not take a definitive side',
      },
    ],
  },
]

// ═══════════════════════════════════════════════════════════
//  Assembled export & helper
// ═══════════════════════════════════════════════════════════

export const readingPassages = { A1, A2, B1, B2, C1, C2 }

/**
 * Picks a random unused passage from the given CEFR level.
 * @param {string} level - CEFR level key (A1-C2)
 * @param {Set<string>} usedIds - set of passage IDs already used
 * @returns {{ passage: object, passageId: string } | null}
 */
export function generateReadingBlock(level, usedIds = new Set()) {
  const pool = readingPassages[level]
  if (!pool) return null

  const available = pool.filter((p) => !usedIds.has(p.id))
  if (available.length === 0) return null

  const picked = available[Math.floor(Math.random() * available.length)]
  return { passage: picked, passageId: picked.id }
}
