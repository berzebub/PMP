/**
 * CEFR Listening Scripts & Comprehension Questions
 *
 * 36 scripts (6 per CEFR level A1-C2) for English placement testing.
 * Audio is generated via ElevenLabs TTS API.
 *
 * Each script object:
 * @typedef {Object} ListeningScript
 * @property {string} id                  - Unique identifier (e.g. 'a1-l-001')
 * @property {string} title               - Short descriptive title
 * @property {'monologue'|'dialogue'|'announcement'|'lecture'|'discussion'} type
 * @property {string} script              - Full text for TTS; dialogues use [Speaker X] labels
 * @property {string[]} speakers          - Speaker identifiers
 * @property {number} wordCount           - Approximate word count
 * @property {Object} voiceConfig
 * @property {number} voiceConfig.stability        - ElevenLabs stability (0-1)
 * @property {number} voiceConfig.similarity_boost - ElevenLabs similarity boost (0-1)
 * @property {number} voiceConfig.speed            - Playback speed factor
 * @property {number} maxReplays          - How many times the user can replay
 * @property {Array<{question: string, choices: string[], correctAnswer: string}>} questions
 */

export const LISTENING_LEVEL_META = {
  A1: { name: 'Beginner', color: '#66bb6a', icon: 'sentiment_satisfied' },
  A2: { name: 'Elementary', color: '#42a5f5', icon: 'school' },
  B1: { name: 'Intermediate', color: '#ffa726', icon: 'psychology' },
  B2: { name: 'Upper-Intermediate', color: '#ef5350', icon: 'military_tech' },
  C1: { name: 'Advanced', color: '#ab47bc', icon: 'workspace_premium' },
  C2: { name: 'Proficiency', color: '#ec407a', icon: 'diamond' },
}

export const LISTENING_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

// ═══════════════════════════════════════════════════════════
//  A1 — Beginner (40-70 words, speed 0.8, 3 replays, 3 Qs)
// ═══════════════════════════════════════════════════════════
const A1 = [
  {
    id: 'a1-l-001',
    title: 'At the Shop',
    type: 'monologue',
    script: `Hello. I am at the shop today. I want to buy some food for dinner. I need bread, milk, eggs, and butter. The bread costs one dollar. The milk costs two dollars. The eggs cost three dollars. I give the woman ten dollars. She gives me change. I say thank you and put the food in my bag.`,
    speakers: ['narrator'],
    wordCount: 58,
    voiceConfig: { stability: 0.5, similarity_boost: 0.75, speed: 0.8 },
    audioUrl: 'https://storage.googleapis.com/edutask-4d90b.firebasestorage.app/cefr-audio/a1-l-001.mp3',
    maxReplays: 3,
    questions: [
      {
        question: 'Why is the speaker at the shop?',
        choices: ['To buy clothes', 'To buy food for dinner', 'To meet a friend', 'To buy a bag'],
        correctAnswer: 'To buy food for dinner',
      },
      {
        question: 'How much does the bread cost?',
        choices: ['Two dollars', 'Three dollars', 'One dollar', 'Five dollars'],
        correctAnswer: 'One dollar',
      },
      {
        question: 'How much money does the speaker give the woman?',
        choices: ['Six dollars', 'Seven dollars', 'Eight dollars', 'Ten dollars'],
        correctAnswer: 'Ten dollars',
      },
    ],
  },
  {
    id: 'a1-l-002',
    title: 'My Family',
    type: 'monologue',
    script: `My name is Sara. I have a small family. My father is a teacher. My mother is a nurse. I have one brother. His name is Tom. He is ten years old. I am eight years old. We have a cat. The cat is white. We live in a small house near the park. I love my family very much.`,
    speakers: ['narrator'],
    wordCount: 60,
    voiceConfig: { stability: 0.5, similarity_boost: 0.75, speed: 0.8 },
    audioUrl: 'https://storage.googleapis.com/edutask-4d90b.firebasestorage.app/cefr-audio/a1-l-002.mp3',
    maxReplays: 3,
    questions: [
      {
        question: 'What is the father\'s job?',
        choices: ['Doctor', 'Teacher', 'Nurse', 'Driver'],
        correctAnswer: 'Teacher',
      },
      {
        question: 'How old is Tom?',
        choices: ['Eight years old', 'Nine years old', 'Ten years old', 'Twelve years old'],
        correctAnswer: 'Ten years old',
      },
      {
        question: 'What colour is the cat?',
        choices: ['Black', 'Brown', 'White', 'Orange'],
        correctAnswer: 'White',
      },
    ],
  },
  {
    id: 'a1-l-003',
    title: 'Ordering Food',
    type: 'dialogue',
    script: `[Speaker A] Hello. Can I have a sandwich, please?
[Speaker B] Of course. What kind of sandwich? We have cheese, chicken, or egg.
[Speaker A] Cheese, please. And a cup of tea.
[Speaker B] OK. That is three dollars for the sandwich and one dollar for the tea. Four dollars, please.
[Speaker A] Here you are. Thank you.
[Speaker B] Thank you. Enjoy your food.`,
    speakers: ['speaker1', 'speaker2'],
    wordCount: 58,
    voiceConfig: { stability: 0.5, similarity_boost: 0.75, speed: 0.8 },
    audioUrl: 'https://storage.googleapis.com/edutask-4d90b.firebasestorage.app/cefr-audio/a1-l-003.mp3',
    maxReplays: 3,
    questions: [
      {
        question: 'What kind of sandwich does the customer choose?',
        choices: ['Chicken', 'Egg', 'Cheese', 'Ham'],
        correctAnswer: 'Cheese',
      },
      {
        question: 'What does the customer drink?',
        choices: ['Coffee', 'Water', 'Juice', 'Tea'],
        correctAnswer: 'Tea',
      },
      {
        question: 'How much does the customer pay in total?',
        choices: ['Three dollars', 'Four dollars', 'Five dollars', 'Two dollars'],
        correctAnswer: 'Four dollars',
      },
    ],
  },
  {
    id: 'a1-l-004',
    title: 'The Weather Today',
    type: 'monologue',
    script: `Good morning. Today is Monday. The weather is very nice today. It is sunny and warm. The sky is blue. There are no clouds. It is a good day to go to the park. Tomorrow will be different. It will rain. You should take an umbrella tomorrow. But today, enjoy the sun and have a good day.`,
    speakers: ['narrator'],
    wordCount: 55,
    voiceConfig: { stability: 0.5, similarity_boost: 0.75, speed: 0.8 },
    audioUrl: 'https://storage.googleapis.com/edutask-4d90b.firebasestorage.app/cefr-audio/a1-l-004.mp3',
    maxReplays: 3,
    questions: [
      {
        question: 'What day is it today?',
        choices: ['Sunday', 'Tuesday', 'Monday', 'Friday'],
        correctAnswer: 'Monday',
      },
      {
        question: 'What is the weather like today?',
        choices: ['Rainy and cold', 'Cloudy and windy', 'Sunny and warm', 'Snowy and cold'],
        correctAnswer: 'Sunny and warm',
      },
      {
        question: 'What will happen tomorrow?',
        choices: ['It will snow', 'It will be sunny', 'It will rain', 'It will be windy'],
        correctAnswer: 'It will rain',
      },
    ],
  },
  {
    id: 'a1-l-005',
    title: 'Asking for Directions',
    type: 'dialogue',
    script: `[Speaker A] Excuse me. Where is the bank, please?
[Speaker B] The bank? Go straight. Then turn left at the traffic light. The bank is next to the supermarket.
[Speaker A] Next to the supermarket. OK. Is it far?
[Speaker B] No, it is not far. About five minutes walking.
[Speaker A] Thank you very much.
[Speaker B] You are welcome.`,
    speakers: ['speaker1', 'speaker2'],
    wordCount: 53,
    voiceConfig: { stability: 0.5, similarity_boost: 0.75, speed: 0.8 },
    audioUrl: 'https://storage.googleapis.com/edutask-4d90b.firebasestorage.app/cefr-audio/a1-l-005.mp3',
    maxReplays: 3,
    questions: [
      {
        question: 'Where does the person want to go?',
        choices: ['The supermarket', 'The hospital', 'The bank', 'The school'],
        correctAnswer: 'The bank',
      },
      {
        question: 'Which direction should the person turn at the traffic light?',
        choices: ['Right', 'Left', 'Straight', 'Back'],
        correctAnswer: 'Left',
      },
      {
        question: 'How long does it take to walk there?',
        choices: ['About two minutes', 'About five minutes', 'About ten minutes', 'About fifteen minutes'],
        correctAnswer: 'About five minutes',
      },
    ],
  },
  {
    id: 'a1-l-006',
    title: 'At the Hotel',
    type: 'dialogue',
    script: `[Speaker A] Good evening. I would like a room, please.
[Speaker B] For how many nights?
[Speaker A] Two nights. Friday and Saturday.
[Speaker B] OK. We have a room on the third floor. It has a big bed and a bathroom.
[Speaker A] How much is it?
[Speaker B] It is fifty dollars per night. One hundred dollars for two nights.
[Speaker A] That is fine. I will take it.`,
    speakers: ['speaker1', 'speaker2'],
    wordCount: 62,
    voiceConfig: { stability: 0.5, similarity_boost: 0.75, speed: 0.8 },
    audioUrl: 'https://storage.googleapis.com/edutask-4d90b.firebasestorage.app/cefr-audio/a1-l-006.mp3',
    maxReplays: 3,
    questions: [
      {
        question: 'How many nights does the guest want to stay?',
        choices: ['One night', 'Two nights', 'Three nights', 'Four nights'],
        correctAnswer: 'Two nights',
      },
      {
        question: 'What floor is the room on?',
        choices: ['First floor', 'Second floor', 'Third floor', 'Fourth floor'],
        correctAnswer: 'Third floor',
      },
      {
        question: 'How much will the guest pay in total?',
        choices: ['Fifty dollars', 'Seventy-five dollars', 'One hundred dollars', 'One hundred and fifty dollars'],
        correctAnswer: 'One hundred dollars',
      },
    ],
  },
]

// ═══════════════════════════════════════════════════════════
//  A2 — Elementary (70-100 words, speed 0.85, 3 replays, 3 Qs)
// ═══════════════════════════════════════════════════════════
const A2 = [
  {
    id: 'a2-l-001',
    title: 'Booking a Restaurant Table',
    type: 'dialogue',
    script: `[Speaker A] Good afternoon, Marco's Restaurant. How can I help you?
[Speaker B] Hello. I'd like to book a table for this Saturday evening, please.
[Speaker A] Of course. How many people?
[Speaker B] Four people. Two adults and two children.
[Speaker A] What time would you like?
[Speaker B] Seven thirty, if possible.
[Speaker A] Let me check. Yes, we have a table at seven thirty. Can I have your name, please?
[Speaker B] Yes, it's Peterson. P-E-T-E-R-S-O-N.
[Speaker A] Perfect, Mr. Peterson. A table for four at seven thirty on Saturday. See you then.`,
    speakers: ['speaker1', 'speaker2'],
    wordCount: 90,
    voiceConfig: { stability: 0.5, similarity_boost: 0.75, speed: 0.85 },
    audioUrl: 'https://storage.googleapis.com/edutask-4d90b.firebasestorage.app/cefr-audio/a2-l-001.mp3',
    maxReplays: 3,
    questions: [
      {
        question: 'When does the caller want to eat at the restaurant?',
        choices: ['Friday evening', 'Saturday lunch', 'Saturday evening', 'Sunday evening'],
        correctAnswer: 'Saturday evening',
      },
      {
        question: 'How many children will come?',
        choices: ['One', 'Two', 'Three', 'Four'],
        correctAnswer: 'Two',
      },
      {
        question: 'What time is the reservation?',
        choices: ['Seven o\'clock', 'Seven thirty', 'Eight o\'clock', 'Eight thirty'],
        correctAnswer: 'Seven thirty',
      },
    ],
  },
  {
    id: 'a2-l-002',
    title: 'Airport Announcement',
    type: 'announcement',
    script: `Attention, please. This is an announcement for passengers on flight BA-245 to London Heathrow. We are sorry to inform you that this flight is delayed by approximately forty-five minutes. The new departure time is three fifteen in the afternoon. Please remain in the departure area near Gate B12. We apologise for the delay. If you need more information, please go to the information desk on the second floor. Free drinks will be available at the gate. Thank you for your patience.`,
    speakers: ['narrator'],
    wordCount: 80,
    voiceConfig: { stability: 0.5, similarity_boost: 0.75, speed: 0.85 },
    audioUrl: 'https://storage.googleapis.com/edutask-4d90b.firebasestorage.app/cefr-audio/a2-l-002.mp3',
    maxReplays: 3,
    questions: [
      {
        question: 'Where is flight BA-245 going?',
        choices: ['New York', 'Paris', 'London Heathrow', 'Berlin'],
        correctAnswer: 'London Heathrow',
      },
      {
        question: 'How long is the delay?',
        choices: ['Thirty minutes', 'Forty-five minutes', 'One hour', 'Two hours'],
        correctAnswer: 'Forty-five minutes',
      },
      {
        question: 'What is offered free at the gate?',
        choices: ['Food', 'Drinks', 'Magazines', 'Wi-Fi'],
        correctAnswer: 'Drinks',
      },
    ],
  },
  {
    id: 'a2-l-003',
    title: 'Calling the Doctor',
    type: 'dialogue',
    script: `[Speaker A] Hello, City Medical Centre. How can I help?
[Speaker B] Hello. I'd like to make an appointment with Dr. Chen, please.
[Speaker A] Is it urgent?
[Speaker B] Not really. I've had a headache for a few days and I'd like to see a doctor.
[Speaker A] OK. Dr. Chen is available on Thursday morning at ten o'clock or Friday afternoon at two thirty. Which one would you prefer?
[Speaker B] Thursday morning is good for me.
[Speaker A] Your name, please?
[Speaker B] Maria Santos.
[Speaker A] OK, Maria. Thursday at ten o'clock with Dr. Chen. Don't forget to bring your ID card.`,
    speakers: ['speaker1', 'speaker2'],
    wordCount: 98,
    voiceConfig: { stability: 0.5, similarity_boost: 0.75, speed: 0.85 },
    audioUrl: 'https://storage.googleapis.com/edutask-4d90b.firebasestorage.app/cefr-audio/a2-l-003.mp3',
    maxReplays: 3,
    questions: [
      {
        question: 'What is the caller\'s problem?',
        choices: ['A stomach ache', 'A headache for a few days', 'A broken arm', 'A fever'],
        correctAnswer: 'A headache for a few days',
      },
      {
        question: 'When is Maria\'s appointment?',
        choices: ['Thursday morning at ten', 'Thursday afternoon at two', 'Friday morning at ten', 'Friday afternoon at two thirty'],
        correctAnswer: 'Thursday morning at ten',
      },
      {
        question: 'What should Maria bring?',
        choices: ['Her phone', 'Her ID card', 'Medical records', 'A letter from work'],
        correctAnswer: 'Her ID card',
      },
    ],
  },
  {
    id: 'a2-l-004',
    title: 'Train Station Announcement',
    type: 'announcement',
    script: `Good morning, passengers. The nine fifteen express train to Manchester will depart from Platform 6 in approximately ten minutes. This is a direct service with no stops. The journey time is two hours and twenty minutes. Please have your tickets ready before boarding. There is a buffet car in Coach D where you can buy hot drinks and snacks. First class passengers should go to Coaches A and B at the front of the train. Please mind the gap between the train and the platform.`,
    speakers: ['narrator'],
    wordCount: 82,
    voiceConfig: { stability: 0.5, similarity_boost: 0.75, speed: 0.85 },
    audioUrl: 'https://storage.googleapis.com/edutask-4d90b.firebasestorage.app/cefr-audio/a2-l-004.mp3',
    maxReplays: 3,
    questions: [
      {
        question: 'Where is the train going?',
        choices: ['London', 'Manchester', 'Birmingham', 'Edinburgh'],
        correctAnswer: 'Manchester',
      },
      {
        question: 'How long is the journey?',
        choices: ['One hour and forty minutes', 'Two hours', 'Two hours and twenty minutes', 'Three hours'],
        correctAnswer: 'Two hours and twenty minutes',
      },
      {
        question: 'Where can passengers buy food and drinks?',
        choices: ['Coach A', 'Coach B', 'Coach C', 'Coach D'],
        correctAnswer: 'Coach D',
      },
    ],
  },
  {
    id: 'a2-l-005',
    title: 'Weekend Plans',
    type: 'dialogue',
    script: `[Speaker A] Hi, Jenny. What are you doing this weekend?
[Speaker B] Hi, Mark. I'm going to visit my grandmother on Saturday. She lives in the countryside, about an hour from here.
[Speaker A] That sounds nice. What about Sunday?
[Speaker B] On Sunday, I'm going to the cinema with my sister. There's a new comedy film we both want to see. What about you?
[Speaker A] I'm playing football on Saturday morning, and then I think I'll just relax at home. Maybe I'll cook something nice for dinner.
[Speaker B] That sounds like a good weekend.`,
    speakers: ['speaker1', 'speaker2'],
    wordCount: 92,
    voiceConfig: { stability: 0.5, similarity_boost: 0.75, speed: 0.85 },
    audioUrl: 'https://storage.googleapis.com/edutask-4d90b.firebasestorage.app/cefr-audio/a2-l-005.mp3',
    maxReplays: 3,
    questions: [
      {
        question: 'Who is Jenny visiting on Saturday?',
        choices: ['Her mother', 'Her friend', 'Her grandmother', 'Her sister'],
        correctAnswer: 'Her grandmother',
      },
      {
        question: 'What kind of film will Jenny see on Sunday?',
        choices: ['Action', 'Horror', 'Drama', 'Comedy'],
        correctAnswer: 'Comedy',
      },
      {
        question: 'What is Mark doing on Saturday morning?',
        choices: ['Going to the cinema', 'Playing football', 'Visiting family', 'Cooking dinner'],
        correctAnswer: 'Playing football',
      },
    ],
  },
  {
    id: 'a2-l-006',
    title: 'Lost Luggage at the Airport',
    type: 'dialogue',
    script: `[Speaker A] Excuse me, I can't find my suitcase. It didn't come on the belt with the other bags.
[Speaker B] I'm sorry about that. Can you describe your suitcase?
[Speaker A] Yes, it's a large blue suitcase with a red tag on the handle. It has wheels.
[Speaker B] OK. And what flight did you arrive on?
[Speaker A] Flight TK-430 from Istanbul.
[Speaker B] Let me check the system. It looks like your bag was put on the wrong flight. It should arrive here in about three hours.
[Speaker A] Oh no. What should I do?
[Speaker B] Please fill in this form with your name and hotel address. We'll deliver the bag to you today.`,
    speakers: ['speaker1', 'speaker2'],
    wordCount: 100,
    voiceConfig: { stability: 0.5, similarity_boost: 0.75, speed: 0.85 },
    audioUrl: 'https://storage.googleapis.com/edutask-4d90b.firebasestorage.app/cefr-audio/a2-l-006.mp3',
    maxReplays: 3,
    questions: [
      {
        question: 'What does the suitcase look like?',
        choices: ['Small and black', 'Large and blue with a red tag', 'Medium and green', 'Large and red with a blue tag'],
        correctAnswer: 'Large and blue with a red tag',
      },
      {
        question: 'What happened to the suitcase?',
        choices: ['It was lost completely', 'It was put on the wrong flight', 'It was damaged', 'It was stolen'],
        correctAnswer: 'It was put on the wrong flight',
      },
      {
        question: 'How will the passenger get the suitcase back?',
        choices: ['Come back to the airport tomorrow', 'Wait at the airport for three hours', 'It will be delivered to the hotel', 'Pick it up at a different terminal'],
        correctAnswer: 'It will be delivered to the hotel',
      },
    ],
  },
]

// ═══════════════════════════════════════════════════════════
//  B1 — Intermediate (100-150 words, speed 0.9, 2 replays, 4 Qs)
// ═══════════════════════════════════════════════════════════
const B1 = [
  {
    id: 'b1-l-001',
    title: 'Local News Report',
    type: 'monologue',
    script: `Good evening, and welcome to the six o'clock news. Our top story tonight: a new public library will open in the city centre next Monday. The modern building took two years to build and cost approximately twelve million dollars. The library will have over fifty thousand books, a children's section, and free computer access for all visitors. The mayor said that this library will be an important resource for the community, especially for young people and families. Opening hours will be nine in the morning until eight in the evening, Monday to Saturday. On Sundays, it will be open from ten until four. The first week, all events and activities will be free.`,
    speakers: ['narrator'],
    wordCount: 115,
    voiceConfig: { stability: 0.5, similarity_boost: 0.75, speed: 0.9 },
    audioUrl: 'https://storage.googleapis.com/edutask-4d90b.firebasestorage.app/cefr-audio/b1-l-001.mp3',
    maxReplays: 2,
    questions: [
      {
        question: 'When will the new library open?',
        choices: ['Next Friday', 'Next Monday', 'Next Saturday', 'Next Wednesday'],
        correctAnswer: 'Next Monday',
      },
      {
        question: 'How long did it take to build the library?',
        choices: ['One year', 'Eighteen months', 'Two years', 'Three years'],
        correctAnswer: 'Two years',
      },
      {
        question: 'What are the Sunday opening hours?',
        choices: ['Nine to eight', 'Ten to four', 'Nine to six', 'Ten to eight'],
        correctAnswer: 'Ten to four',
      },
      {
        question: 'Who did the mayor say the library would especially help?',
        choices: ['Business owners and tourists', 'Young people and families', 'University students', 'Elderly residents'],
        correctAnswer: 'Young people and families',
      },
    ],
  },
  {
    id: 'b1-l-002',
    title: 'Office Meeting',
    type: 'dialogue',
    script: `[Speaker A] OK, everyone, let's start the meeting. As you know, we need to plan the company event for next month. Any ideas?
[Speaker B] How about a barbecue in the park? The weather should be nice in June.
[Speaker A] That's a good idea. But we had a barbecue last year. Maybe we should try something different.
[Speaker C] What about a boat trip? There's a company that does river cruises. They can take groups of up to fifty people.
[Speaker A] Interesting. How much would that cost?
[Speaker C] I checked their website. It's about thirty dollars per person, and that includes a meal.
[Speaker B] That sounds reasonable. I think people would enjoy that.
[Speaker A] Let's go with the boat trip, then. Can you get a quote for forty-five people by Friday?`,
    speakers: ['speaker1', 'speaker2', 'speaker3'],
    wordCount: 135,
    voiceConfig: { stability: 0.5, similarity_boost: 0.75, speed: 0.9 },
    audioUrl: 'https://storage.googleapis.com/edutask-4d90b.firebasestorage.app/cefr-audio/b1-l-002.mp3',
    maxReplays: 2,
    questions: [
      {
        question: 'Why did they reject the barbecue idea?',
        choices: ['It was too expensive', 'The weather might be bad', 'They did it last year', 'The park was closed'],
        correctAnswer: 'They did it last year',
      },
      {
        question: 'How much does the boat trip cost per person?',
        choices: ['Twenty dollars', 'Twenty-five dollars', 'Thirty dollars', 'Forty dollars'],
        correctAnswer: 'Thirty dollars',
      },
      {
        question: 'What is included in the boat trip price?',
        choices: ['Drinks only', 'A meal', 'A hotel room', 'Transport to the river'],
        correctAnswer: 'A meal',
      },
      {
        question: 'How many people need to be included in the quote?',
        choices: ['Thirty', 'Forty', 'Forty-five', 'Fifty'],
        correctAnswer: 'Forty-five',
      },
    ],
  },
  {
    id: 'b1-l-003',
    title: 'A Trip to Japan',
    type: 'monologue',
    script: `Last summer, I went to Japan for two weeks with my best friend. It was my first time in Asia, and I was really excited. We flew from London to Tokyo, and the flight took about twelve hours. When we arrived, we took the train to our hotel in Shinjuku. The trains in Japan are amazing. They're always on time and very clean. During our trip, we visited Tokyo, Kyoto, and Osaka. In Kyoto, we saw beautiful old temples and tried traditional Japanese food. My favourite was ramen from a small restaurant near our hotel. The weather was hot and humid, which was quite tiring, but the experience was incredible. I definitely want to go back.`,
    speakers: ['narrator'],
    wordCount: 120,
    voiceConfig: { stability: 0.5, similarity_boost: 0.75, speed: 0.9 },
    audioUrl: 'https://storage.googleapis.com/edutask-4d90b.firebasestorage.app/cefr-audio/b1-l-003.mp3',
    maxReplays: 2,
    questions: [
      {
        question: 'How long was the trip to Japan?',
        choices: ['One week', 'Ten days', 'Two weeks', 'Three weeks'],
        correctAnswer: 'Two weeks',
      },
      {
        question: 'What did the speaker like about the trains?',
        choices: ['They were cheap', 'They were always on time and clean', 'They had food on board', 'They were very fast'],
        correctAnswer: 'They were always on time and clean',
      },
      {
        question: 'What was the speaker\'s favourite food?',
        choices: ['Sushi', 'Ramen', 'Tempura', 'Rice balls'],
        correctAnswer: 'Ramen',
      },
      {
        question: 'What was the weather like?',
        choices: ['Cold and dry', 'Warm and sunny', 'Hot and humid', 'Cool and rainy'],
        correctAnswer: 'Hot and humid',
      },
    ],
  },
  {
    id: 'b1-l-004',
    title: 'Health Advice from a Doctor',
    type: 'monologue',
    script: `Many people come to me saying they feel tired all the time. There are several simple things you can do to have more energy. First, try to sleep between seven and nine hours every night. Going to bed at the same time each night helps your body develop a routine. Second, drink plenty of water. Many people don't drink enough, and even mild dehydration can make you feel exhausted. Third, exercise regularly. I recommend at least thirty minutes of moderate activity, such as walking or cycling, five times a week. You don't need to join a gym. Finally, pay attention to your diet. Eating lots of fruit, vegetables, and whole grains gives your body the fuel it needs. If you still feel constantly tired after making these changes, please come back and see me.`,
    speakers: ['narrator'],
    wordCount: 135,
    voiceConfig: { stability: 0.5, similarity_boost: 0.75, speed: 0.9 },
    audioUrl: 'https://storage.googleapis.com/edutask-4d90b.firebasestorage.app/cefr-audio/b1-l-004.mp3',
    maxReplays: 2,
    questions: [
      {
        question: 'How many hours of sleep does the doctor recommend?',
        choices: ['Five to seven', 'Six to eight', 'Seven to nine', 'Eight to ten'],
        correctAnswer: 'Seven to nine',
      },
      {
        question: 'According to the doctor, what does dehydration cause?',
        choices: ['Headaches', 'Feeling exhausted', 'Muscle pain', 'Difficulty sleeping'],
        correctAnswer: 'Feeling exhausted',
      },
      {
        question: 'How much exercise does the doctor suggest per week?',
        choices: ['Twenty minutes, three times', 'Thirty minutes, five times', 'Forty-five minutes, four times', 'One hour, three times'],
        correctAnswer: 'Thirty minutes, five times',
      },
      {
        question: 'What should the patient do if they are still tired after following the advice?',
        choices: ['Take vitamins', 'Sleep more', 'Come back to the doctor', 'Stop exercising'],
        correctAnswer: 'Come back to the doctor',
      },
    ],
  },
  {
    id: 'b1-l-005',
    title: 'Museum Welcome Announcement',
    type: 'announcement',
    script: `Good morning, and welcome to the National Science Museum. Before you begin your visit, here is some important information. The museum has three floors. The ground floor features our permanent collection on space exploration. The first floor has a special exhibition on ocean life, which will be here until the end of March. The second floor is our interactive science zone, which is very popular with children. Guided tours start every hour from the information desk and last approximately forty-five minutes. Photography is allowed in all areas except the special exhibition. The museum cafe is on the ground floor, and it serves lunch from twelve until two. We close at five thirty today. Enjoy your visit.`,
    speakers: ['narrator'],
    wordCount: 118,
    voiceConfig: { stability: 0.5, similarity_boost: 0.75, speed: 0.9 },
    audioUrl: 'https://storage.googleapis.com/edutask-4d90b.firebasestorage.app/cefr-audio/b1-l-005.mp3',
    maxReplays: 2,
    questions: [
      {
        question: 'What is on the ground floor?',
        choices: ['Ocean life exhibition', 'Interactive science zone', 'Space exploration collection', 'The cafe only'],
        correctAnswer: 'Space exploration collection',
      },
      {
        question: 'How long do the guided tours last?',
        choices: ['Thirty minutes', 'Forty-five minutes', 'One hour', 'One hour and a half'],
        correctAnswer: 'Forty-five minutes',
      },
      {
        question: 'Where is photography NOT allowed?',
        choices: ['The ground floor', 'The second floor', 'The special exhibition', 'The cafe'],
        correctAnswer: 'The special exhibition',
      },
      {
        question: 'When does the cafe serve lunch?',
        choices: ['Eleven to one', 'Twelve to two', 'Twelve to three', 'One to three'],
        correctAnswer: 'Twelve to two',
      },
    ],
  },
  {
    id: 'b1-l-006',
    title: 'Job Interview Preparation',
    type: 'dialogue',
    script: `[Speaker A] I have a job interview tomorrow and I'm really nervous. Do you have any tips?
[Speaker B] Sure. First, make sure you know about the company. Read their website and learn what they do.
[Speaker A] OK, I've already done that. They're a marketing company with about two hundred employees.
[Speaker B] Good. Also, think about common questions, like why you want the job and what your strengths are. Practise your answers out loud.
[Speaker A] That's helpful. What should I wear?
[Speaker B] Dress formally, even if the company has a casual dress code. It shows respect. And arrive ten minutes early so you're not rushing.
[Speaker A] Great advice. I feel more confident already. Thanks.
[Speaker B] You'll do great. Just be yourself and speak clearly.`,
    speakers: ['speaker1', 'speaker2'],
    wordCount: 128,
    voiceConfig: { stability: 0.5, similarity_boost: 0.75, speed: 0.9 },
    audioUrl: 'https://storage.googleapis.com/edutask-4d90b.firebasestorage.app/cefr-audio/b1-l-006.mp3',
    maxReplays: 2,
    questions: [
      {
        question: 'What type of company is the interview at?',
        choices: ['A technology company', 'A marketing company', 'A law firm', 'A hospital'],
        correctAnswer: 'A marketing company',
      },
      {
        question: 'What does the friend suggest about common questions?',
        choices: ['Write answers on paper', 'Practise answers out loud', 'Memorise answers word for word', 'Ask a family member to help'],
        correctAnswer: 'Practise answers out loud',
      },
      {
        question: 'What advice is given about clothing?',
        choices: ['Wear casual clothes', 'Dress formally', 'Wear the company uniform', 'Ask the company what to wear'],
        correctAnswer: 'Dress formally',
      },
      {
        question: 'How early should the person arrive?',
        choices: ['Five minutes', 'Ten minutes', 'Fifteen minutes', 'Twenty minutes'],
        correctAnswer: 'Ten minutes',
      },
    ],
  },
]

// ═══════════════════════════════════════════════════════════
//  B2 — Upper-Intermediate (150-220 words, speed 1.0, 2 replays, 4 Qs)
// ═══════════════════════════════════════════════════════════
const B2 = [
  {
    id: 'b2-l-001',
    title: 'Technology and Privacy',
    type: 'lecture',
    script: `Today, I want to talk about something that affects all of us: digital privacy. Every time you use a smartphone, browse the internet, or interact with social media, you leave a trail of data. Companies collect this information to build detailed profiles of your behaviour, preferences, and even your location. Most people accept terms and conditions without reading them, essentially giving companies permission to use their personal data in ways they might not expect. A recent study found that the average person would need seventy-six working days per year just to read all the privacy policies they agree to. So what can we do about this? Well, there are several practical steps. You can use a VPN to encrypt your internet connection, switch to privacy-focused browsers, and regularly review the permissions you've given to apps on your phone. However, some experts argue that individual actions are not enough and that governments need to introduce stronger regulations to protect citizens. The European Union's General Data Protection Regulation, or GDPR, is often cited as a model for such legislation.`,
    speakers: ['narrator'],
    wordCount: 175,
    voiceConfig: { stability: 0.5, similarity_boost: 0.75, speed: 1.0 },
    audioUrl: 'https://storage.googleapis.com/edutask-4d90b.firebasestorage.app/cefr-audio/b2-l-001.mp3',
    maxReplays: 2,
    questions: [
      {
        question: 'According to the speaker, what happens when you use social media?',
        choices: ['Your phone slows down', 'You leave a trail of data', 'You automatically accept regulations', 'Companies send you advertisements'],
        correctAnswer: 'You leave a trail of data',
      },
      {
        question: 'How long would it take to read all the privacy policies a person agrees to each year?',
        choices: ['Thirty working days', 'Fifty working days', 'Seventy-six working days', 'One hundred working days'],
        correctAnswer: 'Seventy-six working days',
      },
      {
        question: 'Which of the following is NOT mentioned as a way to protect privacy?',
        choices: ['Using a VPN', 'Switching to a privacy-focused browser', 'Deleting all social media accounts', 'Reviewing app permissions'],
        correctAnswer: 'Deleting all social media accounts',
      },
      {
        question: 'What legislation is mentioned as a model for data protection?',
        choices: ['The US Privacy Act', 'The UK Data Bill', 'The EU GDPR', 'The International Privacy Code'],
        correctAnswer: 'The EU GDPR',
      },
    ],
  },
  {
    id: 'b2-l-002',
    title: 'Cultural Differences in the Workplace',
    type: 'discussion',
    script: `[Speaker A] I've been working with our new team in Tokyo for a month now, and I've noticed some really interesting cultural differences in how we approach meetings.
[Speaker B] Really? Like what?
[Speaker A] Well, in our London office, people tend to speak up immediately if they disagree with something. But in Tokyo, the team members are more likely to consider their response carefully before saying anything. At first, I thought they were just being quiet, but actually they were being thoughtful and deliberate.
[Speaker B] That makes sense. I read somewhere that in many East Asian business cultures, silence during a meeting is a sign of respect and careful thought, whereas in Western cultures, it can be misinterpreted as disengagement.
[Speaker A] Exactly. Another thing I noticed is the decision-making process. Decisions are often made through consensus in Japan, which takes longer but means everyone is truly on board.
[Speaker B] I think there's something we can learn from both approaches. Perhaps we should allow more reflection time in our meetings here, while also encouraging our Tokyo colleagues to share initial reactions when speed is important.`,
    speakers: ['speaker1', 'speaker2'],
    wordCount: 185,
    voiceConfig: { stability: 0.5, similarity_boost: 0.75, speed: 1.0 },
    audioUrl: 'https://storage.googleapis.com/edutask-4d90b.firebasestorage.app/cefr-audio/b2-l-002.mp3',
    maxReplays: 2,
    questions: [
      {
        question: 'What did Speaker A initially think about the Tokyo team\'s silence?',
        choices: ['They were being rude', 'They were just being quiet', 'They disagreed with everything', 'They didn\'t understand English well'],
        correctAnswer: 'They were just being quiet',
      },
      {
        question: 'In many East Asian business cultures, what does silence during a meeting indicate?',
        choices: ['Boredom', 'Disagreement', 'Respect and careful thought', 'A desire to leave'],
        correctAnswer: 'Respect and careful thought',
      },
      {
        question: 'How are decisions typically made in Japan, according to Speaker A?',
        choices: ['By the most senior person', 'By voting', 'Through consensus', 'By the project manager alone'],
        correctAnswer: 'Through consensus',
      },
      {
        question: 'What does Speaker B suggest as a balanced approach?',
        choices: ['Follow the Japanese style completely', 'Follow the British style completely', 'Allow more reflection time but also encourage quick reactions when needed', 'Have separate meetings for each culture'],
        correctAnswer: 'Allow more reflection time but also encourage quick reactions when needed',
      },
    ],
  },
  {
    id: 'b2-l-003',
    title: 'Interview with an Entrepreneur',
    type: 'dialogue',
    script: `[Speaker A] So, Lisa, you left a well-paid corporate job three years ago to start your own organic food delivery company. A lot of people would say that was a risky move. How do you feel about it now?
[Speaker B] Honestly, it was the best decision I've ever made. Yes, the first year was incredibly difficult. I used all my savings and there were months when I didn't pay myself a salary. But I believed in what I was doing.
[Speaker A] What was the turning point for you?
[Speaker B] I'd say it was when a major supermarket chain contacted us about stocking our products. That gave us credibility and a steady income stream. But what really drives the business is our direct-to-customer subscription model. About sixty percent of our revenue comes from people who get a weekly box delivered to their door.
[Speaker A] And you've grown from just yourself to a team of twenty-eight. What's your advice for aspiring entrepreneurs?
[Speaker B] Don't wait for the perfect moment. There's never a perfect time to start. Also, surround yourself with people who are smarter than you and be willing to adapt when things don't go as planned.`,
    speakers: ['speaker1', 'speaker2'],
    wordCount: 195,
    voiceConfig: { stability: 0.5, similarity_boost: 0.75, speed: 1.0 },
    audioUrl: 'https://storage.googleapis.com/edutask-4d90b.firebasestorage.app/cefr-audio/b2-l-003.mp3',
    maxReplays: 2,
    questions: [
      {
        question: 'What did Lisa do before starting her own company?',
        choices: ['She was a chef', 'She worked in a well-paid corporate job', 'She was a university student', 'She managed a supermarket'],
        correctAnswer: 'She worked in a well-paid corporate job',
      },
      {
        question: 'What was the turning point for her business?',
        choices: ['Winning a business competition', 'Getting investment from a bank', 'A major supermarket wanting to stock her products', 'Being featured on television'],
        correctAnswer: 'A major supermarket wanting to stock her products',
      },
      {
        question: 'Where does most of the company\'s revenue come from?',
        choices: ['Supermarket sales', 'Online advertising', 'Direct-to-customer subscriptions', 'Restaurant partnerships'],
        correctAnswer: 'Direct-to-customer subscriptions',
      },
      {
        question: 'What advice does Lisa give to aspiring entrepreneurs?',
        choices: ['Save money for at least five years first', 'Don\'t wait for the perfect moment', 'Always work alone at the start', 'Follow a strict business plan'],
        correctAnswer: 'Don\'t wait for the perfect moment',
      },
    ],
  },
  {
    id: 'b2-l-004',
    title: 'Environmental Policy Discussion',
    type: 'discussion',
    script: `[Speaker A] The city council has proposed banning single-use plastics by next year. What's your take on this?
[Speaker B] I think it's a step in the right direction, but the timeline is too aggressive. Small businesses need time to find affordable alternatives. If we push this too fast, some local shops could go out of business.
[Speaker A] I see your point, but environmental groups say we've already been delaying action for too long. The amount of plastic waste in our rivers has tripled in the last decade.
[Speaker B] That's a fair point. Perhaps a phased approach would work better. We could start by banning the most common items, like plastic bags and straws, and give businesses two years to transition away from other items.
[Speaker A] That's actually close to what happened in Ireland. They introduced a plastic bag levy in 2002, and it reduced usage by about ninety percent almost overnight.
[Speaker B] Exactly. And the revenue from that levy funded environmental projects. So it wasn't just about prohibition but also about investing in solutions. I think that kind of balanced policy is what we should aim for here.`,
    speakers: ['speaker1', 'speaker2'],
    wordCount: 185,
    voiceConfig: { stability: 0.5, similarity_boost: 0.75, speed: 1.0 },
    audioUrl: 'https://storage.googleapis.com/edutask-4d90b.firebasestorage.app/cefr-audio/b2-l-004.mp3',
    maxReplays: 2,
    questions: [
      {
        question: 'What is the city council\'s proposal?',
        choices: ['To increase recycling centres', 'To ban single-use plastics by next year', 'To fine companies that produce plastic', 'To tax all packaging'],
        correctAnswer: 'To ban single-use plastics by next year',
      },
      {
        question: 'Why does Speaker B think the timeline is too aggressive?',
        choices: ['Technology isn\'t ready yet', 'Small businesses need time to find alternatives', 'People won\'t accept it', 'Plastic isn\'t the main problem'],
        correctAnswer: 'Small businesses need time to find alternatives',
      },
      {
        question: 'What happened in Ireland with the plastic bag levy?',
        choices: ['Usage dropped by fifty percent', 'Usage dropped by about ninety percent', 'It was reversed after one year', 'Businesses moved to other countries'],
        correctAnswer: 'Usage dropped by about ninety percent',
      },
      {
        question: 'What did the revenue from the Irish levy fund?',
        choices: ['Tax cuts for businesses', 'Environmental projects', 'New plastic factories', 'Government salaries'],
        correctAnswer: 'Environmental projects',
      },
    ],
  },
  {
    id: 'b2-l-005',
    title: 'The Rise of Remote Work',
    type: 'lecture',
    script: `The pandemic fundamentally transformed how we think about work. Before 2020, only about five percent of full-time employees worked remotely on a regular basis. By 2023, that figure had risen to roughly thirty percent in many developed economies. But what's really interesting is what happened next. Rather than returning fully to the office, most organisations settled on a hybrid model, typically three days in the office and two at home. The research on productivity is mixed. Some studies show that remote workers are actually more productive because they face fewer interruptions and don't have to commute. However, other studies point out that collaboration and creativity suffer when people aren't physically together. There's also the issue of employee wellbeing. While many workers enjoy the flexibility, others report feeling isolated and finding it harder to separate work from personal life. Managers face new challenges too: how do you build team culture when people rarely meet face to face? The companies that seem to be getting it right are those that are intentional about how they use office time, reserving it for collaboration and social connection rather than individual work that could be done anywhere.`,
    speakers: ['narrator'],
    wordCount: 195,
    voiceConfig: { stability: 0.5, similarity_boost: 0.75, speed: 1.0 },
    audioUrl: 'https://storage.googleapis.com/edutask-4d90b.firebasestorage.app/cefr-audio/b2-l-005.mp3',
    maxReplays: 2,
    questions: [
      {
        question: 'What percentage of employees worked remotely before 2020?',
        choices: ['About two percent', 'About five percent', 'About ten percent', 'About fifteen percent'],
        correctAnswer: 'About five percent',
      },
      {
        question: 'What model did most organisations settle on after the pandemic?',
        choices: ['Fully remote', 'Fully in-office', 'Hybrid with three office days', 'Alternating weeks'],
        correctAnswer: 'Hybrid with three office days',
      },
      {
        question: 'According to some studies, why are remote workers more productive?',
        choices: ['They work longer hours', 'They have better equipment at home', 'They face fewer interruptions and skip the commute', 'They are more motivated'],
        correctAnswer: 'They face fewer interruptions and skip the commute',
      },
      {
        question: 'How do successful companies use office time?',
        choices: ['For individual focused work', 'For collaboration and social connection', 'For performance reviews', 'For training sessions only'],
        correctAnswer: 'For collaboration and social connection',
      },
    ],
  },
  {
    id: 'b2-l-006',
    title: 'Social Media and Mental Health',
    type: 'discussion',
    script: `[Speaker A] I recently read a study that found teenagers who spend more than three hours a day on social media are twice as likely to experience symptoms of anxiety and depression. That's quite alarming.
[Speaker B] It is, but we have to be careful about correlation versus causation. It could be that teenagers who are already struggling with mental health are more likely to turn to social media as a coping mechanism.
[Speaker A] True. But there are mechanisms we can identify. The constant comparison with curated, idealised versions of other people's lives can erode self-esteem. And the dopamine-driven feedback loops of likes and comments can become genuinely addictive.
[Speaker B] I agree those are real concerns. But I think we also need to acknowledge the positive aspects. Social media can help young people connect with communities they wouldn't otherwise have access to, especially for those who feel marginalised.
[Speaker A] Absolutely. I'm not suggesting we ban it. I think the answer lies in education and design. We need to teach young people critical digital literacy skills and push companies to design platforms that prioritise wellbeing over engagement metrics.
[Speaker B] That's a nuanced position I can get behind.`,
    speakers: ['speaker1', 'speaker2'],
    wordCount: 195,
    voiceConfig: { stability: 0.5, similarity_boost: 0.75, speed: 1.0 },
    audioUrl: 'https://storage.googleapis.com/edutask-4d90b.firebasestorage.app/cefr-audio/b2-l-006.mp3',
    maxReplays: 2,
    questions: [
      {
        question: 'According to the study mentioned, what happens to teenagers who use social media more than three hours a day?',
        choices: ['They perform worse at school', 'They are twice as likely to experience anxiety and depression', 'They sleep less than six hours', 'They become addicted to their phones'],
        correctAnswer: 'They are twice as likely to experience anxiety and depression',
      },
      {
        question: 'What concern does Speaker B raise about the study?',
        choices: ['The sample size was too small', 'It doesn\'t account for correlation versus causation', 'It only studied one country', 'The researchers were biased'],
        correctAnswer: 'It doesn\'t account for correlation versus causation',
      },
      {
        question: 'What positive aspect of social media does Speaker B mention?',
        choices: ['It helps with homework', 'It improves communication skills', 'It connects marginalised young people with communities', 'It teaches technology skills'],
        correctAnswer: 'It connects marginalised young people with communities',
      },
      {
        question: 'What does Speaker A believe the solution is?',
        choices: ['Banning social media for teenagers', 'Limiting screen time to one hour', 'Education and better platform design', 'Making social media paid only'],
        correctAnswer: 'Education and better platform design',
      },
    ],
  },
]

// ═══════════════════════════════════════════════════════════
//  C1 — Advanced (220-300 words, speed 1.05, 1 replay, 4 Qs)
// ═══════════════════════════════════════════════════════════
const C1 = [
  {
    id: 'c1-l-001',
    title: 'Research Findings on Sleep Deprivation',
    type: 'lecture',
    script: `I'd like to draw your attention to some recent findings from our longitudinal study on sleep deprivation and cognitive performance. Over the past five years, we've been tracking fourteen hundred participants across three age groups. What we've discovered challenges some of the conventional wisdom about sleep. First, and perhaps most strikingly, chronic sleep restriction of just one hour per night, so sleeping six hours instead of seven, produced cumulative cognitive deficits that participants were largely unaware of. In other words, people thought they were functioning normally, but their reaction times, decision-making ability, and working memory were measurably impaired. This has profound implications for professions where alertness is critical, such as healthcare, transportation, and aviation. Second, we found that so-called recovery sleep on weekends does not fully reverse the effects of weekday sleep debt. Participants who slept in on Saturdays and Sundays still showed deficits on Monday morning compared to those who maintained consistent sleep schedules. Third, and this was unexpected, we observed significant individual variation in vulnerability to sleep deprivation. Roughly fifteen percent of our participants showed remarkable resilience, maintaining near-normal performance even after several days of restricted sleep. We're now investigating whether this resilience has a genetic basis, as preliminary data suggest it may be linked to variations in the adenosine receptor gene. The practical takeaway is this: you are probably a worse judge of your own sleep needs than you think, and regularity matters more than occasional catch-up sleep.`,
    speakers: ['narrator'],
    wordCount: 230,
    voiceConfig: { stability: 0.5, similarity_boost: 0.75, speed: 1.05 },
    audioUrl: 'https://storage.googleapis.com/edutask-4d90b.firebasestorage.app/cefr-audio/c1-l-001.mp3',
    maxReplays: 1,
    questions: [
      {
        question: 'What did the study reveal about people who slept six hours instead of seven?',
        choices: ['They performed equally well on all tasks', 'They experienced deficits they were largely unaware of', 'They adapted within two weeks', 'They showed improvement in creativity'],
        correctAnswer: 'They experienced deficits they were largely unaware of',
      },
      {
        question: 'What did the study find about recovery sleep on weekends?',
        choices: ['It fully reverses weekday sleep debt', 'It is more effective than napping', 'It does not fully reverse the effects of sleep debt', 'It causes additional fatigue on Mondays'],
        correctAnswer: 'It does not fully reverse the effects of sleep debt',
      },
      {
        question: 'What percentage of participants showed resilience to sleep deprivation?',
        choices: ['About five percent', 'About ten percent', 'About fifteen percent', 'About twenty-five percent'],
        correctAnswer: 'About fifteen percent',
      },
      {
        question: 'What is the practical takeaway of the research?',
        choices: ['Everyone needs exactly eight hours of sleep', 'Napping is the best solution for sleep debt', 'Regularity matters more than occasional catch-up sleep', 'Caffeine can replace lost sleep effectively'],
        correctAnswer: 'Regularity matters more than occasional catch-up sleep',
      },
    ],
  },
  {
    id: 'c1-l-002',
    title: 'Education Policy Debate',
    type: 'discussion',
    script: `[Speaker A] The proposal to extend the school day by ninety minutes has generated quite a lot of controversy. Dr. Whitfield, you've been a vocal critic. Could you explain your position?
[Speaker B] Certainly. The fundamental problem with this proposal is that it confuses quantity with quality. Research consistently shows that after about five hours of instruction, the marginal benefit of additional classroom time diminishes rapidly, particularly for younger students. What matters is what happens during instructional time, not simply how much of it there is.
[Speaker A] Professor Tanaka, you support the proposal. How do you respond to that?
[Speaker C] I think Dr. Whitfield makes a valid point about diminishing returns, but that assumes the additional time would be used for more of the same. Our proposal specifically allocates the extra ninety minutes to enrichment activities: arts, music, sports, and project-based learning. These aren't traditional academic lessons. They address the well-documented gap in access to extracurricular activities between affluent and disadvantaged students.
[Speaker B] But there's a cost question here. Staffing those additional hours requires significant investment. The government's own figures estimate an annual cost of two point three billion. That money could arguably achieve more if invested in reducing class sizes or improving teacher training.
[Speaker C] I'd argue the comparison is misleading. The extended day programme also provides childcare benefits that save families an estimated eight hundred pounds per year, and it reduces the attainment gap, which has long-term economic returns that far outweigh the initial investment.`,
    speakers: ['speaker1', 'speaker2', 'speaker3'],
    wordCount: 235,
    voiceConfig: { stability: 0.5, similarity_boost: 0.75, speed: 1.05 },
    audioUrl: 'https://storage.googleapis.com/edutask-4d90b.firebasestorage.app/cefr-audio/c1-l-002.mp3',
    maxReplays: 1,
    questions: [
      {
        question: 'What is Dr. Whitfield\'s main argument against extending the school day?',
        choices: ['Students will be too tired', 'It confuses quantity with quality of instruction', 'Parents don\'t support the proposal', 'There aren\'t enough teachers'],
        correctAnswer: 'It confuses quantity with quality of instruction',
      },
      {
        question: 'How would the additional ninety minutes be used according to Professor Tanaka?',
        choices: ['More maths and science lessons', 'Test preparation', 'Enrichment activities like arts, music, and sports', 'Self-study periods'],
        correctAnswer: 'Enrichment activities like arts, music, and sports',
      },
      {
        question: 'What is the estimated annual cost of the proposal?',
        choices: ['One point five billion', 'Two point three billion', 'Three point seven billion', 'Five billion'],
        correctAnswer: 'Two point three billion',
      },
      {
        question: 'What additional benefit does Professor Tanaka mention beyond education?',
        choices: ['Reduced crime rates', 'Better nutrition for students', 'Childcare savings for families', 'Improved teacher satisfaction'],
        correctAnswer: 'Childcare savings for families',
      },
    ],
  },
  {
    id: 'c1-l-003',
    title: 'How Machine Learning Models Work',
    type: 'lecture',
    script: `I want to demystify something that many people find intimidating: how machine learning models actually work under the hood. At its core, a machine learning model is a mathematical function that maps inputs to outputs. Let's take a concrete example. Suppose you want to build a model that predicts house prices. Your inputs might include square footage, number of bedrooms, neighbourhood, and age of the property. During training, the model is shown thousands of examples of houses with known prices. It adjusts internal parameters, called weights, to minimise the difference between its predictions and the actual prices. This process is called optimisation, and the most common method is gradient descent, which you can think of as a ball rolling downhill towards the lowest point in a landscape of errors. Now, here's where it gets interesting. Modern deep learning models have millions or even billions of these weights arranged in layers, hence the term "deep." Each layer learns to represent the data at a different level of abstraction. In an image recognition model, for instance, early layers might detect edges and textures, middle layers identify shapes and patterns, and later layers recognise objects. The remarkable thing is that nobody explicitly programmes these representations. The model discovers them through exposure to data. This is both the power and the limitation of machine learning: it can find patterns humans would never notice, but it can also learn biases present in the training data, which is why careful dataset curation and model auditing are essential.`,
    speakers: ['narrator'],
    wordCount: 235,
    voiceConfig: { stability: 0.5, similarity_boost: 0.75, speed: 1.05 },
    audioUrl: 'https://storage.googleapis.com/edutask-4d90b.firebasestorage.app/cefr-audio/c1-l-003.mp3',
    maxReplays: 1,
    questions: [
      {
        question: 'What does the speaker compare gradient descent to?',
        choices: ['Water flowing through pipes', 'A ball rolling downhill', 'A car accelerating', 'Climbing a mountain'],
        correctAnswer: 'A ball rolling downhill',
      },
      {
        question: 'In an image recognition model, what do early layers detect?',
        choices: ['Complete objects', 'Colours and brightness', 'Edges and textures', 'Faces and expressions'],
        correctAnswer: 'Edges and textures',
      },
      {
        question: 'How do deep learning models learn their representations?',
        choices: ['Through explicit programming by engineers', 'By copying other models', 'Through exposure to data', 'By following predefined rules'],
        correctAnswer: 'Through exposure to data',
      },
      {
        question: 'What limitation of machine learning does the speaker highlight?',
        choices: ['Models are too slow for real-time use', 'Models can learn biases from training data', 'Models cannot process images', 'Models require constant human supervision'],
        correctAnswer: 'Models can learn biases from training data',
      },
    ],
  },
  {
    id: 'c1-l-004',
    title: 'Urban Planning and Liveable Cities',
    type: 'lecture',
    script: `What makes a city truly liveable? This is a question that urban planners have been grappling with for decades, and the answer has evolved considerably over time. In the mid-twentieth century, the dominant paradigm was car-centric design. Cities like Los Angeles and Houston were built around the automobile, with sprawling suburbs connected by vast highway networks. The assumption was that personal mobility through car ownership equated to quality of life. We now know that this approach had significant unintended consequences: social isolation, environmental degradation, and public health problems linked to sedentary lifestyles and air pollution. The contemporary approach to urban planning has shifted dramatically. Cities like Copenhagen, Barcelona, and Melbourne are now frequently cited as models of liveability, and they share several common features. First, they prioritise pedestrians and cyclists over cars through dedicated infrastructure. Copenhagen's network of cycle highways, for example, now handles more daily commuters than its road network. Second, they maintain a mix of residential, commercial, and recreational spaces within walking distance, a concept known as the fifteen-minute city. Third, they invest heavily in green spaces, which research has shown to reduce stress, improve air quality, and strengthen community bonds. Perhaps most importantly, these cities engage residents in the planning process. Barcelona's superblocks programme, which reclaims street space from cars and returns it to communities, was developed through extensive citizen consultation. The result has been a measurable improvement in air quality, noise reduction, and neighbourhood social interaction.`,
    speakers: ['narrator'],
    wordCount: 230,
    voiceConfig: { stability: 0.5, similarity_boost: 0.75, speed: 1.05 },
    audioUrl: 'https://storage.googleapis.com/edutask-4d90b.firebasestorage.app/cefr-audio/c1-l-004.mp3',
    maxReplays: 1,
    questions: [
      {
        question: 'What was the dominant urban planning paradigm in the mid-twentieth century?',
        choices: ['Pedestrian-first design', 'Car-centric design', 'Mixed-use neighbourhoods', 'Green space maximisation'],
        correctAnswer: 'Car-centric design',
      },
      {
        question: 'What does the "fifteen-minute city" concept mean?',
        choices: ['Traffic should never last more than fifteen minutes', 'All essential services are within walking distance', 'Public transport runs every fifteen minutes', 'New buildings take fifteen minutes to approve'],
        correctAnswer: 'All essential services are within walking distance',
      },
      {
        question: 'What is notable about Copenhagen\'s cycle highway network?',
        choices: ['It is the longest in Europe', 'It handles more daily commuters than the road network', 'It was built in under a year', 'It connects to other countries'],
        correctAnswer: 'It handles more daily commuters than the road network',
      },
      {
        question: 'How was Barcelona\'s superblocks programme developed?',
        choices: ['By a single architect', 'Through government decree', 'Through extensive citizen consultation', 'By copying a model from Copenhagen'],
        correctAnswer: 'Through extensive citizen consultation',
      },
    ],
  },
  {
    id: 'c1-l-005',
    title: 'Globalisation and Local Economies',
    type: 'discussion',
    script: `[Speaker A] Professor Reeves, your new book argues that globalisation has entered a fundamentally different phase. Can you elaborate on that?
[Speaker B] Yes. The globalisation we experienced from the 1990s to around 2015 was characterised by the free flow of goods, capital, and to some extent, labour, across borders. It was driven by trade agreements, falling communication costs, and the integration of China and India into the global economy. What we're seeing now is a reconfiguration. Supply chains are being shortened and diversified. Companies are reshoring or nearshoring production, partly in response to the disruptions caused by the pandemic and geopolitical tensions.
[Speaker A] Some economists would call that deglobalisation. Do you agree with that term?
[Speaker B] I'd push back on that characterisation. Trade volumes are still historically high. What's changed is the nature of what's being traded. Physical goods are becoming a smaller share of global trade, while services, data, and intellectual property are growing rapidly. So we're not seeing less globalisation, we're seeing different globalisation. The countries that will thrive in this new landscape are those that can combine competitive manufacturing with strong service sectors and robust digital infrastructure.
[Speaker A] And what about the impact on workers in developing countries who relied on manufacturing jobs?
[Speaker B] That's the critical question. Automation and the shift to services mean that the manufacturing-led development path that lifted hundreds of millions out of poverty in East Asia may not be available in the same way for countries in Sub-Saharan Africa or South Asia. These regions need alternative development strategies that leverage their strengths, whether that's agriculture, services, or the green energy transition.`,
    speakers: ['speaker1', 'speaker2'],
    wordCount: 260,
    voiceConfig: { stability: 0.5, similarity_boost: 0.75, speed: 1.05 },
    audioUrl: 'https://storage.googleapis.com/edutask-4d90b.firebasestorage.app/cefr-audio/c1-l-005.mp3',
    maxReplays: 1,
    questions: [
      {
        question: 'According to Professor Reeves, what is happening to supply chains?',
        choices: ['They are becoming longer', 'They are being shortened and diversified', 'They are being eliminated', 'They are fully automated'],
        correctAnswer: 'They are being shortened and diversified',
      },
      {
        question: 'Why does Professor Reeves reject the term "deglobalisation"?',
        choices: ['Trade has actually increased dramatically', 'Trade volumes are still high but the nature of trade has changed', 'Countries are more connected than ever', 'Manufacturing exports are booming'],
        correctAnswer: 'Trade volumes are still high but the nature of trade has changed',
      },
      {
        question: 'What is growing as a share of global trade?',
        choices: ['Raw materials', 'Agricultural products', 'Physical manufactured goods', 'Services, data, and intellectual property'],
        correctAnswer: 'Services, data, and intellectual property',
      },
      {
        question: 'What concern is raised about developing countries?',
        choices: ['They will stop trading entirely', 'The manufacturing development path may not be available to them', 'They will become too dependent on technology', 'Their populations are declining'],
        correctAnswer: 'The manufacturing development path may not be available to them',
      },
    ],
  },
  {
    id: 'c1-l-006',
    title: 'Cognitive Biases in Decision Making',
    type: 'lecture',
    script: `Let me start today's session by asking you a question. Imagine you've just bought a concert ticket for eighty dollars, and on the day of the concert, you realise you've lost the ticket. Would you buy another one? Now imagine instead that you're on your way to buy the ticket and you discover you've lost eighty dollars from your wallet. Would you still buy the ticket? Logically, both scenarios are identical: you're eighty dollars poorer and face the choice of spending eighty more. Yet research consistently shows that people are much less likely to buy a replacement ticket than to buy the ticket after losing cash. This is an example of what behavioural economists call mental accounting, one of dozens of cognitive biases that systematically distort our decision-making. Another well-documented bias is anchoring. In negotiations, the first number mentioned tends to disproportionately influence the final outcome, regardless of whether it's reasonable. Estate agents know this, which is why asking prices are often set deliberately high. Then there's the sunk cost fallacy, our tendency to continue investing in something because of what we've already spent, rather than evaluating future prospects objectively. This explains why people sit through terrible films they've paid for, or why businesses pour money into failing projects. Understanding these biases doesn't make you immune to them, but it gives you a framework for questioning your intuitions. The most effective strategy is to introduce structured decision-making processes, checklists, pre-mortems, and devil's advocates, that force you to consider perspectives your biases would otherwise filter out.`,
    speakers: ['narrator'],
    wordCount: 250,
    voiceConfig: { stability: 0.5, similarity_boost: 0.75, speed: 1.05 },
    audioUrl: 'https://storage.googleapis.com/edutask-4d90b.firebasestorage.app/cefr-audio/c1-l-006.mp3',
    maxReplays: 1,
    questions: [
      {
        question: 'What cognitive bias does the concert ticket example illustrate?',
        choices: ['Anchoring', 'Sunk cost fallacy', 'Mental accounting', 'Confirmation bias'],
        correctAnswer: 'Mental accounting',
      },
      {
        question: 'How does the anchoring bias affect negotiations?',
        choices: ['People always accept the first offer', 'The first number mentioned disproportionately influences the outcome', 'People refuse to negotiate after the first offer', 'Both parties always meet in the middle'],
        correctAnswer: 'The first number mentioned disproportionately influences the outcome',
      },
      {
        question: 'What is the sunk cost fallacy?',
        choices: ['Investing in things that have already succeeded', 'Avoiding all risk in financial decisions', 'Continuing to invest because of what has already been spent', 'Spending more during sales events'],
        correctAnswer: 'Continuing to invest because of what has already been spent',
      },
      {
        question: 'What strategy does the speaker recommend for countering biases?',
        choices: ['Trusting your intuition more', 'Avoiding all decisions under pressure', 'Introducing structured decision-making processes', 'Making decisions as quickly as possible'],
        correctAnswer: 'Introducing structured decision-making processes',
      },
    ],
  },
]

// ═══════════════════════════════════════════════════════════
//  C2 — Proficiency (300-400 words, speed 1.1, 1 replay, 4 Qs)
// ═══════════════════════════════════════════════════════════
const C2 = [
  {
    id: 'c2-l-001',
    title: 'The Hard Problem of Consciousness',
    type: 'lecture',
    script: `In philosophy of mind, we frequently distinguish between what David Chalmers famously termed the "easy problems" and the "hard problem" of consciousness. The easy problems, and I should note that they're only easy in a relative sense, concern the mechanisms by which the brain processes environmental stimuli, integrates information, and produces behavioural responses. These are problems that neuroscience is making genuine progress on. We can map neural correlates of perception, identify which brain regions activate during specific cognitive tasks, and even predict certain decisions from brain scans before the subject is consciously aware of having made them. The hard problem, however, is of an entirely different character. It asks: why is there subjective experience at all? Why does the redness of red feel like something? Why isn't all this information processing happening in the dark, so to speak, without any accompanying phenomenal experience? This is what philosophers call qualia, the qualitative, first-person character of conscious experience. The hard problem resists the usual scientific approach because it's not clear that any amount of objective, third-person data about neural activity could ever fully explain why those processes are accompanied by subjective experience. This has led to a fascinating proliferation of theoretical positions. Physicalists argue that consciousness will ultimately be explained by a mature neuroscience, even if we can't see how yet. Property dualists, like Chalmers himself, contend that consciousness is a fundamental feature of reality that cannot be reduced to physical processes. Panpsychists take this further, suggesting that some form of experience is present in all matter, not just brains. And illusionists, perhaps the most counterintuitive camp, argue that the hard problem is itself an illusion, that our introspective reports about the richness of our experience are systematically misleading. Each of these positions faces serious objections, and after three decades of intense debate, we're arguably no closer to a consensus. What the hard problem has accomplished, however, is to sharpen our understanding of what a satisfactory theory of consciousness would need to explain, and that, I would argue, is genuine philosophical progress.`,
    speakers: ['narrator'],
    wordCount: 310,
    voiceConfig: { stability: 0.5, similarity_boost: 0.75, speed: 1.1 },
    audioUrl: 'https://storage.googleapis.com/edutask-4d90b.firebasestorage.app/cefr-audio/c2-l-001.mp3',
    maxReplays: 1,
    questions: [
      {
        question: 'What does the "hard problem" of consciousness concern?',
        choices: ['How the brain processes environmental stimuli', 'Why subjective experience exists at all', 'Which brain regions are responsible for decision-making', 'How to measure consciousness with brain scans'],
        correctAnswer: 'Why subjective experience exists at all',
      },
      {
        question: 'What do panpsychists believe?',
        choices: ['Consciousness is an illusion', 'Consciousness exists only in human brains', 'Some form of experience is present in all matter', 'Neuroscience will eventually explain consciousness completely'],
        correctAnswer: 'Some form of experience is present in all matter',
      },
      {
        question: 'What position do illusionists hold?',
        choices: ['The hard problem is itself an illusion', 'Consciousness is a fundamental property of reality', 'Only humans have genuine consciousness', 'The easy problems are more important'],
        correctAnswer: 'The hard problem is itself an illusion',
      },
      {
        question: 'According to the speaker, what has the hard problem accomplished?',
        choices: ['It has been definitively solved', 'It has been proven irrelevant', 'It has sharpened understanding of what a theory of consciousness must explain', 'It has unified all theoretical positions'],
        correctAnswer: 'It has sharpened understanding of what a theory of consciousness must explain',
      },
    ],
  },
  {
    id: 'c2-l-002',
    title: 'Unreliable Narration in Modern Fiction',
    type: 'discussion',
    script: `[Speaker A] Today we're examining the literary device of unreliable narration, which has become increasingly sophisticated in contemporary fiction. Dr. Harmon, you've written extensively about this. Where would you place the origins?
[Speaker B] Well, the roots go back at least to Poe and arguably to Cervantes, but the concept was formally articulated by Wayne Booth in 1961. What's evolved dramatically since then is the taxonomy of unreliability. Booth's original framework was rather binary: a narrator was either reliable or unreliable. Contemporary narratologists like Ansgar Nunning have developed far more nuanced classifications. We now distinguish between narrators who are unknowingly unreliable due to cognitive limitations, those who are deliberately deceptive, and those whose unreliability is a function of the narrative structure itself.
[Speaker A] Could you give us an example of that structural unreliability?
[Speaker B] Kazuo Ishiguro's The Remains of the Day is a masterclass. Stevens, the butler-narrator, doesn't lie to the reader. His unreliability emerges from what he omits and from the gap between his emotionally repressed language and the deeply emotional events he describes. The reader essentially has to read against the grain of the narration to access the true story. It's a form of dramatic irony sustained across an entire novel.
[Speaker A] And how does this differ from, say, the unreliable narration in Gone Girl?
[Speaker B] That's a useful contrast. Gillian Flynn employs what I'd call adversarial unreliability. The narrator actively and strategically deceives the reader, and the revelation of that deception becomes the central plot mechanism. Ishiguro's approach is more subtle and arguably more literary because the narrator's self-deception mirrors a universal human tendency. We all construct narratives about our lives that elide uncomfortable truths. Ishiguro makes the reader complicit in that process by having them gradually recognise what Stevens cannot.
[Speaker A] It raises interesting questions about the relationship between reader and text.
[Speaker B] Absolutely. The unreliable narrator transforms reading from a passive reception of information into an active interpretive act. The reader becomes a kind of detective, weighing every statement against context, tone, and what is conspicuously absent. In that sense, unreliable narration is perhaps the most honest form of fiction, because it acknowledges that all narration, including the stories we tell ourselves, involves selection, emphasis, and inevitable distortion.`,
    speakers: ['speaker1', 'speaker2'],
    wordCount: 340,
    voiceConfig: { stability: 0.5, similarity_boost: 0.75, speed: 1.1 },
    audioUrl: 'https://storage.googleapis.com/edutask-4d90b.firebasestorage.app/cefr-audio/c2-l-002.mp3',
    maxReplays: 1,
    questions: [
      {
        question: 'Who formally articulated the concept of the unreliable narrator?',
        choices: ['Edgar Allan Poe', 'Kazuo Ishiguro', 'Wayne Booth', 'Ansgar Nunning'],
        correctAnswer: 'Wayne Booth',
      },
      {
        question: 'What makes Stevens in The Remains of the Day an unreliable narrator?',
        choices: ['He deliberately lies to the reader', 'His unreliability comes from omissions and repressed emotion', 'He has a mental illness affecting memory', 'The author switches narrators without warning'],
        correctAnswer: 'His unreliability comes from omissions and repressed emotion',
      },
      {
        question: 'How does Dr. Harmon describe the unreliable narration in Gone Girl?',
        choices: ['Structural unreliability', 'Cognitive unreliability', 'Adversarial unreliability', 'Unconscious unreliability'],
        correctAnswer: 'Adversarial unreliability',
      },
      {
        question: 'Why does Dr. Harmon call unreliable narration "the most honest form of fiction"?',
        choices: ['Because unreliable narrators always reveal the truth eventually', 'Because it reflects that all narration involves selection and distortion', 'Because readers prefer narrators who admit to lying', 'Because it uses factual events as source material'],
        correctAnswer: 'Because it reflects that all narration involves selection and distortion',
      },
    ],
  },
  {
    id: 'c2-l-003',
    title: 'Quantum Entanglement and Locality',
    type: 'lecture',
    script: `I want to address one of the most profound and frequently misunderstood phenomena in modern physics: quantum entanglement. When two particles become entangled, measuring a property of one instantaneously determines the corresponding property of the other, regardless of the distance separating them. Einstein famously dismissed this as "spooky action at a distance" and argued, along with Podolsky and Rosen in their celebrated 1935 paper, that quantum mechanics must be incomplete. There must, they reasoned, be hidden variables, predetermined values that the particles carry with them, that would explain the correlations without requiring any non-local influence. For decades, this seemed like a question that could never be resolved empirically. Then, in 1964, John Bell formulated his remarkable inequality, a mathematical constraint that any local hidden variable theory must satisfy. The genius of Bell's theorem is that it's experimentally testable. If the correlations between entangled particles violate Bell's inequality, then no local hidden variable theory can account for the results. Alain Aspect's pioneering experiments in 1982, and subsequent increasingly rigorous tests, have consistently shown violations of Bell's inequality. The implications are staggering: either we accept that reality is fundamentally non-local, that distant events can instantaneously influence each other, or we abandon the assumption of realism, the idea that particles have definite properties before measurement. Most physicists today accept some form of non-locality, though it's crucial to note that entanglement cannot be used to transmit information faster than light. The correlations are only apparent when the results from both particles are compared, which requires classical communication. This is what prevents entanglement from violating special relativity, but it does force us to reconsider our most basic intuitions about the nature of physical reality, separability, and causation. The philosophical ramifications continue to be debated vigorously, and I would argue they constitute the deepest unresolved conceptual problem in fundamental physics.`,
    speakers: ['narrator'],
    wordCount: 300,
    voiceConfig: { stability: 0.5, similarity_boost: 0.75, speed: 1.1 },
    audioUrl: 'https://storage.googleapis.com/edutask-4d90b.firebasestorage.app/cefr-audio/c2-l-003.mp3',
    maxReplays: 1,
    questions: [
      {
        question: 'What was Einstein\'s explanation for entanglement correlations?',
        choices: ['Particles communicate faster than light', 'There must be hidden variables that predetermine outcomes', 'Quantum mechanics is entirely correct as stated', 'Entanglement only works at short distances'],
        correctAnswer: 'There must be hidden variables that predetermine outcomes',
      },
      {
        question: 'What did Bell\'s inequality make possible?',
        choices: ['Building quantum computers', 'Experimentally testing whether local hidden variable theories are viable', 'Transmitting information faster than light', 'Observing individual quantum particles'],
        correctAnswer: 'Experimentally testing whether local hidden variable theories are viable',
      },
      {
        question: 'What did Aspect\'s experiments show?',
        choices: ['Bell\'s inequality was never violated', 'Einstein\'s hidden variable theory was correct', 'Bell\'s inequality was consistently violated', 'Entanglement doesn\'t exist at large distances'],
        correctAnswer: 'Bell\'s inequality was consistently violated',
      },
      {
        question: 'Why can\'t entanglement be used to transmit information faster than light?',
        choices: ['The particles are too small to carry data', 'Correlations only become apparent when results are compared via classical communication', 'Entanglement breaks down over distance', 'Current technology isn\'t advanced enough'],
        correctAnswer: 'Correlations only become apparent when results are compared via classical communication',
      },
    ],
  },
  {
    id: 'c2-l-004',
    title: 'Ethics of Germline Genetic Engineering',
    type: 'discussion',
    script: `[Speaker A] The advent of CRISPR-Cas9 gene editing has made germline modification, that is, changes to DNA that would be inherited by future generations, technically feasible. Professor Okafor, should there be an outright ban on germline editing in humans?
[Speaker B] I think a blanket ban would be both ethically unjustifiable and practically unenforceable. Consider a couple who both carry the gene for a devastating condition like Huntington's disease. If we have the technology to ensure their child won't inherit that gene, and we refuse to use it, we're making a moral choice by omission. The question isn't whether we should intervene in nature, we already do that every time we administer a vaccine or perform surgery. The question is where we draw the line.
[Speaker A] Dr. Nakamura, you've argued for a moratorium. What's your reasoning?
[Speaker C] My concern is not with the therapeutic applications Professor Okafor describes. It's with the trajectory. Once we accept editing out disease genes, the boundary between therapy and enhancement becomes exceedingly difficult to maintain. We've already seen proposals for editing genes associated with intelligence, athletic ability, and physical appearance. This isn't science fiction; it's a logical extension of the technology. And the equity implications are profound. If genetic enhancement becomes available only to the wealthy, we're looking at a future where social inequality is literally written into our DNA.
[Speaker B] I share Dr. Nakamura's concern about equity, but I'd argue the solution is regulation and universal access, not prohibition. We don't ban life-saving medications because they're initially expensive; we develop policies to make them accessible.
[Speaker C] But medications don't permanently alter the human gene pool. Germline changes are irrevocable and intergenerational. If we make a mistake, we can't recall it like a faulty product. We're making decisions that will affect people who don't yet exist and who never consented to being modified. That asymmetry of power demands extraordinary caution.
[Speaker A] How do you both view the current regulatory landscape?
[Speaker B] It's fragmented and inadequate. We need an international framework, something akin to what we have for nuclear technology, that permits therapeutic applications under strict oversight while establishing enforceable boundaries against enhancement applications, at least until we've had a genuinely inclusive global conversation about where those boundaries should lie.`,
    speakers: ['speaker1', 'speaker2', 'speaker3'],
    wordCount: 345,
    voiceConfig: { stability: 0.5, similarity_boost: 0.75, speed: 1.1 },
    audioUrl: 'https://storage.googleapis.com/edutask-4d90b.firebasestorage.app/cefr-audio/c2-l-004.mp3',
    maxReplays: 1,
    questions: [
      {
        question: 'Why does Professor Okafor oppose a blanket ban on germline editing?',
        choices: ['It would slow scientific progress', 'Refusing to prevent inherited diseases is a moral choice by omission', 'Other countries would gain a competitive advantage', 'The technology is already too widespread to ban'],
        correctAnswer: 'Refusing to prevent inherited diseases is a moral choice by omission',
      },
      {
        question: 'What is Dr. Nakamura\'s primary concern?',
        choices: ['The technology doesn\'t work reliably enough', 'The difficulty of maintaining the boundary between therapy and enhancement', 'Religious objections to genetic modification', 'Lack of interest from the scientific community'],
        correctAnswer: 'The difficulty of maintaining the boundary between therapy and enhancement',
      },
      {
        question: 'Why does Dr. Nakamura argue germline changes are fundamentally different from medications?',
        choices: ['They are more expensive', 'They are irrevocable and affect future generations who never consented', 'They require more testing', 'They only work in certain populations'],
        correctAnswer: 'They are irrevocable and affect future generations who never consented',
      },
      {
        question: 'What kind of regulatory framework does Professor Okafor advocate?',
        choices: ['National regulations only', 'A complete global ban for fifty years', 'An international framework similar to nuclear technology oversight', 'Self-regulation by the scientific community'],
        correctAnswer: 'An international framework similar to nuclear technology oversight',
      },
    ],
  },
  {
    id: 'c2-l-005',
    title: 'Linguistic Relativity and Cognition',
    type: 'lecture',
    script: `The Sapir-Whorf hypothesis, or the principle of linguistic relativity, posits that the structure of a language influences, or in its stronger formulation, determines the way its speakers perceive and conceptualise the world. The strong version, linguistic determinism, which holds that thought is essentially impossible without language, has been largely discredited. However, the weak version, that language influences cognition in measurable ways, has received compelling empirical support in recent decades. Consider the domain of colour perception. The Dani people of Papua New Guinea have only two basic colour terms, roughly equivalent to dark and light. Early Whorfian predictions suggested they would have difficulty distinguishing between colours. Subsequent research by Eleanor Rosch in the 1970s seemed to refute this, showing that the Dani could perceive colour distinctions even without corresponding vocabulary. However, more sophisticated recent experiments have revealed a subtler picture. While people can perceive colours they don't have words for, the presence of linguistic categories accelerates recognition and enhances memory for those colours. Language doesn't create perceptual boundaries, but it sharpens them. Perhaps the most striking evidence comes from spatial cognition. Some languages, like Guugu Yimithirr, an Australian Aboriginal language, use absolute cardinal directions instead of relative terms. Speakers say "the cup is to the north of the plate" rather than "to the left of." Research by Stephen Levinson has shown that speakers of such languages maintain an extraordinary sense of absolute orientation, even indoors and in unfamiliar environments, a cognitive ability that speakers of relative-frame languages simply don't develop. Time is another fascinating domain. English speakers tend to conceptualise time horizontally, with the future ahead and the past behind. Mandarin speakers, however, frequently use vertical metaphors, with earlier events above and later events below. Lera Boroditsky's experiments have demonstrated that these linguistic metaphors measurably influence how speakers think about temporal relationships, even in non-linguistic tasks. The emerging consensus is that while language doesn't imprison us in a particular worldview, it does create habitual patterns of thought, cognitive grooves, if you will, that require conscious effort to override.`,
    speakers: ['narrator'],
    wordCount: 320,
    voiceConfig: { stability: 0.5, similarity_boost: 0.75, speed: 1.1 },
    audioUrl: 'https://storage.googleapis.com/edutask-4d90b.firebasestorage.app/cefr-audio/c2-l-005.mp3',
    maxReplays: 1,
    questions: [
      {
        question: 'What is the status of the strong version of the Sapir-Whorf hypothesis?',
        choices: ['It has been largely confirmed', 'It remains the dominant view', 'It has been largely discredited', 'It has never been tested empirically'],
        correctAnswer: 'It has been largely discredited',
      },
      {
        question: 'What do recent experiments show about language and colour perception?',
        choices: ['People cannot see colours they have no word for', 'Language creates entirely new perceptual categories', 'Language sharpens perceptual boundaries but doesn\'t create them', 'Colour perception is entirely independent of language'],
        correctAnswer: 'Language sharpens perceptual boundaries but doesn\'t create them',
      },
      {
        question: 'What unique cognitive ability do speakers of Guugu Yimithirr demonstrate?',
        choices: ['Superior memory for faces', 'Extraordinary sense of absolute spatial orientation', 'Ability to learn multiple languages easily', 'Enhanced mathematical reasoning'],
        correctAnswer: 'Extraordinary sense of absolute spatial orientation',
      },
      {
        question: 'How do Mandarin speakers tend to conceptualise time, according to the lecture?',
        choices: ['In circular patterns', 'Horizontally, like English speakers', 'Vertically, with earlier events above', 'As unrelated discrete events'],
        correctAnswer: 'Vertically, with earlier events above',
      },
    ],
  },
  {
    id: 'c2-l-006',
    title: 'Climate Change and Intergenerational Justice',
    type: 'lecture',
    script: `I want to explore a dimension of climate change that is frequently acknowledged but rarely examined with the philosophical rigour it demands: the question of intergenerational justice. The fundamental asymmetry is this: the generation that benefits most from carbon-intensive economic activity is not the generation that will bear the greatest costs. Current emissions will continue warming the planet for decades, meaning that children born today will inherit atmospheric conditions shaped predominantly by decisions made before they were born and entirely without their consent. How should we think about our obligations to these future people? The utilitarian approach, which dominates much climate economics, attempts to quantify future harm and discount it to present value. This is the logic behind models like William Nordhaus's DICE model, which applies a discount rate to future damages. But this raises a profound ethical question: is it morally permissible to discount the suffering of future people simply because they don't yet exist? The philosopher Derek Parfit argued persuasively that temporal distance alone has no moral relevance. A person suffering in 2100 matters no less than a person suffering today. If we accept this premise, the standard economic approach to climate policy is radically insufficient. The Rawlsian framework offers an alternative lens. John Rawls's "veil of ignorance" thought experiment asks us to design institutions as though we didn't know which generation we'd belong to. Behind this veil, a rational agent would arguably advocate for strong climate action, since the worst outcomes overwhelmingly fall on future generations. Yet Rawls himself was curiously vague about intergenerational obligations, and extending his framework across time raises complications. Future generations cannot participate in the social contract, negotiate, or reciprocate. This has led some philosophers, notably Avner de-Shalit, to argue that intergenerational justice requires not just fair distribution of resources but the preservation of meaningful options. On this view, our obligation is not merely to minimise harm but to ensure that future generations retain the capacity to pursue their own conceptions of the good life. This includes maintaining biodiversity, stable climate systems, and functioning ecosystems, not because of their economic value, but because they represent irreplaceable conditions for human flourishing that, once destroyed, cannot be restored.`,
    speakers: ['narrator'],
    wordCount: 330,
    voiceConfig: { stability: 0.5, similarity_boost: 0.75, speed: 1.1 },
    audioUrl: 'https://storage.googleapis.com/edutask-4d90b.firebasestorage.app/cefr-audio/c2-l-006.mp3',
    maxReplays: 1,
    questions: [
      {
        question: 'What is the fundamental asymmetry the speaker identifies?',
        choices: ['Rich countries pollute more than poor ones', 'The generation that benefits from carbon emissions is not the one that bears the costs', 'Climate change affects different regions unequally', 'Scientists know more than politicians about climate policy'],
        correctAnswer: 'The generation that benefits from carbon emissions is not the one that bears the costs',
      },
      {
        question: 'What ethical issue does discounting future damages raise?',
        choices: ['It makes climate models inaccurate', 'It implies future people\'s suffering matters less simply because they don\'t exist yet', 'It leads to higher taxes in the present', 'It contradicts economic theory'],
        correctAnswer: 'It implies future people\'s suffering matters less simply because they don\'t exist yet',
      },
      {
        question: 'What complication arises when applying Rawls\'s framework across generations?',
        choices: ['Future generations have different values', 'Future generations cannot participate in the social contract or reciprocate', 'Rawls explicitly rejected intergenerational analysis', 'The veil of ignorance only works within a single society'],
        correctAnswer: 'Future generations cannot participate in the social contract or reciprocate',
      },
      {
        question: 'According to Avner de-Shalit, what does intergenerational justice require?',
        choices: ['Equal distribution of wealth across time', 'Preserving meaningful options and conditions for human flourishing', 'Compensating future generations financially', 'Stopping all industrial activity immediately'],
        correctAnswer: 'Preserving meaningful options and conditions for human flourishing',
      },
    ],
  },
]

// ═══════════════════════════════════════════════════════════
//  Combined export
// ═══════════════════════════════════════════════════════════
export const listeningScripts = { A1, A2, B1, B2, C1, C2 }

/**
 * Pick a random unused listening script from the given CEFR level.
 * @param {'A1'|'A2'|'B1'|'B2'|'C1'|'C2'} level
 * @param {Set<string>} usedIds - IDs already used this session
 * @returns {{ script: ListeningScript, scriptId: string } | null}
 */
export function generateListeningBlock(level, usedIds = new Set()) {
  const pool = listeningScripts[level]
  if (!pool) return null

  const available = pool.filter((s) => !usedIds.has(s.id))
  if (available.length === 0) return null

  const script = available[Math.floor(Math.random() * available.length)]
  return { script, scriptId: script.id }
}
