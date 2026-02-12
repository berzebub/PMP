<template>
  <q-page class="calendar-page">
    <div class="calendar-container">
      <!-- Header -->
      <div class="calendar-page-header">
        <div class="calendar-header-left">
          <div class="calendar-header-icon">
            <q-icon name="calendar_month" size="26px" />
          </div>
          <div>
            <div class="calendar-header-title">Company Calendar</div>
            <div class="calendar-header-subtitle">ปฏิทินบริษัท — ดูตารางวันลา, กิจกรรม และอีเวนท์ต่างๆ</div>
          </div>
        </div>
        <div class="calendar-header-right"></div>
      </div>

      <!-- Calendar Embed -->
      <div class="calendar-embed-card">
        <iframe
          src="https://calendar.google.com/calendar/embed?src=0c7cb0ba7b6f7ef670f9dea1d2aba5da0c06112094ce8e2260bba6545d663056%40group.calendar.google.com&ctz=Asia%2FBangkok"
          class="calendar-iframe"
          frameborder="0"
          scrolling="no"
        ></iframe>
      </div>
    </div>
  </q-page>
</template>

<script setup>
</script>

<style scoped>
.calendar-page {
  background: transparent;
  min-height: 100vh;
  padding: 24px;
}

.calendar-container {
  max-width: 1100px;
  margin: 0 auto;
}

/* ====== Header ====== */
.calendar-page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.calendar-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.calendar-header-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(66, 165, 245, 0.12);
  color: #42a5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.calendar-header-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #e0e1e4;
}

.calendar-header-subtitle {
  font-size: 0.72rem;
  color: #6b6c6f;
  margin-top: 2px;
}

.calendar-back-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px;
  border-radius: 8px;
  border: 1px solid rgba(58, 59, 62, 0.4);
  background: transparent;
  color: #9e9e9e;
  font-size: 0.78rem;
  cursor: pointer;
  transition: all 0.15s;
}

.calendar-back-btn:hover {
  border-color: rgba(92, 156, 230, 0.3);
  color: #5c9ce6;
}

/* ====== Calendar Card ====== */
.calendar-embed-card {
  background: rgba(30, 33, 36, 0.7);
  border: 1px solid rgba(58, 59, 62, 0.3);
  border-radius: 14px;
  backdrop-filter: blur(10px);
  overflow: hidden;
  padding: 4px;
}

.calendar-iframe {
  width: 100%;
  height: calc(100vh - 160px);
  min-height: 500px;
  border: none;
  border-radius: 10px;
}

/* ====== Responsive ====== */
@media (max-width: 768px) {
  .calendar-page {
    padding: 16px;
  }

  .calendar-page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .calendar-iframe {
    height: calc(100vh - 200px);
    min-height: 400px;
  }
}
</style>
