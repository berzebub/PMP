/**
 * Werewolf Game - Role Definitions & Configurations
 */

export const TEAMS = {
  VILLAGE: 'village',
  WOLF: 'wolf'
}

export const ROLES = {
  villager: {
    id: 'villager',
    name: 'ชาวบ้าน',
    nameEn: 'Villager',
    team: TEAMS.VILLAGE,
    icon: 'person',
    color: '#66bb6a',
    emoji: '👨‍🌾',
    hasNightAction: false,
    description: 'ชาวบ้านธรรมดา ใช้สัญชาตญาณโหวตกำจัดหมาป่าตอนกลางวัน',
    nightPrompt: null
  },
  werewolf: {
    id: 'werewolf',
    name: 'หมาป่า',
    nameEn: 'Werewolf',
    team: TEAMS.WOLF,
    icon: 'pets',
    color: '#ef5350',
    emoji: '🐺',
    hasNightAction: true,
    description: 'เลือกเป้าหมายฆ่าตอนกลางคืน เห็นหมาป่าตัวอื่น แชทลับกันได้',
    nightPrompt: 'เลือกเป้าหมายที่จะกัด'
  },
  seer: {
    id: 'seer',
    name: 'หมอดู',
    nameEn: 'Seer',
    team: TEAMS.VILLAGE,
    icon: 'visibility',
    color: '#ab47bc',
    emoji: '🔮',
    hasNightAction: true,
    description: 'ตรวจสอบผู้เล่น 1 คนต่อคืน ว่าเป็นหมาป่าหรือไม่',
    nightPrompt: 'เลือกผู้เล่นที่จะตรวจสอบ'
  },
  doctor: {
    id: 'doctor',
    name: 'หมอ',
    nameEn: 'Doctor',
    team: TEAMS.VILLAGE,
    icon: 'healing',
    color: '#42a5f5',
    emoji: '💊',
    hasNightAction: true,
    description: 'ป้องกันผู้เล่น 1 คนต่อคืน จากการถูกหมาป่ากัด',
    nightPrompt: 'เลือกผู้เล่นที่จะปกป้อง'
  },
  hunter: {
    id: 'hunter',
    name: 'นักล่า',
    nameEn: 'Hunter',
    team: TEAMS.VILLAGE,
    icon: 'gps_fixed',
    color: '#ff7043',
    emoji: '🏹',
    hasNightAction: false,
    description: 'เมื่อตาย จะยิงผู้เล่นอีก 1 คนตายตาม',
    nightPrompt: null
  },
  witch: {
    id: 'witch',
    name: 'แม่มด',
    nameEn: 'Witch',
    team: TEAMS.VILLAGE,
    icon: 'science',
    color: '#7e57c2',
    emoji: '🧙‍♀️',
    hasNightAction: true,
    description: 'มียาช่วยชีวิต 1 ขวด + ยาพิษ 1 ขวด ใช้ได้ตลอดทั้งเกม',
    nightPrompt: 'เลือกใช้ยา'
  }
}

/**
 * Recommended role configs per player count.
 * Villager fills the remainder automatically.
 */
export const RECOMMENDED_CONFIGS = {
  6: { werewolf: 1, seer: 1, doctor: 1 },
  7: { werewolf: 2, seer: 1, doctor: 1 },
  8: { werewolf: 2, seer: 1, doctor: 1, hunter: 1 },
  9: { werewolf: 2, seer: 1, doctor: 1, hunter: 1 },
  10: { werewolf: 3, seer: 1, doctor: 1, hunter: 1, witch: 1 }
}

/**
 * Build the full role list for a given player count and config.
 * Auto-fills remaining slots with villagers.
 */
export function buildRoleList(playerCount, config) {
  const roles = []
  for (const [roleId, count] of Object.entries(config)) {
    for (let i = 0; i < count; i++) {
      roles.push(roleId)
    }
  }
  // Fill remainder with villagers
  while (roles.length < playerCount) {
    roles.push('villager')
  }
  return roles
}

/**
 * Get recommended config for a player count (clamps to 6-10)
 */
export function getRecommendedConfig(playerCount) {
  const clamped = Math.max(6, Math.min(10, playerCount))
  return { ...RECOMMENDED_CONFIGS[clamped] }
}

/**
 * Shuffle an array (Fisher-Yates)
 */
export function shuffleArray(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * Get all available role IDs (excluding villager which auto-fills)
 */
export function getSelectableRoles() {
  return Object.values(ROLES).filter(r => r.id !== 'villager')
}
