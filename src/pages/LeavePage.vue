<template>
  <q-page class="leave-page">
    <div class="leave-container">
      <!-- Header -->
      <div class="leave-page-header">
        <div class="leave-header-left">
          <div class="leave-header-icon">
            <q-icon name="event_busy" size="26px" />
          </div>
          <div>
            <div class="leave-header-title">Leave Request</div>
            <div class="leave-header-subtitle">ส่งใบลาและดูประวัติการลา</div>
          </div>
        </div>
        <div class="leave-header-right">
          <button v-if="showQuotaManagement" class="leave-individual-quota-btn"
            @click="openIndividualQuotaDialog">
            <q-icon name="person_add" size="18px" />
            <q-tooltip anchor="bottom middle" self="top middle" :offset="[0, 6]">จัดการโควต้ารายบุคคล</q-tooltip>
          </button>
          <button v-if="showQuotaManagement" class="leave-quota-settings-btn"
            @click="openQuotaDialog">
            <q-icon name="tune" size="18px" />
            <q-tooltip anchor="bottom middle" self="top middle" :offset="[0, 6]">ตั้งค่าโควต้ากลาง</q-tooltip>
          </button>
        </div>
      </div>

      <!-- Approval Section (for head / hr / super_admin) -->
      <div v-if="showApprovalSection" class="leave-card leave-approval-card">
        <div class="leave-card-header">
          <q-icon name="approval" size="18px" style="color: #ce93d8;" />
          <span class="leave-card-title">รออนุมัติ</span>
          <q-badge v-if="leaveStore.pendingApprovalCount > 0"
            :label="leaveStore.pendingApprovalCount + ' รายการ'" class="leave-approval-badge" />
          <div style="flex:1"></div>
          <button class="leave-refresh-btn" :disabled="leaveStore.loading" @click="refreshApprovals" title="รีเฟรช">
            <q-icon name="refresh" size="15px" :class="{ 'leave-spin': leaveStore.loading }" />
          </button>
          <div class="leave-role-badge">
            <q-icon :name="authStore.roleLabels[authStore.profile.role]?.icon || 'person'" size="13px" />
            <span>{{ authStore.roleLabels[authStore.profile.role]?.label || 'พนักงาน' }}</span>
          </div>
        </div>

        <div class="leave-approval-list">
          <div v-if="leaveStore.pendingApprovals.length === 0" class="leave-empty">
            <q-icon name="check_circle_outline" size="40px" style="color: #2a2b2e;" />
            <span>ไม่มีใบลารออนุมัติ</span>
          </div>

          <div v-for="leave in leaveStore.pendingApprovals" :key="leave.id" class="leave-approval-item">
            <div class="leave-approval-item-top">
              <div class="leave-approval-avatar">
                <img v-if="authStore.getPhotoURL(leave.userId)" :src="authStore.getPhotoURL(leave.userId)" class="leave-approval-avatar-img" />
                <span v-else>{{ leave.firstName?.charAt(0) || leave.userId?.charAt(0)?.toUpperCase() || 'U' }}</span>
              </div>
              <div class="leave-approval-info">
                <div class="leave-approval-name">{{ leave.firstName }} {{ leave.lastName }}</div>
                <div class="leave-approval-email">{{ leave.userId }}</div>
              </div>
              <div class="leave-history-status"
                :style="{ color: getStatusInfo(leave.status).color, background: getStatusInfo(leave.status).color + '15' }">
                <q-icon :name="getStatusInfo(leave.status).icon" size="13px" />
                <span>{{ getStatusInfo(leave.status).label }}</span>
              </div>
            </div>

            <div class="leave-approval-detail-row">
              <div class="leave-approval-type">
                <span>{{ getTypeInfo(leave.leaveType).icon }}</span>
                <span>{{ getTypeInfo(leave.leaveType).label }}</span>
                <span v-if="leave.durationType && leave.durationType !== 'full_day'" class="leave-duration-badge">
                  {{ getDurationLabel(leave) }}
                </span>
              </div>
              <div class="leave-approval-dates">
                <q-icon name="date_range" size="13px" />
                <span>{{ formatDate(leave.startDate) }}{{ leave.startDate !== leave.endDate ? ' — ' + formatDate(leave.endDate) : '' }}</span>
                <span class="leave-history-days">({{ getDisplayDays(leave) }} วัน)</span>
              </div>
            </div>

            <div v-if="leave.department" class="leave-approval-dept">
              <q-icon name="business" size="13px" />
              <span>{{ leave.department }}</span>
            </div>

            <div v-if="leave.details" class="leave-history-details">
              {{ leave.details }}
            </div>

            <!-- Head approval info (shown to HR if head already approved) -->
            <div v-if="leave.headApproval" class="leave-approval-trail">
              <q-icon name="check_circle" size="13px" style="color: #66bb6a;" />
              <span>หัวหน้าอนุมัติโดย {{ leave.headApproval.approvedByName }}</span>
            </div>

            <div class="leave-approval-actions">
              <button class="leave-approve-btn" @click="handleApprove(leave)" :disabled="leaveStore.loading">
                <q-icon name="check" size="16px" />
                <span>อนุมัติ</span>
              </button>
              <button class="leave-reject-btn" @click="openRejectDialog(leave)" :disabled="leaveStore.loading">
                <q-icon name="close" size="16px" />
                <span>ไม่อนุมัติ</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Quota Summary Cards -->
      <div class="leave-quota-row">
        <div v-for="t in leaveStore.leaveTypes.filter(lt => !leaveStore.noQuotaTypes.includes(lt.value))" :key="t.value" class="leave-quota-card"
          :class="{ 'leave-quota-exhausted': leaveStore.getRemainingDays(t.value) <= 0 }">
          <div class="leave-quota-card-header">
            <span class="leave-quota-card-icon">{{ t.icon }}</span>
            <span class="leave-quota-card-label">{{ t.label }}</span>
            <span v-if="leaveStore.myIndividualQuota" class="leave-quota-badge-individual">โควต้าเฉพาะ</span>
            <span v-if="leaveStore.getRemainingDays(t.value) <= 0" class="leave-quota-badge-empty">หมดโควต้า</span>
          </div>
          <div class="leave-quota-card-numbers">
            <span class="leave-quota-used">{{ formatDays(leaveStore.usedDaysMap[t.value] || 0) }}</span>
            <span class="leave-quota-sep">/</span>
            <span class="leave-quota-total">{{ leaveStore.effectiveQuota[t.value] || 0 }}</span>
            <span class="leave-quota-unit">วัน</span>
          </div>
          <div class="leave-quota-bar">
            <div class="leave-quota-bar-fill"
              :style="{
                width: Math.min(100, ((leaveStore.usedDaysMap[t.value] || 0) / (leaveStore.effectiveQuota[t.value] || 1)) * 100) + '%',
                background: leaveStore.getRemainingDays(t.value) <= 0 ? '#ef5350' : t.color
              }"></div>
          </div>
          <div class="leave-quota-remaining">
            คงเหลือ <strong>{{ leaveStore.getRemainingDays(t.value) }}</strong> วัน
          </div>
        </div>
      </div>

      <!-- Main Grid -->
      <div class="leave-grid">
        <!-- Left: Submit Form -->
        <div class="leave-card leave-form-card">
          <div class="leave-card-header">
            <q-icon name="post_add" size="18px" style="color: #ffb74d;" />
            <span class="leave-card-title">ส่งใบลา</span>
          </div>

          <!-- Success message -->
          <div v-if="showSuccess" class="leave-success">
            <div class="leave-success-icon">✅</div>
            <div class="leave-success-title">ส่งใบลาเรียบร้อยแล้ว!</div>
            <div class="leave-success-desc">
              {{ lastSubmittedType === 'sick' ? 'ลาป่วยได้รับการอนุมัติอัตโนมัติ' : 'ใบลาของคุณอยู่ระหว่างรอการอนุมัติ' }}
            </div>
            <button class="leave-new-btn" @click="resetForm">
              <q-icon name="add" size="16px" />
              <span>ส่งใบลาใหม่</span>
            </button>
          </div>

          <!-- Form -->
          <div v-else class="leave-form-body">

            <!-- Name row -->
            <div v-if="authStore.profile.firstName || authStore.profile.lastName" class="leave-profile-hint">
              <q-icon name="person" size="14px" />
              <span>ข้อมูลจากโปรไฟล์ของคุณ</span>
            </div>
            <div class="leave-form-row">
              <div class="leave-field">
                <label class="leave-field-label">ชื่อ <span class="leave-required">*</span></label>
                <input v-model="form.firstName" class="leave-input" placeholder="ชื่อ"
                  :readonly="!!(authStore.profile.firstName)" />
              </div>
              <div class="leave-field">
                <label class="leave-field-label">นามสกุล <span class="leave-required">*</span></label>
                <input v-model="form.lastName" class="leave-input" placeholder="นามสกุล"
                  :readonly="!!(authStore.profile.lastName)" />
              </div>
            </div>

            <!-- Leave Type -->
            <div class="leave-field">
              <label class="leave-field-label">ประเภทการลา <span class="leave-required">*</span></label>
              <div class="leave-type-grid">
                <button v-for="t in leaveStore.leaveTypes" :key="t.value"
                  class="leave-type-btn"
                  :class="{
                    'leave-type-selected': form.leaveType === t.value,
                    'leave-type-disabled': !leaveStore.noQuotaTypes.includes(t.value) && leaveStore.getRemainingDays(t.value) <= 0
                  }"
                  :disabled="!leaveStore.noQuotaTypes.includes(t.value) && leaveStore.getRemainingDays(t.value) <= 0"
                  @click="selectLeaveType(t.value)">
                  <span class="leave-type-icon">{{ t.icon }}</span>
                  <span class="leave-type-label">{{ t.label }}</span>
                  <span v-if="leaveStore.noQuotaTypes.includes(t.value)" class="leave-type-remaining">
                    {{ t.value === 'maternity' ? 'ไม่เกิน 90 วัน' : 'ไม่จำกัด' }}
                  </span>
                  <span v-else-if="leaveStore.getRemainingDays(t.value) <= 0" class="leave-type-no-quota">หมดโควต้า</span>
                  <span v-else class="leave-type-remaining">เหลือ {{ leaveStore.getRemainingDays(t.value) }} วัน</span>
                </button>
              </div>
            </div>

            <!-- Duration Type (only for sick / personal) -->
            <div v-if="showDurationSelector" class="leave-field">
              <label class="leave-field-label">ช่วงเวลาการลา <span class="leave-required">*</span></label>
              <div class="leave-duration-grid">
                <button v-for="d in leaveStore.durationTypes" :key="d.value"
                  class="leave-duration-btn"
                  :class="{ 'leave-duration-selected': form.durationType === d.value }"
                  @click="selectDurationType(d.value)">
                  <q-icon :name="d.icon" size="16px" />
                  <span class="leave-duration-label">{{ d.label }}</span>
                  <span v-if="d.hint" class="leave-duration-hint">{{ d.hint }}</span>
                </button>
              </div>
            </div>

            <!-- Custom Time Inputs (when durationType === 'custom') -->
            <div v-if="form.durationType === 'custom' && showDurationSelector" class="leave-form-row">
              <div class="leave-field">
                <label class="leave-field-label">เวลาเริ่ม <span class="leave-required">*</span></label>
                <q-input v-model="form.customStartTime" dense filled dark readonly
                  class="leave-time-picker" placeholder="09:00">
                  <template v-slot:prepend>
                    <q-icon name="schedule" size="18px" class="cursor-pointer" style="color: #42a5f5;">
                      <q-popup-proxy transition-show="scale" transition-hide="scale">
                        <q-time v-model="form.customStartTime" format24h mask="HH:mm" dark
                          :hour-options="workHourOptions" :minute-options="[0, 30]" color="blue-7" />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
              <div class="leave-field">
                <label class="leave-field-label">เวลาสิ้นสุด <span class="leave-required">*</span></label>
                <q-input v-model="form.customEndTime" dense filled dark readonly
                  class="leave-time-picker" placeholder="12:00">
                  <template v-slot:prepend>
                    <q-icon name="schedule" size="18px" class="cursor-pointer" style="color: #42a5f5;">
                      <q-popup-proxy transition-show="scale" transition-hide="scale">
                        <q-time v-model="form.customEndTime" format24h mask="HH:mm" dark
                          :hour-options="workHourOptions" :minute-options="[0, 30]" color="blue-7" />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
            </div>

            <!-- Custom time preview -->
            <div v-if="form.durationType === 'custom' && showDurationSelector && customHoursPreview > 0" class="leave-custom-preview">
              <q-icon name="schedule" size="14px" />
              <span>{{ customHoursPreview }} ชั่วโมง ({{ customDaysPreview }} วัน)</span>
              <span v-if="hasLunchDeduction" class="leave-lunch-note">
                <q-icon name="info_outline" size="12px" />
                หักเวลาพักเที่ยงแล้ว
              </span>
            </div>

            <!-- Date range -->
            <div class="leave-form-row">
              <div class="leave-field">
                <label class="leave-field-label">วันที่{{ isPartialDay ? 'ลา' : 'เริ่มลา' }} <span class="leave-required">*</span></label>
                <input v-model="form.startDate" type="date" class="leave-input leave-date-input" />
              </div>
              <div v-if="!isPartialDay" class="leave-field">
                <label class="leave-field-label">วันที่สิ้นสุด <span class="leave-required">*</span></label>
                <input v-model="form.endDate" type="date" class="leave-input leave-date-input" :min="form.startDate" />
              </div>
            </div>

            <!-- Days count -->
            <div v-if="leaveDays > 0" class="leave-days-preview">
              <q-icon name="date_range" size="16px" />
              <span>ลาทั้งหมด <strong>{{ leaveDays }}</strong> วัน
                <template v-if="leaveHours > 0">({{ leaveHours }} ชม.)</template>
              </span>
              <template v-if="form.leaveType === 'maternity' && leaveDays > 90">
                <span class="leave-days-warning">
                  <q-icon name="warning" size="14px" />
                  ลาคลอดครั้งละไม่เกิน 90 วัน
                </span>
              </template>
              <template v-else-if="form.leaveType && !leaveStore.noQuotaTypes.includes(form.leaveType) && leaveStore.getRemainingDays(form.leaveType) < leaveDays">
                <span class="leave-days-warning">
                  <q-icon name="warning" size="14px" />
                  เกินโควต้าคงเหลือ ({{ leaveStore.getRemainingDays(form.leaveType) }} วัน)
                </span>
              </template>
            </div>

            <!-- Holidays in range notice -->
            <div v-if="holidaysInRange.length > 0 && leaveDays > 0" class="leave-holidays-notice">
              <div class="leave-holidays-notice-header">
                <q-icon name="celebration" size="15px" />
                <span>วันหยุดบริษัทที่ไม่นับเป็นวันลา ({{ holidaysInRange.length }} วัน)</span>
              </div>
              <div class="leave-holidays-list">
                <div v-for="h in holidaysInRange" :key="h.date" class="leave-holiday-chip">
                  <span class="leave-holiday-chip-date">{{ formatHolidayDateShort(h.date) }}</span>
                  <span class="leave-holiday-chip-name">{{ h.name }}</span>
                </div>
              </div>
            </div>

            <!-- Details -->
            <div class="leave-field">
              <label class="leave-field-label">
                รายละเอียด
                <span v-if="form.leaveType === 'other'" class="leave-required">* (จำเป็นสำหรับลาอื่นๆ)</span>
                <span v-else>(ไม่บังคับ)</span>
              </label>
              <textarea v-model="form.details" class="leave-textarea"
                :placeholder="form.leaveType === 'other' ? 'ระบุประเภทการลาและเหตุผล เช่น ลาบวช, ลาเพื่อรับราชการทหาร...' : 'ระบุรายละเอียดเพิ่มเติม เช่น เหตุผลการลา...'"
                rows="3" maxlength="500"></textarea>
              <div class="leave-char-count">{{ form.details.length }}/500</div>
            </div>

            <!-- Error -->
            <div v-if="formError" class="leave-error">
              <q-icon name="error_outline" size="16px" />
              <span>{{ formError }}</span>
            </div>

            <!-- Submit -->
            <button class="leave-submit-btn" :disabled="leaveStore.loading || !isFormValid" @click="handleSubmit">
              <q-spinner v-if="leaveStore.loading" size="18px" color="white" class="q-mr-sm" />
              <q-icon v-else name="send" size="18px" class="q-mr-sm" />
              <span>{{ leaveStore.loading ? 'กำลังส่ง...' : 'ส่งใบลา' }}</span>
            </button>
          </div>
        </div>

        <!-- Right: History -->
        <div class="leave-card leave-history-card">
          <div class="leave-card-header leave-history-header">
            <div class="leave-history-title-row">
              <q-icon name="history" size="18px" style="color: #42a5f5;" />
              <span class="leave-card-title">ประวัติการลา</span>
              <q-badge v-if="leaveStore.pendingCount > 0" :label="leaveStore.pendingCount + ' รอ'" class="leave-pending-badge" />
            </div>
            <div class="leave-history-controls">
              <!-- Tabs -->
              <div class="leave-tabs">
                <button class="leave-tab" :class="{ 'leave-tab-active': historyTab === 'my' }" @click="historyTab = 'my'">ของฉัน</button>
                <button class="leave-tab" :class="{ 'leave-tab-active': historyTab === 'team' }" @click="switchToTeam">ทั้งหมด</button>
              </div>
              <div v-if="historyTab === 'my'" class="leave-view-toggle">
                <button class="leave-view-btn" :class="{ 'leave-view-btn-active': viewMode === 'list' }"
                  @click="viewMode = 'list'" title="มุมมองรายการ">
                  <q-icon name="view_list" size="15px" />
                </button>
                <button class="leave-view-btn" :class="{ 'leave-view-btn-active': viewMode === 'calendar' }"
                  @click="viewMode = 'calendar'" title="มุมมองปฏิทิน">
                  <q-icon name="calendar_month" size="15px" />
                </button>
              </div>
              <button class="leave-refresh-btn" :disabled="leaveStore.loading" @click="refreshHistory" title="รีเฟรช">
                <q-icon name="refresh" size="15px" :class="{ 'leave-spin': leaveStore.loading }" />
              </button>
              <button class="leave-export-btn"
                :disabled="(historyTab === 'my' ? leaveStore.myLeaves.length : leaveStore.teamLeaves.length) === 0"
                @click="exportToExcel"
                title="Export เป็น Excel">
                <q-icon name="download" size="15px" />
                <span>Export</span>
              </button>
            </div>
          </div>

          <!-- My Leaves: Calendar View -->
          <div v-if="historyTab === 'my' && viewMode === 'calendar'" class="leave-calendar">
            <!-- Calendar Navigation -->
            <div class="leave-cal-nav">
              <button class="leave-cal-nav-btn" @click="prevMonth">
                <q-icon name="chevron_left" size="20px" />
              </button>
              <div class="leave-cal-nav-title">{{ calendarMonthLabel }}</div>
              <button class="leave-cal-nav-btn" @click="nextMonth">
                <q-icon name="chevron_right" size="20px" />
              </button>
              <button class="leave-cal-today-btn" @click="goToToday">วันนี้</button>
            </div>

            <!-- Legend -->
            <div class="leave-cal-legend">
              <span v-for="t in leaveStore.leaveTypes" :key="t.value" class="leave-cal-legend-item">
                <span class="leave-cal-legend-dot" :style="{ background: t.color }"></span>
                <span>{{ t.label }}</span>
              </span>
              <span class="leave-cal-legend-item">
                <span class="leave-cal-legend-dot" style="background: #66bb6a;"></span>
                <span>วันหยุด</span>
              </span>
            </div>

            <!-- Day-of-week header -->
            <div class="leave-cal-grid leave-cal-header">
              <div v-for="d in ['จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.', 'อา.']" :key="d" class="leave-cal-dow"
                :class="{ 'leave-cal-dow--weekend': d === 'ส.' || d === 'อา.' }">{{ d }}</div>
            </div>

            <!-- Calendar Grid -->
            <div class="leave-cal-grid leave-cal-body">
              <div v-for="(day, idx) in calendarDays" :key="idx"
                class="leave-cal-day"
                :class="{
                  'leave-cal-day--outside': !day.isCurrentMonth,
                  'leave-cal-day--today': day.isToday,
                  'leave-cal-day--weekend': day.isWeekend,
                  'leave-cal-day--has-event': day.leaves.length > 0 || day.holiday,
                  'leave-cal-day--selected': calendarSelectedDay === day.date
                }"
                @click="selectCalendarDay(day)">
                <div class="leave-cal-day-num">{{ day.day }}</div>
                <!-- Holiday dot -->
                <div v-if="day.holiday" class="leave-cal-holiday-dot">
                  <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 4]">{{ day.holiday.name }}</q-tooltip>
                </div>
                <!-- Leave pills (max 2 shown, then +N) -->
                <div v-if="day.leaves.length > 0" class="leave-cal-events">
                  <div v-for="(lv, li) in day.leaves.slice(0, 2)" :key="li"
                    class="leave-cal-event"
                    :style="{ background: getLeaveColor(lv.leaveType) + '30', borderLeft: '2px solid ' + getLeaveColor(lv.leaveType) }">
                    <span class="leave-cal-event-icon">{{ getTypeInfo(lv.leaveType).icon }}</span>
                  </div>
                  <div v-if="day.leaves.length > 2" class="leave-cal-event-more">
                    +{{ day.leaves.length - 2 }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Selected Day Detail -->
            <div v-if="calendarSelectedDay" class="leave-cal-detail">
              <div class="leave-cal-detail-header">
                <q-icon name="event" size="16px" />
                <span>{{ formatDate(calendarSelectedDay) }}</span>
                <button class="leave-cal-detail-close" @click="calendarSelectedDay = null">
                  <q-icon name="close" size="14px" />
                </button>
              </div>
              <!-- Holiday info -->
              <div v-if="calendarDays.find(d => d.date === calendarSelectedDay)?.holiday" class="leave-cal-detail-holiday">
                <q-icon name="celebration" size="14px" style="color: #66bb6a;" />
                <span>{{ calendarDays.find(d => d.date === calendarSelectedDay).holiday.name }}</span>
              </div>
              <!-- Leave details -->
              <div v-for="lv in (calendarDays.find(d => d.date === calendarSelectedDay)?.leaves || [])" :key="lv.id"
                class="leave-cal-detail-item">
                <div class="leave-cal-detail-type">
                  <span>{{ getTypeInfo(lv.leaveType).icon }}</span>
                  <span>{{ getTypeInfo(lv.leaveType).label }}</span>
                  <span v-if="lv.durationType && lv.durationType !== 'full_day'" class="leave-duration-badge">
                    {{ getDurationLabel(lv) }}
                  </span>
                </div>
                <div class="leave-cal-detail-dates">
                  {{ formatDate(lv.startDate) }}{{ lv.startDate !== lv.endDate ? ' — ' + formatDate(lv.endDate) : '' }}
                  <span class="leave-cal-detail-days">({{ getDisplayDays(lv) }} วัน)</span>
                </div>
                <div class="leave-cal-detail-status"
                  :style="{ color: getStatusInfo(lv.status).color }">
                  <q-icon :name="getStatusInfo(lv.status).icon" size="12px" />
                  <span>{{ getStatusInfo(lv.status).label }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- My Leaves: List View -->
          <div v-if="historyTab === 'my' && viewMode === 'list'" class="leave-history-list">
            <div v-if="leaveStore.myLeaves.length === 0" class="leave-empty">
              <q-icon name="beach_access" size="40px" style="color: #2a2b2e;" />
              <span>ยังไม่มีประวัติการลา</span>
            </div>

            <div v-for="leave in leaveStore.myLeaves" :key="leave.id" class="leave-history-item">
              <div class="leave-history-top">
                <div class="leave-history-type">
                  <span class="leave-history-type-icon">{{ getTypeInfo(leave.leaveType).icon }}</span>
                  <span class="leave-history-type-label">{{ getTypeInfo(leave.leaveType).label }}</span>
                  <span v-if="leave.durationType && leave.durationType !== 'full_day'" class="leave-duration-badge">
                    {{ getDurationLabel(leave) }}
                  </span>
                </div>
                <div class="leave-history-status"
                  :style="{ color: getStatusInfo(leave.status).color, background: getStatusInfo(leave.status).color + '15' }">
                  <q-icon :name="getStatusInfo(leave.status).icon" size="13px" />
                  <span>{{ getStatusInfo(leave.status).label }}</span>
                </div>
              </div>

              <div class="leave-history-name">{{ leave.firstName }} {{ leave.lastName }}</div>

              <div class="leave-history-dates">
                <q-icon name="date_range" size="13px" />
                <span>{{ formatDate(leave.startDate) }}{{ leave.startDate !== leave.endDate ? ' — ' + formatDate(leave.endDate) : '' }}</span>
                <span class="leave-history-days">({{ getDisplayDays(leave) }} วัน)</span>
              </div>

              <div v-if="leave.details" class="leave-history-details">
                {{ leave.details }}
              </div>

              <!-- Approval trail -->
              <div v-if="leave.headApproval" class="leave-approval-trail">
                <q-icon name="check_circle" size="12px" style="color: #66bb6a;" />
                <span>หัวหน้าอนุมัติ: {{ leave.headApproval.approvedByName }}</span>
              </div>
              <div v-if="leave.hrApproval" class="leave-approval-trail">
                <q-icon name="check_circle" size="12px" style="color: #ce93d8;" />
                <span>HR อนุมัติ: {{ leave.hrApproval.approvedByName }}</span>
              </div>
              <div v-if="leave.status === 'rejected' && leave.rejectionReason" class="leave-rejection-reason">
                <q-icon name="info" size="12px" />
                <span>เหตุผล: {{ leave.rejectionReason }}</span>
              </div>
              <div v-if="leave.status === 'cancelled' && leave.cancelledBy" class="leave-cancel-trail">
                <q-icon name="cancel" size="12px" style="color: #ef5350;" />
                <span>ยกเลิกโดย {{ leave.cancelledByName || leave.cancelledBy }}{{ leave.cancelReason ? ' — ' + leave.cancelReason : '' }}</span>
              </div>

              <div class="leave-history-bottom">
                <span class="leave-history-submitted">ส่งเมื่อ {{ formatTimestamp(leave.submittedAt) }}</span>
                <button v-if="leave.status === 'pending_head' || leave.status === 'pending_hr'"
                  class="leave-cancel-btn" @click="handleCancel(leave.id)">
                  <q-icon name="close" size="13px" />
                  <span>ยกเลิก</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Team Leaves -->
          <div v-else class="leave-history-list">
            <div v-if="leaveStore.teamLeaves.length === 0" class="leave-empty">
              <q-icon name="groups" size="40px" style="color: #2a2b2e;" />
              <span>ยังไม่มีข้อมูลการลาของทีม</span>
            </div>

            <div v-for="leave in leaveStore.teamLeaves" :key="leave.id"
              class="leave-history-item" :class="{ 'leave-today-item': isLeaveToday(leave) }">
              <div class="leave-history-top">
                <div class="leave-history-type">
                  <span class="leave-history-type-icon">{{ getTypeInfo(leave.leaveType).icon }}</span>
                  <span class="leave-history-type-label">{{ getTypeInfo(leave.leaveType).label }}</span>
                  <span v-if="leave.durationType && leave.durationType !== 'full_day'" class="leave-duration-badge">
                    {{ getDurationLabel(leave) }}
                  </span>
                </div>
                <span v-if="isLeaveToday(leave)" class="leave-today-badge">
                  <q-icon name="circle" size="6px" />
                  วันนี้
                </span>
                <div class="leave-history-status"
                  :style="{ color: getStatusInfo(leave.status).color, background: getStatusInfo(leave.status).color + '15' }">
                  <q-icon :name="getStatusInfo(leave.status).icon" size="13px" />
                  <span>{{ getStatusInfo(leave.status).label }}</span>
                </div>
              </div>

              <div class="leave-history-name">{{ leave.firstName }} {{ leave.lastName }}</div>

              <div class="leave-history-dates">
                <q-icon name="date_range" size="13px" />
                <span>{{ formatDate(leave.startDate) }}{{ leave.startDate !== leave.endDate ? ' — ' + formatDate(leave.endDate) : '' }}</span>
                <span class="leave-history-days">({{ getDisplayDays(leave) }} วัน)</span>
              </div>

              <div v-if="leave.details" class="leave-history-details">
                {{ leave.details }}
              </div>

              <!-- Approval trail (team view) -->
              <div v-if="leave.headApproval" class="leave-approval-trail">
                <q-icon name="check_circle" size="12px" style="color: #66bb6a;" />
                <span>หัวหน้าอนุมัติ: {{ leave.headApproval.approvedByName }}</span>
              </div>
              <div v-if="leave.hrApproval" class="leave-approval-trail">
                <q-icon name="check_circle" size="12px" style="color: #ce93d8;" />
                <span>HR อนุมัติ: {{ leave.hrApproval.approvedByName }}</span>
              </div>
              <div v-if="leave.status === 'cancelled' && leave.cancelledBy" class="leave-cancel-trail">
                <q-icon name="cancel" size="12px" style="color: #ef5350;" />
                <span>ยกเลิกโดย {{ leave.cancelledByName || leave.cancelledBy }}{{ leave.cancelReason ? ' — ' + leave.cancelReason : '' }}</span>
              </div>
              <div v-if="leave.status === 'rejected' && leave.rejectionReason" class="leave-rejection-reason">
                <q-icon name="info" size="12px" />
                <span>เหตุผล: {{ leave.rejectionReason }}</span>
              </div>

              <div class="leave-history-bottom">
                <span class="leave-history-submitted">โดย {{ leave.userName }} — {{ formatTimestamp(leave.submittedAt) }}</span>
                <button v-if="canHeadRevoke(leave)"
                  class="leave-revoke-btn" @click="openRevokeDialog(leave, 'head')">
                  <q-icon name="undo" size="13px" />
                  <span>ถอนอนุมัติ</span>
                </button>
                <button v-if="canHrRevoke(leave)"
                  class="leave-revoke-btn" @click="openRevokeDialog(leave, 'hr')">
                  <q-icon name="undo" size="13px" />
                  <span>ถอนอนุมัติ</span>
                </button>
                <button v-if="leave.status === 'approved' && canAdminCancel"
                  class="leave-admin-cancel-btn" @click="openAdminCancelDialog(leave)">
                  <q-icon name="cancel" size="13px" />
                  <span>ยกเลิกใบลา</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Admin Cancel Approved Leave Dialog -->
    <q-dialog v-model="showAdminCancelDialog">
      <q-card class="reject-dialog-card">
        <q-card-section class="row items-center q-pb-sm">
          <q-icon name="cancel" size="22px" style="color: #ef5350;" class="q-mr-sm" />
          <div class="reject-dialog-title">ยกเลิกใบลาที่อนุมัติแล้ว</div>
          <q-space />
          <q-btn icon="close" flat round dense style="color: #6b6c6f;" @click="showAdminCancelDialog = false" />
        </q-card-section>
        <q-separator style="background: rgba(44, 58, 69, 0.4);" />
        <q-card-section>
          <div v-if="adminCancellingLeave" class="reject-leave-info">
            <span>{{ adminCancellingLeave.firstName }} {{ adminCancellingLeave.lastName }}</span>
            <span class="reject-leave-type">{{ getTypeInfo(adminCancellingLeave.leaveType).icon }} {{ getTypeInfo(adminCancellingLeave.leaveType).label }}</span>
            <span class="reject-leave-dates">{{ formatDate(adminCancellingLeave.startDate) }} — {{ formatDate(adminCancellingLeave.endDate) }}</span>
            <span class="reject-leave-dates">({{ getDisplayDays(adminCancellingLeave) }} วัน)</span>
          </div>
          <div class="admin-cancel-quota-hint">
            <q-icon name="info" size="14px" />
            <span>โควต้าการลาจะถูกคืนให้พนักงานอัตโนมัติ</span>
          </div>
          <label class="reject-field-label">เหตุผลที่ยกเลิก</label>
          <textarea v-model="adminCancelReason" class="reject-textarea"
            placeholder="ระบุเหตุผล (ไม่บังคับ)..." rows="3" maxlength="300"></textarea>
          <div class="row justify-end q-gutter-sm q-mt-md">
            <q-btn flat label="ปิด" class="reject-cancel-btn" @click="showAdminCancelDialog = false" />
            <q-btn label="ยืนยันยกเลิกใบลา" icon="cancel" class="reject-confirm-btn"
              :loading="leaveStore.loading" @click="handleAdminCancel" />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Reject Dialog -->
    <q-dialog v-model="showRejectDialog">
      <q-card class="reject-dialog-card">
        <q-card-section class="row items-center q-pb-sm">
          <q-icon name="cancel" size="22px" style="color: #ef5350;" class="q-mr-sm" />
          <div class="reject-dialog-title">ไม่อนุมัติใบลา</div>
          <q-space />
          <q-btn icon="close" flat round dense style="color: #6b6c6f;" @click="showRejectDialog = false" />
        </q-card-section>
        <q-separator style="background: rgba(44, 58, 69, 0.4);" />
        <q-card-section>
          <div v-if="rejectingLeave" class="reject-leave-info">
            <span>{{ rejectingLeave.firstName }} {{ rejectingLeave.lastName }}</span>
            <span class="reject-leave-type">{{ getTypeInfo(rejectingLeave.leaveType).icon }} {{ getTypeInfo(rejectingLeave.leaveType).label }}</span>
            <span class="reject-leave-dates">{{ formatDate(rejectingLeave.startDate) }} — {{ formatDate(rejectingLeave.endDate) }}</span>
          </div>
          <label class="reject-field-label">เหตุผลที่ไม่อนุมัติ</label>
          <textarea v-model="rejectReason" class="reject-textarea"
            placeholder="ระบุเหตุผล (ไม่บังคับ)..." rows="3" maxlength="300"></textarea>
          <div class="row justify-end q-gutter-sm q-mt-md">
            <q-btn flat label="ยกเลิก" class="reject-cancel-btn" @click="showRejectDialog = false" />
            <q-btn label="ยืนยันไม่อนุมัติ" icon="cancel" class="reject-confirm-btn"
              :loading="leaveStore.loading" @click="handleReject" />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Revoke Approval Dialog -->
    <q-dialog v-model="showRevokeDialog">
      <q-card class="reject-dialog-card">
        <q-card-section class="row items-center q-pb-sm">
          <q-icon name="undo" size="22px" style="color: #ffb74d;" class="q-mr-sm" />
          <div class="reject-dialog-title">ถอนอนุมัติใบลา</div>
          <q-space />
          <q-btn icon="close" flat round dense style="color: #6b6c6f;" @click="showRevokeDialog = false" />
        </q-card-section>
        <q-separator style="background: rgba(44, 58, 69, 0.4);" />
        <q-card-section>
          <div v-if="revokingLeave" class="reject-leave-info">
            <span>{{ revokingLeave.firstName }} {{ revokingLeave.lastName }}</span>
            <span class="reject-leave-type">{{ getTypeInfo(revokingLeave.leaveType).icon }} {{ getTypeInfo(revokingLeave.leaveType).label }}</span>
            <span class="reject-leave-dates">{{ formatDate(revokingLeave.startDate) }} — {{ formatDate(revokingLeave.endDate) }}</span>
            <span class="reject-leave-dates">({{ getDisplayDays(revokingLeave) }} วัน)</span>
          </div>
          <div v-if="revokeType === 'hr'" class="admin-cancel-quota-hint">
            <q-icon name="info" size="14px" />
            <span>โควต้าการลาจะถูกคืนให้พนักงานอัตโนมัติ</span>
          </div>
          <div class="revoke-warning-hint">
            <q-icon name="warning" size="14px" />
            <span>การถอนอนุมัติจะเปลี่ยนสถานะเป็น "ไม่อนุมัติ" ทันที</span>
          </div>
          <label class="reject-field-label">เหตุผลที่ถอนอนุมัติ</label>
          <textarea v-model="revokeReason" class="reject-textarea"
            placeholder="ระบุเหตุผล เช่น กดอนุมัติผิด, ข้อมูลไม่ถูกต้อง..." rows="3" maxlength="300"></textarea>
          <div class="row justify-end q-gutter-sm q-mt-md">
            <q-btn flat label="ยกเลิก" class="reject-cancel-btn" @click="showRevokeDialog = false" />
            <q-btn label="ยืนยันถอนอนุมัติ" icon="undo" class="revoke-confirm-btn"
              :loading="leaveStore.loading" @click="handleRevoke" />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Quota Settings Dialog (Global) -->
    <q-dialog v-model="showQuotaDialog">
      <q-card class="quota-dialog-card">
        <q-card-section class="quota-dialog-header">
          <div class="quota-dialog-title-row">
            <q-icon name="tune" size="20px" style="color: #ab47bc;" />
            <span class="quota-dialog-title">ตั้งค่าโควต้ากลาง</span>
          </div>
          <q-btn icon="close" flat round dense size="sm" color="grey-6" v-close-popup />
        </q-card-section>

        <q-card-section class="quota-dialog-body">
          <div class="quota-dialog-fields">
            <div v-for="t in leaveStore.leaveTypes" :key="t.value" class="quota-dialog-field">
              <label class="quota-dialog-label">
                <span>{{ t.icon }} {{ t.label }}</span>
                <span class="quota-dialog-unit">(วัน/ปี)</span>
              </label>
              <input v-model.number="quotaForm[t.value]" type="number" min="0" class="leave-input leave-quota-input" />
            </div>
          </div>

          <div v-if="leaveStore.quotaMeta.updatedBy" class="quota-dialog-meta">
            <q-icon name="info_outline" size="12px" />
            <span>อัปเดตล่าสุดโดย {{ leaveStore.quotaMeta.updatedBy }}
              <template v-if="leaveStore.quotaMeta.updatedAt">
                เมื่อ {{ formatTimestamp(leaveStore.quotaMeta.updatedAt) }}
              </template>
            </span>
          </div>

          <div v-if="quotaSaved" class="leave-quota-saved">
            <q-icon name="check_circle" size="14px" />
            <span>บันทึกโควต้าเรียบร้อย</span>
          </div>
        </q-card-section>

        <q-card-section class="quota-dialog-actions">
          <q-btn flat label="ยกเลิก" color="grey-6" v-close-popup />
          <button class="leave-quota-save-btn" :disabled="leaveStore.loading || !isQuotaChanged" @click="handleSaveQuota">
            <q-spinner v-if="savingQuota" size="14px" color="white" />
            <q-icon v-else name="save" size="14px" />
            <span>{{ savingQuota ? 'กำลังบันทึก...' : 'บันทึก' }}</span>
          </button>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Individual Quota Management Dialog -->
    <q-dialog v-model="showIndividualQuotaDialog">
      <q-card class="quota-dialog-card" style="min-width: 520px;">
        <q-card-section class="quota-dialog-header">
          <div class="quota-dialog-title-row">
            <q-icon name="person_add" size="20px" style="color: #42a5f5;" />
            <span class="quota-dialog-title">จัดการโควต้ารายบุคคล</span>
          </div>
          <q-btn icon="close" flat round dense size="sm" color="grey-6" v-close-popup />
        </q-card-section>

        <q-card-section class="quota-dialog-body">
          <!-- Employee Search -->
          <div class="leave-field" style="margin-bottom: 16px;">
            <label class="leave-field-label">เลือกพนักงาน</label>
            <q-select
              v-model="iqSelectedUser"
              :options="iqFilteredUsers"
              option-label="displayLabel"
              option-value="email"
              use-input
              input-debounce="200"
              @filter="filterUsers"
              emit-value
              map-options
              dense
              outlined
              dark
              placeholder="ค้นหาชื่อหรืออีเมล..."
              class="iq-user-select"
              @update:model-value="onSelectUser"
            >
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section>
                    <q-item-label>{{ scope.opt.firstName }} {{ scope.opt.lastName }}</q-item-label>
                    <q-item-label caption>{{ scope.opt.email }} — {{ scope.opt.department || 'ไม่ระบุแผนก' }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">ไม่พบพนักงาน</q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>

          <!-- Selected user quota -->
          <div v-if="iqSelectedUser" class="iq-user-quota-section">
            <div class="iq-quota-status">
              <span v-if="iqUserQuota" class="iq-badge-individual">
                <q-icon name="person" size="12px" /> โควต้าเฉพาะ
              </span>
              <span v-else class="iq-badge-global">
                <q-icon name="public" size="12px" /> ใช้โควต้ากลาง
              </span>
            </div>

            <div class="quota-dialog-fields" style="margin-top: 12px;">
              <div v-for="t in leaveStore.leaveTypes" :key="t.value" class="quota-dialog-field">
                <label class="quota-dialog-label">
                  <span>{{ t.icon }} {{ t.label }}</span>
                  <span class="quota-dialog-unit">(วัน/ปี)</span>
                </label>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <input v-model.number="iqForm[t.value]" type="number" min="0" class="leave-input leave-quota-input" />
                  <span class="iq-global-hint">กลาง: {{ leaveStore.leaveQuota[t.value] }}</span>
                </div>
              </div>
            </div>

            <div v-if="iqSaved" class="leave-quota-saved">
              <q-icon name="check_circle" size="14px" />
              <span>บันทึกโควต้าเรียบร้อย</span>
            </div>
          </div>
        </q-card-section>

        <q-card-section v-if="iqSelectedUser" class="quota-dialog-actions">
          <button v-if="iqUserQuota" class="leave-iq-reset-btn" :disabled="leaveStore.loading" @click="handleResetToGlobal">
            <q-icon name="restart_alt" size="14px" />
            <span>รีเซ็ตเป็นโควต้ากลาง</span>
          </button>
          <div style="flex:1"></div>
          <q-btn flat label="ยกเลิก" color="grey-6" v-close-popup />
          <button class="leave-quota-save-btn" :disabled="leaveStore.loading || !isIqChanged" @click="handleSaveIndividualQuota">
            <q-spinner v-if="iqSaving" size="14px" color="white" />
            <q-icon v-else name="save" size="14px" />
            <span>{{ iqSaving ? 'กำลังบันทึก...' : 'บันทึก' }}</span>
          </button>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useLeaveStore } from 'stores/leave'
import { useAuthStore } from 'stores/auth'
import { useNotificationsStore } from 'stores/notifications'
import { useHolidayStore } from 'stores/holiday'
import * as XLSX from 'xlsx'

const leaveStore = useLeaveStore()
const authStore = useAuthStore()
const notificationsStore = useNotificationsStore()
const holidayStore = useHolidayStore()

const historyTab = ref('my')
const showSuccess = ref(false)
const formError = ref('')
const showRejectDialog = ref(false)
const showAdminCancelDialog = ref(false)
const adminCancellingLeave = ref(null)
const adminCancelReason = ref('')
const rejectingLeave = ref(null)
const rejectReason = ref('')
const lastSubmittedType = ref('')

// ====== Calendar View ======
const viewMode = ref('list') // 'list' | 'calendar'
const calendarMonth = ref(new Date().getMonth())
const calendarYear = ref(new Date().getFullYear())

const calendarMonthLabel = computed(() => {
  const date = new Date(calendarYear.value, calendarMonth.value, 1)
  return date.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })
})

const prevMonth = () => {
  if (calendarMonth.value === 0) {
    calendarMonth.value = 11
    calendarYear.value--
  } else {
    calendarMonth.value--
  }
}

const nextMonth = () => {
  if (calendarMonth.value === 11) {
    calendarMonth.value = 0
    calendarYear.value++
  } else {
    calendarMonth.value++
  }
}

const goToToday = () => {
  const now = new Date()
  calendarMonth.value = now.getMonth()
  calendarYear.value = now.getFullYear()
}

const getLeaveColor = (leaveType) => {
  const info = leaveStore.leaveTypes.find(t => t.value === leaveType)
  return info?.color || '#9e9e9e'
}

// Build calendar grid (42 cells = 6 weeks)
const calendarDays = computed(() => {
  const year = calendarYear.value
  const month = calendarMonth.value
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  // Monday = 0 based start (shift Sunday from 0 to 6)
  let startDow = firstDay.getDay() - 1
  if (startDow < 0) startDow = 6

  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  // Get the first date shown (may be from previous month)
  const gridStart = new Date(year, month, 1 - startDow)

  // Filter leaves that may overlap this month view
  const gridStartStr = `${gridStart.getFullYear()}-${String(gridStart.getMonth() + 1).padStart(2, '0')}-${String(gridStart.getDate()).padStart(2, '0')}`
  const gridEndDate = new Date(year, month, lastDay.getDate() + (41 - startDow - lastDay.getDate() + 1))
  const gridEndStr = `${gridEndDate.getFullYear()}-${String(gridEndDate.getMonth() + 1).padStart(2, '0')}-${String(gridEndDate.getDate()).padStart(2, '0')}`

  const relevantLeaves = leaveStore.myLeaves.filter(l => {
    if (l.status === 'rejected' || l.status === 'cancelled') return false
    if (!l.startDate || !l.endDate) return false
    return l.startDate <= gridEndStr && l.endDate >= gridStartStr
  })

  const days = []
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart)
    d.setDate(d.getDate() + i)
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const dow = d.getDay()

    // Find leaves that cover this date
    const dayLeaves = relevantLeaves.filter(l => l.startDate <= dateStr && l.endDate >= dateStr)

    // Find holiday
    const holidayName = holidayStore.getHolidayName(dateStr)

    days.push({
      date: dateStr,
      day: d.getDate(),
      isCurrentMonth: d.getMonth() === month,
      isToday: dateStr === todayStr,
      isWeekend: dow === 0 || dow === 6,
      holiday: holidayName ? { name: holidayName } : null,
      leaves: dayLeaves
    })
  }
  return days
})

const calendarSelectedDay = ref(null)

const selectCalendarDay = (day) => {
  if (day.leaves.length === 0 && !day.holiday) return
  calendarSelectedDay.value = calendarSelectedDay.value === day.date ? null : day.date
}

// Quota management state
const showQuotaDialog = ref(false)
const quotaForm = ref({ sick: 30, personal: 10, vacation: 6 })
const savingQuota = ref(false)
const quotaSaved = ref(false)

const openQuotaDialog = () => {
  // Sync form with current values before opening
  quotaForm.value = {
    sick: leaveStore.leaveQuota.sick,
    personal: leaveStore.leaveQuota.personal,
    vacation: leaveStore.leaveQuota.vacation
  }
  quotaSaved.value = false
  showQuotaDialog.value = true
}

const showQuotaManagement = computed(() => {
  const role = authStore.profile.role
  return role === 'hr' || role === 'super_admin'
})

const isQuotaChanged = computed(() => {
  return quotaForm.value.sick !== leaveStore.leaveQuota.sick ||
    quotaForm.value.personal !== leaveStore.leaveQuota.personal ||
    quotaForm.value.vacation !== leaveStore.leaveQuota.vacation
})

const handleSaveQuota = async () => {
  savingQuota.value = true
  quotaSaved.value = false
  const success = await leaveStore.updateLeaveQuota(quotaForm.value)
  savingQuota.value = false
  if (success) {
    quotaSaved.value = true
    setTimeout(() => { quotaSaved.value = false }, 3000)
  }
}

// --- Individual Quota Management ---
const showIndividualQuotaDialog = ref(false)
const iqSelectedUser = ref(null)
const iqUserQuota = ref(null) // null = global, object = individual
const iqForm = ref({ sick: 30, personal: 10, vacation: 6 })
const iqSaving = ref(false)
const iqSaved = ref(false)
const iqFilteredUsers = ref([])

const openIndividualQuotaDialog = async () => {
  iqSelectedUser.value = null
  iqUserQuota.value = null
  iqSaved.value = false
  // Pre-load all profiles if not loaded yet
  if (authStore.allProfiles.length === 0) {
    await authStore.fetchAllProfiles()
  }
  iqFilteredUsers.value = authStore.allProfiles.map(p => ({
    ...p,
    email: p.id || p.email,
    displayLabel: `${p.firstName || ''} ${p.lastName || ''} (${p.id || p.email})`.trim()
  }))
  showIndividualQuotaDialog.value = true
}

const filterUsers = (val, update) => {
  update(() => {
    const needle = val.toLowerCase()
    iqFilteredUsers.value = authStore.allProfiles
      .map(p => ({
        ...p,
        email: p.id || p.email,
        displayLabel: `${p.firstName || ''} ${p.lastName || ''} (${p.id || p.email})`.trim()
      }))
      .filter(p =>
        p.displayLabel.toLowerCase().includes(needle) ||
        (p.department || '').toLowerCase().includes(needle)
      )
  })
}

const onSelectUser = async (email) => {
  if (!email) {
    iqUserQuota.value = null
    return
  }
  iqSaved.value = false
  const quota = await leaveStore.fetchUserIndividualQuota(email)
  iqUserQuota.value = quota
  if (quota) {
    iqForm.value = { sick: quota.sick, personal: quota.personal, vacation: quota.vacation }
  } else {
    // Default to global
    iqForm.value = {
      sick: leaveStore.leaveQuota.sick,
      personal: leaveStore.leaveQuota.personal,
      vacation: leaveStore.leaveQuota.vacation
    }
  }
}

const isIqChanged = computed(() => {
  if (!iqUserQuota.value) {
    // No individual quota yet: changed if different from global
    return iqForm.value.sick !== leaveStore.leaveQuota.sick ||
      iqForm.value.personal !== leaveStore.leaveQuota.personal ||
      iqForm.value.vacation !== leaveStore.leaveQuota.vacation
  }
  return iqForm.value.sick !== iqUserQuota.value.sick ||
    iqForm.value.personal !== iqUserQuota.value.personal ||
    iqForm.value.vacation !== iqUserQuota.value.vacation
})

const handleSaveIndividualQuota = async () => {
  if (!iqSelectedUser.value) return
  iqSaving.value = true
  iqSaved.value = false
  const success = await leaveStore.setUserIndividualQuota(iqSelectedUser.value, iqForm.value)
  iqSaving.value = false
  if (success) {
    iqUserQuota.value = { ...iqForm.value }
    iqSaved.value = true
    setTimeout(() => { iqSaved.value = false }, 3000)
  }
}

const handleResetToGlobal = async () => {
  if (!iqSelectedUser.value) return
  const success = await leaveStore.resetUserToGlobalQuota(iqSelectedUser.value)
  if (success) {
    iqUserQuota.value = null
    iqForm.value = {
      sick: leaveStore.leaveQuota.sick,
      personal: leaveStore.leaveQuota.personal,
      vacation: leaveStore.leaveQuota.vacation
    }
    iqSaved.value = true
    setTimeout(() => { iqSaved.value = false }, 3000)
  }
}

const form = ref({
  firstName: '',
  lastName: '',
  leaveType: '',
  durationType: 'full_day',
  customStartTime: '09:00',
  customEndTime: '12:00',
  startDate: '',
  endDate: '',
  details: ''
})

// Show approval section for head, hr, super_admin
const showApprovalSection = computed(() => {
  const role = authStore.profile.role
  return role === 'head' || role === 'hr' || role === 'super_admin'
})

// Fill name from profile (reactive - works even if profile loads late)
const fillNameFromProfile = () => {
  if (authStore.profile.firstName || authStore.profile.lastName) {
    form.value.firstName = authStore.profile.firstName || ''
    form.value.lastName = authStore.profile.lastName || ''
  } else {
    const displayName = authStore.user?.displayName || ''
    if (displayName) {
      const parts = displayName.split(' ')
      form.value.firstName = parts[0] || ''
      form.value.lastName = parts.slice(1).join(' ') || ''
    }
  }
}

// Watch leave dates to ensure holidays are loaded for the correct year(s)
watch([() => form.value.startDate, () => form.value.endDate], async ([startDate, endDate]) => {
  if (!startDate) return
  const startYear = parseInt(startDate.split('-')[0])
  const endYear = endDate ? parseInt(endDate.split('-')[0]) : startYear

  if (startYear !== endYear) {
    await holidayStore.fetchHolidaysMultiYear([startYear, endYear])
  } else if (holidayStore.loadedYear !== startYear) {
    await holidayStore.fetchHolidays(startYear)
  }
})

// Watch profile changes to fill name when profile finishes loading
const approvalsFetched = ref(false)

watch(() => authStore.profile, async () => {
  if (!form.value.firstName && !form.value.lastName) {
    fillNameFromProfile()
  }
  // Fetch pending approvals when profile (role) loads
  if (showApprovalSection.value && !approvalsFetched.value) {
    approvalsFetched.value = true
    await leaveStore.fetchPendingApprovals()
  }
}, { deep: true })

onMounted(async () => {
  fillNameFromProfile()

  // Set default date to today
  const today = new Date()
  form.value.startDate = leaveStore.getDateStr(today)
  form.value.endDate = leaveStore.getDateStr(today)

  await Promise.all([
    leaveStore.fetchMyLeaves(),
    leaveStore.fetchLeaveQuota(),
    leaveStore.fetchMyIndividualQuota(),
    holidayStore.fetchHolidays(new Date().getFullYear())
  ])

  // Initialize quota form from loaded values
  quotaForm.value = {
    sick: leaveStore.leaveQuota.sick,
    personal: leaveStore.leaveQuota.personal,
    vacation: leaveStore.leaveQuota.vacation
  }

  // Fetch pending approvals if user has approval rights
  if (showApprovalSection.value && !approvalsFetched.value) {
    approvalsFetched.value = true
    await leaveStore.fetchPendingApprovals()
  }
})

// Work hour options for time picker (9-17)
const workHourOptions = [9, 10, 11, 12, 13, 14, 15, 16, 17]

// Whether duration selector should be shown (sick/personal/other only; vacation, maternity & unpaid are always full-day)
const showDurationSelector = computed(() => {
  const t = form.value.leaveType
  return t === 'sick' || t === 'personal' || t === 'other'
})

// Whether current selection is partial day
const isPartialDay = computed(() => {
  return form.value.durationType !== 'full_day' && showDurationSelector.value
})

// Custom hours/days preview
const customHoursPreview = computed(() => {
  if (form.value.durationType !== 'custom') return 0
  return leaveStore.calcCustomHours(form.value.customStartTime, form.value.customEndTime)
})

const customDaysPreview = computed(() => {
  if (customHoursPreview.value <= 0) return 0
  return Math.round((customHoursPreview.value / leaveStore.WORK_HOURS_PER_DAY) * 100) / 100
})

// Check if custom time range overlaps lunch
const hasLunchDeduction = computed(() => {
  if (form.value.durationType !== 'custom') return false
  const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m }
  const s = toMin(form.value.customStartTime || '09:00')
  const e = toMin(form.value.customEndTime || '12:00')
  return s < 13 * 60 && e > 12 * 60
})

// Computed: leave totals (hours + days)
const leaveCalc = computed(() => {
  if (!form.value.startDate) return { totalHours: 0, totalDays: 0 }
  const effectiveEnd = isPartialDay.value ? form.value.startDate : (form.value.endDate || form.value.startDate)
  return leaveStore.calcLeaveTotals(
    showDurationSelector.value ? form.value.durationType : 'full_day',
    form.value.startDate,
    effectiveEnd,
    form.value.customStartTime,
    form.value.customEndTime
  )
})

const leaveDays = computed(() => leaveCalc.value.totalDays)
const leaveHours = computed(() => leaveCalc.value.totalHours)

// Computed: holidays that fall within the selected leave date range
const holidaysInRange = computed(() => {
  if (!form.value.startDate) return []
  const effectiveEnd = isPartialDay.value ? form.value.startDate : (form.value.endDate || form.value.startDate)
  return holidayStore.getHolidaysInRange(form.value.startDate, effectiveEnd)
})

// Format a holiday date for display (short)
const formatHolidayDateShort = (dateStr) => {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })
}

// Computed: form valid
const isFormValid = computed(() => {
  const base = form.value.firstName.trim() &&
    form.value.lastName.trim() &&
    form.value.leaveType &&
    form.value.startDate

  if (!base) return false

  if (isPartialDay.value) {
    // Partial day: only need start date
    if (form.value.durationType === 'custom') {
      return form.value.customStartTime && form.value.customEndTime &&
        form.value.customStartTime < form.value.customEndTime &&
        customHoursPreview.value > 0
    }
    return true
  }

  // Full day: need both dates
  return form.value.endDate && form.value.startDate <= form.value.endDate
})

// Select leave type handler
const selectLeaveType = (type) => {
  form.value.leaveType = type
  // Reset to full_day if vacation, maternity or unpaid (always full-day leave)
  if (type === 'vacation' || type === 'maternity' || type === 'unpaid') {
    form.value.durationType = 'full_day'
  }
}

// Select duration type handler
const selectDurationType = (type) => {
  form.value.durationType = type
  // Sync end date for partial day
  if (type !== 'full_day') {
    form.value.endDate = form.value.startDate
  }
}

// Format days for display (remove unnecessary decimals)
const formatDays = (days) => {
  if (days === Math.floor(days)) return days
  return Math.round(days * 100) / 100
}

// Helpers
const getTypeInfo = (type) => {
  return leaveStore.leaveTypes.find(t => t.value === type) || { icon: '📄', label: type, color: '#9e9e9e' }
}

const getStatusInfo = (status) => {
  return leaveStore.statusLabels[status] || { label: status, color: '#9e9e9e', icon: 'info' }
}

const calcDays = (start, end) => {
  return leaveStore.calcBusinessDays(start, end)
}

// Get display days for a leave record (use totalDays if available)
const getDisplayDays = (leave) => {
  if (leave.totalDays !== undefined && leave.totalDays !== null) {
    return formatDays(leave.totalDays)
  }
  return calcDays(leave.startDate, leave.endDate)
}

// Get duration label for display
const getDurationLabel = (leave) => {
  if (!leave.durationType || leave.durationType === 'full_day') return ''
  const dt = leaveStore.durationTypes.find(d => d.value === leave.durationType)
  if (leave.durationType === 'custom' && leave.customStartTime && leave.customEndTime) {
    return `${leave.customStartTime}-${leave.customEndTime}`
  }
  return dt?.label || leave.durationType
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })
}

const isLeaveToday = (leave) => {
  if (!leave.startDate || !leave.endDate) return false
  if (leave.status === 'rejected' || leave.status === 'cancelled') return false
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  return leave.startDate <= todayStr && todayStr <= leave.endDate
}

const formatTimestamp = (timestamp) => {
  if (!timestamp) return ''
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }) +
    ' ' + date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
}

const exportToExcel = () => {
  const leaves = historyTab.value === 'my' ? leaveStore.myLeaves : leaveStore.teamLeaves
  if (!leaves || leaves.length === 0) return

  const rows = leaves.map(leave => {
    const typeInfo = getTypeInfo(leave.leaveType)
    const statusInfo = getStatusInfo(leave.status)
    const days = getDisplayDays(leave)
    const submitted = leave.submittedAt
      ? (leave.submittedAt.toDate ? leave.submittedAt.toDate() : new Date(leave.submittedAt))
      : null

    return {
      'ชื่อ-นามสกุล': `${leave.firstName || ''} ${leave.lastName || ''}`.trim(),
      'ประเภทการลา': typeInfo.label,
      'ช่วงเวลา': getDurationLabel(leave) || 'เต็มวัน',
      'วันที่เริ่ม': leave.startDate || '',
      'วันที่สิ้นสุด': leave.endDate || '',
      'ชั่วโมง': leave.totalHours ?? '',
      'จำนวนวัน': days,
      'เหตุผล': leave.details || '',
      'สถานะ': statusInfo.label,
      'แผนก': leave.department || '',
      'หัวหน้าอนุมัติ': leave.headApproval?.approvedByName || '-',
      'HR อนุมัติ': leave.hrApproval?.approvedByName || '-',
      'เหตุผลที่ไม่อนุมัติ': leave.rejectionReason || '-',
      'วันที่ส่ง': submitted ? submitted.toLocaleDateString('th-TH') + ' ' + submitted.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) : ''
    }
  })

  const ws = XLSX.utils.json_to_sheet(rows)

  // Auto column width
  const colWidths = Object.keys(rows[0]).map(key => {
    const maxLen = Math.max(key.length, ...rows.map(r => String(r[key] || '').length))
    return { wch: Math.min(maxLen + 2, 40) }
  })
  ws['!cols'] = colWidths

  const wb = XLSX.utils.book_new()
  const sheetName = historyTab.value === 'my' ? 'ประวัติการลาของฉัน' : 'ประวัติการลาทั้งหมด'
  XLSX.utils.book_append_sheet(wb, ws, sheetName)

  const today = new Date().toISOString().slice(0, 10)
  const filename = `leave-history-${historyTab.value}-${today}.xlsx`
  XLSX.writeFile(wb, filename)
}

const handleSubmit = async () => {
  formError.value = ''

  if (!isFormValid.value) {
    formError.value = 'กรุณากรอกข้อมูลให้ครบถ้วน'
    return
  }

  // Validate quota (skip for no-quota types: unpaid, maternity, other)
  if (!leaveStore.noQuotaTypes.includes(form.value.leaveType)) {
    const remaining = leaveStore.getRemainingDays(form.value.leaveType)
    if (remaining <= 0) {
      formError.value = `โควต้า${getTypeInfo(form.value.leaveType).label}หมดแล้ว ไม่สามารถส่งใบลาได้`
      return
    }
    if (leaveDays.value > remaining) {
      formError.value = `จำนวนวันลา (${leaveDays.value} วัน) เกินโควต้าคงเหลือ (${remaining} วัน)`
      return
    }
  }

  // Validate maternity leave: max 90 days per request
  if (form.value.leaveType === 'maternity' && leaveDays.value > 90) {
    formError.value = 'ลาคลอดครั้งละไม่เกิน 90 วัน'
    return
  }

  // Validate "other" leave: require details
  if (form.value.leaveType === 'other' && !form.value.details.trim()) {
    formError.value = 'กรุณาระบุรายละเอียดสำหรับการลาอื่นๆ'
    return
  }

  const effectiveDurationType = showDurationSelector.value ? form.value.durationType : 'full_day'
  const effectiveEndDate = isPartialDay.value ? form.value.startDate : form.value.endDate

  const success = await leaveStore.submitLeave({
    firstName: form.value.firstName,
    lastName: form.value.lastName,
    leaveType: form.value.leaveType,
    startDate: form.value.startDate,
    endDate: effectiveEndDate,
    details: form.value.details,
    durationType: effectiveDurationType,
    customStartTime: effectiveDurationType === 'custom' ? form.value.customStartTime : null,
    customEndTime: effectiveDurationType === 'custom' ? form.value.customEndTime : null
  })

  if (success) {
    // Notify approvers (skip for sick leave which is auto-approved)
    if (form.value.leaveType !== 'sick') {
      const leaveLabel = getTypeInfo(form.value.leaveType).label
      const senderName = authStore.fullName
      const dept = authStore.profile.department
      const userRole = authStore.profile.role

      const currentUserEmail = authStore.user?.email
      let recipients = []
      if (userRole === 'head' || userRole === 'super_admin' || authStore.profile.skipHeadApproval) {
        // Head/super_admin/skipHeadApproval skip head approval → notify HR + super_admin
        recipients = authStore.allProfiles.filter(p => p.role === 'hr' || p.role === 'super_admin')
      } else {
        // Employee → notify department head + super_admin
        recipients = authStore.allProfiles.filter(p =>
          (p.role === 'head' && p.department === dept) || p.role === 'super_admin'
        )
      }
      // Exclude self from recipients to avoid self-notification
      recipients = recipients.filter(r => (r.email || r.id) !== currentUserEmail)

      for (const r of recipients) {
        await notificationsStore.createNotification({
          recipientEmail: r.email || r.id,
          type: 'leave_submitted',
          title: 'มีใบลาใหม่รออนุมัติ',
          message: `${senderName} ขอ${leaveLabel} วันที่ ${form.value.startDate}${form.value.startDate !== (isPartialDay.value ? form.value.startDate : form.value.endDate) ? ' ถึง ' + form.value.endDate : ''}`
        })
      }
    }

    lastSubmittedType.value = form.value.leaveType
    showSuccess.value = true
  } else {
    formError.value = leaveStore.error || 'เกิดข้อผิดพลาด กรุณาลองใหม่'
  }
}

const resetForm = () => {
  showSuccess.value = false
  form.value.leaveType = ''
  form.value.durationType = 'full_day'
  form.value.customStartTime = '09:00'
  form.value.customEndTime = '12:00'
  form.value.details = ''
  const today = new Date()
  form.value.startDate = leaveStore.getDateStr(today)
  form.value.endDate = leaveStore.getDateStr(today)
}

const handleCancel = async (id) => {
  const success = await leaveStore.cancelLeave(id)
  if (!success && leaveStore.error) {
    formError.value = leaveStore.error
    await leaveStore.fetchMyLeaves()
  }
}

// Admin cancel (HR / super_admin)
const canAdminCancel = computed(() => {
  const role = authStore.profile.role
  return role === 'hr' || role === 'super_admin'
})

const openAdminCancelDialog = (leave) => {
  adminCancellingLeave.value = leave
  adminCancelReason.value = ''
  showAdminCancelDialog.value = true
}

const handleAdminCancel = async () => {
  if (!adminCancellingLeave.value) return
  const success = await leaveStore.adminCancelLeave(adminCancellingLeave.value.id, adminCancelReason.value)
  if (success) {
    // Notify the employee
    await notificationsStore.createNotification({
      recipientEmail: adminCancellingLeave.value.userId,
      type: 'leave_cancelled',
      title: 'ใบลาถูกยกเลิก',
      message: `ใบลา${getTypeInfo(adminCancellingLeave.value.leaveType).label}ของคุณ (${formatDate(adminCancellingLeave.value.startDate)}${adminCancellingLeave.value.startDate !== adminCancellingLeave.value.endDate ? ' — ' + formatDate(adminCancellingLeave.value.endDate) : ''}) ถูกยกเลิกโดย ${authStore.fullName}${adminCancelReason.value ? ' เหตุผล: ' + adminCancelReason.value : ''} — โควต้าได้คืนแล้ว`
    })

    showAdminCancelDialog.value = false
    adminCancellingLeave.value = null
    adminCancelReason.value = ''

    // Refresh data
    await leaveStore.fetchTeamLeaves()
  }
}

// ====== Revoke Approval ======
const showRevokeDialog = ref(false)
const revokingLeave = ref(null)
const revokeReason = ref('')
const revokeType = ref('') // 'head' or 'hr'

// Can head/hr/super_admin revoke head approval on this leave?
const canHeadRevoke = (leave) => {
  const role = authStore.profile.role
  if (role !== 'head' && role !== 'hr' && role !== 'super_admin') return false
  if (leave.status !== 'pending_hr') return false
  return !!leave.headApproval
}

// Can HR/super_admin revoke HR approval on this leave?
const canHrRevoke = (leave) => {
  const role = authStore.profile.role
  if (role !== 'hr' && role !== 'super_admin') return false
  if (leave.status !== 'approved') return false
  return !!leave.hrApproval
}

const openRevokeDialog = (leave, type) => {
  revokingLeave.value = leave
  revokeReason.value = ''
  revokeType.value = type
  showRevokeDialog.value = true
}

const handleRevoke = async () => {
  if (!revokingLeave.value) return
  let success = false

  if (revokeType.value === 'head') {
    success = await leaveStore.headRevokeApproval(revokingLeave.value.id, revokeReason.value)
  } else if (revokeType.value === 'hr') {
    success = await leaveStore.hrRevokeApproval(revokingLeave.value.id, revokeReason.value)
  }

  if (success) {
    const leave = revokingLeave.value
    const revokerRole = revokeType.value === 'head' ? 'หัวหน้า' : 'HR'
    await notificationsStore.createNotification({
      recipientEmail: leave.userId,
      type: 'leave_rejected',
      title: 'การอนุมัติใบลาถูกถอน',
      message: `ใบลา${getTypeInfo(leave.leaveType).label}ของคุณ (${formatDate(leave.startDate)}${leave.startDate !== leave.endDate ? ' — ' + formatDate(leave.endDate) : ''}) ถูกถอนอนุมัติโดย${revokerRole} ${authStore.fullName}${revokeReason.value ? ' เหตุผล: ' + revokeReason.value : ''}`
    })

    showRevokeDialog.value = false
    revokingLeave.value = null
    revokeReason.value = ''
    revokeType.value = ''

    await leaveStore.fetchTeamLeaves()
    await leaveStore.fetchMyLeaves()
  }
}

const refreshApprovals = async () => {
  await leaveStore.fetchPendingApprovals()
}

const refreshHistory = async () => {
  if (historyTab.value === 'my') {
    await leaveStore.fetchMyLeaves()
  } else {
    await leaveStore.fetchTeamLeaves()
  }
}

const switchToTeam = async () => {
  historyTab.value = 'team'
  if (leaveStore.teamLeaves.length === 0) {
    await leaveStore.fetchTeamLeaves()
  }
}

// Approval handlers
const handleApprove = async (leave) => {
  const role = authStore.profile.role
  let success = false

  if (leave.status === 'pending_head' && (role === 'head' || role === 'super_admin')) {
    // Head step: pending_head -> pending_hr (super_admin also approves as head role)
    success = await leaveStore.headApprove(leave.id)
    if (success) {
      // แจ้งพนักงานเจ้าของใบลา
      await notificationsStore.createNotification({
        recipientEmail: leave.userId,
        type: 'leave_approved',
        title: 'หัวหน้าอนุมัติใบลา',
        message: `ใบลา${getTypeInfo(leave.leaveType).label}ของคุณได้รับการอนุมัติจากหัวหน้าแล้ว รอ HR อนุมัติ`
      })
      // แจ้ง HR ว่ามีใบลาใหม่รออนุมัติ
      const hrRecipients = authStore.allProfiles.filter(p => p.role === 'hr')
      for (const hr of hrRecipients) {
        await notificationsStore.createNotification({
          recipientEmail: hr.email || hr.id,
          type: 'leave_submitted',
          title: 'มีใบลารอ HR อนุมัติ',
          message: `ใบลา${getTypeInfo(leave.leaveType).label}ของ ${leave.firstName} ${leave.lastName} ผ่านการอนุมัติจากหัวหน้าแล้ว รอ HR อนุมัติ`
        })
      }
    }
  } else if (leave.status === 'pending_hr' && role === 'hr') {
    // Final step: only HR can do final approval
    success = await leaveStore.hrApprove(leave.id)
    if (success) {
      await notificationsStore.createNotification({
        recipientEmail: leave.userId,
        type: 'leave_approved',
        title: 'ใบลาอนุมัติแล้ว',
        message: `ใบลา${getTypeInfo(leave.leaveType).label}ของคุณได้รับการอนุมัติแล้ว`
      })
    }
  }

  // Auto re-fetch history to keep data up-to-date
  if (success) {
    await leaveStore.fetchMyLeaves()
    if (leaveStore.teamLeaves.length > 0) {
      await leaveStore.fetchTeamLeaves()
    }
  }
}

const openRejectDialog = (leave) => {
  rejectingLeave.value = leave
  rejectReason.value = ''
  showRejectDialog.value = true
}

const handleReject = async () => {
  if (!rejectingLeave.value) return
  const success = await leaveStore.rejectLeave(rejectingLeave.value.id, rejectReason.value)
  if (success) {
    // Notify the employee
    await notificationsStore.createNotification({
      recipientEmail: rejectingLeave.value.userId,
      type: 'leave_rejected',
      title: 'ใบลาไม่อนุมัติ',
      message: `ใบลา${getTypeInfo(rejectingLeave.value.leaveType).label}ของคุณไม่ได้รับการอนุมัติ${rejectReason.value ? ': ' + rejectReason.value : ''}`
    })
    showRejectDialog.value = false
    rejectingLeave.value = null
    rejectReason.value = ''

    // Auto re-fetch history to keep data up-to-date
    await leaveStore.fetchMyLeaves()
    if (leaveStore.teamLeaves.length > 0) {
      await leaveStore.fetchTeamLeaves()
    }
  }
}
</script>

<style scoped>
.leave-page {
  background: transparent;
  min-height: 100vh;
  padding: 24px;
}

.leave-container {
  max-width: 1000px;
  margin: 0 auto;
}

/* ====== Header ====== */
.leave-page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.leave-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.leave-header-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(255, 183, 77, 0.12);
  color: #ffb74d;
  display: flex;
  align-items: center;
  justify-content: center;
}

.leave-header-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #e0e1e4;
}

.leave-header-subtitle {
  font-size: 0.72rem;
  color: #6b6c6f;
  margin-top: 2px;
}

.leave-header-right {
  display: flex;
  align-items: center;
  gap: 6px;
}

.leave-back-btn {
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

.leave-back-btn:hover {
  border-color: rgba(92, 156, 230, 0.3);
  color: #5c9ce6;
}

/* ====== Grid ====== */
.leave-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

/* ====== Card ====== */
.leave-card {
  background: rgba(30, 33, 36, 0.7);
  border: 1px solid rgba(58, 59, 62, 0.3);
  border-radius: 14px;
  backdrop-filter: blur(10px);
  overflow: hidden;
}

.leave-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 16px;
  border-bottom: 1px solid rgba(58, 59, 62, 0.2);
}

.leave-card-title {
  font-size: 0.82rem;
  font-weight: 700;
  color: #cecfd2;
}

.leave-pending-badge {
  background: rgba(255, 183, 77, 0.15) !important;
  color: #ffb74d !important;
  font-size: 0.58rem !important;
}

/* ====== Success State ====== */
.leave-success {
  padding: 40px 24px;
  text-align: center;
}

.leave-success-icon { font-size: 2.5rem; margin-bottom: 10px; }
.leave-success-title { font-size: 1rem; font-weight: 700; color: #66bb6a; margin-bottom: 4px; }
.leave-success-desc { font-size: 0.75rem; color: #6b6c6f; margin-bottom: 20px; }

.leave-new-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  border-radius: 8px;
  border: 1px dashed rgba(92, 156, 230, 0.3);
  background: transparent;
  color: #5c9ce6;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.leave-new-btn:hover {
  background: rgba(92, 156, 230, 0.08);
  border-color: rgba(92, 156, 230, 0.5);
}

/* ====== Form ====== */
.leave-form-body { padding: 16px; }

.leave-form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.leave-field { margin-bottom: 14px; }

.leave-field-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: #9e9e9e;
  margin-bottom: 6px;
}

.leave-required { color: #ef5350; }

.leave-profile-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  color: #5c9ce6;
  margin-bottom: 4px;
  opacity: 0.85;
}

.leave-input[readonly] {
  opacity: 0.7;
  cursor: default;
  background: rgba(30, 33, 36, 0.3);
}

.leave-input {
  width: 100%;
  padding: 9px 12px;
  border-radius: 8px;
  border: 1px solid rgba(58, 59, 62, 0.4);
  background: rgba(30, 33, 36, 0.6);
  color: #cecfd2;
  font-size: 0.82rem;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.leave-input:focus { border-color: rgba(92, 156, 230, 0.5); }
.leave-input::placeholder { color: #4b5563; }
.leave-date-input { color-scheme: dark; }

.leave-time-picker {
  font-variant-numeric: tabular-nums;
}

.leave-time-picker .q-field__control {
  background: rgba(30, 33, 36, 0.6) !important;
  border: 1px solid rgba(58, 59, 62, 0.4) !important;
  border-radius: 8px !important;
  min-height: 38px !important;
  padding: 0 10px !important;
}

.leave-time-picker .q-field__control::before,
.leave-time-picker .q-field__control::after {
  border: none !important;
}

.leave-time-picker .q-field__native {
  color: #cecfd2 !important;
  font-size: 0.82rem !important;
  font-family: inherit !important;
}

.leave-time-picker .q-field__control:hover {
  border-color: rgba(92, 156, 230, 0.5) !important;
}

/* ====== Leave Type ====== */
.leave-type-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.leave-type-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 6px;
  border-radius: 10px;
  border: 1px solid rgba(58, 59, 62, 0.3);
  background: rgba(36, 37, 40, 0.4);
  cursor: pointer;
  transition: all 0.2s ease;
}

.leave-type-btn:hover {
  border-color: rgba(255, 183, 77, 0.3);
  background: rgba(255, 183, 77, 0.05);
}

.leave-type-btn.leave-type-selected {
  border-color: rgba(255, 183, 77, 0.5);
  background: rgba(255, 183, 77, 0.1);
  box-shadow: 0 0 12px rgba(255, 183, 77, 0.08);
}

.leave-type-icon { font-size: 1.5rem; }
.leave-type-label { font-size: 0.68rem; color: #9e9e9e; font-weight: 600; }
.leave-type-selected .leave-type-label { color: #ffb74d; }

.leave-type-btn:disabled,
.leave-type-btn.leave-type-disabled {
  opacity: 0.45;
  cursor: not-allowed;
  border-color: rgba(58, 59, 62, 0.2);
  background: rgba(36, 37, 40, 0.2);
}

.leave-type-btn:disabled:hover {
  border-color: rgba(58, 59, 62, 0.2);
  background: rgba(36, 37, 40, 0.2);
}

.leave-type-remaining {
  font-size: 0.58rem;
  color: #6b6c6f;
  font-weight: 500;
}

.leave-type-selected .leave-type-remaining {
  color: rgba(255, 183, 77, 0.7);
}

.leave-type-no-quota {
  font-size: 0.58rem;
  color: #ef5350;
  font-weight: 600;
}

/* ====== Quota Summary Cards ====== */
.leave-quota-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.leave-quota-card {
  background: rgba(30, 33, 36, 0.7);
  border: 1px solid rgba(58, 59, 62, 0.3);
  border-radius: 12px;
  padding: 14px 16px;
  transition: border-color 0.2s;
}

.leave-quota-card:hover {
  border-color: rgba(58, 59, 62, 0.5);
}

.leave-quota-exhausted {
  border-color: rgba(239, 83, 80, 0.3);
  background: rgba(239, 83, 80, 0.04);
}

.leave-quota-card-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}

.leave-quota-card-icon { font-size: 1rem; }

.leave-quota-card-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #cecfd2;
}

.leave-quota-badge-empty {
  margin-left: auto;
  font-size: 0.6rem;
  font-weight: 700;
  color: #ef5350;
  background: rgba(239, 83, 80, 0.12);
  padding: 2px 7px;
  border-radius: 4px;
}

.leave-quota-card-numbers {
  display: flex;
  align-items: baseline;
  gap: 2px;
  margin-bottom: 6px;
}

.leave-quota-used {
  font-size: 1.2rem;
  font-weight: 700;
  color: #e0e1e4;
}

.leave-quota-sep {
  font-size: 0.85rem;
  color: #4b5563;
  margin: 0 2px;
}

.leave-quota-total {
  font-size: 0.85rem;
  font-weight: 600;
  color: #6b6c6f;
}

.leave-quota-unit {
  font-size: 0.68rem;
  color: #4b5563;
  margin-left: 4px;
}

.leave-quota-bar {
  height: 4px;
  border-radius: 2px;
  background: rgba(58, 59, 62, 0.3);
  overflow: hidden;
  margin-bottom: 6px;
}

.leave-quota-bar-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.4s ease;
}

.leave-quota-remaining {
  font-size: 0.65rem;
  color: #6b6c6f;
}

.leave-quota-remaining strong {
  color: #9ca3af;
}

/* ====== Quota Settings Button ====== */
.leave-quota-settings-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid rgba(58, 59, 62, 0.4);
  background: transparent;
  color: #ab47bc;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;
}

.leave-quota-settings-btn:hover {
  background: rgba(171, 71, 188, 0.1);
  border-color: rgba(171, 71, 188, 0.3);
}

/* ====== Quota Dialog ====== */
.quota-dialog-card {
  background: #1e2124;
  border: 1px solid rgba(58, 59, 62, 0.4);
  border-radius: 14px;
  min-width: 400px;
  max-width: 480px;
}

.quota-dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px 8px;
}

.quota-dialog-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.quota-dialog-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #e0e1e4;
}

.quota-dialog-body {
  padding: 8px 20px 12px;
}

.quota-dialog-fields {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 12px;
}

.quota-dialog-field {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.quota-dialog-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #cecfd2;
}

.quota-dialog-unit {
  font-size: 0.62rem;
  color: #4b5563;
  font-weight: 400;
}

.quota-dialog-field .leave-quota-input {
  width: 90px;
  text-align: center;
  font-weight: 600;
}

.quota-dialog-meta {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.65rem;
  color: #4b5563;
  margin-bottom: 4px;
}

.quota-dialog-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding: 8px 20px 16px;
}

.leave-quota-input {
  text-align: center;
  font-weight: 600;
}

.leave-quota-save-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 18px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #ab47bc 0%, #8e24aa 100%);
  color: white;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.leave-quota-save-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(171, 71, 188, 0.3);
}

.leave-quota-save-btn:disabled {
  opacity: 0.4;
  cursor: default;
}

.leave-quota-saved {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
  font-size: 0.72rem;
  color: #66bb6a;
}

/* ====== Days Preview ====== */
.leave-days-preview {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  flex-wrap: wrap;
  border-radius: 8px;
  background: rgba(66, 165, 245, 0.08);
  border: 1px solid rgba(66, 165, 245, 0.15);
  font-size: 0.75rem;
  color: #42a5f5;
  margin-bottom: 14px;
}

.leave-days-preview strong { font-weight: 800; }

.leave-days-warning {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #ef5350;
  font-size: 0.7rem;
  font-weight: 600;
  margin-left: 4px;
}

/* ====== Holidays Notice ====== */
.leave-holidays-notice {
  padding: 10px 14px;
  border-radius: 8px;
  background: rgba(102, 187, 106, 0.08);
  border: 1px solid rgba(102, 187, 106, 0.18);
  margin-bottom: 14px;
}

.leave-holidays-notice-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  font-weight: 600;
  color: #66bb6a;
  margin-bottom: 8px;
}

.leave-holidays-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.leave-holiday-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 6px;
  background: rgba(102, 187, 106, 0.12);
  font-size: 0.72rem;
}

.leave-holiday-chip-date {
  font-weight: 700;
  color: #66bb6a;
}

.leave-holiday-chip-name {
  color: #9ca3af;
}

/* ====== Textarea ====== */
.leave-textarea {
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

.leave-textarea:focus { border-color: rgba(92, 156, 230, 0.5); }
.leave-textarea::placeholder { color: #4b5563; }
.leave-char-count { text-align: right; font-size: 0.6rem; color: #4b5563; margin-top: 3px; }

/* ====== Error ====== */
.leave-error {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 8px;
  background: rgba(239, 83, 80, 0.08);
  border: 1px solid rgba(239, 83, 80, 0.15);
  font-size: 0.75rem;
  color: #ef5350;
  margin-bottom: 14px;
}

/* ====== Submit ====== */
.leave-submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 12px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, #ef6c00, #ffb74d);
  color: #fff;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 4px 16px rgba(255, 152, 0, 0.2);
}

.leave-submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 24px rgba(255, 152, 0, 0.3);
}

.leave-submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* ====== History Header ====== */
.leave-history-header {
  flex-wrap: wrap;
}

.leave-history-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.leave-history-controls {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
}

/* ====== Tabs ====== */
.leave-tabs {
  display: flex;
  background: rgba(36, 37, 40, 0.6);
  border-radius: 8px;
  padding: 2px;
}

.leave-tab {
  padding: 5px 14px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: #6b6c6f;
  font-size: 0.7rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.leave-tab:hover { color: #9e9e9e; }
.leave-tab-active { background: rgba(92, 156, 230, 0.12); color: #5c9ce6; }

.leave-refresh-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: 1px solid rgba(58, 59, 62, 0.3);
  background: transparent;
  color: #6b6c6f;
  cursor: pointer;
  transition: all 0.2s;
  margin-left: 6px;
}

.leave-refresh-btn:hover:not(:disabled) {
  border-color: rgba(92, 156, 230, 0.3);
  color: #5c9ce6;
}

.leave-refresh-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.leave-spin {
  animation: leave-spin-anim 0.8s linear infinite;
}

@keyframes leave-spin-anim {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.leave-export-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border-radius: 8px;
  border: 1px solid rgba(76, 175, 80, 0.25);
  background: rgba(76, 175, 80, 0.08);
  color: #66bb6a;
  font-size: 0.7rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-left: 6px;
}

.leave-export-btn:hover:not(:disabled) {
  background: rgba(76, 175, 80, 0.18);
  border-color: rgba(76, 175, 80, 0.4);
}

.leave-export-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

/* ====== History List ====== */
.leave-history-list {
  max-height: calc(100vh - 240px);
  overflow-y: auto;
  padding: 4px 0;
}

.leave-history-list::-webkit-scrollbar { width: 3px; }
.leave-history-list::-webkit-scrollbar-thumb { background: rgba(58, 59, 62, 0.3); border-radius: 2px; }

.leave-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 48px 20px;
  color: #4a4b4e;
  font-size: 0.78rem;
}

/* ====== History Item ====== */
.leave-history-item {
  padding: 14px 16px;
  border-bottom: 1px solid rgba(58, 59, 62, 0.12);
  transition: background 0.15s;
}

.leave-today-item {
  background: rgba(66, 165, 245, 0.04);
  border-left: 3px solid #42a5f5;
}

.leave-today-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 6px;
  background: rgba(66, 165, 245, 0.12);
  color: #42a5f5;
  font-size: 0.58rem;
  font-weight: 700;
}

.leave-history-item:hover { background: rgba(58, 59, 62, 0.08); }

.leave-history-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.leave-history-type { display: flex; align-items: center; gap: 6px; }
.leave-history-type-icon { font-size: 0.9rem; }
.leave-history-type-label { font-size: 0.75rem; font-weight: 700; color: #e0e1e4; }

.leave-history-status {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 0.62rem;
  font-weight: 700;
}

.leave-history-name { font-size: 0.78rem; font-weight: 600; color: #cecfd2; margin-bottom: 4px; }

.leave-history-dates {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.7rem;
  color: #9e9e9e;
  margin-bottom: 4px;
}

.leave-history-days { font-size: 0.62rem; color: #6b6c6f; }

.leave-history-details {
  font-size: 0.72rem;
  color: #6b6c6f;
  font-style: italic;
  margin-bottom: 6px;
  line-height: 1.4;
}

.leave-history-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.leave-history-submitted { font-size: 0.62rem; color: #4b5563; }

.leave-cancel-btn {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 3px 10px;
  border-radius: 6px;
  border: 1px solid rgba(239, 83, 80, 0.2);
  background: rgba(239, 83, 80, 0.06);
  color: #ef5350;
  font-size: 0.62rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.leave-cancel-btn:hover {
  background: rgba(239, 83, 80, 0.12);
  border-color: rgba(239, 83, 80, 0.4);
}

.leave-admin-cancel-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 6px;
  border: 1px solid rgba(239, 83, 80, 0.25);
  background: rgba(239, 83, 80, 0.06);
  color: #ef5350;
  font-size: 0.68rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.leave-admin-cancel-btn:hover {
  background: rgba(239, 83, 80, 0.14);
  border-color: rgba(239, 83, 80, 0.45);
}

.leave-revoke-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 6px;
  border: 1px solid rgba(255, 183, 77, 0.25);
  background: rgba(255, 183, 77, 0.06);
  color: #ffb74d;
  font-size: 0.68rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
}

.leave-revoke-btn:hover {
  background: rgba(255, 183, 77, 0.14);
  border-color: rgba(255, 183, 77, 0.45);
}

.leave-cancel-trail {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.68rem;
  color: #ef5350;
  margin-top: 4px;
}

.admin-cancel-quota-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 8px;
  background: rgba(66, 165, 245, 0.06);
  border: 1px solid rgba(66, 165, 245, 0.12);
  font-size: 0.75rem;
  color: #42a5f5;
  margin-bottom: 12px;
}

/* ====== Approval Section ====== */
.leave-approval-card {
  margin-bottom: 20px;
}

.leave-approval-badge {
  background: rgba(206, 147, 216, 0.15) !important;
  color: #ce93d8 !important;
  font-size: 0.58rem !important;
}

.leave-role-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 6px;
  background: rgba(206, 147, 216, 0.1);
  color: #ce93d8;
  font-size: 0.7rem;
  font-weight: 600;
}

.leave-approval-list {
  max-height: 400px;
  overflow-y: auto;
  padding: 4px 0;
}

.leave-approval-list::-webkit-scrollbar { width: 3px; }
.leave-approval-list::-webkit-scrollbar-thumb { background: rgba(58, 59, 62, 0.3); border-radius: 2px; }

.leave-approval-item {
  padding: 16px;
  border-bottom: 1px solid rgba(58, 59, 62, 0.12);
}

.leave-approval-item:last-child { border-bottom: none; }

.leave-approval-item-top {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.leave-approval-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.leave-approval-avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  overflow: hidden;
  background: linear-gradient(135deg, #ffb74d 0%, #ef6c00 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.82rem;
  font-weight: 700;
  flex-shrink: 0;
}

.leave-approval-info { flex: 1; min-width: 0; }
.leave-approval-name { font-size: 0.82rem; font-weight: 600; color: #e1e2e5; }
.leave-approval-email { font-size: 0.7rem; color: #6b6c6f; }

.leave-approval-detail-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 6px;
}

.leave-approval-type {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #cecfd2;
}

.leave-approval-dates {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.72rem;
  color: #9e9e9e;
}

.leave-approval-dept {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.7rem;
  color: #6b6c6f;
  margin-bottom: 6px;
}

.leave-approval-trail {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.7rem;
  color: #9e9e9e;
  margin-top: 4px;
  margin-bottom: 4px;
}

.leave-rejection-reason {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.7rem;
  color: #ef5350;
  margin-top: 4px;
  margin-bottom: 4px;
}

.leave-approval-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.leave-approve-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #66bb6a 0%, #43a047 100%);
  color: white;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.leave-approve-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 187, 106, 0.3);
}

.leave-approve-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.leave-reject-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 8px;
  border: 1px solid rgba(239, 83, 80, 0.3);
  background: transparent;
  color: #ef5350;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.leave-reject-btn:hover:not(:disabled) {
  background: rgba(239, 83, 80, 0.08);
  border-color: rgba(239, 83, 80, 0.5);
}

.leave-reject-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* ====== Reject Dialog ====== */
.reject-dialog-card {
  min-width: 420px;
  max-width: 500px;
  background: #1e2124 !important;
  border: 1px solid rgba(58, 59, 62, 0.5);
  border-radius: 14px !important;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5) !important;
}

.reject-dialog-title {
  font-size: 0.92rem;
  font-weight: 700;
  color: #ef5350;
}

.reject-leave-info {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
  font-size: 0.82rem;
  font-weight: 600;
  color: #e1e2e5;
}

.reject-leave-type {
  padding: 2px 8px;
  border-radius: 6px;
  background: rgba(255, 183, 77, 0.1);
  font-size: 0.75rem;
  color: #ffb74d;
}

.reject-leave-dates {
  font-size: 0.72rem;
  color: #9e9e9e;
  font-weight: 400;
}

.reject-field-label {
  display: block;
  font-size: 0.78rem;
  font-weight: 600;
  color: #9ca3af;
  margin-bottom: 6px;
}

.reject-textarea {
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
  box-sizing: border-box;
}

.reject-textarea:focus { border-color: rgba(239, 83, 80, 0.4); }
.reject-textarea::placeholder { color: #4b5563; }

.reject-cancel-btn {
  color: #9ca3af !important;
  font-size: 0.82rem;
}

.reject-confirm-btn {
  background: linear-gradient(135deg, #ef5350 0%, #c62828 100%) !important;
  color: white !important;
  font-weight: 600;
  font-size: 0.82rem;
  border-radius: 8px;
}

.revoke-confirm-btn {
  background: linear-gradient(135deg, #ffb74d 0%, #ff9800 100%) !important;
  color: #1a1a1a !important;
  font-weight: 700;
  font-size: 0.82rem;
  border-radius: 8px;
}

.revoke-warning-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 6px;
  background: rgba(255, 183, 77, 0.08);
  border: 1px solid rgba(255, 183, 77, 0.15);
  font-size: 0.75rem;
  color: #ffb74d;
  margin-bottom: 12px;
}

/* ====== View Toggle ====== */
.leave-view-toggle {
  display: flex;
  background: rgba(30, 33, 36, 0.6);
  border-radius: 6px;
  border: 1px solid rgba(58, 59, 62, 0.3);
  overflow: hidden;
}

.leave-view-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px 8px;
  border: none;
  background: transparent;
  color: #6b6c6f;
  cursor: pointer;
  transition: all 0.15s;
}

.leave-view-btn:hover {
  color: #9ca3af;
}

.leave-view-btn-active {
  background: rgba(92, 156, 230, 0.15);
  color: #5c9ce6;
}

/* ====== Calendar View ====== */
.leave-calendar {
  padding: 16px;
}

.leave-cal-nav {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.leave-cal-nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: 1px solid rgba(58, 59, 62, 0.3);
  background: transparent;
  color: #9ca3af;
  cursor: pointer;
  transition: all 0.15s;
}

.leave-cal-nav-btn:hover {
  background: rgba(58, 59, 62, 0.3);
  color: #e1e2e5;
}

.leave-cal-nav-title {
  flex: 1;
  text-align: center;
  font-size: 0.9rem;
  font-weight: 700;
  color: #e1e2e5;
}

.leave-cal-today-btn {
  padding: 4px 12px;
  border-radius: 6px;
  border: 1px solid rgba(92, 156, 230, 0.3);
  background: transparent;
  color: #5c9ce6;
  font-size: 0.72rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
}

.leave-cal-today-btn:hover {
  background: rgba(92, 156, 230, 0.1);
}

/* Legend */
.leave-cal-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 12px;
  padding: 8px 10px;
  background: rgba(30, 33, 36, 0.4);
  border-radius: 8px;
}

.leave-cal-legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.65rem;
  color: #9ca3af;
}

.leave-cal-legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* Grid */
.leave-cal-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.leave-cal-header {
  margin-bottom: 2px;
}

.leave-cal-dow {
  text-align: center;
  font-size: 0.68rem;
  font-weight: 700;
  color: #6b6c6f;
  padding: 6px 0;
}

.leave-cal-dow--weekend {
  color: #4b5563;
}

/* Day cells */
.leave-cal-body {
  gap: 2px;
}

.leave-cal-day {
  min-height: 52px;
  padding: 3px;
  border-radius: 6px;
  background: rgba(30, 33, 36, 0.3);
  cursor: default;
  transition: all 0.15s;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.leave-cal-day--has-event {
  cursor: pointer;
}

.leave-cal-day--has-event:hover {
  background: rgba(58, 59, 62, 0.3);
}

.leave-cal-day--outside {
  opacity: 0.3;
}

.leave-cal-day--today {
  outline: 1.5px solid rgba(92, 156, 230, 0.6);
  outline-offset: -1.5px;
  background: rgba(92, 156, 230, 0.06);
}

.leave-cal-day--weekend {
  background: rgba(22, 24, 26, 0.4);
}

.leave-cal-day--selected {
  outline: 1.5px solid rgba(255, 183, 77, 0.6);
  outline-offset: -1.5px;
  background: rgba(255, 183, 77, 0.06);
}

.leave-cal-day-num {
  font-size: 0.7rem;
  font-weight: 600;
  color: #9ca3af;
  line-height: 1;
  margin-bottom: 2px;
}

.leave-cal-day--today .leave-cal-day-num {
  color: #5c9ce6;
  font-weight: 800;
}

.leave-cal-day--outside .leave-cal-day-num {
  color: #4b5563;
}

/* Holiday dot */
.leave-cal-holiday-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #66bb6a;
  position: absolute;
  top: 4px;
  right: 4px;
}

/* Leave event pills */
.leave-cal-events {
  display: flex;
  flex-direction: column;
  gap: 1px;
  flex: 1;
  min-height: 0;
}

.leave-cal-event {
  display: flex;
  align-items: center;
  padding: 1px 3px;
  border-radius: 3px;
  font-size: 0.6rem;
  line-height: 1.2;
  overflow: hidden;
}

.leave-cal-event-icon {
  font-size: 0.55rem;
  line-height: 1;
}

.leave-cal-event-more {
  font-size: 0.55rem;
  color: #6b6c6f;
  text-align: center;
  font-weight: 700;
}

/* Selected Day Detail Panel */
.leave-cal-detail {
  margin-top: 12px;
  padding: 14px;
  background: rgba(30, 33, 36, 0.6);
  border: 1px solid rgba(58, 59, 62, 0.3);
  border-radius: 10px;
}

.leave-cal-detail-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  font-weight: 700;
  color: #e1e2e5;
  margin-bottom: 10px;
}

.leave-cal-detail-close {
  margin-left: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: #6b6c6f;
  cursor: pointer;
  transition: all 0.15s;
}

.leave-cal-detail-close:hover {
  background: rgba(58, 59, 62, 0.3);
  color: #9ca3af;
}

.leave-cal-detail-holiday {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  border-radius: 6px;
  background: rgba(102, 187, 106, 0.08);
  border: 1px solid rgba(102, 187, 106, 0.15);
  font-size: 0.78rem;
  font-weight: 600;
  color: #66bb6a;
  margin-bottom: 8px;
}

.leave-cal-detail-item {
  padding: 8px 10px;
  border-radius: 6px;
  background: rgba(22, 24, 26, 0.4);
  border: 1px solid rgba(58, 59, 62, 0.2);
  margin-bottom: 6px;
}

.leave-cal-detail-item:last-child {
  margin-bottom: 0;
}

.leave-cal-detail-type {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  color: #e1e2e5;
  margin-bottom: 4px;
}

.leave-cal-detail-dates {
  font-size: 0.75rem;
  color: #9ca3af;
  margin-bottom: 4px;
}

.leave-cal-detail-days {
  color: #6b6c6f;
}

.leave-cal-detail-status {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.72rem;
  font-weight: 600;
}

@media (max-width: 640px) {
  .leave-cal-day { min-height: 42px; }
  .leave-cal-legend { gap: 6px; }
  .leave-cal-event-icon { font-size: 0.5rem; }
}

/* ====== Duration Type Selector ====== */
.leave-duration-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
}

.leave-duration-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 10px 4px;
  border-radius: 8px;
  border: 1px solid rgba(58, 59, 62, 0.3);
  background: rgba(36, 37, 40, 0.4);
  cursor: pointer;
  transition: all 0.2s ease;
  color: #9e9e9e;
}

.leave-duration-btn:hover {
  border-color: rgba(66, 165, 245, 0.3);
  background: rgba(66, 165, 245, 0.05);
}

.leave-duration-btn.leave-duration-selected {
  border-color: rgba(66, 165, 245, 0.5);
  background: rgba(66, 165, 245, 0.1);
  color: #42a5f5;
}

.leave-duration-label {
  font-size: 0.68rem;
  font-weight: 600;
}

.leave-duration-hint {
  font-size: 0.55rem;
  color: #6b6c6f;
  font-weight: 400;
}

.leave-duration-selected .leave-duration-hint {
  color: rgba(66, 165, 245, 0.7);
}

/* ====== Custom Time Preview ====== */
.leave-custom-preview {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
  background: rgba(66, 165, 245, 0.06);
  border: 1px solid rgba(66, 165, 245, 0.12);
  font-size: 0.72rem;
  color: #42a5f5;
  margin-bottom: 14px;
}

.leave-lunch-note {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 0.62rem;
  color: #6b6c6f;
  margin-left: 6px;
}

.leave-cap-note {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 0.62rem;
  color: #ffb74d;
  margin-left: 6px;
}

/* ====== Duration Badge (in history/approval) ====== */
.leave-duration-badge {
  display: inline-flex;
  align-items: center;
  padding: 1px 7px;
  border-radius: 4px;
  background: rgba(66, 165, 245, 0.12);
  color: #42a5f5;
  font-size: 0.58rem;
  font-weight: 600;
  margin-left: 4px;
}

/* ====== Individual Quota Badge ====== */
.leave-quota-badge-individual {
  margin-left: auto;
  font-size: 0.58rem;
  font-weight: 600;
  color: #42a5f5;
  background: rgba(66, 165, 245, 0.1);
  padding: 2px 7px;
  border-radius: 4px;
}

/* ====== Individual Quota Button ====== */
.leave-individual-quota-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid rgba(58, 59, 62, 0.4);
  background: transparent;
  color: #42a5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;
  margin-right: 6px;
}

.leave-individual-quota-btn:hover {
  background: rgba(66, 165, 245, 0.1);
  border-color: rgba(66, 165, 245, 0.3);
}

/* ====== Individual Quota Dialog ====== */
.iq-user-select {
  font-size: 0.82rem;
}

.iq-user-select .q-field__control {
  background: rgba(30, 33, 36, 0.6) !important;
  border-color: rgba(58, 59, 62, 0.4) !important;
}

.iq-user-quota-section {
  padding: 12px;
  border-radius: 10px;
  background: rgba(36, 37, 40, 0.4);
  border: 1px solid rgba(58, 59, 62, 0.2);
}

.iq-quota-status {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.iq-badge-individual {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 6px;
  background: rgba(66, 165, 245, 0.12);
  color: #42a5f5;
  font-size: 0.7rem;
  font-weight: 600;
}

.iq-badge-global {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 6px;
  background: rgba(102, 187, 106, 0.12);
  color: #66bb6a;
  font-size: 0.7rem;
  font-weight: 600;
}

.iq-global-hint {
  font-size: 0.62rem;
  color: #4b5563;
  white-space: nowrap;
}

.leave-iq-reset-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 7px 14px;
  border-radius: 8px;
  border: 1px solid rgba(239, 83, 80, 0.25);
  background: rgba(239, 83, 80, 0.06);
  color: #ef5350;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.leave-iq-reset-btn:hover:not(:disabled) {
  background: rgba(239, 83, 80, 0.12);
  border-color: rgba(239, 83, 80, 0.4);
}

.leave-iq-reset-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* ====== Responsive ====== */
@media (max-width: 768px) {
  .leave-page { padding: 16px; }
  .leave-grid { grid-template-columns: 1fr; }
  .leave-form-row { grid-template-columns: 1fr; }
  .leave-page-header { flex-direction: column; align-items: flex-start; gap: 12px; }
  .leave-approval-actions { flex-direction: column; }
  .reject-dialog-card { min-width: 90vw; }
  .leave-quota-row { grid-template-columns: 1fr; }
  .quota-dialog-card { min-width: 90vw; }
  .leave-duration-grid { grid-template-columns: repeat(2, 1fr); }

  /* History header: stack title + controls */
  .leave-history-title-row {
    width: 100%;
  }

  .leave-history-controls {
    width: 100%;
    margin-left: 0;
    margin-top: 8px;
  }
}
</style>
