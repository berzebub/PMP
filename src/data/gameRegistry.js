/**
 * Game Registry
 *
 * Central config for all mini-games in the Arcade.
 * To add a new game, just add an entry here + create the page + add the route.
 */

export const games = [
  {
    id: 'dino-runner',
    name: 'Dino Runner',
    subtitle: 'Office Edition',
    description: 'วิ่งหลบ Bug และ Deadline! ยิ่งวิ่งนาน ยิ่งได้คะแนนเยอะ',
    icon: 'directions_run',
    color: '#66bb6a',
    route: '/games/dino-runner',
    difficulty: 'ง่าย',
    controls: 'Space / Tap',
    available: true
  },
  {
    id: 'hallway-herding',
    name: 'Hallway Herding',
    subtitle: 'ครูเวรต้อนเด็ก',
    description: 'ต้อนเด็กที่วิ่งมั่วในโถงให้เข้าห้องก่อนหมดเวลา! มี Boss และ Power-ups',
    icon: 'school',
    color: '#ec407a',
    route: '/games/hallway-herding',
    difficulty: 'ปานกลาง',
    controls: 'Click / Tap',
    available: true
  },
  {
    id: 'stack-overflow',
    name: 'Stack Overflow',
    subtitle: 'Office Edition',
    description: 'กดจังหวะวางเอกสารซ้อนกันให้สูงที่สุด! ยิ่งสูงยิ่งเร็ว ยิ่งท้าทาย',
    icon: 'layers',
    color: '#42a5f5',
    route: '/games/stack-overflow',
    difficulty: 'ง่าย',
    controls: 'Click / Tap',
    available: true
  },
  {
    id: 'werewolf',
    name: 'Werewolf',
    subtitle: 'Multiplayer',
    description: 'เกมหมาป่า 6-10 คน! หาหมาป่าให้เจอก่อนที่จะสาย มี AI เป็น Game Master',
    icon: 'pets',
    color: '#ef5350',
    route: '/games/werewolf',
    difficulty: 'ปานกลาง',
    controls: 'Chat / Vote',
    available: true
  },
  {
    id: 'uno',
    name: 'UNO',
    subtitle: 'Multiplayer',
    description: 'เกมไพ่ UNO! ทิ้งไพ่ให้หมดมือก่อนใครเป็นคนชนะ 2-10 คน',
    icon: 'style',
    color: '#ff9800',
    route: '/games/uno',
    difficulty: 'ง่าย',
    controls: 'Tap / Click',
    available: true,
    noLeaderboard: true
  }
  // เพิ่มเกมใหม่ได้ที่นี่ เช่น:
  // {
  //   id: 'flappy-dev',
  //   name: 'Flappy Dev',
  //   subtitle: 'Pipe Dodger',
  //   description: 'บินลอดท่อให้ได้มากที่สุด!',
  //   icon: 'flutter_dash',
  //   color: '#42a5f5',
  //   route: '/games/flappy-dev',
  //   difficulty: 'ปานกลาง',
  //   controls: 'Space / Tap',
  //   available: false
  // }
]

/**
 * Find a game by its ID
 */
export function getGameById(id) {
  return games.find(g => g.id === id) || null
}
