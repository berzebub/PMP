import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  collection, doc, addDoc, setDoc, getDoc, getDocs, updateDoc, deleteDoc,
  query, where, limit, onSnapshot, serverTimestamp
} from 'firebase/firestore'
import { db } from 'boot/firebase'
import { useAuthStore } from './auth'
import { buildDeck, shuffleDeck, canPlayCard, CARD_TYPES } from 'src/data/unoCards'

const COLLECTION = 'unoRooms'

export const useUnoStore = defineStore('uno', () => {
  const authStore = useAuthStore()

  // ==================== STATE ====================

  const room = ref(null)            // Current room document data
  const roomId = ref(null)          // Current room Firestore doc id
  const myHand = ref([])            // My private hand of cards
  const loading = ref(false)
  const error = ref(null)

  // Unsubscribe functions for listeners
  let unsubRoom = null
  let unsubHand = null

  // ==================== COMPUTED ====================

  const myId = computed(() => authStore.user?.email || '')
  const myDisplayName = computed(() => authStore.fullName || authStore.user?.email?.split('@')[0] || '')
  const myPhotoURL = computed(() => authStore.profile?.photoURL || '')

  const isHost = computed(() => room.value?.hostId === myId.value)

  const playerCount = computed(() => {
    if (!room.value?.players) return 0
    return Object.keys(room.value.players).length
  })

  const playerOrder = computed(() => room.value?.playerOrder || [])

  const currentPlayerId = computed(() => {
    if (!room.value || room.value.status !== 'playing') return null
    const idx = room.value.currentPlayerIndex ?? 0
    const order = room.value.playerOrder || []
    return order[idx] || null
  })

  const isMyTurn = computed(() => currentPlayerId.value === myId.value)

  const topCard = computed(() => room.value?.topCard || null)
  const currentColor = computed(() => room.value?.currentColor || null)
  const direction = computed(() => room.value?.direction || 1)

  const isGameActive = computed(() => room.value?.status === 'playing')

  // ==================== ROOM CRUD ====================

  function generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let code = ''
    for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)]
    return code
  }

  async function createRoom() {
    if (!myId.value) return null
    loading.value = true
    error.value = null

    try {
      const roomData = {
        hostId: myId.value,
        roomCode: generateRoomCode(),
        status: 'waiting',
        players: {
          [myId.value]: {
            displayName: myDisplayName.value,
            photoURL: myPhotoURL.value,
            handCount: 0,
            isReady: false,
            calledUno: false
          }
        },
        playerOrder: [myId.value],
        // Game state (populated when game starts)
        drawPileCount: 0,
        topCard: null,
        currentColor: null,
        currentPlayerIndex: 0,
        direction: 1,  // 1 = clockwise, -1 = counter-clockwise
        winner: null,
        lastAction: null,
        mustDrawPlayer: null, // player forced to draw (from Draw2 / Wild4)
        pendingDrawCount: 0,  // how many cards to draw
        createdAt: serverTimestamp()
      }

      const docRef = await addDoc(collection(db, COLLECTION), roomData)
      roomId.value = docRef.id
      await subscribeToRoom(docRef.id)
      return { id: docRef.id, code: roomData.roomCode }
    } catch (err) {
      console.error('Error creating room:', err)
      error.value = 'ไม่สามารถสร้างห้องได้'
      return null
    } finally {
      loading.value = false
    }
  }

  async function joinRoom(code) {
    if (!myId.value) return null
    loading.value = true
    error.value = null

    try {
      const q = query(
        collection(db, COLLECTION),
        where('roomCode', '==', code.toUpperCase()),
        where('status', '==', 'waiting'),
        limit(1)
      )
      const snap = await getDocs(q)
      if (snap.empty) {
        error.value = 'ไม่พบห้อง หรือห้องเริ่มเกมแล้ว'
        return null
      }

      const roomDoc = snap.docs[0]
      const data = roomDoc.data()

      if (Object.keys(data.players || {}).length >= 10) {
        error.value = 'ห้องเต็มแล้ว (สูงสุด 10 คน)'
        return null
      }

      if (data.players?.[myId.value]) {
        // Already in room, just reconnect
        roomId.value = roomDoc.id
        await subscribeToRoom(roomDoc.id)
        return { id: roomDoc.id, code: data.roomCode }
      }

      // Add player
      const playerData = {
        displayName: myDisplayName.value,
        photoURL: myPhotoURL.value,
        handCount: 0,
        isReady: false,
        calledUno: false
      }

      const updatedPlayers = { ...(data.players || {}), [myId.value]: playerData }
      await updateDoc(doc(db, COLLECTION, roomDoc.id), {
        players: updatedPlayers,
        playerOrder: [...(data.playerOrder || []), myId.value]
      })

      roomId.value = roomDoc.id
      await subscribeToRoom(roomDoc.id)
      return { id: roomDoc.id, code: data.roomCode }
    } catch (err) {
      console.error('Error joining room:', err)
      error.value = 'ไม่สามารถเข้าห้องได้'
      return null
    } finally {
      loading.value = false
    }
  }

  async function leaveRoom() {
    if (!roomId.value || !myId.value) return
    try {
      const roomRef = doc(db, COLLECTION, roomId.value)
      const snap = await getDoc(roomRef)
      if (!snap.exists()) return

      const data = snap.data()
      const players = { ...data.players }
      delete players[myId.value]
      const newPlayerOrder = (data.playerOrder || []).filter(id => id !== myId.value)

      if (Object.keys(players).length === 0) {
        // Delete hands subcollection first
        const handsSnap = await getDocs(collection(db, COLLECTION, roomId.value, 'hands'))
        for (const d of handsSnap.docs) { await deleteDoc(d.ref) }
        await deleteDoc(roomRef)
      } else {
        const update = { players, playerOrder: newPlayerOrder }
        if (data.hostId === myId.value && newPlayerOrder.length > 0) {
          update.hostId = newPlayerOrder[0]
        }
        await updateDoc(roomRef, update)
      }
    } catch (err) {
      console.error('Error leaving room:', err)
    } finally {
      cleanup()
    }
  }

  async function toggleReady() {
    if (!roomId.value || !myId.value || !room.value?.players) return
    const current = room.value.players[myId.value]?.isReady || false
    const updatedPlayers = { ...room.value.players }
    updatedPlayers[myId.value] = { ...updatedPlayers[myId.value], isReady: !current }
    await updateDoc(doc(db, COLLECTION, roomId.value), { players: updatedPlayers })
  }

  // ==================== GAME START (HOST) ====================

  async function startGame() {
    if (!isHost.value || !roomId.value) return
    const r = room.value
    const playerIds = r.playerOrder || Object.keys(r.players)
    const count = playerIds.length

    if (count < 2) {
      error.value = 'ต้องมีผู้เล่นอย่างน้อย 2 คน'
      return
    }

    // Build and shuffle deck
    let deck = shuffleDeck(buildDeck())

    // Deal 7 cards to each player
    const hands = {}
    for (const pid of playerIds) {
      hands[pid] = []
      for (let i = 0; i < 7; i++) {
        hands[pid].push(deck.pop())
      }
    }

    // Find a starting card (must be a number card)
    let startCard = null
    let startIdx = deck.length - 1
    while (startIdx >= 0) {
      if (deck[startIdx].type === CARD_TYPES.NUMBER) {
        startCard = deck.splice(startIdx, 1)[0]
        break
      }
      startIdx--
    }

    // Write hands to subcollection (private per player)
    const batch = []
    const updatedPlayers = { ...r.players }
    for (const pid of playerIds) {
      batch.push(
        setDoc(doc(db, COLLECTION, roomId.value, 'hands', pid), {
          cards: hands[pid]
        })
      )
      updatedPlayers[pid] = {
        ...updatedPlayers[pid],
        handCount: 7,
        isReady: false,
        calledUno: false
      }
    }

    // Write draw pile to subcollection (host only reads)
    batch.push(
      setDoc(doc(db, COLLECTION, roomId.value, 'hands', '_drawPile'), {
        cards: deck
      })
    )

    await Promise.all(batch)

    // Update room to playing
    await updateDoc(doc(db, COLLECTION, roomId.value), {
      players: updatedPlayers,
      status: 'playing',
      topCard: startCard,
      currentColor: startCard.color,
      currentPlayerIndex: 0,
      direction: 1,
      drawPileCount: deck.length,
      winner: null,
      lastAction: null,
      mustDrawPlayer: null,
      pendingDrawCount: 0
    })

    // Fetch my hand
    await fetchMyHand()
  }

  // ==================== PLAYER ACTIONS ====================

  async function playCard(cardIndex, chosenColor = null) {
    if (!roomId.value || !myId.value || !isMyTurn.value) return
    if (room.value?.status !== 'playing') return

    // Cannot play cards while forced to draw
    if (room.value.mustDrawPlayer === myId.value) {
      error.value = 'คุณต้องจั่วไพ่ก่อน!'
      return
    }

    const card = myHand.value[cardIndex]
    if (!card) return

    // Validate play
    if (!canPlayCard(card, topCard.value, currentColor.value)) {
      error.value = 'ไม่สามารถลงไพ่ใบนี้ได้'
      return
    }

    // Wild cards need a color choice
    if ((card.type === CARD_TYPES.WILD || card.type === CARD_TYPES.WILD4) && !chosenColor) {
      error.value = 'กรุณาเลือกสี'
      return
    }

    error.value = null

    // Remove card from hand
    const newHand = [...myHand.value]
    newHand.splice(cardIndex, 1)

    // Update my hand in Firestore
    await setDoc(doc(db, COLLECTION, roomId.value, 'hands', myId.value), {
      cards: newHand
    })

    // Determine new game state
    const r = room.value
    const playerIds = r.playerOrder
    const totalPlayers = playerIds.length
    let newDirection = r.direction
    let newCurrentIndex = r.currentPlayerIndex
    const newColor = chosenColor || card.color
    let pendingDraw = 0
    let mustDrawPid = null
    let skipNext = false

    // Apply card effects
    if (card.type === CARD_TYPES.REVERSE) {
      if (totalPlayers === 2) {
        // In 2-player, reverse acts as skip
        skipNext = true
      } else {
        newDirection = newDirection * -1
      }
    }

    if (card.type === CARD_TYPES.SKIP) {
      skipNext = true
    }

    if (card.type === CARD_TYPES.DRAW2) {
      pendingDraw = 2
    }

    if (card.type === CARD_TYPES.WILD4) {
      pendingDraw = 4
    }

    // Move to next player
    newCurrentIndex = (newCurrentIndex + newDirection + totalPlayers) % totalPlayers

    if (pendingDraw > 0) {
      // Draw 2 / Wild Draw 4: turn goes to target player, they MUST draw before continuing
      mustDrawPid = playerIds[newCurrentIndex]
      // Don't advance past them — they need to draw first
    } else if (skipNext) {
      // Skip / Reverse(2p): skip one more player
      newCurrentIndex = (newCurrentIndex + newDirection + totalPlayers) % totalPlayers
    }

    // Preserve calledUno when going from 2 to 1 card, otherwise reset
    const updatedPlayers = { ...r.players }
    updatedPlayers[myId.value] = {
      ...updatedPlayers[myId.value],
      handCount: newHand.length,
      calledUno: newHand.length === 1
        ? (r.players[myId.value]?.calledUno || false)
        : false
    }

    // Check for win
    let winner = null
    if (newHand.length === 0) {
      winner = myId.value
    }

    const updateData = {
      players: updatedPlayers,
      topCard: card,
      currentColor: newColor,
      currentPlayerIndex: newCurrentIndex,
      direction: newDirection,
      lastAction: {
        type: 'play',
        playerId: myId.value,
        card: card,
        chosenColor: chosenColor
      }
    }

    if (pendingDraw > 0 && mustDrawPid) {
      updateData.mustDrawPlayer = mustDrawPid
      updateData.pendingDrawCount = pendingDraw
    } else {
      updateData.mustDrawPlayer = null
      updateData.pendingDrawCount = 0
    }

    if (winner) {
      updateData.status = 'finished'
      updateData.winner = winner
    }

    await updateDoc(doc(db, COLLECTION, roomId.value), updateData)

    myHand.value = newHand
  }

  async function drawCard() {
    if (!roomId.value || !myId.value) return
    if (room.value?.status !== 'playing') return

    // Can only draw on your turn (or if forced)
    const forced = room.value.mustDrawPlayer === myId.value
    if (!isMyTurn.value && !forced) return

    error.value = null

    // Read draw pile
    const drawPileSnap = await getDoc(doc(db, COLLECTION, roomId.value, 'hands', '_drawPile'))
    let drawPile = drawPileSnap.exists() ? drawPileSnap.data().cards || [] : []

    const drawCount = forced ? (room.value.pendingDrawCount || 1) : 1

    // If draw pile is empty, reshuffle discard into draw pile
    if (drawPile.length < drawCount) {
      drawPile = await reshuffleDiscardIntoDraw(drawPile)
    }

    if (drawPile.length === 0) return // No cards left at all

    // Draw card(s)
    const drawn = []
    for (let i = 0; i < drawCount && drawPile.length > 0; i++) {
      drawn.push(drawPile.pop())
    }

    // Update draw pile
    await setDoc(doc(db, COLLECTION, roomId.value, 'hands', '_drawPile'), {
      cards: drawPile
    })

    // Add to my hand
    const newHand = [...myHand.value, ...drawn]
    await setDoc(doc(db, COLLECTION, roomId.value, 'hands', myId.value), {
      cards: newHand
    })

    // Update room state
    const updatedPlayers = { ...room.value.players }
    updatedPlayers[myId.value] = {
      ...updatedPlayers[myId.value],
      handCount: newHand.length,
      calledUno: false
    }

    const updateData = {
      players: updatedPlayers,
      drawPileCount: drawPile.length,
      lastAction: {
        type: 'draw',
        playerId: myId.value,
        count: drawCount
      }
    }

    // If forced draw, clear the pending and advance turn to next player
    if (forced) {
      updateData.mustDrawPlayer = null
      updateData.pendingDrawCount = 0
      // After forced draw, skip this player's turn and move to next
      const r = room.value
      const totalPlayers = r.playerOrder.length
      const nextIndex = (r.currentPlayerIndex + r.direction + totalPlayers) % totalPlayers
      updateData.currentPlayerIndex = nextIndex
    } else {
      // Normal draw: advance turn to next player
      const r = room.value
      const totalPlayers = r.playerOrder.length
      const nextIndex = (r.currentPlayerIndex + r.direction + totalPlayers) % totalPlayers
      updateData.currentPlayerIndex = nextIndex
    }

    await updateDoc(doc(db, COLLECTION, roomId.value), updateData)
    myHand.value = newHand
  }

  async function reshuffleDiscardIntoDraw(currentDraw) {
    // In a real game, we'd reshuffle all but the top card from discard
    // Since we only track the top card, we recreate a partial deck
    // This is a simplified version - create fresh shuffled deck minus known cards
    const freshDeck = shuffleDeck(buildDeck())

    // Remove cards that are in players' hands
    const knownCardIds = new Set()
    if (topCard.value) knownCardIds.add(topCard.value.id)
    for (const card of myHand.value) knownCardIds.add(card.id)

    // Read all players' hands to exclude their cards
    const playerIds = room.value.playerOrder || []
    for (const pid of playerIds) {
      if (pid === myId.value) continue
      try {
        const handSnap = await getDoc(doc(db, COLLECTION, roomId.value, 'hands', pid))
        if (handSnap.exists()) {
          const cards = handSnap.data().cards || []
          cards.forEach(c => knownCardIds.add(c.id))
        }
      } catch (e) { /* ignore */ }
    }

    const newDraw = [...currentDraw, ...freshDeck.filter(c => !knownCardIds.has(c.id))]
    return shuffleDeck(newDraw)
  }

  async function callUno() {
    if (!roomId.value || !myId.value) return
    if (myHand.value.length > 2) return // Can only call when about to have 1 card

    const updatedPlayers = { ...room.value.players }
    updatedPlayers[myId.value] = {
      ...updatedPlayers[myId.value],
      calledUno: true
    }
    await updateDoc(doc(db, COLLECTION, roomId.value), {
      players: updatedPlayers,
      lastAction: { type: 'uno', playerId: myId.value }
    })
  }

  async function challengeUno(targetPid) {
    if (!roomId.value || !myId.value) return
    const targetPlayer = room.value?.players?.[targetPid]
    if (!targetPlayer || targetPlayer.handCount !== 1 || targetPlayer.calledUno) return

    // Target didn't call UNO and has 1 card — penalty: draw 2 cards
    const drawPileSnap = await getDoc(doc(db, COLLECTION, roomId.value, 'hands', '_drawPile'))
    let drawPile = drawPileSnap.exists() ? drawPileSnap.data().cards || [] : []

    if (drawPile.length < 2) {
      drawPile = await reshuffleDiscardIntoDraw(drawPile)
    }

    const drawn = []
    for (let i = 0; i < 2 && drawPile.length > 0; i++) {
      drawn.push(drawPile.pop())
    }

    await setDoc(doc(db, COLLECTION, roomId.value, 'hands', '_drawPile'), {
      cards: drawPile
    })

    // Add to target's hand
    const handSnap = await getDoc(doc(db, COLLECTION, roomId.value, 'hands', targetPid))
    const targetHand = handSnap.exists() ? handSnap.data().cards || [] : []
    const newHand = [...targetHand, ...drawn]

    await setDoc(doc(db, COLLECTION, roomId.value, 'hands', targetPid), {
      cards: newHand
    })

    const updatedPlayers = { ...room.value.players }
    updatedPlayers[targetPid] = {
      ...updatedPlayers[targetPid],
      handCount: newHand.length,
      calledUno: false
    }

    await updateDoc(doc(db, COLLECTION, roomId.value), {
      players: updatedPlayers,
      drawPileCount: drawPile.length,
      lastAction: {
        type: 'challenge_uno',
        playerId: myId.value,
        targetId: targetPid
      }
    })

    // If I challenged myself and it's my hand that was updated
    if (targetPid === myId.value) {
      myHand.value = newHand
    }
  }

  async function playAgain() {
    if (!isHost.value || !roomId.value) return

    // Reset room to waiting
    const r = room.value
    const updatedPlayers = { ...r.players }
    for (const pid of Object.keys(updatedPlayers)) {
      updatedPlayers[pid] = {
        ...updatedPlayers[pid],
        handCount: 0,
        isReady: false,
        calledUno: false
      }
    }

    // Clean up hands
    const handsSnap = await getDocs(collection(db, COLLECTION, roomId.value, 'hands'))
    for (const d of handsSnap.docs) { await deleteDoc(d.ref) }

    await updateDoc(doc(db, COLLECTION, roomId.value), {
      players: updatedPlayers,
      status: 'waiting',
      topCard: null,
      currentColor: null,
      currentPlayerIndex: 0,
      direction: 1,
      drawPileCount: 0,
      winner: null,
      lastAction: null,
      mustDrawPlayer: null,
      pendingDrawCount: 0
    })

    myHand.value = []
  }

  // ==================== LISTENERS ====================

  async function subscribeToRoom(id) {
    unsubAll()
    roomId.value = id

    // Listen to room doc
    unsubRoom = onSnapshot(doc(db, COLLECTION, id), (snap) => {
      if (snap.exists()) {
        room.value = { id: snap.id, ...snap.data() }

        // If game is playing and we don't have our hand, fetch it
        if (room.value.status === 'playing' && myHand.value.length === 0) {
          fetchMyHand()
        }
      } else {
        room.value = null
        roomId.value = null
      }
    })

    // Listen to my hand
    unsubHand = onSnapshot(doc(db, COLLECTION, id, 'hands', myId.value), (snap) => {
      if (snap.exists()) {
        myHand.value = snap.data().cards || []
      }
    })
  }

  async function fetchMyHand() {
    if (!roomId.value || !myId.value) return
    try {
      const snap = await getDoc(doc(db, COLLECTION, roomId.value, 'hands', myId.value))
      if (snap.exists()) {
        myHand.value = snap.data().cards || []
      }
    } catch (err) {
      console.error('Error fetching hand:', err)
    }
  }

  // ==================== CLEANUP ====================

  function unsubAll() {
    if (unsubRoom) { unsubRoom(); unsubRoom = null }
    if (unsubHand) { unsubHand(); unsubHand = null }
  }

  function cleanup() {
    unsubAll()
    room.value = null
    roomId.value = null
    myHand.value = []
    error.value = null
  }

  // ==================== RETURN ====================

  return {
    // State
    room, roomId, myHand, loading, error,
    // Computed
    myId, myDisplayName, isHost, playerCount, playerOrder,
    currentPlayerId, isMyTurn, topCard, currentColor, direction,
    isGameActive,
    // Room
    createRoom, joinRoom, leaveRoom, toggleReady,
    // Game
    startGame, playCard, drawCard, callUno, challengeUno, playAgain,
    // Listeners
    subscribeToRoom, fetchMyHand,
    // Cleanup
    cleanup
  }
})
