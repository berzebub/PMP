<template>
  <q-layout view="lHh Lpr lFf" class="bg-primary">
    <q-header elevated class="bg-surface">
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" class="text-primary" />

        <q-toolbar-title class="text-primary">
          Edutech Innovation
        </q-toolbar-title>

        <div class="row items-center q-gutter-sm">
          <!-- Daily Check-in Button -->
          <button class="checkin-btn" :class="{ 'checkin-done': checkinStore.hasCheckedInToday }"
            @click="handleCheckinBtnClick">
            <span class="checkin-icon-wrap">
              <q-icon :name="checkinStore.hasCheckedInToday ? 'check_circle' : 'radio_button_unchecked'" size="20px" />
            </span>
            <span class="checkin-label">
              {{ checkinStore.hasCheckedInToday ? 'เช็คชื่อแล้ว' : 'เช็คชื่อวันนี้' }}
            </span>
            <span v-if="checkinStore.currentStreak > 0" class="checkin-streak">
              {{ checkinStore.streakTier.emoji }} {{ checkinStore.currentStreak }}
            </span>
          </button>

          <!-- Notification Bell -->
          <q-btn flat round dense class="notif-bell" @click="showNotifPanel = !showNotifPanel">
            <q-icon name="notifications" size="22px" />
            <q-badge v-if="notificationsStore.unreadCount > 0" floating color="red" :label="notificationsStore.unreadCount > 9 ? '9+' : notificationsStore.unreadCount" class="notif-badge" />
          </q-btn>

          <!-- Notification Panel (teleported to body for full-screen overlay) -->
          <Teleport to="body">
            <div v-if="showNotifPanel" class="notif-overlay" @click.self="showNotifPanel = false">
              <div class="notif-panel">
                <!-- Header -->
                <div class="notif-panel-header">
                  <div class="notif-panel-title">
                    <q-icon name="notifications" size="20px" />
                    <span>การแจ้งเตือน</span>
                    <q-badge v-if="notificationsStore.unreadCount > 0" :label="notificationsStore.unreadCount" class="notif-count-badge" />
                  </div>
                  <button v-if="notificationsStore.unreadCount > 0" class="notif-mark-all" @click="notificationsStore.markAllAsRead()">
                    อ่านทั้งหมด
                  </button>
                </div>

                <!-- List -->
                <div class="notif-list">
                  <div v-if="notificationsStore.sortedNotifications.length === 0" class="notif-empty">
                    <q-icon name="notifications_none" size="48px" style="color: #2a2b2e;" />
                    <span>ยังไม่มีการแจ้งเตือน</span>
                  </div>

                  <div v-for="notif in notificationsStore.sortedNotifications" :key="notif.id"
                    class="notif-item" :class="{ 'notif-unread': !notif.read }"
                    @click="handleNotifClick(notif)">
                    <div class="notif-icon-wrap" :class="'notif-icon-' + notif.type">
                      <q-icon :name="notif.type === 'mention' ? 'alternate_email' : notif.type === 'assign' ? 'person_add' : 'info'" size="18px" />
                    </div>
                    <div class="notif-content">
                      <div class="notif-msg">{{ notif.message }}</div>
                      <div class="notif-meta">
                        <span v-if="notif.projectName" class="notif-project">{{ notif.projectName }}</span>
                        <span class="notif-time">{{ formatNotifTime(notif.createdAt) }}</span>
                      </div>
                    </div>
                    <div v-if="!notif.read" class="notif-dot"></div>
                  </div>
                </div>
              </div>
            </div>
          </Teleport>

          <!-- Help Button -->
          <q-btn v-if="currentHelpContent" flat round dense class="help-btn" @click="showHelpDialog = true">
            <q-icon name="help_outline" size="22px" />
            <q-tooltip>คู่มือการใช้งาน</q-tooltip>
          </q-btn>

          <q-btn-dropdown flat no-caps class="profile-dropdown bg-transparent" menu-class="profile-menu-popup">
            <template v-slot:label>
              <div class="row items-center no-wrap">
                <q-avatar size="30px" class="profile-avatar">
                  <img v-if="authStore.profile.photoURL" :src="authStore.profile.photoURL" />
                  <span v-else>{{ authStore.user?.email?.charAt(0).toUpperCase() || 'U' }}</span>
                </q-avatar>
                <span class="profile-name q-ml-sm">
                  {{ authStore.user?.displayName || authStore.user?.email?.split('@')[0] || 'User' }}
                </span>
              </div>
            </template>

            <div class="profile-menu">
              <!-- User Info -->
              <div class="profile-menu-header">
                <q-avatar size="42px" class="profile-avatar-lg">
                  <img v-if="authStore.profile.photoURL" :src="authStore.profile.photoURL" />
                  <span v-else>{{ authStore.user?.email?.charAt(0).toUpperCase() || 'U' }}</span>
                </q-avatar>
                <div class="profile-menu-info">
                  <div class="profile-menu-name">
                    {{ authStore.fullName }}
                  </div>
                  <div class="profile-menu-email">{{ authStore.user?.email }}</div>
                </div>
              </div>

              <q-separator style="background: rgba(44, 58, 69, 0.4);" />

              <!-- Menu Items -->
              <q-list class="profile-menu-list">
                <q-item clickable v-close-popup @click="showProfileDialog = true" class="profile-menu-item">
                  <q-item-section avatar>
                    <q-icon name="person" size="18px" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>จัดการโปรไฟล์</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="handleLogout" class="profile-menu-item logout-item">
                  <q-item-section avatar>
                    <q-icon name="logout" size="18px" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>ออกจากระบบ</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </q-btn-dropdown>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <div class="drawer-content">
        <!-- Drawer Header -->
        <div class="drawer-header">
          <div class="drawer-logo">
            <q-icon name="dashboard" size="20px" />
          </div>
          <div>
            <div class="drawer-brand">Edutech Innovation Co., Ltd</div>
            <div class="drawer-brand-sub">Menu</div>
          </div>
        </div>

        <!-- Navigation Menu -->
        <nav class="nav-menu">
          <!-- Dashboard -->
          <!-- <div class="nav-item" :class="{ 'nav-active': currentRoute === '/' }"
            @click="navigateTo('/')">
            <div class="nav-icon" style="color: #5c9ce6;">
              <q-icon name="space_dashboard" size="20px" />
            </div>
            <span class="nav-label">Dashboard</span>
          </div> -->

          <!-- Projects -->
          <div class="nav-item" :class="{ 'nav-active': currentRoute === '/' }"
            @click="navigateTo('/')">
            <div class="nav-icon" style="color: #5c9ce6;">
              <q-icon name="folder" size="20px" />
            </div>
            <span class="nav-label">Projects</span>
            <q-badge v-if="projectsStore.projects.length > 0" :label="projectsStore.projects.length" class="nav-section-badge" />
          </div>

          <!-- Divider -->
          <div class="nav-divider"></div>

          <!-- Check-in -->
          <div class="nav-item" :class="{ 'nav-active': currentRoute === '/checkins' }"
            @click="navigateTo('/checkins')">
            <div class="nav-icon" style="color: #66bb6a;">
              <q-icon name="event_available" size="20px" />
            </div>
            <span class="nav-label">Daily Check-in</span>
            <span v-if="!checkinStore.hasCheckedInToday" class="nav-badge-alert"></span>
          </div>

          <!-- Leave Request -->
          <div class="nav-item" :class="{ 'nav-active': currentRoute === '/leaves' }"
            @click="navigateTo('/leaves')">
            <div class="nav-icon" style="color: #ffb74d;">
              <q-icon name="event_busy" size="20px" />
            </div>
            <span class="nav-label">Leave Request</span>
          </div>

          <!-- Expense Reimbursement -->
          <div class="nav-item" :class="{ 'nav-active': currentRoute === '/expenses' }"
            @click="navigateTo('/expenses')">
            <div class="nav-icon" style="color: #26a69a;">
              <q-icon name="receipt_long" size="20px" />
            </div>
            <span class="nav-label">Expense Claim</span>
          </div>

          <!-- Work Log -->
          <div class="nav-item" :class="{ 'nav-active': currentRoute === '/worklogs' }"
            @click="navigateTo('/worklogs')">
            <div class="nav-icon" style="color: #ab47bc;">
              <q-icon name="edit_note" size="20px" />
            </div>
            <span class="nav-label">Work Log</span>
            <span v-if="!worklogStore.hasSubmittedToday" class="nav-badge-alert"></span>
          </div>

          <!-- Portfolio -->
          <div class="nav-item" :class="{ 'nav-active': currentRoute === '/portfolio' }"
            @click="navigateTo('/portfolio')">
            <div class="nav-icon" style="color: #7e57c2;">
              <q-icon name="work_history" size="20px" />
            </div>
            <span class="nav-label">Portfolio</span>
          </div>

          <!-- Company Calendar -->
          <div class="nav-item" :class="{ 'nav-active': currentRoute === '/calendar' }"
            @click="navigateTo('/calendar')">
            <div class="nav-icon" style="color: #42a5f5;">
              <q-icon name="calendar_month" size="20px" />
            </div>
            <span class="nav-label">Company Calendar</span>
          </div>

          <!-- Arcade -->
          <div class="nav-item" :class="{ 'nav-active': currentRoute.startsWith('/games') }"
            @click="navigateTo('/games')">
            <div class="nav-icon" style="color: #ec407a;">
              <q-icon name="sports_esports" size="20px" />
            </div>
            <span class="nav-label">Arcade</span>
          </div>

          <!-- Admin (HR sees Leave Report only, super_admin sees all) -->
          <template v-if="authStore.isSuperAdmin || authStore.isHR">
            <div class="nav-divider"></div>
            <div class="nav-section-label">
              <span>Admin</span>
            </div>
            <div class="nav-item" :class="{ 'nav-active': currentRoute === '/leave-report' }"
              @click="navigateTo('/leave-report')">
              <div class="nav-icon" style="color: #ff8a65;">
                <q-icon name="assessment" size="20px" />
              </div>
              <span class="nav-label">Leave Report</span>
            </div>
            <div v-if="authStore.isSuperAdmin"
              class="nav-item" :class="{ 'nav-active': currentRoute === '/admin' }"
              @click="navigateTo('/admin')">
              <div class="nav-icon" style="color: #ef5350;">
                <q-icon name="admin_panel_settings" size="20px" />
              </div>
              <span class="nav-label">Admin Panel</span>
            </div>
          </template>
        </nav>

        <!-- Drawer Footer: User Info -->
        <div class="drawer-footer">
          <div class="drawer-user">
            <div class="drawer-user-avatar">
              <img v-if="authStore.profile.photoURL" :src="authStore.profile.photoURL" class="drawer-user-avatar-img" />
              <span v-else>{{ authStore.user?.email?.charAt(0).toUpperCase() || 'U' }}</span>
            </div>
            <div class="drawer-user-info">
              <div class="drawer-user-name">
                {{ authStore.fullName || 'User' }}
              </div>
              <div class="drawer-user-email">{{ authStore.user?.email }}</div>
            </div>
          </div>
        </div>
      </div>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- Daily Check-in Dialog (Agile Standup Wizard) -->
    <q-dialog v-model="showCheckinDialog">
      <div class="checkin-dialog">
        <!-- Header -->
        <div class="checkin-dialog-header">
          <div class="checkin-dialog-icon-wrap">
            <span v-if="checkinStore.hasCheckedInToday || showCelebration" style="font-size: 1.4rem;">{{ checkinStore.streakTier.emoji || '✅' }}</span>
            <q-icon v-else name="event_available" size="28px" />
          </div>
          <div>
            <div class="checkin-dialog-title">Daily Standup</div>
            <div class="checkin-dialog-date">{{ formatCheckinDate() }}</div>
          </div>
          <div style="flex:1"></div>
          <!-- Level badge -->
          <div v-if="checkinStore.currentLevel" class="checkin-level-badge">
            <span class="checkin-level-icon">{{ checkinStore.currentLevel.icon }}</span>
            <span class="checkin-level-text">Lv.{{ checkinStore.currentLevel.level }}</span>
          </div>
          <button class="checkin-close-btn" @click="showCheckinDialog = false">
            <q-icon name="close" size="18px" />
          </button>
        </div>

        <!-- ====== Celebration State (after submit) ====== -->
        <div v-if="showCelebration" class="checkin-celebration">
          <div class="celebration-particles">
            <span v-for="i in 12" :key="i" class="particle" :style="{ '--i': i }"></span>
          </div>
          <div class="celebration-emoji">🎉</div>
          <div class="celebration-title">เช็คชื่อสำเร็จ!</div>
          <div class="celebration-streak" v-if="checkinStore.currentStreak > 0">
            <span class="streak-fire">{{ checkinStore.streakTier.emoji }}</span>
            <span class="streak-count">{{ checkinStore.currentStreak }} วัน Streak</span>
          </div>
          <div class="celebration-level">
            <span>{{ checkinStore.currentLevel.icon }}</span>
            <span>Level {{ checkinStore.currentLevel.level }} — {{ checkinStore.currentLevel.name }}</span>
          </div>
          <div class="celebration-progress">
            <div class="celebration-progress-bar" :style="{ width: checkinStore.currentLevel.progress + '%' }"></div>
          </div>
          <div class="celebration-progress-label" v-if="checkinStore.currentLevel.nextLevel">
            {{ checkinStore.currentLevel.total }} / {{ checkinStore.currentLevel.nextLevel.min }} check-ins ถึง {{ checkinStore.currentLevel.nextLevel.name }}
          </div>
          <button class="checkin-submit-btn" style="margin-top: 16px;" @click="showCelebration = false">
            <q-icon name="check" size="18px" class="q-mr-sm" />
            <span>เรียบร้อย!</span>
          </button>
        </div>

        <!-- ====== Already checked in (Done State) ====== -->
        <div v-else-if="checkinStore.hasCheckedInToday" class="checkin-done-state">
          <!-- Streak + Level summary -->
          <div class="done-summary-row">
            <div class="done-summary-item">
              <span class="done-summary-emoji">{{ checkinStore.streakTier.emoji || '🔥' }}</span>
              <div>
                <div class="done-summary-value">{{ checkinStore.currentStreak }} วัน</div>
                <div class="done-summary-label">Streak</div>
              </div>
            </div>
            <div class="done-summary-item">
              <span class="done-summary-emoji">{{ checkinStore.currentLevel.icon }}</span>
              <div>
                <div class="done-summary-value">Lv.{{ checkinStore.currentLevel.level }}</div>
                <div class="done-summary-label">{{ checkinStore.currentLevel.name }}</div>
              </div>
            </div>
            <div class="done-summary-item">
              <span class="done-summary-emoji">📅</span>
              <div>
                <div class="done-summary-value">{{ checkinStore.thisMonthCount }}</div>
                <div class="done-summary-label">เดือนนี้</div>
              </div>
            </div>
          </div>

          <!-- ====== View Mode ====== -->
          <template v-if="!isEditingCheckin">
            <!-- Answers cards -->
            <div class="done-answers">
              <div class="done-answer-card">
                <div class="done-answer-header">
                  <span class="done-answer-icon">⏪</span>
                  <span class="done-answer-title">เมื่อวานทำอะไร?</span>
                </div>
                <div class="done-answer-text">{{ checkinStore.todayCheckin?.yesterday || checkinStore.todayCheckin?.note || '-' }}</div>
              </div>
              <div class="done-answer-card">
                <div class="done-answer-header">
                  <span class="done-answer-icon">🎯</span>
                  <span class="done-answer-title">วันนี้จะทำอะไร?</span>
                </div>
                <div class="done-answer-text">{{ checkinStore.todayCheckin?.today || '-' }}</div>
              </div>
              <div class="done-answer-card" v-if="checkinStore.todayCheckin?.blockers">
                <div class="done-answer-header">
                  <span class="done-answer-icon">🚧</span>
                  <span class="done-answer-title">ปัญหา / อุปสรรค</span>
                </div>
                <div class="done-answer-text">{{ checkinStore.todayCheckin.blockers }}</div>
              </div>
            </div>

            <div class="done-time">
              <q-icon name="schedule" size="14px" />
              เช็คชื่อเวลา {{ formatCheckinTime(checkinStore.todayCheckin?.checkedInAt) }}
              <span v-if="checkinStore.todayCheckin?.mood" style="margin-left: 6px;">{{ checkinStore.todayCheckin.mood }}</span>
            </div>

            <div class="done-actions-row">
              <button class="checkin-edit-btn" @click="startEditCheckin">
                <q-icon name="edit" size="16px" />
                <span>แก้ไขข้อความ</span>
              </button>
              <button class="checkin-history-btn" @click="goToCheckinHistory">
                <q-icon name="history" size="16px" />
                <span>ดูประวัติการเช็คชื่อ</span>
              </button>
            </div>
          </template>

          <!-- ====== Edit Mode ====== -->
          <template v-else>
            <div class="done-edit-section">
              <div class="done-edit-field">
                <div class="done-edit-label">
                  <span>⏪</span> เมื่อวานทำอะไร?
                </div>
                <textarea v-model="editYesterday" class="checkin-textarea done-edit-textarea"
                  rows="2" maxlength="500" placeholder="สรุปสิ่งที่ทำเมื่อวาน..."></textarea>
              </div>
              <div class="done-edit-field">
                <div class="done-edit-label">
                  <span>🎯</span> วันนี้จะทำอะไร?
                </div>
                <textarea v-model="editToday" class="checkin-textarea done-edit-textarea"
                  rows="2" maxlength="500" placeholder="วางแผนงานสำหรับวันนี้..."></textarea>
              </div>
              <div class="done-edit-field">
                <div class="done-edit-label">
                  <span>🚧</span> ปัญหา / อุปสรรค
                </div>
                <textarea v-model="editBlockers" class="checkin-textarea done-edit-textarea"
                  rows="2" maxlength="500" placeholder="ถ้าไม่มีก็เว้นว่างได้"></textarea>
              </div>
            </div>

            <div class="done-edit-actions">
              <button class="done-edit-cancel-btn" @click="isEditingCheckin = false">
                <q-icon name="close" size="16px" />
                <span>ยกเลิก</span>
              </button>
              <button class="done-edit-save-btn" :disabled="checkinStore.loading" @click="handleSaveEditCheckin">
                <q-spinner v-if="checkinStore.loading" size="16px" color="white" />
                <q-icon v-else name="check" size="16px" />
                <span>{{ checkinStore.loading ? 'กำลังบันทึก...' : 'บันทึก' }}</span>
              </button>
            </div>
          </template>
        </div>

        <!-- ====== Wizard Steps (not yet checked in) ====== -->
        <div v-else class="checkin-wizard">
          <!-- Progress bar -->
          <div class="wizard-progress">
            <div class="wizard-progress-bar" :style="{ width: ((checkinStep) / 4 * 100) + '%' }"></div>
          </div>
          <div class="wizard-step-indicators">
            <div v-for="s in 4" :key="s" class="wizard-step-dot"
              :class="{ 'dot-active': s <= checkinStep, 'dot-current': s === checkinStep }">
              {{ s }}
            </div>
          </div>

          <!-- Streak preview -->
          <div v-if="checkinStore.currentStreak > 0" class="checkin-streak-preview">
            <span>{{ checkinStore.streakTier.emoji }}</span>
            <span>{{ checkinStore.currentStreak }} วัน streak — เช็คชื่อเพื่อต่อ!</span>
          </div>

          <!-- Step 1: Yesterday -->
          <div v-if="checkinStep === 1" class="wizard-step" key="step1">
            <div class="wizard-question-icon">⏪</div>
            <div class="wizard-question">เมื่อวานคุณทำอะไรบ้าง?</div>
            <div class="wizard-hint">สรุปสั้นๆ สิ่งที่ทำเมื่อวาน</div>
            <textarea v-model="checkinYesterday" class="checkin-textarea wizard-textarea"
              placeholder="เช่น แก้บัค login, ประชุม sprint review..."
              rows="3" maxlength="500" ref="textareaStep1"></textarea>
            <div class="checkin-char-count">{{ checkinYesterday.length }}/500</div>
          </div>

          <!-- Step 2: Today -->
          <div v-if="checkinStep === 2" class="wizard-step" key="step2">
            <div class="wizard-question-icon">🎯</div>
            <div class="wizard-question">วันนี้จะทำอะไร?</div>
            <div class="wizard-hint">วางแผนงานสำหรับวันนี้</div>
            <textarea v-model="checkinToday" class="checkin-textarea wizard-textarea"
              placeholder="เช่น ทำ feature ใหม่, review PR..."
              rows="3" maxlength="500" ref="textareaStep2"></textarea>
            <div class="checkin-char-count">{{ checkinToday.length }}/500</div>
          </div>

          <!-- Step 3: Blockers -->
          <div v-if="checkinStep === 3" class="wizard-step" key="step3">
            <div class="wizard-question-icon">🚧</div>
            <div class="wizard-question">มีปัญหาหรืออุปสรรคไหม?</div>
            <div class="wizard-hint">ถ้าไม่มีก็กดข้ามได้เลย!</div>
            <textarea v-model="checkinBlockers" class="checkin-textarea wizard-textarea"
              placeholder="เช่น รอ API จากทีมอื่น, ไม่เข้าใจ requirement..."
              rows="3" maxlength="500" ref="textareaStep3"></textarea>
            <div class="checkin-char-count">{{ checkinBlockers.length }}/500</div>
            <button class="wizard-skip-btn" @click="checkinBlockers = ''; checkinStep = 4">
              <q-icon name="thumb_up" size="14px" />
              <span>ไม่มีปัญหา!</span>
            </button>
          </div>

          <!-- Step 4: Mood -->
          <div v-if="checkinStep === 4" class="wizard-step" key="step4">
            <div class="wizard-question-icon">😊</div>
            <div class="wizard-question">วันนี้รู้สึกอย่างไร?</div>
            <div class="wizard-hint">เลือก mood ของคุณ (ไม่บังคับ)</div>
            <div class="mood-grid">
              <button v-for="mood in moodOptions" :key="mood.emoji"
                class="mood-btn" :class="{ 'mood-selected': checkinMood === mood.emoji }"
                @click="checkinMood = checkinMood === mood.emoji ? '' : mood.emoji">
                <span class="mood-emoji">{{ mood.emoji }}</span>
                <span class="mood-label">{{ mood.label }}</span>
              </button>
            </div>
          </div>

          <!-- Wizard Navigation -->
          <div class="wizard-nav">
            <button v-if="checkinStep > 1" class="wizard-back-btn" @click="checkinStep--">
              <q-icon name="arrow_back" size="16px" />
              <span>ย้อนกลับ</span>
            </button>
            <div v-else style="flex:1"></div>

            <button v-if="checkinStep < 4" class="wizard-next-btn"
              :disabled="checkinStep === 1 && !checkinYesterday.trim() || checkinStep === 2 && !checkinToday.trim()"
              @click="checkinStep++">
              <span>ถัดไป</span>
              <q-icon name="arrow_forward" size="16px" />
            </button>

            <button v-else class="checkin-submit-btn wizard-submit" :disabled="checkinStore.loading" @click="handleCheckIn">
              <q-spinner v-if="checkinStore.loading" size="18px" color="white" class="q-mr-sm" />
              <q-icon v-else name="check_circle" size="20px" class="q-mr-sm" />
              <span>{{ checkinStore.loading ? 'กำลังเช็คชื่อ...' : 'เช็คชื่อเลย!' }}</span>
            </button>
          </div>
        </div>
      </div>
    </q-dialog>

    <!-- Create Project Dialog -->
    <q-dialog v-model="showCreateProjectDialog">
      <q-card class="create-project-card">
        <q-card-section class="row items-center q-pb-sm">
          <q-icon name="create_new_folder" size="24px" style="color: #5c9ce6;" class="q-mr-sm" />
          <div class="dialog-title">สร้างโปรเจคใหม่</div>
          <q-space />
          <q-btn icon="close" flat round dense style="color: #6b6c6f;"
            @click="showCreateProjectDialog = false" />
        </q-card-section>

        <q-separator style="background: rgba(44, 58, 69, 0.4);" />

        <q-card-section class="q-pt-lg">
          <div class="q-gutter-md">
            <div>
              <label class="field-label">ชื่อโปรเจค</label>
              <q-input v-model="newProject.name" outlined dense dark
                placeholder="กรอกชื่อโปรเจค" class="dialog-input" />
            </div>

            <div>
              <label class="field-label">คำอธิบาย</label>
              <q-input v-model="newProject.description" outlined dense dark
                type="textarea" rows="3" placeholder="เพิ่มคำอธิบายโปรเจค (ไม่บังคับ)"
                class="dialog-input" />
            </div>

            <div class="row justify-end q-gutter-sm q-mt-md">
              <q-btn flat label="ยกเลิก" class="cancel-btn"
                @click="showCreateProjectDialog = false" />
              <q-btn label="สร้างโปรเจค" icon="add" class="create-btn"
                :disable="!newProject.name?.trim()"
                :loading="projectsStore.loading"
                @click="handleCreateProject" />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Profile Dialog -->
    <q-dialog v-model="showProfileDialog" @before-show="loadProfileForm">
      <q-card class="profile-dialog-card">
        <q-card-section class="row items-center q-pb-sm">
          <q-icon name="person" size="24px" style="color: #5c9ce6;" class="q-mr-sm" />
          <div class="dialog-title">จัดการโปรไฟล์</div>
          <q-space />
          <q-btn icon="close" flat round dense style="color: #6b6c6f;"
            @click="showProfileDialog = false" />
        </q-card-section>

        <q-separator style="background: rgba(44, 58, 69, 0.4);" />

        <q-card-section class="q-pt-lg">
          <div class="q-gutter-md">
            <div class="profile-dialog-avatar-section">
              <div class="profile-avatar-upload-wrapper" @click="$refs.avatarInput.click()">
                <q-avatar  class="profile-avatar-lg" style="font-size: 40px;width:80px;height:80px">
                  <img v-if="authStore.profile.photoURL" :src="authStore.profile.photoURL" />
                  <span v-else>{{ authStore.user?.email?.charAt(0).toUpperCase() || 'U' }}</span>
                </q-avatar>
                <div class="profile-avatar-overlay">
                  <q-icon name="photo_camera" size="80px" />
                </div>
                <q-spinner v-if="avatarUploading" size="24px" color="white" class="profile-avatar-spinner" />
              </div>
              <input type="file" ref="avatarInput" accept="image/*" style="display: none;"
                @change="handleAvatarUpload" />
              <div class="profile-dialog-email">{{ authStore.user?.email }}</div>
            </div>

            <div>
              <label class="field-label">ชื่อ</label>
              <q-input v-model="profileForm.firstName" outlined dense dark
                placeholder="กรอกชื่อ" class="dialog-input" />
            </div>

            <div>
              <label class="field-label">นามสกุล</label>
              <q-input v-model="profileForm.lastName" outlined dense dark
                placeholder="กรอกนามสกุล" class="dialog-input" />
            </div>

            <!-- Role & Department (read-only info) -->
            <div v-if="authStore.profile.role || authStore.profile.department" class="profile-role-info">
              <div class="profile-role-tag"
                :style="{ color: authStore.roleLabels[authStore.profile.role]?.color || '#66bb6a' }">
                <q-icon :name="authStore.roleLabels[authStore.profile.role]?.icon || 'person'" size="14px" />
                <span>{{ authStore.roleLabels[authStore.profile.role]?.label || 'พนักงาน' }}</span>
              </div>
              <div v-if="authStore.profile.department" class="profile-dept-tag">
                <q-icon name="business" size="14px" />
                <span>{{ authStore.profile.department }}</span>
              </div>
            </div>

            <div v-if="profileSaveSuccess" class="profile-save-success">
              <q-icon name="check_circle" size="16px" />
              <span>บันทึกข้อมูลเรียบร้อยแล้ว</span>
            </div>

            <div class="row justify-end q-gutter-sm q-mt-md">
              <q-btn flat label="ยกเลิก" class="cancel-btn"
                @click="showProfileDialog = false" />
              <q-btn label="บันทึก" icon="save" class="create-btn"
                :disable="!profileForm.firstName?.trim() && !profileForm.lastName?.trim()"
                :loading="authStore.loading"
                @click="handleSaveProfile" />
            </div>

            <q-separator style="background: rgba(44, 58, 69, 0.4); margin-top: 16px;" />

            <!-- Change Password Toggle -->
            <button class="profile-password-toggle" @click="showPasswordForm = !showPasswordForm">
              <q-icon name="lock" size="16px" style="color: #ffb74d;" />
              <span>เปลี่ยนรหัสผ่าน</span>
              <q-icon :name="showPasswordForm ? 'expand_less' : 'expand_more'" size="18px" style="color: #6b6c6f;" />
            </button>

            <!-- Change Password Form (collapsible) -->
            <div v-if="showPasswordForm" class="profile-password-section">
              <div>
                <label class="field-label">รหัสผ่านปัจจุบัน</label>
                <q-input v-model="passwordForm.current" outlined dense dark
                  type="password" placeholder="กรอกรหัสผ่านปัจจุบัน" class="dialog-input" />
              </div>

              <div>
                <label class="field-label">รหัสผ่านใหม่</label>
                <q-input v-model="passwordForm.newPass" outlined dense dark
                  type="password" placeholder="กรอกรหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)" class="dialog-input" />
              </div>

              <div>
                <label class="field-label">ยืนยันรหัสผ่านใหม่</label>
                <q-input v-model="passwordForm.confirm" outlined dense dark
                  type="password" placeholder="กรอกรหัสผ่านใหม่อีกครั้ง" class="dialog-input" />
              </div>

              <div v-if="passwordError" class="profile-password-error">
                <q-icon name="error_outline" size="14px" />
                <span>{{ passwordError }}</span>
              </div>

              <div v-if="passwordSuccess" class="profile-save-success">
                <q-icon name="check_circle" size="16px" />
                <span>เปลี่ยนรหัสผ่านเรียบร้อยแล้ว</span>
              </div>

              <div class="row justify-end q-mt-sm">
                <q-btn label="เปลี่ยนรหัสผ่าน" icon="lock_reset" class="password-change-btn"
                  :disable="!isPasswordFormValid"
                  :loading="passwordLoading"
                  @click="handleChangePassword" />
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
    <!-- Help Dialog -->
    <q-dialog v-model="showHelpDialog" position="right" full-height>
      <div class="help-panel">
        <!-- Header -->
        <div class="help-panel-header">
          <div class="help-panel-header-left">
            <div class="help-panel-icon" :style="{ background: (currentHelpContent?.color || '#5c9ce6') + '15', color: currentHelpContent?.color || '#5c9ce6' }">
              <q-icon :name="currentHelpContent?.icon || 'help'" size="22px" />
            </div>
            <div>
              <div class="help-panel-title">{{ currentHelpContent?.title || 'Help' }}</div>
              <div class="help-panel-subtitle">คู่มือการใช้งาน</div>
            </div>
          </div>
          <button class="help-panel-close" @click="showHelpDialog = false">
            <q-icon name="close" size="18px" />
          </button>
        </div>

        <!-- Intro -->
        <div class="help-panel-body">
          <div v-if="currentHelpContent?.intro" class="help-intro">
            <q-icon name="lightbulb" size="16px" style="color: #ffb74d; flex-shrink: 0;" />
            <span>{{ currentHelpContent.intro }}</span>
          </div>

          <!-- Sections -->
          <div v-for="(section, sIdx) in (currentHelpContent?.sections || [])" :key="sIdx" class="help-section">
            <div class="help-section-header" @click="toggleHelpSection(sIdx)">
              <div class="help-section-header-left">
                <div class="help-section-icon" :style="{ color: currentHelpContent?.color || '#5c9ce6' }">
                  <q-icon :name="section.icon || 'info'" size="16px" />
                </div>
                <span class="help-section-title">{{ section.title }}</span>
              </div>
              <q-icon :name="openHelpSections.includes(sIdx) ? 'expand_less' : 'expand_more'" size="18px" class="help-section-chevron" />
            </div>

            <div v-if="openHelpSections.includes(sIdx)" class="help-section-body">
              <p v-if="section.description" class="help-section-desc">{{ section.description }}</p>

              <!-- Steps list -->
              <div v-if="section.steps" class="help-steps">
                <div v-for="(step, idx) in section.steps" :key="idx" class="help-step">
                  <div class="help-step-num">{{ idx + 1 }}</div>
                  <span>{{ step }}</span>
                </div>
              </div>

              <!-- Items list (label + desc) -->
              <div v-if="section.items" class="help-items">
                <div v-for="(item, idx) in section.items" :key="idx" class="help-item">
                  <div class="help-item-label">{{ item.label }}</div>
                  <div class="help-item-desc">{{ item.desc }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Tips -->
          <div v-if="currentHelpContent?.tips?.length" class="help-tips">
            <div class="help-tips-header">
              <q-icon name="tips_and_updates" size="16px" style="color: #42a5f5;" />
              <span>เคล็ดลับ</span>
            </div>
            <div v-for="(tip, idx) in currentHelpContent.tips" :key="idx" class="help-tip">
              <q-icon name="arrow_right" size="14px" style="color: #42a5f5; flex-shrink: 0;" />
              <span>{{ tip }}</span>
            </div>
          </div>
        </div>
      </div>
    </q-dialog>
  </q-layout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { onAuthStateChanged, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth'
import { auth } from 'boot/firebase'
import { useAuthStore } from 'stores/auth'
import { useProjectsStore } from 'stores/projects'
import { useNotificationsStore } from 'stores/notifications'
import { useCheckinStore } from 'stores/checkin'
import { useWorklogStore } from 'stores/worklog'
import { getHelpForRoute } from 'src/data/helpContent'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const projectsStore = useProjectsStore()
const notificationsStore = useNotificationsStore()
const checkinStore = useCheckinStore()
const worklogStore = useWorklogStore()

const leftDrawerOpen = ref(false)
const showCreateProjectDialog = ref(false)
const showNotifPanel = ref(false)
const showHelpDialog = ref(false)
const openHelpSections = ref([0])
const showCheckinDialog = ref(false)
const checkinStep = ref(1)
const checkinYesterday = ref('')
const checkinToday = ref('')
const checkinBlockers = ref('')
const checkinMood = ref('')
const showCelebration = ref(false)
const isEditingCheckin = ref(false)
const editYesterday = ref('')
const editToday = ref('')
const editBlockers = ref('')
const showProfileDialog = ref(false)
const profileForm = ref({ firstName: '', lastName: '' })
const profileSaveSuccess = ref(false)
const passwordForm = ref({ current: '', newPass: '', confirm: '' })
const passwordError = ref('')
const passwordSuccess = ref(false)
const passwordLoading = ref(false)
const showPasswordForm = ref(false)
const avatarUploading = ref(false)

const moodOptions = [
  { emoji: '🔥', label: 'มุ่งมั่น' },
  { emoji: '😊', label: 'สดใส' },
  { emoji: '💪', label: 'พร้อมลุย' },
  { emoji: '🧘', label: 'สงบ' },
  { emoji: '😴', label: 'ง่วง' },
  { emoji: '🤒', label: 'ไม่สบาย' }
]
const newProject = ref({
  name: '',
  description: ''
})

onMounted(async () => {
  // Initialize auth state
  authStore.initAuth()

  // Wait for auth state to be determined
  await new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe()
      resolve()
    })
  })

  // Fetch projects when user is authenticated
  if (authStore.isAuthenticated) {
    await projectsStore.fetchProjects()
    projectsStore.subscribeToProjects()
    notificationsStore.subscribeToNotifications()
    // Fetch profile data
    await authStore.fetchProfile()
    // Fetch all profiles for avatar lookup
    authStore.fetchAllProfiles()
    // Fetch today's check-in & worklog status
    await checkinStore.fetchTodayCheckin()
    await checkinStore.fetchCheckinHistory()
    worklogStore.fetchTodayLog()

    // Auto-show dialog if not checked in today
    if (!checkinStore.hasCheckedInToday) {
      showCheckinDialog.value = true
    }
  }
})

onUnmounted(() => {
  notificationsStore.cleanup()
})

const currentRoute = computed(() => route.path)
const currentHelpContent = computed(() => getHelpForRoute(route.path))

const toggleHelpSection = (idx) => {
  const i = openHelpSections.value.indexOf(idx)
  if (i > -1) {
    openHelpSections.value.splice(i, 1)
  } else {
    openHelpSections.value.push(idx)
  }
}

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

const navigateTo = (path) => {
  router.push(path)
}

const selectProject = (project) => {
  projectsStore.setCurrentProject(project)
  router.push(`/project/${project.id}`)
}

const handleCreateProject = async () => {
  try {
    await projectsStore.createProject(newProject.value)
    newProject.value = { name: '', description: '' }
    showCreateProjectDialog.value = false
  } catch (error) {
    console.error('Error creating project:', error)
  }
}

const isPasswordFormValid = computed(() => {
  return passwordForm.value.current.length > 0 &&
    passwordForm.value.newPass.length >= 6 &&
    passwordForm.value.newPass === passwordForm.value.confirm
})

const handleAvatarUpload = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return
  // Validate file size (max 2MB)
  if (file.size > 2 * 1024 * 1024) {
    alert('ขนาดไฟล์ต้องไม่เกิน 2MB')
    return
  }
  avatarUploading.value = true
  await authStore.uploadAvatar(file)
  avatarUploading.value = false
  // Reset input
  event.target.value = ''
}

const loadProfileForm = () => {
  profileForm.value = {
    firstName: authStore.profile.firstName || '',
    lastName: authStore.profile.lastName || ''
  }
  profileSaveSuccess.value = false
  passwordForm.value = { current: '', newPass: '', confirm: '' }
  passwordError.value = ''
  passwordSuccess.value = false
  showPasswordForm.value = false
}

const handleChangePassword = async () => {
  passwordError.value = ''
  passwordSuccess.value = false

  if (passwordForm.value.newPass !== passwordForm.value.confirm) {
    passwordError.value = 'รหัสผ่านใหม่ไม่ตรงกัน'
    return
  }

  if (passwordForm.value.newPass.length < 6) {
    passwordError.value = 'รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร'
    return
  }

  try {
    passwordLoading.value = true
    const user = auth.currentUser
    const credential = EmailAuthProvider.credential(user.email, passwordForm.value.current)
    await reauthenticateWithCredential(user, credential)
    await updatePassword(user, passwordForm.value.newPass)
    passwordSuccess.value = true
    passwordForm.value = { current: '', newPass: '', confirm: '' }
    setTimeout(() => { passwordSuccess.value = false }, 3000)
  } catch (err) {
    console.error('Error changing password:', err)
    if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
      passwordError.value = 'รหัสผ่านปัจจุบันไม่ถูกต้อง'
    } else if (err.code === 'auth/too-many-requests') {
      passwordError.value = 'ลองผิดหลายครั้ง กรุณารอสักครู่แล้วลองใหม่'
    } else {
      passwordError.value = 'เกิดข้อผิดพลาด กรุณาลองใหม่'
    }
  } finally {
    passwordLoading.value = false
  }
}

const handleSaveProfile = async () => {
  const success = await authStore.saveProfile({
    firstName: profileForm.value.firstName,
    lastName: profileForm.value.lastName
  })
  if (success) {
    profileSaveSuccess.value = true
    setTimeout(() => {
      profileSaveSuccess.value = false
    }, 3000)
  }
}

const handleLogout = async () => {
  try {
    notificationsStore.cleanup()
    await authStore.logout()
    router.push('/login')
  } catch (error) {
    console.error('Error logging out:', error)
  }
}

// Check-in helpers
const handleCheckinBtnClick = () => {
  isEditingCheckin.value = false
  showCheckinDialog.value = true
}

const handleCheckIn = async () => {
  const success = await checkinStore.checkIn({
    yesterday: checkinYesterday.value.trim(),
    today: checkinToday.value.trim(),
    blockers: checkinBlockers.value.trim(),
    mood: checkinMood.value
  })
  if (success) {
    showCelebration.value = true
    // Reset form for next time
    checkinStep.value = 1
    checkinYesterday.value = ''
    checkinToday.value = ''
    checkinBlockers.value = ''
    checkinMood.value = ''
  }
}

const startEditCheckin = () => {
  editYesterday.value = checkinStore.todayCheckin?.yesterday || checkinStore.todayCheckin?.note || ''
  editToday.value = checkinStore.todayCheckin?.today || ''
  editBlockers.value = checkinStore.todayCheckin?.blockers || ''
  isEditingCheckin.value = true
}

const handleSaveEditCheckin = async () => {
  const success = await checkinStore.updateTodayCheckin({
    yesterday: editYesterday.value.trim(),
    today: editToday.value.trim(),
    blockers: editBlockers.value.trim()
  })
  if (success) {
    isEditingCheckin.value = false
  }
}

const goToCheckinHistory = () => {
  showCheckinDialog.value = false
  router.push('/checkins')
}

const formatCheckinDate = () => {
  return new Date().toLocaleDateString('th-TH', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatCheckinTime = (timestamp) => {
  if (!timestamp) return ''
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
}

// Notification helpers
const formatNotifTime = (timestamp) => {
  if (!timestamp) return ''
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  const now = new Date()
  const diff = now - date
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (mins < 1) return 'เมื่อสักครู่'
  if (mins < 60) return `${mins} นาทีที่แล้ว`
  if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`
  if (days < 7) return `${days} วันที่แล้ว`
  return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })
}

const handleNotifClick = async (notif) => {
  showNotifPanel.value = false

  // Mark as read
  if (!notif.read) {
    notificationsStore.markAsRead(notif.id)
  }

  // Set pending task to open
  if (notif.taskId) {
    notificationsStore.pendingOpenTaskId = notif.taskId
  }

  // Navigate to the project
  if (notif.projectId) {
    const isSameProject = notif.projectId === projectsStore.currentProject?.id
      && router.currentRoute.value.path === `/project/${notif.projectId}`

    if (!isSameProject) {
      const project = projectsStore.projects.find(p => p.id === notif.projectId)
      if (project) {
        projectsStore.setCurrentProject(project)
      }
      router.push(`/project/${notif.projectId}`)
    } else {
      // Already on same project — open task directly from here
      // ProjectPage watches pendingOpenTaskId so it will pick it up
    }
  }
}
</script>

<style scoped>
/* Override Quasar heading sizes */
.text-h6 {
  font-size: 0.875rem !important;
}

.bg-primary {
  background: #18191a;
}

.bg-surface {
  background: rgba(0, 0, 0, 0.1);
}

/* ====== Daily Check-in Button ====== */
.checkin-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 20px;
  border: 1px solid rgba(58, 59, 62, 0.5);
  background: rgba(30, 33, 36, 0.6);
  color: #9e9e9e;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s ease;
  white-space: nowrap;
}

.checkin-btn:hover {
  border-color: rgba(76, 175, 80, 0.4);
  background: rgba(76, 175, 80, 0.08);
  color: #81c784;
}

.checkin-btn.checkin-done {
  border-color: rgba(76, 175, 80, 0.3);
  background: rgba(76, 175, 80, 0.1);
  color: #66bb6a;
}

.checkin-icon-wrap {
  display: flex;
  align-items: center;
}

.checkin-btn:not(.checkin-done) .checkin-icon-wrap {
  animation: checkin-pulse 2s ease-in-out infinite;
}

@keyframes checkin-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.checkin-label {
  line-height: 1;
}

.checkin-streak {
  font-size: 0.7rem;
  background: rgba(255, 152, 0, 0.15);
  color: #ffb74d;
  padding: 1px 6px;
  border-radius: 10px;
  line-height: 1.4;
}

/* ====== Check-in Dialog ====== */
.checkin-dialog {
  width: 460px;
  max-width: 95vw;
  background: #1a1b1e;
  border: 1px solid rgba(58, 59, 62, 0.5);
  border-radius: 16px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.6);
  overflow: hidden;
}

.checkin-dialog-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 20px;
  border-bottom: 1px solid rgba(58, 59, 62, 0.3);
}

.checkin-dialog-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(76, 175, 80, 0.12);
  color: #66bb6a;
  display: flex;
  align-items: center;
  justify-content: center;
}

.checkin-dialog-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #e0e1e4;
}

.checkin-dialog-date {
  font-size: 0.72rem;
  color: #6b6c6f;
  margin-top: 2px;
}

.checkin-level-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 12px;
  background: rgba(255, 183, 77, 0.1);
  border: 1px solid rgba(255, 183, 77, 0.15);
  margin-right: 4px;
}

.checkin-level-icon {
  font-size: 0.9rem;
}

.checkin-level-text {
  font-size: 0.68rem;
  font-weight: 700;
  color: #ffb74d;
}

.checkin-close-btn {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #6b6c6f;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.checkin-close-btn:hover {
  background: rgba(239, 83, 80, 0.1);
  color: #ef5350;
}

/* ====== Celebration State ====== */
.checkin-celebration {
  padding: 28px 24px;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.celebration-particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.particle {
  position: absolute;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  top: 50%;
  left: 50%;
  animation: particle-burst 1.2s ease-out forwards;
  animation-delay: calc(var(--i) * 0.05s);
}

.particle:nth-child(1) { background: #ff6b6b; }
.particle:nth-child(2) { background: #feca57; }
.particle:nth-child(3) { background: #48dbfb; }
.particle:nth-child(4) { background: #ff9ff3; }
.particle:nth-child(5) { background: #54a0ff; }
.particle:nth-child(6) { background: #5f27cd; }
.particle:nth-child(7) { background: #01a3a4; }
.particle:nth-child(8) { background: #f368e0; }
.particle:nth-child(9) { background: #ff6348; }
.particle:nth-child(10) { background: #2ed573; }
.particle:nth-child(11) { background: #ffa502; }
.particle:nth-child(12) { background: #70a1ff; }

@keyframes particle-burst {
  0% { transform: translate(0, 0) scale(1); opacity: 1; }
  100% {
    transform: translate(
      calc(cos(calc(var(--i) * 30deg)) * 120px),
      calc(sin(calc(var(--i) * 30deg)) * 120px)
    ) scale(0);
    opacity: 0;
  }
}

.celebration-emoji {
  font-size: 3rem;
  margin-bottom: 8px;
  animation: celebration-bounce 0.6s ease;
}

@keyframes celebration-bounce {
  0% { transform: scale(0); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
}

.celebration-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #66bb6a;
  margin-bottom: 12px;
}

.celebration-streak {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 20px;
  background: rgba(255, 152, 0, 0.1);
  border: 1px solid rgba(255, 152, 0, 0.2);
  margin-bottom: 10px;
}

.streak-fire { font-size: 1.1rem; }
.streak-count {
  font-size: 0.82rem;
  font-weight: 700;
  color: #ffb74d;
}

.celebration-level {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  color: #9e9e9e;
  margin-bottom: 8px;
}

.celebration-progress {
  width: 60%;
  margin: 0 auto 6px;
  height: 4px;
  border-radius: 2px;
  background: rgba(58, 59, 62, 0.4);
  overflow: hidden;
}

.celebration-progress-bar {
  height: 100%;
  border-radius: 2px;
  background: linear-gradient(90deg, #ffb74d, #ffa726);
  transition: width 0.6s ease;
}

.celebration-progress-label {
  font-size: 0.62rem;
  color: #6b6c6f;
  margin-bottom: 4px;
}

/* ====== Done State ====== */
.checkin-done-state {
  padding: 20px;
}

.done-summary-row {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.done-summary-item {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  background: rgba(36, 37, 40, 0.5);
  border: 1px solid rgba(58, 59, 62, 0.25);
  border-radius: 10px;
}

.done-summary-emoji {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.done-summary-value {
  font-size: 0.82rem;
  font-weight: 700;
  color: #e0e1e4;
  line-height: 1.2;
}

.done-summary-label {
  font-size: 0.6rem;
  color: #6b6c6f;
  font-weight: 500;
}

.done-answers {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.done-answer-card {
  padding: 12px 14px;
  border-radius: 10px;
  background: rgba(36, 37, 40, 0.4);
  border: 1px solid rgba(58, 59, 62, 0.2);
}

.done-answer-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}

.done-answer-icon {
  font-size: 0.9rem;
}

.done-answer-title {
  font-size: 0.7rem;
  font-weight: 700;
  color: #6b6c6f;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.done-answer-text {
  font-size: 0.82rem;
  color: #cecfd2;
  line-height: 1.5;
  white-space: pre-wrap;
}

.done-time {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 0.7rem;
  color: #6b6c6f;
  margin-bottom: 10px;
}

/* ====== Wizard ====== */
.checkin-wizard {
  padding: 16px 20px 20px;
}

.wizard-progress {
  height: 3px;
  border-radius: 2px;
  background: rgba(58, 59, 62, 0.3);
  margin-bottom: 12px;
  overflow: hidden;
}

.wizard-progress-bar {
  height: 100%;
  border-radius: 2px;
  background: linear-gradient(90deg, #43a047, #66bb6a);
  transition: width 0.35s ease;
}

.wizard-step-indicators {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 16px;
}

.wizard-step-dot {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6rem;
  font-weight: 700;
  color: #4b5563;
  background: rgba(36, 37, 40, 0.6);
  border: 1px solid rgba(58, 59, 62, 0.3);
  transition: all 0.25s ease;
}

.wizard-step-dot.dot-active {
  background: rgba(76, 175, 80, 0.15);
  border-color: rgba(76, 175, 80, 0.3);
  color: #66bb6a;
}

.wizard-step-dot.dot-current {
  background: rgba(76, 175, 80, 0.2);
  border-color: #66bb6a;
  color: #66bb6a;
  box-shadow: 0 0 8px rgba(76, 175, 80, 0.2);
}

.checkin-streak-preview {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 8px;
  background: rgba(255, 152, 0, 0.08);
  border: 1px solid rgba(255, 152, 0, 0.15);
  font-size: 0.72rem;
  color: #ffb74d;
  margin-bottom: 16px;
}

.wizard-step {
  animation: wizard-slide-in 0.25s ease;
}

@keyframes wizard-slide-in {
  from { opacity: 0; transform: translateX(16px); }
  to { opacity: 1; transform: translateX(0); }
}

.wizard-question-icon {
  font-size: 1.8rem;
  text-align: center;
  margin-bottom: 6px;
}

.wizard-question {
  font-size: 1rem;
  font-weight: 700;
  color: #e0e1e4;
  text-align: center;
  margin-bottom: 4px;
}

.wizard-hint {
  font-size: 0.72rem;
  color: #6b6c6f;
  text-align: center;
  margin-bottom: 14px;
}

.wizard-textarea {
  min-height: 80px;
}

.checkin-textarea {
  width: 100%;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid rgba(58, 59, 62, 0.4);
  background: rgba(30, 33, 36, 0.6);
  color: #cecfd2;
  font-size: 0.82rem;
  font-family: inherit;
  resize: none;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.checkin-textarea:focus {
  border-color: rgba(92, 156, 230, 0.5);
}

.checkin-textarea::placeholder {
  color: #4b5563;
}

.checkin-char-count {
  text-align: right;
  font-size: 0.62rem;
  color: #4b5563;
  margin-top: 4px;
}

.wizard-skip-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 8px;
  margin-top: 8px;
  border-radius: 8px;
  border: 1px dashed rgba(76, 175, 80, 0.3);
  background: rgba(76, 175, 80, 0.05);
  color: #66bb6a;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.wizard-skip-btn:hover {
  background: rgba(76, 175, 80, 0.1);
  border-color: rgba(76, 175, 80, 0.5);
}

/* Mood Grid */
.mood-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.mood-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 6px;
  border-radius: 10px;
  border: 1px solid rgba(58, 59, 62, 0.3);
  background: rgba(36, 37, 40, 0.4);
  cursor: pointer;
  transition: all 0.2s ease;
}

.mood-btn:hover {
  border-color: rgba(92, 156, 230, 0.3);
  background: rgba(92, 156, 230, 0.05);
}

.mood-btn.mood-selected {
  border-color: rgba(92, 156, 230, 0.5);
  background: rgba(92, 156, 230, 0.1);
  box-shadow: 0 0 12px rgba(92, 156, 230, 0.1);
}

.mood-emoji {
  font-size: 1.4rem;
}

.mood-label {
  font-size: 0.62rem;
  color: #9e9e9e;
  font-weight: 500;
}

.mood-selected .mood-label {
  color: #5c9ce6;
}

/* Wizard Navigation */
.wizard-nav {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 18px;
}

.wizard-back-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 10px 16px;
  border-radius: 10px;
  border: 1px solid rgba(58, 59, 62, 0.4);
  background: transparent;
  color: #9e9e9e;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.wizard-back-btn:hover {
  background: rgba(58, 59, 62, 0.2);
  color: #e0e1e4;
}

.wizard-next-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px;
  border-radius: 10px;
  border: none;
  background: rgba(92, 156, 230, 0.15);
  color: #5c9ce6;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s ease;
  border: 1px solid rgba(92, 156, 230, 0.2);
}

.wizard-next-btn:hover:not(:disabled) {
  background: rgba(92, 156, 230, 0.25);
}

.wizard-next-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.wizard-submit {
  flex: 1;
}

.checkin-submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 12px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, #43a047, #66bb6a);
  color: #fff;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 4px 16px rgba(76, 175, 80, 0.25);
}

.checkin-submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 24px rgba(76, 175, 80, 0.35);
}

.checkin-submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Done actions row */
.done-actions-row {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.done-actions-row .checkin-history-btn {
  margin-top: 0;
}

.checkin-edit-btn,
.checkin-history-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  border: 1px dashed rgba(58, 59, 62, 0.4);
  background: transparent;
  color: #6b6c6f;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.checkin-edit-btn:hover {
  border-color: rgba(255, 183, 77, 0.3);
  color: #ffb74d;
  background: rgba(255, 183, 77, 0.05);
}

.checkin-history-btn:hover {
  border-color: rgba(92, 156, 230, 0.3);
  color: #5c9ce6;
  background: rgba(92, 156, 230, 0.05);
}

/* ====== Edit Mode ====== */
.done-edit-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 4px;
}

.done-edit-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.done-edit-label {
  font-size: 0.72rem;
  font-weight: 600;
  color: #9e9e9e;
  display: flex;
  align-items: center;
  gap: 5px;
}

.done-edit-textarea {
  min-height: 48px !important;
  font-size: 0.78rem !important;
}

.done-edit-actions {
  display: flex;
  gap: 8px;
  margin-top: 6px;
}

.done-edit-cancel-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  flex: 1;
  padding: 9px;
  border-radius: 8px;
  border: 1px solid rgba(58, 59, 62, 0.4);
  background: transparent;
  color: #9e9e9e;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.done-edit-cancel-btn:hover {
  border-color: rgba(239, 83, 80, 0.3);
  color: #ef5350;
  background: rgba(239, 83, 80, 0.05);
}

.done-edit-save-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  flex: 1;
  padding: 9px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.8), rgba(56, 142, 60, 0.8));
  color: #fff;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.done-edit-save-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.95), rgba(56, 142, 60, 0.95));
  box-shadow: 0 2px 10px rgba(76, 175, 80, 0.2);
}

.done-edit-save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ====== Notification Bell ====== */
.notif-bell {
  color: #8a8b8e;
  position: relative;
  transition: color 0.2s ease;
}

.notif-bell:hover {
  color: #e0e1e4;
}

.notif-badge {
  font-size: 0.6rem !important;
  min-height: 16px !important;
  min-width: 16px !important;
  padding: 0 4px !important;
  line-height: 16px !important;
  border: 2px solid #18191a;
}

/* Notification bell & badge stay in scoped (they're not teleported) */

.text-primary {
  color: #cecfd2;
}

/* ====== Drawer / Navigation Menu ====== */
.drawer-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.drawer-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 16px 14px;
  border-bottom: 1px solid rgba(58, 59, 62, 0.2);
}

.drawer-logo {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(92, 156, 230, 0.12);
  color: #5c9ce6;
  display: flex;
  align-items: center;
  justify-content: center;
}

.drawer-brand {
  font-size: 0.85rem;
  font-weight: 700;
  color: #e0e1e4;
}

.drawer-brand-sub {
  font-size: 0.62rem;
  color: #6b6c6f;
  margin-top: 1px;
}

/* ====== Nav Menu ====== */
.nav-menu {
  flex: 1;
  overflow-y: auto;
  padding: 10px 8px;
}

.nav-menu::-webkit-scrollbar { width: 3px; }
.nav-menu::-webkit-scrollbar-thumb { background: rgba(58, 59, 62, 0.4); border-radius: 2px; }

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
  margin-bottom: 2px;
  position: relative;
}

.nav-item:hover {
  background: rgba(58, 59, 62, 0.2);
}

.nav-active {
  background: rgba(92, 156, 230, 0.08) !important;
}

.nav-icon {
  width: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.nav-label {
  font-size: 0.8rem;
  font-weight: 500;
  color: #9e9e9e;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-active .nav-label {
  color: #e0e1e4;
  font-weight: 600;
}

.nav-badge-alert {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #ef5350;
  margin-left: auto;
  flex-shrink: 0;
  animation: nav-pulse 2s ease-in-out infinite;
}

@keyframes nav-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

/* ====== Project Section ====== */
.nav-section-label {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 14px 12px 6px;
  font-size: 0.65rem;
  font-weight: 700;
  color: #4b5563;
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

.nav-section-badge {
  background: rgba(92, 156, 230, 0.1) !important;
  color: #5c9ce6 !important;
  font-size: 0.58rem !important;
  min-height: 16px !important;
  padding: 0 5px !important;
}

.nav-project-list {
  padding-left: 4px;
}

.nav-project-item {
  padding: 7px 12px 7px 14px;
}

.nav-project-dot {
  width: 8px;
  height: 8px;
  min-width: 8px;
  border-radius: 3px;
  transition: background 0.15s;
}

.nav-active .nav-project-dot {
  background: #5c9ce6 !important;
  box-shadow: 0 0 6px rgba(92, 156, 230, 0.3);
}

.nav-add-project {
  padding: 7px 12px 7px 14px;
  opacity: 0.7;
}

.nav-add-project:hover {
  opacity: 1;
}

/* ====== Nav Divider ====== */
.nav-divider {
  height: 1px;
  background: rgba(58, 59, 62, 0.2);
  margin: 8px 12px;
}

/* ====== Drawer Footer ====== */
.drawer-footer {
  padding: 10px 12px;
  border-top: 1px solid rgba(58, 59, 62, 0.2);
}

.drawer-user {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 4px;
}

.drawer-user-avatar {
  width: 32px;
  height: 32px;
  min-width: 32px;
  border-radius: 8px;
  background: rgba(92, 156, 230, 0.12);
  color: #5c9ce6;
  font-size: 0.78rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.drawer-user-info {
  overflow: hidden;
}

.drawer-user-name {
  font-size: 0.78rem;
  font-weight: 600;
  color: #cecfd2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.drawer-user-email {
  font-size: 0.62rem;
  color: #6b6c6f;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 1px;
}

/* Create Project Dialog */
.create-project-card {
  min-width: 440px;
  max-width: 520px;
  background: #1e2124 !important;
  border: 1px solid rgba(44, 58, 69, 0.5);
  border-radius: 14px !important;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5) !important;
}

.dialog-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #cecfd2;
  letter-spacing: 0.3px;
}

.field-label {
  display: block;
  font-size: 0.78rem;
  font-weight: 600;
  color: #9ca3af;
  margin-bottom: 6px;
  letter-spacing: 0.3px;
}

.dialog-input :deep(.q-field__control) {
  background: rgba(30, 33, 36, 0.8) !important;
  border-color: rgba(58, 59, 62, 0.5) !important;
  border-radius: 8px !important;
}

.dialog-input :deep(.q-field__control:hover) {
  border-color: rgba(92, 156, 230, 0.3) !important;
}

.dialog-input :deep(.q-field__control.q-field__control--focused) {
  border-color: #5c9ce6 !important;
}

.dialog-input :deep(.q-field__native) {
  color: #cecfd2 !important;
  font-size: 0.85rem !important;
}

.dialog-input :deep(.q-field__native::placeholder) {
  color: #4b5563 !important;
}

.cancel-btn {
  color: #6b6c6f !important;
  font-size: 0.8rem !important;
  border-radius: 8px !important;
}

.cancel-btn:hover {
  background: rgba(58, 59, 62, 0.3) !important;
  color: #9ca3af !important;
}

.create-btn {
  background: rgba(92, 156, 230, 0.15) !important;
  color: #5c9ce6 !important;
  font-size: 0.8rem !important;
  font-weight: 600 !important;
  border-radius: 8px !important;
  border: 1px solid rgba(92, 156, 230, 0.2) !important;
}

.create-btn:hover {
  background: rgba(92, 156, 230, 0.25) !important;
}

.create-btn.disabled {
  opacity: 0.4 !important;
}

/* Profile Dropdown */
.profile-dropdown {
  border-radius: 10px !important;
  padding: 2px 4px !important;
}

.profile-dropdown:hover {
  background: rgba(58, 59, 62, 0.3) !important;
}

.profile-avatar {
  background: rgba(92, 156, 230, 0.15);
  color: #5c9ce6;
  font-size: 0.78rem;
  font-weight: 700;
}

.profile-name {
  font-size: 0.82rem;
  font-weight: 500;
  color: #cecfd2;
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.profile-menu {
  background: rgb(12, 10, 10);
  border: 1px solid rgba(44, 58, 69, 0.5);
  min-width: 260px;
  overflow: hidden;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
}

.profile-menu-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
}

.profile-avatar-lg {
  background: rgba(92, 156, 230, 0.15);
  color: #5c9ce6;
  font-size: 1rem;
  font-weight: 700;
}

.profile-menu-info {
  overflow: hidden;
}

.profile-menu-name {
  font-size: 0.88rem;
  font-weight: 600;
  color: #cecfd2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.profile-menu-email {
  font-size: 0.72rem;
  color: #6b6c6f;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.profile-menu-list {
  padding: 6px;
}

.profile-menu-item {
  border-radius: 8px;
  min-height: 40px;
  padding: 0 12px;
  transition: background 0.15s;
}

.profile-menu-item :deep(.q-item__section--avatar) {
  min-width: 32px;
}

.profile-menu-item :deep(.q-item__label) {
  font-size: 0.8rem;
  font-weight: 500;
}

.logout-item {
  color: #ef5350 !important;
}

.logout-item:hover {
  background: rgba(239, 83, 80, 0.1) !important;
}
</style>

<!-- Unscoped styles for Teleported notification panel -->
<style>
/* ====== Notification Overlay ====== */
.notif-overlay {
  position: fixed;
  inset: 0;
  z-index: 6000;
}

/* ====== Notification Panel ====== */
.notif-panel {
  position: fixed;
  top: 52px;
  right: 16px;
  width: 380px;
  max-height: 520px;
  background: #1e2023;
  border: 1px solid rgba(92, 156, 230, 0.12);
  border-radius: 14px;
  box-shadow: 0 12px 48px rgba(0,0,0,0.55), 0 0 0 1px rgba(92,156,230,0.04);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: notif-slide 0.2s ease;
  z-index: 6001;
}

@keyframes notif-slide {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}

.notif-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid rgba(255,255,255,0.04);
  flex-shrink: 0;
}

.notif-panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  font-weight: 700;
  color: #e0e1e4;
}

.notif-count-badge {
  background: #ef5350 !important;
  color: #fff !important;
  font-size: 0.6rem;
  padding: 1px 6px;
  border-radius: 10px;
  min-height: auto;
}

.notif-mark-all {
  background: none;
  border: none;
  color: #5c9ce6;
  font-size: 0.72rem;
  font-weight: 600;
  cursor: pointer;
  padding: 4px 10px;
  border-radius: 6px;
  transition: background 0.15s ease;
}

.notif-mark-all:hover {
  background: rgba(92, 156, 230, 0.1);
}

/* ====== Notification List ====== */
.notif-list {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.notif-list::-webkit-scrollbar { width: 3px; }
.notif-list::-webkit-scrollbar-thumb { background: rgba(58,59,62,0.4); border-radius: 2px; }

.notif-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 20px;
  gap: 10px;
  color: #4a4b4e;
  font-size: 0.78rem;
}

/* ====== Notification Item ====== */
.notif-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 18px;
  cursor: pointer;
  transition: background 0.15s ease;
  border-bottom: 1px solid rgba(255,255,255,0.02);
  position: relative;
}

.notif-item:hover {
  background: rgba(92, 156, 230, 0.05);
}

.notif-unread {
  background: rgba(92, 156, 230, 0.04);
}

.notif-icon-wrap {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.notif-icon-mention {
  background: rgba(92, 156, 230, 0.12);
  color: #5c9ce6;
}

.notif-icon-assign {
  background: rgba(76, 175, 80, 0.12);
  color: #66bb6a;
}

.notif-icon-info {
  background: rgba(255, 183, 77, 0.12);
  color: #ffb74d;
}

.notif-content {
  flex: 1;
  min-width: 0;
}

.notif-msg {
  font-size: 0.78rem;
  color: #c0c1c4;
  line-height: 1.5;
  word-break: break-word;
}

.notif-unread .notif-msg {
  color: #e0e1e4;
  font-weight: 500;
}

.notif-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.notif-project {
  font-size: 0.65rem;
  color: #5c9ce6;
  background: rgba(92, 156, 230, 0.08);
  padding: 1px 6px;
  border-radius: 3px;
  font-weight: 500;
}

.notif-time {
  font-size: 0.65rem;
  color: #4a4b4e;
}

.notif-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #5c9ce6;
  flex-shrink: 0;
  margin-top: 4px;
  animation: notif-pulse 2s ease-in-out infinite;
}

@keyframes notif-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

/* Profile Dialog */
.profile-dialog-card {
  min-width: 440px;
  max-width: 520px;
  background: #1e2124 !important;
  border: 1px solid rgba(44, 58, 69, 0.5);
  border-radius: 14px !important;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5) !important;
}

.profile-dialog-avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 8px 0 12px;
}

.profile-avatar-upload-wrapper {
  position: relative;
  cursor: pointer;
  border-radius: 50%;
}

.profile-avatar-overlay {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transition: opacity 0.2s;
}

.profile-avatar-upload-wrapper:hover .profile-avatar-overlay {
  opacity: 1;
}

.profile-avatar-spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.drawer-user-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.profile-dialog-email {
  font-size: 0.82rem;
  color: #9ca3af;
}

.profile-role-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.profile-role-tag,
.profile-dept-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  border-radius: 8px;
  background: rgba(58, 59, 62, 0.2);
  font-size: 0.75rem;
  font-weight: 600;
}

.profile-dept-tag {
  color: #5c9ce6;
}

.profile-save-success {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: rgba(76, 175, 80, 0.12);
  border: 1px solid rgba(76, 175, 80, 0.3);
  border-radius: 8px;
  color: #66bb6a;
  font-size: 0.82rem;
  font-weight: 500;
}

.profile-password-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid rgba(58, 59, 62, 0.3);
  background: transparent;
  color: #9ca3af;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.profile-password-toggle:hover {
  background: rgba(58, 59, 62, 0.15);
  color: #cecfd2;
  border-color: rgba(255, 183, 77, 0.3);
}

.profile-password-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.profile-password-error {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: rgba(239, 83, 80, 0.1);
  border: 1px solid rgba(239, 83, 80, 0.25);
  border-radius: 8px;
  color: #ef5350;
  font-size: 0.78rem;
  font-weight: 500;
}

.password-change-btn {
  background: linear-gradient(135deg, #ffb74d 0%, #ef6c00 100%) !important;
  color: white !important;
  font-weight: 600;
  font-size: 0.8rem;
  border-radius: 8px;
}

/* ====== Help Button ====== */
.help-btn {
  color: #6b6c6f !important;
  transition: color 0.2s;
}
.help-btn:hover {
  color: #42a5f5 !important;
}

/* ====== Help Panel (Right Drawer Dialog) ====== */
.help-panel {
  width: 420px;
  max-width: 95vw;
  height: 100%;
  background: rgba(24, 25, 26, 0.98);
  border-left: 1px solid rgba(58, 59, 62, 0.3);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.help-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  border-bottom: 1px solid rgba(58, 59, 62, 0.25);
  flex-shrink: 0;
}

.help-panel-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.help-panel-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.help-panel-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #e0e1e4;
}

.help-panel-subtitle {
  font-size: 0.65rem;
  color: #6b6c6f;
  margin-top: 1px;
}

.help-panel-close {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: none;
  background: rgba(58, 59, 62, 0.2);
  color: #6b6c6f;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.help-panel-close:hover {
  background: rgba(58, 59, 62, 0.4);
  color: #9e9e9e;
}

.help-panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 18px 20px;
}

.help-panel-body::-webkit-scrollbar { width: 3px; }
.help-panel-body::-webkit-scrollbar-thumb { background: rgba(58, 59, 62, 0.3); border-radius: 2px; }

/* Intro */
.help-intro {
  display: flex;
  gap: 10px;
  padding: 14px;
  border-radius: 10px;
  background: rgba(255, 183, 77, 0.06);
  border: 1px solid rgba(255, 183, 77, 0.12);
  font-size: 0.74rem;
  color: #9e9e9e;
  line-height: 1.6;
  margin-bottom: 18px;
}

/* Sections (Accordion) */
.help-section {
  margin-bottom: 8px;
  border-radius: 10px;
  background: rgba(30, 33, 36, 0.6);
  border: 1px solid rgba(58, 59, 62, 0.2);
  overflow: hidden;
}

.help-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  cursor: pointer;
  transition: background 0.15s;
}

.help-section-header:hover {
  background: rgba(58, 59, 62, 0.1);
}

.help-section-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.help-section-icon {
  width: 28px;
  height: 28px;
  border-radius: 7px;
  background: rgba(92, 156, 230, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.help-section-title {
  font-size: 0.78rem;
  font-weight: 600;
  color: #cecfd2;
}

.help-section-chevron {
  color: #4a4b4e;
  transition: color 0.15s;
}

.help-section-body {
  padding: 0 14px 14px;
}

.help-section-desc {
  font-size: 0.72rem;
  color: #6b6c6f;
  line-height: 1.5;
  margin: 0 0 10px;
}

/* Steps (numbered) */
.help-steps {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.help-step {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 0.72rem;
  color: #9e9e9e;
  line-height: 1.5;
}

.help-step-num {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background: rgba(92, 156, 230, 0.12);
  color: #5c9ce6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6rem;
  font-weight: 700;
  flex-shrink: 0;
  margin-top: 1px;
}

/* Items (label + description) */
.help-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.help-item {
  padding: 10px 12px;
  border-radius: 8px;
  background: rgba(24, 25, 26, 0.5);
  border: 1px solid rgba(58, 59, 62, 0.15);
}

.help-item-label {
  font-size: 0.72rem;
  font-weight: 700;
  color: #cecfd2;
  margin-bottom: 2px;
}

.help-item-desc {
  font-size: 0.68rem;
  color: #6b6c6f;
  line-height: 1.45;
}

/* Tips */
.help-tips {
  margin-top: 18px;
  padding: 14px;
  border-radius: 10px;
  background: rgba(66, 165, 245, 0.05);
  border: 1px solid rgba(66, 165, 245, 0.1);
}

.help-tips-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #42a5f5;
  margin-bottom: 10px;
}

.help-tip {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 0.7rem;
  color: #9e9e9e;
  line-height: 1.5;
  margin-bottom: 6px;
}

.help-tip:last-child {
  margin-bottom: 0;
}
</style>

