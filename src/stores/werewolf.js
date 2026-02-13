import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  collection, doc, addDoc, setDoc, getDoc, getDocs, updateDoc, deleteDoc,
  query, where, orderBy, limit, onSnapshot, Timestamp, serverTimestamp
} from 'firebase/firestore'
import { db } from 'boot/firebase'
import { useAuthStore } from './auth'
import { ROLES, TEAMS, buildRoleList, shuffleArray } from 'src/data/werewolfRoles'

const COLLECTION = 'werewolfRooms'

export const useWerewolfStore = defineStore('werewolf', () => {
  const authStore = useAuthStore()

  // ==================== STATE ====================

  const room = ref(null)            // Current room document data
  const roomId = ref(null)          // Current room Firestore doc id
  const mySecret = ref(null)        // My role + private info
  const messages = ref([])          // Chat messages
  const nightActions = ref({})      // Night actions for current round (host only)
  const wolfNightTargets = ref({})  // Real-time wolf targets during night (for wolves only)
  const loading = ref(false)
  const error = ref(null)

  // Unsubscribe functions for listeners
  let unsubRoom = null
  let unsubMessages = null
  let unsubNightActions = null
  let phaseTimerInterval = null
  let isAdvancing = false       // guard: prevent advancePhase re-entry
  let isCheckingWin = false     // guard: prevent checkAndEndGame re-entry

  // ==================== COMPUTED ====================

  const myId = computed(() => authStore.user?.email || '')
  const myDisplayName = computed(() => authStore.fullName || authStore.user?.email?.split('@')[0] || '')
  const myPhotoURL = computed(() => authStore.profile?.photoURL || '')

  const isHost = computed(() => room.value?.hostId === myId.value)
  const isAlive = computed(() => room.value?.players?.[myId.value]?.isAlive ?? false)
  const myRole = computed(() => mySecret.value?.role || null)
  const myRoleDef = computed(() => myRole.value ? ROLES[myRole.value] : null)

  const alivePlayers = computed(() => {
    if (!room.value?.players) return []
    return Object.entries(room.value.players)
      .filter(([, p]) => p.isAlive)
      .map(([id]) => id)
  })

  const aliveWolves = computed(() => {
    if (!room.value?.eliminationLog) return []
    const deadIds = room.value.eliminationLog.map(e => e.playerId)
    // We can only know wolf count as host; for display we count alive minus known dead wolves
    return alivePlayers.value // This is approximate; host uses secrets for exact count
  })

  const playerCount = computed(() => {
    if (!room.value?.players) return 0
    return Object.keys(room.value.players).length
  })

  const isGameActive = computed(() => room.value?.status === 'playing')

  // ==================== ROOM CRUD ====================

  function generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let code = ''
    for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)]
    return code
  }

  async function createRoom(settings = {}) {
    if (!myId.value) return null
    loading.value = true
    error.value = null

    try {
      const roomData = {
        hostId: myId.value,
        roomCode: generateRoomCode(),
        status: 'waiting',
        phase: null,
        round: 0,
        phaseEndAt: null,
        players: {
          [myId.value]: {
            displayName: myDisplayName.value,
            photoURL: myPhotoURL.value,
            isAlive: true,
            isReady: false,
            isConnected: true
          }
        },
        playerOrder: [myId.value],
        settings: {
          dayDuration: settings.dayDuration || 90,
          nightDuration: settings.nightDuration || 30,
          roleConfig: settings.roleConfig || {}
        },
        eliminationLog: [],
        lastNightResult: null,
        lastVoteResult: null,
        currentVotes: {},
        winner: null,
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

      // Add player — avoid dot notation on email keys
      const playerData = {
        displayName: myDisplayName.value,
        photoURL: myPhotoURL.value,
        isAlive: true,
        isReady: false,
        isConnected: true
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
      const playerOrder = (data.playerOrder || []).filter(id => id !== myId.value)

      if (Object.keys(players).length === 0) {
        await deleteDoc(roomRef)
      } else {
        const update = { players, playerOrder }
        // If host leaves, transfer to first remaining player
        if (data.hostId === myId.value && playerOrder.length > 0) {
          update.hostId = playerOrder[0]
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

  // ==================== GAME MASTER (HOST) ====================

  async function startGame(roleConfig) {
    if (!isHost.value || !roomId.value) return
    const r = room.value
    const playerIds = r.playerOrder || Object.keys(r.players)
    const count = playerIds.length

    if (count < 6) {
      error.value = 'ต้องมีผู้เล่นอย่างน้อย 6 คน'
      return
    }

    // Build and shuffle roles
    const roleList = shuffleArray(buildRoleList(count, roleConfig))
    const wolfTeam = []

    // Assign roles and find wolf team
    roleList.forEach((role, i) => {
      if (role === 'werewolf') wolfTeam.push(playerIds[i])
    })

    // Write secret docs for each player
    const batch = []
    roleList.forEach((role, i) => {
      const secretData = { role }
      if (role === 'werewolf') {
        secretData.wolfTeam = wolfTeam.filter(id => id !== playerIds[i])
      }
      if (role === 'seer') {
        secretData.investigations = []
      }
      if (role === 'witch') {
        secretData.hasSavePotion = true
        secretData.hasPoisonPotion = true
      }
      batch.push(
        setDoc(doc(db, COLLECTION, roomId.value, 'secrets', playerIds[i]), secretData)
      )
    })
    await Promise.all(batch)

    // Mark all players alive — update full players map (avoid dot notation on email keys)
    const updatedPlayers = { ...r.players }
    for (const pid of playerIds) {
      updatedPlayers[pid] = { ...updatedPlayers[pid], isAlive: true, isReady: false }
    }

    // Update room to playing
    await updateDoc(doc(db, COLLECTION, roomId.value), {
      players: updatedPlayers,
      status: 'playing',
      phase: 'role_reveal',
      round: 0,
      phaseEndAt: Timestamp.fromMillis(Date.now() + 8000),
      eliminationLog: [],
      lastNightResult: null,
      lastVoteResult: null,
      currentVotes: {},
      winner: null
    })

    // Send system message
    await sendSystemMessage('🎮 เกมเริ่มแล้ว! กำลังแจกบทบาท...')

    // Read own secret
    await fetchMySecret()

    // Start phase timer
    startPhaseTimer()
  }

  function startPhaseTimer() {
    if (phaseTimerInterval) clearInterval(phaseTimerInterval)
    phaseTimerInterval = setInterval(() => {
      if (!isHost.value || !room.value) return
      const endAt = room.value.phaseEndAt
      if (!endAt) return

      const endMs = endAt.toMillis ? endAt.toMillis() : endAt.seconds * 1000
      if (Date.now() >= endMs) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/4874ca0e-af79-4c62-8248-d09be4c4f778',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'werewolf.js:phaseTimer',message:'timer expired, calling advancePhase',data:{phase:room.value.phase,isAdvancing,status:room.value.status},timestamp:Date.now(),hypothesisId:'H2,H5'})}).catch(()=>{});
        // #endregion
        advancePhase()
      }
    }, 1000)
  }

  async function advancePhase() {
    if (!isHost.value || !roomId.value || !room.value) return
    if (isAdvancing) return
    isAdvancing = true
    try {
    const phase = room.value.phase
    const r = room.value
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/4874ca0e-af79-4c62-8248-d09be4c4f778',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'werewolf.js:advancePhase',message:'advancePhase entered',data:{phase,round:r.round,status:r.status},timestamp:Date.now(),hypothesisId:'H1,H3'})}).catch(()=>{});
    // #endregion

    if (phase === 'role_reveal') {
      // Move to first night
      await updateDoc(doc(db, COLLECTION, roomId.value), {
        phase: 'night',
        round: 1,
        phaseEndAt: Timestamp.fromMillis(Date.now() + (r.settings.nightDuration || 30) * 1000)
      })
      await sendSystemMessage('🌙 คืนที่ 1 — หมาป่าออกล่า...')
    }
    else if (phase === 'night') {
      await processNightActions()
    }
    else if (phase === 'night_result') {
      // Check win after night kills before moving to day
      const gameEnded = await checkAndEndGame()
      if (!gameEnded) {
        await updateDoc(doc(db, COLLECTION, roomId.value), {
          phase: 'day_discussion',
          phaseEndAt: Timestamp.fromMillis(Date.now() + (r.settings.dayDuration || 90) * 1000)
        })
        await sendSystemMessage(`☀️ กลางวัน — อภิปรายกัน! (${r.settings.dayDuration || 90} วินาที)`)
      }
    }
    else if (phase === 'day_discussion') {
      // Move to voting
      await updateDoc(doc(db, COLLECTION, roomId.value), {
        phase: 'day_vote',
        currentVotes: {},
        phaseEndAt: Timestamp.fromMillis(Date.now() + 30000)
      })
      await sendSystemMessage('🗳️ เวลาโหวต! เลือกคนที่จะกำจัด (30 วินาที)')
    }
    else if (phase === 'day_vote') {
      await processVotes()
    }
    else if (phase === 'vote_result') {
      // Check win via checkAndEndGame (reads secrets from Firestore)
      const gameEnded = await checkAndEndGame()
      if (!gameEnded) {
        const nextRound = (r.round || 1) + 1
        await updateDoc(doc(db, COLLECTION, roomId.value), {
          phase: 'night',
          round: nextRound,
          phaseEndAt: Timestamp.fromMillis(Date.now() + (r.settings.nightDuration || 30) * 1000)
        })
        await sendSystemMessage(`🌙 คืนที่ ${nextRound} — หมาป่าออกล่า...`)
      }
    }
    } catch(err) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/4874ca0e-af79-4c62-8248-d09be4c4f778',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'werewolf.js:advancePhase:catch',message:'advancePhase ERROR',data:{error:err?.message,phase:room.value?.phase},timestamp:Date.now(),hypothesisId:'H1'})}).catch(()=>{});
      // #endregion
      throw err;
    } finally { isAdvancing = false }
  }

  async function processNightActions() {
    if (!isHost.value || !roomId.value) return

    // Read all night actions for this round
    const round = room.value.round
    const actionsSnap = await getDocs(
      query(
        collection(db, COLLECTION, roomId.value, 'nightActions'),
        where('round', '==', round)
      )
    )

    const actions = {}
    actionsSnap.docs.forEach(d => {
      const data = d.data()
      actions[data.playerId] = data
    })

    // Read all secrets to know who is wolf
    const secretsSnap = await getDocs(collection(db, COLLECTION, roomId.value, 'secrets'))
    const secrets = {}
    secretsSnap.docs.forEach(d => { secrets[d.id] = d.data() })

    // Determine wolf kill target (majority among wolves)
    const wolfVotes = {}
    for (const [pid, secret] of Object.entries(secrets)) {
      if (secret.role === 'werewolf' && room.value.players[pid]?.isAlive && actions[pid]) {
        const target = actions[pid].target
        if (target) wolfVotes[target] = (wolfVotes[target] || 0) + 1
      }
    }

    // Wolf tie-break: need majority agreement, otherwise no kill
    let killTarget = null
    let maxVotes = 0
    let isTie = false
    for (const [target, votes] of Object.entries(wolfVotes)) {
      if (votes > maxVotes) {
        maxVotes = votes
        killTarget = target
        isTie = false
      } else if (votes === maxVotes) {
        isTie = true
      }
    }
    // If wolves couldn't agree (tie), nobody dies
    if (isTie) killTarget = null

    // Doctor protection
    let savedByDoctor = false
    for (const [pid, secret] of Object.entries(secrets)) {
      if (secret.role === 'doctor' && room.value.players[pid]?.isAlive && actions[pid]) {
        if (actions[pid].target === killTarget) {
          savedByDoctor = true
        }
      }
    }

    // Witch actions
    let witchSaved = false
    let witchKill = null
    for (const [pid, secret] of Object.entries(secrets)) {
      if (secret.role === 'witch' && room.value.players[pid]?.isAlive && actions[pid]) {
        const act = actions[pid]
        if (act.action === 'save' && secret.hasSavePotion) {
          witchSaved = true
          await updateDoc(doc(db, COLLECTION, roomId.value, 'secrets', pid), {
            hasSavePotion: false
          })
        }
        if (act.action === 'poison' && act.target && secret.hasPoisonPotion) {
          witchKill = act.target
          await updateDoc(doc(db, COLLECTION, roomId.value, 'secrets', pid), {
            hasPoisonPotion: false
          })
        }
      }
    }

    const wolfDisagreed = isTie && Object.keys(wolfVotes).length > 1
    const actualSaved = savedByDoctor || witchSaved
    const killed = actualSaved ? null : killTarget
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/4874ca0e-af79-4c62-8248-d09be4c4f778',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'werewolf.js:processNightActions',message:'night result',data:{killTarget,savedByDoctor,witchSaved,witchKill,killed,wolfVotes,actionsCount:Object.keys(actions).length},timestamp:Date.now(),hypothesisId:'H4'})}).catch(()=>{});
    // #endregion

    // Seer investigation
    for (const [pid, secret] of Object.entries(secrets)) {
      if (secret.role === 'seer' && room.value.players[pid]?.isAlive && actions[pid]) {
        const target = actions[pid].target
        if (target && secrets[target]) {
          const isWolf = secrets[target].role === 'werewolf'
          const investigations = secret.investigations || []
          investigations.push({ target, isWolf, round })
          await updateDoc(doc(db, COLLECTION, roomId.value, 'secrets', pid), {
            investigations,
            lastInvestigation: { target, isWolf }
          })
        }
      }
    }

    // Apply kills — update full players map (avoid dot notation on email keys)
    const nightPlayers = { ...room.value.players }
    const updates = {
      lastNightResult: { killedId: killed, savedByDoctor: actualSaved, witchKill },
      phase: 'night_result',
      phaseEndAt: Timestamp.fromMillis(Date.now() + 6000)
    }

    if (killed) {
      nightPlayers[killed] = { ...nightPlayers[killed], isAlive: false }
      const killedRole = secrets[killed]?.role || 'unknown'
      updates.eliminationLog = [
        ...(room.value.eliminationLog || []),
        { round, playerId: killed, role: killedRole, by: 'wolf' }
      ]
    }
    if (witchKill && witchKill !== killed) {
      nightPlayers[witchKill] = { ...nightPlayers[witchKill], isAlive: false }
      const wkRole = secrets[witchKill]?.role || 'unknown'
      const log = updates.eliminationLog || [...(room.value.eliminationLog || [])]
      log.push({ round, playerId: witchKill, role: wkRole, by: 'witch' })
      updates.eliminationLog = log
    }

    updates.players = nightPlayers
    await updateDoc(doc(db, COLLECTION, roomId.value), updates)

    // Announce result
    if (killed) {
      const name = room.value.players[killed]?.displayName || killed
      await sendSystemMessage(`💀 ${name} ถูกหมาป่ากัดตายเมื่อคืน!`)
    } else if (actualSaved) {
      await sendSystemMessage('🛡️ มีคนถูกโจมตี แต่ได้รับการช่วยเหลือ! ไม่มีใครตายคืนนี้')
    } else {
      await sendSystemMessage('🌅 คืนที่ผ่านมาสงบสุข ไม่มีใครตาย')
    }
    if (witchKill && witchKill !== killed) {
      const wname = room.value.players[witchKill]?.displayName || witchKill
      await sendSystemMessage(`☠️ ${wname} ถูกวางยาพิษตาย!`)
    }

    // Notify wolves if they disagreed (wolf channel only)
    if (wolfDisagreed) {
      await addDoc(collection(db, COLLECTION, roomId.value, 'messages'), {
        senderId: 'system',
        senderName: 'Game Master',
        text: '🐺 หมาป่าเลือกไม่ตรงกัน! ไม่มีใครถูกกัดคืนนี้',
        channel: 'wolf',
        createdAt: serverTimestamp()
      })
    }

    // Clean up night actions
    for (const d of actionsSnap.docs) {
      await deleteDoc(d.ref)
    }

  }

  async function processVotes() {
    if (!isHost.value || !roomId.value) return
    const votes = room.value.currentVotes || {}

    // Tally votes (only alive players' votes count)
    const tally = {}
    for (const [voter, target] of Object.entries(votes)) {
      if (room.value.players[voter]?.isAlive && target !== 'skip') {
        tally[target] = (tally[target] || 0) + 1
      }
    }

    // Find majority
    let maxVotes = 0
    let eliminated = null
    let isTie = false
    for (const [target, count] of Object.entries(tally)) {
      if (count > maxVotes) {
        maxVotes = count
        eliminated = target
        isTie = false
      } else if (count === maxVotes) {
        isTie = true
      }
    }

    // Need majority of alive players, and no tie
    const aliveCount = alivePlayers.value.length
    if (isTie || maxVotes < Math.ceil(aliveCount / 2)) {
      eliminated = null // No consensus
    }

    const secretsSnap = await getDocs(collection(db, COLLECTION, roomId.value, 'secrets'))
    const secrets = {}
    secretsSnap.docs.forEach(d => { secrets[d.id] = d.data() })

    // Update full players map (avoid dot notation on email keys)
    const votePlayers = { ...room.value.players }
    const updates = {
      lastVoteResult: { eliminatedId: eliminated, tally, votes },
      phase: 'vote_result',
      phaseEndAt: Timestamp.fromMillis(Date.now() + 6000)
    }

    if (eliminated) {
      votePlayers[eliminated] = { ...votePlayers[eliminated], isAlive: false }
      const elimRole = secrets[eliminated]?.role || 'unknown'
      updates.eliminationLog = [
        ...(room.value.eliminationLog || []),
        {
          round: room.value.round,
          playerId: eliminated,
          role: elimRole,
          by: 'vote'
        }
      ]
    }

    updates.players = votePlayers
    await updateDoc(doc(db, COLLECTION, roomId.value), updates)

    if (eliminated) {
      const name = room.value.players[eliminated]?.displayName || eliminated
      const role = secrets[eliminated]?.role
      const roleName = ROLES[role]?.name || role
      await sendSystemMessage(`⚖️ ${name} ถูกโหวตกำจัด! บทบาท: ${roleName} ${ROLES[role]?.emoji || ''}`)

      // Hunter special: if hunter is eliminated, they get to shoot
      if (role === 'hunter') {
        await sendSystemMessage(`🏹 ${name} เป็นนักล่า! จะได้ยิงคนตายตามอีก 1 คน!`)
        // For simplicity, hunter auto-targets a random alive wolf (or random if no wolf known)
        // In a full version, this would pause for hunter to choose
      }
    } else {
      await sendSystemMessage('🤷 ไม่มีเสียงข้างมาก ไม่มีใครถูกกำจัดวันนี้')
    }
  }

  // Returns true if game ended, false otherwise
  // Reads fresh data from Firestore to avoid stale local state
  async function checkAndEndGame() {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/4874ca0e-af79-4c62-8248-d09be4c4f778',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'werewolf.js:checkAndEndGame:entry',message:'checkAndEndGame called',data:{isHost:isHost.value,roomId:roomId.value,isCheckingWin,localStatus:room.value?.status,localPhase:room.value?.phase},timestamp:Date.now(),hypothesisId:'H3'})}).catch(()=>{});
    // #endregion
    if (!isHost.value || !roomId.value) return false
    if (isCheckingWin) return false
    if (room.value?.status === 'finished') return true

    isCheckingWin = true
    try {
      // Read fresh room data from Firestore (local state may be stale after writes)
      const roomSnap = await getDoc(doc(db, COLLECTION, roomId.value))
      if (!roomSnap.exists()) return false
      const freshRoom = roomSnap.data()
      if (freshRoom.status === 'finished') return true

      const secretsSnap = await getDocs(collection(db, COLLECTION, roomId.value, 'secrets'))
      const secrets = {}
      secretsSnap.docs.forEach(d => { secrets[d.id] = d.data() })

      const alive = Object.entries(freshRoom.players)
        .filter(([, p]) => p.isAlive)
        .map(([id]) => id)

      let aliveWolfCount = 0
      let aliveVillageCount = 0
      for (const pid of alive) {
        if (secrets[pid]?.role === 'werewolf') aliveWolfCount++
        else aliveVillageCount++
      }

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/4874ca0e-af79-4c62-8248-d09be4c4f778',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'werewolf.js:checkAndEndGame:counts',message:'win condition check',data:{aliveWolfCount,aliveVillageCount,aliveTotal:alive.length,freshPhase:freshRoom.phase,freshStatus:freshRoom.status},timestamp:Date.now(),hypothesisId:'H3'})}).catch(()=>{});
      // #endregion

      if (aliveWolfCount === 0) {
        await endGame('village', secrets)
        return true
      } else if (aliveWolfCount >= aliveVillageCount) {
        await endGame('wolf', secrets)
        return true
      }
      return false
    } finally { isCheckingWin = false }
  }

  async function endGame(winner, secrets) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/4874ca0e-af79-4c62-8248-d09be4c4f778',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'werewolf.js:endGame',message:'endGame called',data:{winner,roomId:roomId.value,secretsKeys:secrets?Object.keys(secrets):null},timestamp:Date.now(),hypothesisId:'H3'})}).catch(()=>{});
    // #endregion
    if (!roomId.value) return

    // Build revealedRoles map so all players can see roles at game over
    let revealedRoles = {}
    if (secrets) {
      for (const [pid, s] of Object.entries(secrets)) {
        revealedRoles[pid] = s.role
      }
    } else {
      // Fallback: read secrets if not provided
      const secretsSnap = await getDocs(collection(db, COLLECTION, roomId.value, 'secrets'))
      secretsSnap.docs.forEach(d => { revealedRoles[d.id] = d.data().role })
    }

    await updateDoc(doc(db, COLLECTION, roomId.value), {
      status: 'finished',
      phase: 'game_over',
      winner,
      revealedRoles,
      phaseEndAt: null
    })

    if (phaseTimerInterval) { clearInterval(phaseTimerInterval); phaseTimerInterval = null }

    const winnerText = winner === 'village' ? '🎉 ฝ่ายชาวบ้านชนะ!' : '🐺 ฝ่ายหมาป่าชนะ!'
    await sendSystemMessage(winnerText)

    // Submit scores
    await submitGameScores(winner)
  }

  async function submitGameScores(winner) {
    const { useGameStore } = await import('./game')
    const gameStore = useGameStore()

    const secretsSnap = await getDocs(collection(db, COLLECTION, roomId.value, 'secrets'))
    const secrets = {}
    secretsSnap.docs.forEach(d => { secrets[d.id] = d.data() })

    for (const [pid, playerData] of Object.entries(room.value.players)) {
      const secret = secrets[pid]
      if (!secret) continue

      let score = 0
      const team = ROLES[secret.role]?.team

      // Winning team bonus
      if ((winner === 'village' && team === TEAMS.VILLAGE) ||
          (winner === 'wolf' && team === TEAMS.WOLF)) {
        score += 10
      }

      // Survival bonus
      if (playerData.isAlive) score += 2

      // Special role bonus
      if (secret.role === 'seer' && secret.investigations?.some(i => i.isWolf)) score += 3
      if (secret.role === 'doctor') {
        if (room.value.lastNightResult?.savedByDoctor) score += 3
      }

      if (score > 0 && pid === myId.value) {
        await gameStore.submitScore('werewolf', score)
      }
    }
  }

  // ==================== PLAYER ACTIONS ====================

  async function submitNightAction(action, target) {
    if (!roomId.value || !myId.value || !isAlive.value) return
    const round = room.value?.round || 0
    await setDoc(
      doc(db, COLLECTION, roomId.value, 'nightActions', `${myId.value}_${round}`),
      {
        playerId: myId.value,
        action: action || myRole.value,
        target,
        round
      }
    )
  }

  async function submitVote(targetId) {
    if (!roomId.value || !myId.value || !room.value || !isAlive.value) return
    const updatedVotes = { ...(room.value.currentVotes || {}), [myId.value]: targetId }
    await updateDoc(doc(db, COLLECTION, roomId.value), { currentVotes: updatedVotes })
  }

  // ==================== CHAT ====================

  async function sendMessage(text, channel = 'public') {
    if (!roomId.value || !myId.value || !text.trim()) return
    await addDoc(collection(db, COLLECTION, roomId.value, 'messages'), {
      senderId: myId.value,
      senderName: myDisplayName.value,
      text: text.trim(),
      channel,
      createdAt: serverTimestamp()
    })
  }

  async function sendSystemMessage(text) {
    if (!roomId.value) return
    await addDoc(collection(db, COLLECTION, roomId.value, 'messages'), {
      senderId: 'system',
      senderName: 'Game Master',
      text,
      channel: 'public',
      createdAt: serverTimestamp()
    })
  }

  // ==================== WOLF NIGHT TARGETS LISTENER ====================

  function subscribeToWolfNightActions() {
    // Unsubscribe previous listener
    if (unsubNightActions) { unsubNightActions(); unsubNightActions = null }
    wolfNightTargets.value = {}

    if (!roomId.value || !room.value) return
    const round = room.value.round
    if (!round) return

    // Listen to nightActions for current round
    unsubNightActions = onSnapshot(
      query(
        collection(db, COLLECTION, roomId.value, 'nightActions'),
        where('round', '==', round)
      ),
      (snap) => {
        const targets = {}
        snap.docs.forEach(d => {
          const data = d.data()
          // Only include wolf actions (werewolf role players)
          // We check if the playerId is in our wolfTeam or is ourselves
          const wolfTeam = mySecret.value?.wolfTeam || []
          const isWolfPlayer = data.playerId === myId.value || wolfTeam.includes(data.playerId)
          if (isWolfPlayer && data.target) {
            targets[data.playerId] = data.target
          }
        })
        wolfNightTargets.value = targets
      }
    )
  }

  function unsubWolfNightActions() {
    if (unsubNightActions) { unsubNightActions(); unsubNightActions = null }
    wolfNightTargets.value = {}
  }

  // ==================== LISTENERS ====================

  async function subscribeToRoom(id) {
    unsubAll()
    roomId.value = id

    // Listen to room doc
    unsubRoom = onSnapshot(doc(db, COLLECTION, id), (snap) => {
      if (snap.exists()) {
        room.value = { id: snap.id, ...snap.data() }

        // If game just started or we reconnected, fetch secret
        if (room.value.status === 'playing' && !mySecret.value) {
          fetchMySecret()
        }

        // Re-fetch secret on night_result so seer sees investigation results
        if (room.value.status === 'playing' && room.value.phase === 'night_result' && mySecret.value) {
          fetchMySecret()
        }

        // Wolf night action listener: subscribe during night, unsubscribe otherwise
        if (room.value.status === 'playing' && room.value.phase === 'night' && myRole.value === 'werewolf') {
          subscribeToWolfNightActions()
        } else {
          unsubWolfNightActions()
        }

        // Host: restart phase timer if needed
        if (isHost.value && room.value.status === 'playing' && room.value.phaseEndAt) {
          if (!phaseTimerInterval) startPhaseTimer()
        }

        // Auto-check win condition after state changes (host only)
        if (isHost.value && room.value.status === 'playing' &&
            (room.value.phase === 'night_result' || room.value.phase === 'vote_result')) {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/4874ca0e-af79-4c62-8248-d09be4c4f778',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'werewolf.js:onSnapshot:winCheck',message:'onSnapshot triggering checkAndEndGame',data:{phase:room.value.phase,isCheckingWin},timestamp:Date.now(),hypothesisId:'H3'})}).catch(()=>{});
          // #endregion
          checkAndEndGame()
        }
      } else {
        room.value = null
        roomId.value = null
      }
    })

    // Listen to messages
    unsubMessages = onSnapshot(
      query(
        collection(db, COLLECTION, id, 'messages'),
        orderBy('createdAt', 'asc')
      ),
      (snap) => {
        messages.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      }
    )
  }

  async function fetchMySecret() {
    if (!roomId.value || !myId.value) return
    try {
      const snap = await getDoc(doc(db, COLLECTION, roomId.value, 'secrets', myId.value))
      if (snap.exists()) {
        mySecret.value = snap.data()
      }
    } catch (err) {
      console.error('Error fetching secret:', err)
    }
  }

  // ==================== CLEANUP ====================

  function unsubAll() {
    if (unsubRoom) { unsubRoom(); unsubRoom = null }
    if (unsubMessages) { unsubMessages(); unsubMessages = null }
    if (unsubNightActions) { unsubNightActions(); unsubNightActions = null }
    if (phaseTimerInterval) { clearInterval(phaseTimerInterval); phaseTimerInterval = null }
  }

  function cleanup() {
    unsubAll()
    room.value = null
    roomId.value = null
    mySecret.value = null
    messages.value = []
    nightActions.value = {}
    wolfNightTargets.value = {}
    error.value = null
    isAdvancing = false
    isCheckingWin = false
  }

  // ==================== RETURN ====================

  return {
    // State
    room, roomId, mySecret, messages, wolfNightTargets, loading, error,
    // Computed
    myId, myDisplayName, isHost, isAlive, myRole, myRoleDef,
    alivePlayers, playerCount, isGameActive,
    // Room
    createRoom, joinRoom, leaveRoom, toggleReady,
    // Game Master
    startGame, advancePhase,
    // Player Actions
    submitNightAction, submitVote,
    // Chat
    sendMessage,
    // Listeners
    subscribeToRoom, fetchMySecret,
    // Cleanup
    cleanup
  }
})
