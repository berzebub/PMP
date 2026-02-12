<template>
  <q-page class="games-page">
    <div class="games-container">
      <!-- Header -->
      <div class="games-header">
        <div class="games-header-left">
          <div class="games-header-icon">
            <q-icon name="sports_esports" size="26px" />
          </div>
          <div>
            <div class="games-header-title">Arcade</div>
            <div class="games-header-subtitle">พักสมอง แก้เครียด แข่งกันสนุกๆ</div>
          </div>
        </div>
      </div>

      <!-- Games Grid -->
      <div class="games-grid">
        <div
          v-for="game in availableGames"
          :key="game.id"
          class="game-card"
          :class="{ 'game-card-disabled': !game.available }"
          @click="game.available && $router.push(game.route)"
        >
          <div class="game-card-accent" :style="{ background: game.color }"></div>
          <div class="game-card-body">
            <div class="game-card-top">
              <div class="game-card-icon" :style="{ background: game.color + '18', color: game.color }">
                <q-icon :name="game.icon" size="24px" />
              </div>
              <div v-if="game.available" class="game-card-arrow">
                <q-icon name="play_arrow" size="18px" />
              </div>
              <div v-else class="game-card-coming">
                <span>เร็วๆ นี้</span>
              </div>
            </div>
            <div class="game-card-name">{{ game.name }}</div>
            <div v-if="game.subtitle" class="game-card-subtitle">{{ game.subtitle }}</div>
            <div class="game-card-desc">{{ game.description }}</div>
            <div class="game-card-footer">
              <div class="game-card-tag">
                <q-icon name="speed" size="12px" />
                <span>{{ game.difficulty }}</span>
              </div>
              <div class="game-card-tag">
                <q-icon name="keyboard" size="12px" />
                <span>{{ game.controls }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Leaderboard Section -->
      <div class="games-leaderboard-section">
        <div class="games-section-header">
          <div class="games-section-icon">
            <q-icon name="emoji_events" size="20px" />
          </div>
          <div>
            <div class="games-section-title">Leaderboard</div>
            <div class="games-section-subtitle">อันดับคะแนนสูงสุด</div>
          </div>
        </div>

        <div v-if="gameStore.loading" class="games-leaderboard-loading">
          <q-spinner-dots size="32px" color="primary" />
        </div>

        <div v-else-if="gameStore.leaderboard.length === 0" class="games-leaderboard-empty">
          <q-icon name="leaderboard" size="48px" />
          <span>ยังไม่มีคะแนน เป็นคนแรกที่ทำลายสถิติ!</span>
        </div>

        <div v-else class="games-leaderboard-list">
          <div
            v-for="(entry, idx) in gameStore.leaderboard"
            :key="entry.id"
            class="leaderboard-item"
            :class="{ 'leaderboard-me': entry.userId === currentUserEmail }"
          >
            <div class="leaderboard-rank" :class="'rank-' + (idx + 1)">
              <span v-if="idx === 0">🥇</span>
              <span v-else-if="idx === 1">🥈</span>
              <span v-else-if="idx === 2">🥉</span>
              <span v-else>#{{ idx + 1 }}</span>
            </div>
            <div class="leaderboard-avatar">
              <img v-if="entry.photoURL" :src="entry.photoURL" />
              <span v-else>{{ (entry.displayName || 'U').charAt(0).toUpperCase() }}</span>
            </div>
            <div class="leaderboard-info">
              <div class="leaderboard-name">{{ entry.displayName }}</div>
              <div class="leaderboard-date">{{ formatDate(entry.createdAt) }}</div>
            </div>
            <div class="leaderboard-score">{{ entry.score.toLocaleString() }}</div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { games } from 'src/data/gameRegistry'
import { useGameStore } from 'src/stores/game'
import { useAuthStore } from 'src/stores/auth'

const gameStore = useGameStore()
const authStore = useAuthStore()

const availableGames = computed(() => games)
const currentUserEmail = computed(() => authStore.user?.email || '')

const formatDate = (timestamp) => {
  if (!timestamp) return ''
  const d = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })
}

onMounted(() => {
  // Fetch leaderboard for the first (main) game
  gameStore.fetchLeaderboard('dino-runner', 10)
})
</script>

<style scoped>
.games-page {
  padding: 24px;
  min-height: 100vh;
}

.games-container {
  max-width: 900px;
  margin: 0 auto;
}

/* ====== Header ====== */
.games-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
}

.games-header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.games-header-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(236, 64, 122, 0.12);
  color: #ec407a;
  display: flex;
  align-items: center;
  justify-content: center;
}

.games-header-title {
  font-size: 1.35rem;
  font-weight: 700;
  color: #e0e1e4;
  letter-spacing: -0.01em;
}

.games-header-subtitle {
  font-size: 0.78rem;
  color: #6b6c6f;
  margin-top: 2px;
}

/* ====== Games Grid ====== */
.games-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 18px;
  margin-bottom: 36px;
}

.game-card {
  background: #23242a;
  border-radius: 14px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.18s, box-shadow 0.18s;
  border: 1px solid rgba(58, 59, 62, 0.3);
}

.game-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.game-card-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.game-card-disabled:hover {
  transform: none;
  box-shadow: none;
}

.game-card-accent {
  height: 4px;
}

.game-card-body {
  padding: 18px;
}

.game-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.game-card-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.game-card-arrow {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(92, 156, 230, 0.1);
  color: #5c9ce6;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}

.game-card:hover .game-card-arrow {
  background: rgba(92, 156, 230, 0.2);
}

.game-card-coming {
  font-size: 0.65rem;
  color: #6b6c6f;
  background: rgba(58, 59, 62, 0.3);
  padding: 4px 10px;
  border-radius: 20px;
  font-weight: 600;
}

.game-card-name {
  font-size: 1.05rem;
  font-weight: 700;
  color: #e0e1e4;
}

.game-card-subtitle {
  font-size: 0.72rem;
  color: #6b6c6f;
  margin-top: 2px;
  font-weight: 500;
}

.game-card-desc {
  font-size: 0.78rem;
  color: #9e9fa3;
  margin-top: 8px;
  line-height: 1.45;
}

.game-card-footer {
  display: flex;
  gap: 10px;
  margin-top: 14px;
}

.game-card-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.68rem;
  color: #6b6c6f;
  background: rgba(58, 59, 62, 0.25);
  padding: 4px 10px;
  border-radius: 20px;
}

/* ====== Leaderboard Section ====== */
.games-leaderboard-section {
  background: #23242a;
  border-radius: 14px;
  padding: 20px;
  border: 1px solid rgba(58, 59, 62, 0.3);
}

.games-section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
}

.games-section-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(255, 183, 77, 0.12);
  color: #ffb74d;
  display: flex;
  align-items: center;
  justify-content: center;
}

.games-section-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #e0e1e4;
}

.games-section-subtitle {
  font-size: 0.68rem;
  color: #6b6c6f;
  margin-top: 1px;
}

.games-leaderboard-loading {
  text-align: center;
  padding: 32px 0;
}

.games-leaderboard-empty {
  text-align: center;
  padding: 32px 0;
  color: #6b6c6f;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  font-size: 0.82rem;
}

.games-leaderboard-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.leaderboard-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  transition: background 0.15s;
}

.leaderboard-item:hover {
  background: rgba(58, 59, 62, 0.2);
}

.leaderboard-me {
  background: rgba(92, 156, 230, 0.08);
  border: 1px solid rgba(92, 156, 230, 0.15);
}

.leaderboard-rank {
  width: 32px;
  text-align: center;
  font-size: 0.85rem;
  font-weight: 700;
  color: #6b6c6f;
}

.rank-1 { font-size: 1.15rem; }
.rank-2 { font-size: 1.1rem; }
.rank-3 { font-size: 1.05rem; }

.leaderboard-avatar {
  width: 34px;
  height: 34px;
  min-width: 34px;
  border-radius: 50%;
  background: #2a2b2e;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.78rem;
  font-weight: 600;
  color: #9e9fa3;
  overflow: hidden;
}

.leaderboard-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.leaderboard-info {
  flex: 1;
  min-width: 0;
}

.leaderboard-name {
  font-size: 0.82rem;
  font-weight: 600;
  color: #e0e1e4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.leaderboard-date {
  font-size: 0.65rem;
  color: #6b6c6f;
  margin-top: 1px;
}

.leaderboard-score {
  font-size: 0.92rem;
  font-weight: 700;
  color: #ffb74d;
  font-variant-numeric: tabular-nums;
}

/* ====== Responsive ====== */
@media (max-width: 600px) {
  .games-page {
    padding: 16px;
  }

  .games-grid {
    grid-template-columns: 1fr;
  }

  .games-header-title {
    font-size: 1.15rem;
  }
}
</style>
