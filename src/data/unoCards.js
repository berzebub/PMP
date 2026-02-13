/**
 * UNO Card Game - Card Definitions & Utilities
 */

export const COLORS = {
  red: { name: 'แดง', hex: '#ef5350', dark: '#c62828' },
  yellow: { name: 'เหลือง', hex: '#fdd835', dark: '#f9a825' },
  green: { name: 'เขียว', hex: '#66bb6a', dark: '#2e7d32' },
  blue: { name: 'น้ำเงิน', hex: '#42a5f5', dark: '#1565c0' }
}

export const COLOR_KEYS = ['red', 'yellow', 'green', 'blue']

export const CARD_TYPES = {
  NUMBER: 'number',
  SKIP: 'skip',
  REVERSE: 'reverse',
  DRAW2: 'draw2',
  WILD: 'wild',
  WILD4: 'wild4'
}

/**
 * Build a standard 108-card UNO deck
 * - Each color: one 0, two 1-9, two Skip, two Reverse, two Draw Two
 * - 4 Wild, 4 Wild Draw Four
 */
export function buildDeck() {
  const deck = []
  let id = 0

  for (const color of COLOR_KEYS) {
    // One 0 per color
    deck.push({ id: id++, color, type: CARD_TYPES.NUMBER, value: 0 })

    // Two of 1-9 per color
    for (let n = 1; n <= 9; n++) {
      deck.push({ id: id++, color, type: CARD_TYPES.NUMBER, value: n })
      deck.push({ id: id++, color, type: CARD_TYPES.NUMBER, value: n })
    }

    // Two Skip per color
    deck.push({ id: id++, color, type: CARD_TYPES.SKIP, value: 'skip' })
    deck.push({ id: id++, color, type: CARD_TYPES.SKIP, value: 'skip' })

    // Two Reverse per color
    deck.push({ id: id++, color, type: CARD_TYPES.REVERSE, value: 'reverse' })
    deck.push({ id: id++, color, type: CARD_TYPES.REVERSE, value: 'reverse' })

    // Two Draw Two per color
    deck.push({ id: id++, color, type: CARD_TYPES.DRAW2, value: 'draw2' })
    deck.push({ id: id++, color, type: CARD_TYPES.DRAW2, value: 'draw2' })
  }

  // 4 Wild cards
  for (let i = 0; i < 4; i++) {
    deck.push({ id: id++, color: null, type: CARD_TYPES.WILD, value: 'wild' })
  }

  // 4 Wild Draw Four cards
  for (let i = 0; i < 4; i++) {
    deck.push({ id: id++, color: null, type: CARD_TYPES.WILD4, value: 'wild4' })
  }

  return deck
}

/**
 * Shuffle an array (Fisher-Yates)
 */
export function shuffleDeck(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * Check if a card can be played on the current discard pile
 * @param {Object} card - The card to play
 * @param {Object} topCard - The top card on the discard pile
 * @param {string} currentColor - The currently active color (important when wild was played)
 * @returns {boolean}
 */
export function canPlayCard(card, topCard, currentColor) {
  // Wild cards can always be played
  if (card.type === CARD_TYPES.WILD || card.type === CARD_TYPES.WILD4) {
    return true
  }

  // Match by color
  if (card.color === currentColor) return true

  // Match by value/type (number matches number, skip matches skip, etc.)
  if (card.value === topCard.value && card.type === topCard.type) return true

  return false
}

/**
 * Get the display label for a card
 */
export function getCardLabel(card) {
  if (!card) return ''
  switch (card.type) {
    case CARD_TYPES.NUMBER: return String(card.value)
    case CARD_TYPES.SKIP: return '⊘'
    case CARD_TYPES.REVERSE: return '⟲'
    case CARD_TYPES.DRAW2: return '+2'
    case CARD_TYPES.WILD: return 'W'
    case CARD_TYPES.WILD4: return '+4'
    default: return '?'
  }
}

/**
 * Get the display name in Thai for a card type
 */
export function getCardTypeName(card) {
  if (!card) return ''
  switch (card.type) {
    case CARD_TYPES.NUMBER: return String(card.value)
    case CARD_TYPES.SKIP: return 'Skip'
    case CARD_TYPES.REVERSE: return 'Reverse'
    case CARD_TYPES.DRAW2: return 'Draw 2'
    case CARD_TYPES.WILD: return 'Wild'
    case CARD_TYPES.WILD4: return 'Wild Draw 4'
    default: return ''
  }
}

/**
 * Check if a player has any playable card
 */
export function hasPlayableCard(hand, topCard, currentColor) {
  return hand.some(card => canPlayCard(card, topCard, currentColor))
}
