<template>
  <q-page class="admin-page">
    <div class="admin-container">
      <!-- Header -->
      <div class="admin-page-header">
        <div class="admin-header-left">
          <div class="admin-header-icon">
            <q-icon name="admin_panel_settings" size="26px" />
          </div>
          <div>
            <div class="admin-header-title">Admin Panel</div>
            <div class="admin-header-subtitle">จัดการผู้ใช้และแผนก</div>
          </div>
        </div>
        <div class="admin-header-right">
          <button class="admin-back-btn" @click="$router.back()">
            <q-icon name="arrow_back" size="18px" />
            <span>กลับ</span>
          </button>
        </div>
      </div>

      <!-- Tabs -->
      <div class="admin-tabs">
        <button class="admin-tab" :class="{ 'admin-tab-active': activeTab === 'users' }"
          @click="activeTab = 'users'">
          <q-icon name="people" size="18px" />
          <span>จัดการผู้ใช้</span>
          <q-badge v-if="authStore.allProfiles.length" :label="authStore.allProfiles.length" class="admin-tab-badge" />
        </button>
        <button class="admin-tab" :class="{ 'admin-tab-active': activeTab === 'departments' }"
          @click="activeTab = 'departments'">
          <q-icon name="business" size="18px" />
          <span>จัดการแผนก</span>
          <q-badge v-if="deptStore.departments.length" :label="deptStore.departments.length" class="admin-tab-badge" />
        </button>
        <button  class="admin-tab"
          :class="{ 'admin-tab-active': activeTab === 'import' }" @click="activeTab = 'import'">
          <q-icon name="upload_file" size="18px" />
          <span>นำเข้าข้อมูล</span>
        </button>
        <button  class="admin-tab"
          :class="{ 'admin-tab-active': activeTab === 'holidays' }" @click="activeTab = 'holidays'">
          <q-icon name="calendar_month" size="18px" />
          <span>วันหยุดประจำปี</span>
          <q-badge v-if="holidayStore.holidays.length" :label="holidayStore.holidays.length" class="admin-tab-badge" />
        </button>
        <button  class="admin-tab"
          :class="{ 'admin-tab-active': activeTab === 'notifications' }" @click="activeTab = 'notifications'">
          <q-icon name="campaign" size="18px" />
          <span>ส่งการแจ้งเตือน</span>
        </button>
        <button class="admin-tab"
          :class="{ 'admin-tab-active': activeTab === 'punch' }" @click="activeTab = 'punch'">
          <q-icon name="fingerprint" size="18px" />
          <span>เวลาเข้า-ออก</span>
        </button>
      </div>

      <!-- Users Tab -->
      <div v-if="activeTab === 'users'" class="admin-section">
        <!-- Search -->
        <div class="admin-search-bar">
          <q-icon name="search" size="18px" style="color: #6b6c6f;" />
          <input v-model="userSearch" class="admin-search-input" placeholder="ค้นหาผู้ใช้ด้วย email หรือชื่อ..." />
        </div>

        <!-- User List -->
        <div class="admin-user-list">
          <div v-if="filteredUsers.length === 0" class="admin-empty">
            <q-icon name="person_off" size="40px" style="color: #2a2b2e;" />
            <span>ไม่พบผู้ใช้</span>
          </div>

          <div v-for="usr in filteredUsers" :key="usr.id" class="admin-user-card">
            <div class="admin-user-top">
              <div class="admin-user-avatar">
                <img v-if="usr.photoURL" :src="usr.photoURL" class="admin-user-avatar-img" />
                <span v-else>{{ usr.email?.charAt(0).toUpperCase() || 'U' }}</span>
              </div>
              <div class="admin-user-info">
                <div class="admin-user-name">
                  {{ usr.firstName && usr.lastName ? `${usr.firstName} ${usr.lastName}` : usr.email?.split('@')[0] }}
                </div>
                <div class="admin-user-email">{{ usr.email }}</div>
              </div>
              <div class="admin-user-current-role">
                <q-icon :name="authStore.roleLabels[usr.role || 'employee']?.icon || 'person'" size="14px" />
                <span>{{ authStore.roleLabels[usr.role || 'employee']?.label || 'พนักงาน' }}</span>
              </div>
            </div>

            <!-- Projects -->
            <div v-if="getUserProjects(usr.email).length" class="admin-user-projects">
              <div class="admin-user-projects-label">
                <q-icon name="folder" size="13px" />
                <span>Projects</span>
              </div>
              <div class="admin-user-projects-list">
                <span v-for="proj in getUserProjects(usr.email)" :key="proj.id" class="admin-project-chip">
                  {{ proj.name }}
                </span>
              </div>
            </div>
            <div v-else class="admin-user-projects admin-user-projects-empty">
              <div class="admin-user-projects-label">
                <q-icon name="folder_off" size="13px" />
                <span>ยังไม่ได้อยู่ในโปรเจคใด</span>
              </div>
            </div>

            <div class="admin-user-fields">
              <div class="admin-field">
                <label class="admin-field-label">Role</label>
                <select :value="getEditRole(usr)" @change="setEditRole(usr, $event.target.value)" class="admin-select">
                  <option value="employee">พนักงาน</option>
                  <option value="head">หัวหน้าแผนก</option>
                  <option value="hr">HR</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              <div class="admin-field">
                <label class="admin-field-label">แผนก</label>
                <select :value="getEditDept(usr)" @change="setEditDept(usr, $event.target.value)" class="admin-select">
                  <option value="">-- ไม่ระบุ --</option>
                  <option v-for="dept in deptStore.departments" :key="dept.id" :value="dept.name">
                    {{ dept.name }}
                  </option>
                </select>
              </div>
              <div class="admin-field">
                <label class="admin-field-label">Punch ID</label>
                <input
                  :value="getEditPunchId(usr)"
                  @input="setEditPunchId(usr, $event.target.value)"
                  class="admin-select"
                  placeholder="เช่น 00000001"
                  maxlength="8"
                  style="font-family: monospace;"
                />
                <div v-if="punchIdDuplicateWarning(usr)" class="admin-punch-id-warn">
                  <q-icon name="warning" size="12px" />
                  {{ punchIdDuplicateWarning(usr) }}
                </div>
              </div>
              <button class="admin-save-btn"
                :disabled="!isUserChanged(usr) || savingUser === usr.id"
                @click="handleSaveUser(usr)">
                <q-spinner v-if="savingUser === usr.id" size="14px" color="white" />
                <q-icon v-else name="save" size="14px" />
                <span>{{ savingUser === usr.id ? 'กำลังบันทึก...' : 'บันทึก' }}</span>
              </button>
            </div>

            <!-- Skip Head Approval toggle -->
            <div v-if="getEditRole(usr) === 'employee'" class="admin-skip-head-row">
              <label class="admin-skip-head-toggle" @click="setEditSkipHead(usr, !getEditSkipHead(usr))">
                <div class="admin-toggle-track" :class="{ 'admin-toggle-active': getEditSkipHead(usr) }">
                  <div class="admin-toggle-thumb"></div>
                </div>
                <div class="admin-skip-head-label">
                  <span class="admin-skip-head-text">ข้ามหัวหน้าอนุมัติ (ส่งตรง HR)</span>
                  <span class="admin-skip-head-hint">ใบลาจะข้ามขั้นหัวหน้าแผนก ส่งตรงไป HR อนุมัติเลย</span>
                </div>
              </label>
            </div>

            <!-- Save success message -->
            <div v-if="savedUser === usr.id" class="admin-save-success">
              <q-icon name="check_circle" size="14px" />
              <span>บันทึกเรียบร้อย</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Departments Tab -->
      <div v-if="activeTab === 'departments'" class="admin-section">
        <!-- Add Department -->
        <div class="admin-add-dept">
          <input v-model="newDeptName" class="admin-dept-input" placeholder="ชื่อแผนกใหม่..."
            @keyup.enter="handleAddDept" />
          <button class="admin-add-dept-btn" :disabled="!newDeptName.trim() || deptStore.loading"
            @click="handleAddDept">
            <q-icon name="add" size="18px" />
            <span>เพิ่มแผนก</span>
          </button>
        </div>

        <!-- Department List -->
        <div class="admin-dept-list">
          <div v-if="deptStore.departments.length === 0" class="admin-empty">
            <q-icon name="business" size="40px" style="color: #2a2b2e;" />
            <span>ยังไม่มีแผนก</span>
          </div>

          <div v-for="dept in deptStore.departments" :key="dept.id" class="admin-dept-card">
            <div v-if="editingDept === dept.id" class="admin-dept-edit">
              <input v-model="editDeptName" class="admin-dept-input" @keyup.enter="handleUpdateDept(dept.id)"
                @keyup.esc="editingDept = null" ref="editDeptInput" />
              <button class="admin-dept-save-btn" @click="handleUpdateDept(dept.id)">
                <q-icon name="check" size="16px" />
              </button>
              <button class="admin-dept-cancel-btn" @click="editingDept = null">
                <q-icon name="close" size="16px" />
              </button>
            </div>
            <div v-else class="admin-dept-row">
              <div class="admin-dept-icon">
                <q-icon name="business" size="18px" />
              </div>
              <div class="admin-dept-name">{{ dept.name }}</div>
              <div class="admin-dept-count">
                {{ getUserCountByDept(dept.name) }} คน
              </div>
              <div class="admin-dept-actions">
                <button class="admin-dept-action-btn" @click="startEditDept(dept)">
                  <q-icon name="edit" size="14px" />
                </button>
                <button class="admin-dept-action-btn admin-dept-delete-btn" @click="handleDeleteDept(dept)">
                  <q-icon name="delete" size="14px" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Import Tab -->
      <div v-if="activeTab === 'import'" class="admin-section">
        <div class="import-card">
          <div class="import-card-header">
            <q-icon name="upload_file" size="20px" style="color: #ffb74d;" />
            <span class="import-card-title">นำเข้าข้อมูลการลา</span>
          </div>

          <div class="import-card-body">
            <!-- Step info -->
            <div class="import-info-box">
              <q-icon name="info" size="16px" />
              <span>นำเข้าประวัติการลาจากไฟล์ Excel (.xlsx) — ข้อมูลที่นำเข้าจะมีสถานะ "อนุมัติแล้ว" ทั้งหมด</span>
            </div>

            <!-- Download Template -->
            <button class="import-template-btn" @click="downloadTemplate">
              <q-icon name="download" size="16px" />
              <span>ดาวน์โหลด Template Excel</span>
            </button>

            <!-- Upload Area -->
            <div class="import-upload-area"
              :class="{ 'import-upload-dragover': isDragging }"
              @dragover.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false"
              @drop.prevent="handleDrop">
              <div v-if="!importFile" class="import-upload-placeholder">
                <q-icon name="cloud_upload" size="40px" />
                <span class="import-upload-text">ลากไฟล์ Excel มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์</span>
                <span class="import-upload-hint">.xlsx เท่านั้น</span>
                <label class="import-browse-btn">
                  <q-icon name="folder_open" size="16px" />
                  <span>เลือกไฟล์</span>
                  <input type="file" accept=".xlsx,.xls" style="display: none;" @change="handleFileSelect" />
                </label>
              </div>
              <div v-else class="import-upload-selected">
                <q-icon name="description" size="24px" style="color: #66bb6a;" />
                <div class="import-file-info">
                  <span class="import-file-name">{{ importFile.name }}</span>
                  <span class="import-file-size">{{ (importFile.size / 1024).toFixed(1) }} KB</span>
                </div>
                <button class="import-remove-btn" @click="clearImport">
                  <q-icon name="close" size="16px" />
                </button>
              </div>
            </div>

            <!-- Parse Error -->
            <div v-if="importParseError" class="import-error-box">
              <q-icon name="error_outline" size="16px" />
              <span>{{ importParseError }}</span>
            </div>

            <!-- Preview Table -->
            <div v-if="importPreview.length > 0" class="import-preview-section">
              <div class="import-preview-header">
                <span class="import-preview-title">ตรวจสอบข้อมูล</span>
                <div class="import-preview-summary">
                  <span class="import-summary-total">ทั้งหมด {{ importPreview.length }} รายการ</span>
                  <span class="import-summary-valid">ถูกต้อง {{ validRows.length }}</span>
                  <span v-if="invalidRows.length > 0" class="import-summary-invalid">ผิดพลาด {{ invalidRows.length }}</span>
                </div>
              </div>

              <div class="import-table-wrapper">
                <table class="import-table">
                  <thead>
                    <tr>
                      <th class="import-th-seq">#</th>
                      <th>อีเมล</th>
                      <th>ชื่อ</th>
                      <th>นามสกุล</th>
                      <th>ประเภท</th>
                      <th>วันที่เริ่ม</th>
                      <th>วันที่สิ้นสุด</th>
                      <th>แผนก</th>
                      <th class="import-th-status">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, idx) in importPreview" :key="idx"
                      :class="{ 'import-row-invalid': row._errors.length > 0 }">
                      <td class="import-td-seq">{{ idx + 1 }}</td>
                      <td>{{ row.userId }}</td>
                      <td>{{ row.firstName }}</td>
                      <td>{{ row.lastName }}</td>
                      <td>
                        <span class="import-type-pill">{{ getLeaveTypeLabel(row.leaveType) }}</span>
                      </td>
                      <td>{{ row.startDate }}</td>
                      <td>{{ row.endDate }}</td>
                      <td>{{ row.department || '-' }}</td>
                      <td class="import-td-status">
                        <span v-if="row._errors.length === 0" class="import-status-ok">
                          <q-icon name="check_circle" size="13px" /> OK
                        </span>
                        <span v-else class="import-status-error" :title="row._errors.join(', ')">
                          <q-icon name="error" size="13px" /> {{ row._errors[0] }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Import Actions -->
              <div class="import-actions">
                <button class="import-clear-btn" @click="clearImport">
                  <q-icon name="delete_outline" size="16px" />
                  <span>ล้างข้อมูล</span>
                </button>
                <div style="flex: 1;"></div>
                <div v-if="invalidRows.length > 0" class="import-skip-hint">
                  <q-icon name="warning" size="14px" style="color: #ffb74d;" />
                  <span>จะนำเข้าเฉพาะ {{ validRows.length }} รายการที่ถูกต้อง (ข้าม {{ invalidRows.length }} รายการที่ผิดพลาด)</span>
                </div>
                <button class="import-submit-btn"
                  :disabled="validRows.length === 0 || leaveStore.loading"
                  @click="handleImport">
                  <q-spinner v-if="leaveStore.loading" size="16px" color="white" />
                  <q-icon v-else name="cloud_upload" size="16px" />
                  <span>{{ leaveStore.loading ? 'กำลังนำเข้า...' : `นำเข้า ${validRows.length} รายการ` }}</span>
                </button>
              </div>
            </div>

            <!-- Import Result -->
            <div v-if="importResult" class="import-result-box" :class="importResult.errors.length > 0 ? 'import-result-warn' : 'import-result-success'">
              <q-icon :name="importResult.errors.length > 0 ? 'warning' : 'check_circle'" size="20px" />
              <div>
                <div class="import-result-title">นำเข้าสำเร็จ {{ importResult.success }} รายการ</div>
                <div v-if="importResult.errors.length > 0" class="import-result-errors">
                  ผิดพลาด {{ importResult.errors.length }} รายการ
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Holidays Tab -->
      <div v-if="activeTab === 'holidays'" class="admin-section">
        <div class="holiday-card">
          <div class="holiday-card-header">
            <q-icon name="calendar_month" size="22px" style="color: #66bb6a;" />
            <span class="holiday-card-title">จัดการวันหยุดประจำปี</span>
            <div style="flex:1"></div>
            <select v-model="holidayYear" class="holiday-year-select" @change="loadHolidaysForYear">
              <option v-for="y in availableYears" :key="y" :value="y">{{ y }}</option>
            </select>
          </div>

          <div class="holiday-card-body">
            <!-- Action Buttons -->
            <div class="holiday-actions-row">
              <button class="holiday-action-btn holiday-preset-btn" @click="loadThaiPresets"
                :disabled="holidayStore.loading">
                <q-icon name="flag" size="16px" />
                <span>เพิ่มวันหยุดนักขัตฤกษ์ไทย</span>
              </button>
              <button class="holiday-action-btn holiday-copy-btn" @click="showCopyDialog = true"
                :disabled="holidayStore.loading">
                <q-icon name="content_copy" size="16px" />
                <span>คัดลอกจากปีอื่น</span>
              </button>
            </div>

            <!-- Add Holiday Form -->
            <div class="holiday-add-form">
              <div class="holiday-add-fields">
                <input v-model="newHolidayDate" type="date" class="holiday-date-input" />
                <input v-model="newHolidayName" class="holiday-name-input" placeholder="ชื่อวันหยุด เช่น วันขึ้นปีใหม่" @keyup.enter="handleAddHoliday" />
                <select v-model="newHolidayType" class="holiday-type-select">
                  <option value="national">นักขัตฤกษ์</option>
                  <option value="company">บริษัท</option>
                  <option value="special">พิเศษ</option>
                </select>
              </div>
              <button class="holiday-add-btn" :disabled="!newHolidayDate || !newHolidayName.trim() || holidayStore.loading"
                @click="handleAddHoliday">
                <q-icon name="add" size="18px" />
                <span>เพิ่มวันหยุด</span>
              </button>
            </div>

            <!-- Holiday List -->
            <div class="holiday-list">
              <div v-if="holidayStore.loading" class="admin-empty">
                <q-spinner size="24px" color="green" />
                <span>กำลังโหลด...</span>
              </div>
              <div v-else-if="editableHolidays.length === 0" class="admin-empty">
                <q-icon name="calendar_month" size="40px" style="color: #2a2b2e;" />
                <span>ยังไม่มีวันหยุดสำหรับปี {{ holidayYear }}</span>
              </div>
              <div v-else>
                <div class="holiday-list-header">
                  <span class="holiday-count-badge">{{ editableHolidays.length }} วันหยุด</span>
                </div>
                <div v-for="(h, idx) in editableHolidays" :key="h.date + idx" class="holiday-item">
                  <div v-if="editingHolidayDate === h.date" class="holiday-item-edit">
                    <input v-model="editHolidayNewDate" type="date" class="holiday-date-input" />
                    <input v-model="editHolidayName" class="holiday-name-input" @keyup.enter="handleUpdateHoliday(h.date)" @keyup.esc="editingHolidayDate = null" />
                    <select v-model="editHolidayType" class="holiday-type-select">
                      <option value="national">นักขัตฤกษ์</option>
                      <option value="company">บริษัท</option>
                      <option value="special">พิเศษ</option>
                    </select>
                    <button class="admin-dept-save-btn" @click="handleUpdateHoliday(h.date)">
                      <q-icon name="check" size="16px" />
                    </button>
                    <button class="admin-dept-cancel-btn" @click="editingHolidayDate = null">
                      <q-icon name="close" size="16px" />
                    </button>
                  </div>
                  <div v-else class="holiday-item-row">
                    <div class="holiday-item-date">
                      <q-icon name="event" size="14px" />
                      <span>{{ formatHolidayDate(h.date) }}</span>
                    </div>
                    <div class="holiday-item-name">{{ h.name }}</div>
                    <div class="holiday-item-type" :class="'holiday-type-' + (h.type || 'company')">
                      {{ h.type === 'national' ? 'นักขัตฤกษ์' : h.type === 'special' ? 'พิเศษ' : 'บริษัท' }}
                    </div>
                    <div class="holiday-item-day">{{ getDayOfWeek(h.date) }}</div>
                    <div class="holiday-item-actions">
                      <button class="admin-dept-action-btn" @click="startEditHoliday(h)">
                        <q-icon name="edit" size="14px" />
                      </button>
                      <button class="admin-dept-action-btn admin-dept-delete-btn" @click="handleRemoveHoliday(h)">
                        <q-icon name="delete" size="14px" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Save result -->
            <div v-if="holidaySaveResult" class="holiday-save-result" :class="holidaySaveResult.success ? 'holiday-result-success' : 'holiday-result-error'">
              <q-icon :name="holidaySaveResult.success ? 'check_circle' : 'error'" size="16px" />
              <span>{{ holidaySaveResult.message }}</span>
            </div>
          </div>
        </div>

        <!-- Delete Holiday Confirm Dialog -->
        <q-dialog v-model="showDeleteHolidayDialog" persistent class="confirm-dialog-backdrop">
          <div class="confirm-dialog-card">
            <div class="confirm-dialog-header">
              <div class="confirm-dialog-icon-wrap" style="background: linear-gradient(135deg, rgba(239, 83, 80, 0.18) 0%, rgba(211, 47, 47, 0.10) 100%);">
                <q-icon name="delete_forever" size="28px" style="color: #ef5350;" />
              </div>
              <div class="confirm-dialog-header-text">
                <div class="confirm-dialog-title">ยืนยันลบวันหยุด</div>
                <div class="confirm-dialog-subtitle">การลบจะมีผลทันทีและไม่สามารถย้อนกลับได้</div>
              </div>
            </div>
            <div class="confirm-dialog-body" v-if="deletingHoliday">
              <div class="confirm-preview-row">
                <div class="confirm-preview-label">
                  <q-icon name="event" size="16px" />
                  <span>วันที่</span>
                </div>
                <div class="confirm-preview-value confirm-text-value">
                  {{ formatHolidayDate(deletingHoliday.date) }} ({{ getDayOfWeek(deletingHoliday.date) }})
                </div>
              </div>
              <div class="confirm-preview-row">
                <div class="confirm-preview-label">
                  <q-icon name="label" size="16px" />
                  <span>ชื่อวันหยุด</span>
                </div>
                <div class="confirm-preview-value confirm-text-value">{{ deletingHoliday.name }}</div>
              </div>
              <div class="confirm-preview-row">
                <div class="confirm-preview-label">
                  <q-icon name="category" size="16px" />
                  <span>ประเภท</span>
                </div>
                <div class="confirm-preview-value">
                  <span class="holiday-item-type" :class="'holiday-type-' + (deletingHoliday.type || 'company')">
                    {{ deletingHoliday.type === 'national' ? 'นักขัตฤกษ์' : deletingHoliday.type === 'special' ? 'พิเศษ' : 'บริษัท' }}
                  </span>
                </div>
              </div>
            </div>
            <div class="confirm-dialog-actions">
              <button class="confirm-cancel-btn" @click="showDeleteHolidayDialog = false">
                <q-icon name="close" size="16px" />
                <span>ยกเลิก</span>
              </button>
              <button class="confirm-send-btn" style="background: linear-gradient(135deg, #ef5350 0%, #d32f2f 100%);" @click="confirmDeleteHoliday">
                <q-icon name="delete" size="16px" />
                <span>ลบวันหยุด</span>
              </button>
            </div>
          </div>
        </q-dialog>

        <!-- Copy from year dialog -->
        <q-dialog v-model="showCopyDialog" persistent class="confirm-dialog-backdrop">
          <div class="confirm-dialog-card">
            <div class="confirm-dialog-header">
              <div class="confirm-dialog-icon-wrap" style="background: linear-gradient(135deg, rgba(102, 187, 106, 0.18) 0%, rgba(76, 175, 80, 0.10) 100%);">
                <q-icon name="content_copy" size="28px" style="color: #66bb6a;" />
              </div>
              <div class="confirm-dialog-header-text">
                <div class="confirm-dialog-title">คัดลอกวันหยุดจากปีอื่น</div>
                <div class="confirm-dialog-subtitle">จะคัดลอกวันหยุดมายังปี {{ holidayYear }} (ไม่ทับรายการที่มีอยู่แล้ว)</div>
              </div>
            </div>
            <div class="confirm-dialog-body">
              <div class="notif-field">
                <label class="notif-field-label">คัดลอกจากปี</label>
                <select v-model="copySourceYear" class="admin-select">
                  <option v-for="y in availableYears.filter(y => y !== holidayYear)" :key="y" :value="y">{{ y }}</option>
                </select>
              </div>
            </div>
            <div class="confirm-dialog-actions">
              <button class="confirm-cancel-btn" @click="showCopyDialog = false">
                <q-icon name="close" size="16px" />
                <span>ยกเลิก</span>
              </button>
              <button class="confirm-send-btn" style="background: linear-gradient(135deg, #66bb6a 0%, #4caf50 100%);" @click="handleCopyFromYear">
                <q-icon name="content_copy" size="16px" />
                <span>คัดลอก</span>
              </button>
            </div>
          </div>
        </q-dialog>
      </div>

      <!-- Notifications Tab -->
      <div v-if="activeTab === 'notifications'" class="admin-section">
        <div class="notif-send-card">
          <div class="notif-send-header">
            <q-icon name="campaign" size="22px" style="color: #ffb74d;" />
            <span class="notif-send-title">ส่งการแจ้งเตือนถึงพนักงาน</span>
          </div>

          <div class="notif-send-body">
            <!-- Target Type -->
            <div class="notif-field">
              <label class="notif-field-label">ส่งถึง</label>
              <div class="notif-target-options">
                <button class="notif-target-btn" :class="{ 'notif-target-active': notifTarget === 'all' }"
                  @click="notifTarget = 'all'">
                  <q-icon name="groups" size="18px" />
                  <span>ทุกคน</span>
                </button>
                <button class="notif-target-btn" :class="{ 'notif-target-active': notifTarget === 'department' }"
                  @click="notifTarget = 'department'">
                  <q-icon name="business" size="18px" />
                  <span>รายแผนก</span>
                </button>
                <button class="notif-target-btn" :class="{ 'notif-target-active': notifTarget === 'individual' }"
                  @click="notifTarget = 'individual'">
                  <q-icon name="person" size="18px" />
                  <span>รายบุคคล</span>
                </button>
              </div>
            </div>

            <!-- Department Selector (when target = department) -->
            <div v-if="notifTarget === 'department'" class="notif-field">
              <label class="notif-field-label">เลือกแผนก</label>
              <select v-model="notifDepartment" class="admin-select">
                <option value="">-- เลือกแผนก --</option>
                <option v-for="dept in deptStore.departments" :key="dept.id" :value="dept.name">
                  {{ dept.name }} ({{ getUserCountByDept(dept.name) }} คน)
                </option>
              </select>
            </div>

            <!-- Individual Selector (when target = individual) -->
            <div v-if="notifTarget === 'individual'" class="notif-field">
              <label class="notif-field-label">เลือกพนักงาน</label>
              <div class="notif-user-search-bar">
                <q-icon name="search" size="16px" style="color: #6b6c6f;" />
                <input v-model="notifUserSearch" class="admin-search-input" placeholder="ค้นหาด้วย email หรือชื่อ..." />
              </div>
              <div class="notif-user-list">
                <div v-for="usr in filteredNotifUsers" :key="usr.email || usr.id" class="notif-user-option"
                  :class="{ 'notif-user-selected': notifSelectedEmails.includes(usr.email || usr.id) }"
                  @click="toggleUserSelect(usr)">
                  <div class="notif-user-check">
                    <q-icon :name="notifSelectedEmails.includes(usr.email || usr.id) ? 'check_box' : 'check_box_outline_blank'" size="18px" />
                  </div>
                  <div class="notif-user-avatar-sm">
                    <img v-if="usr.photoURL" :src="usr.photoURL" class="admin-user-avatar-img" />
                    <span v-else>{{ (usr.email || 'U').charAt(0).toUpperCase() }}</span>
                  </div>
                  <div class="notif-user-detail">
                    <div class="notif-user-name">{{ usr.firstName && usr.lastName ? `${usr.firstName} ${usr.lastName}` : (usr.email || usr.id).split('@')[0] }}</div>
                    <div class="notif-user-email">{{ usr.email || usr.id }}</div>
                  </div>
                  <div v-if="usr.department" class="notif-user-dept-chip">{{ usr.department }}</div>
                </div>
                <div v-if="filteredNotifUsers.length === 0" class="notif-user-empty">
                  <q-icon name="person_off" size="24px" style="color: #2a2b2e;" />
                  <span>ไม่พบพนักงาน</span>
                </div>
              </div>
              <div v-if="notifSelectedEmails.length > 0" class="notif-selected-count">
                <q-icon name="check_circle" size="14px" />
                <span>เลือกแล้ว {{ notifSelectedEmails.length }} คน</span>
              </div>
            </div>

            <!-- Title -->
            <div class="notif-field">
              <label class="notif-field-label">หัวข้อ</label>
              <input v-model="notifTitle" class="notif-input" placeholder="เช่น ประกาศสำคัญ, แจ้งเรื่องวันหยุด..." />
            </div>

            <!-- Message -->
            <div class="notif-field">
              <label class="notif-field-label">ข้อความ</label>
              <textarea v-model="notifMessage" class="notif-textarea" rows="4" placeholder="เขียนข้อความที่ต้องการแจ้งเตือน..."></textarea>
            </div>

            <!-- Image Attachment -->
            <div class="notif-field">
              <label class="notif-field-label">แนบรูปภาพ (ไม่บังคับ)</label>
              <div v-if="!notifImagePreview" class="notif-image-picker" @click="$refs.notifImageInput.click()">
                <q-icon name="add_photo_alternate" size="28px" />
                <span>คลิกเพื่อเลือกรูปภาพ</span>
                <span class="notif-image-hint">รองรับ JPG, PNG, GIF, WebP (ไม่เกิน 5MB)</span>
              </div>
              <div v-else class="notif-image-preview-wrap">
                <img :src="notifImagePreview" class="notif-image-preview" />
                <button class="notif-image-remove-btn" @click="removeNotifImage">
                  <q-icon name="close" size="16px" />
                </button>
              </div>
              <input ref="notifImageInput" type="file" accept="image/*" style="display: none;" @change="handleNotifImageSelect" />
            </div>

            <!-- Summary Info -->
            <div v-if="notifRecipientSummary" class="notif-summary-info">
              <q-icon name="info" size="16px" />
              <span>{{ notifRecipientSummary }}</span>
            </div>

            <!-- Send Button -->
            <div class="notif-send-actions">
              <button class="notif-send-btn" :disabled="!canSendNotif || sendingNotif" @click="showConfirmDialog = true">
                <q-spinner v-if="sendingNotif" size="16px" color="white" />
                <q-icon v-else name="send" size="16px" />
                <span>{{ sendingNotif ? 'กำลังส่ง...' : 'ส่งการแจ้งเตือน' }}</span>
              </button>
            </div>

            <!-- Send Result -->
            <div v-if="notifSendResult" class="notif-send-result" :class="notifSendResult.success > 0 ? 'notif-result-success' : 'notif-result-error'">
              <q-icon :name="notifSendResult.success > 0 ? 'check_circle' : 'error'" size="20px" />
              <div>
                <div class="notif-result-title">
                  {{ notifSendResult.success > 0 ? `ส่งการแจ้งเตือนสำเร็จ ${notifSendResult.success} คน` : 'ไม่สามารถส่งการแจ้งเตือนได้' }}
                </div>
                <div v-if="notifSendResult.error" class="notif-result-sub">{{ notifSendResult.error }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Confirm Send Dialog -->
        <q-dialog v-model="showConfirmDialog" persistent class="confirm-dialog-backdrop">
          <div class="confirm-dialog-card">
            <!-- Header -->
            <div class="confirm-dialog-header">
              <div class="confirm-dialog-icon-wrap">
                <q-icon name="campaign" size="28px" />
              </div>
              <div class="confirm-dialog-header-text">
                <div class="confirm-dialog-title">ยืนยันส่งการแจ้งเตือน</div>
                <div class="confirm-dialog-subtitle">กรุณาตรวจสอบข้อมูลก่อนส่ง</div>
              </div>
            </div>

            <!-- Preview Content -->
            <div class="confirm-dialog-body">
              <!-- Target -->
              <div class="confirm-preview-row">
                <div class="confirm-preview-label">
                  <q-icon :name="notifTarget === 'all' ? 'groups' : notifTarget === 'department' ? 'business' : 'person'" size="16px" />
                  <span>ส่งถึง</span>
                </div>
                <div class="confirm-preview-value">
                  <span v-if="notifTarget === 'all'" class="confirm-target-chip confirm-chip-all">
                    <q-icon name="groups" size="14px" />
                    พนักงานทุกคน
                  </span>
                  <span v-else-if="notifTarget === 'department'" class="confirm-target-chip confirm-chip-dept">
                    <q-icon name="business" size="14px" />
                    แผนก {{ notifDepartment }}
                  </span>
                  <span v-else class="confirm-target-chip confirm-chip-individual">
                    <q-icon name="person" size="14px" />
                    {{ notifSelectedEmails.length }} คนที่เลือก
                  </span>
                </div>
              </div>

              <!-- Recipient Count -->
              <div class="confirm-preview-row">
                <div class="confirm-preview-label">
                  <q-icon name="people" size="16px" />
                  <span>จำนวนผู้รับ</span>
                </div>
                <div class="confirm-preview-value">
                  <span class="confirm-count-badge">{{ confirmRecipientCount }} คน</span>
                </div>
              </div>

              <!-- Title -->
              <div v-if="notifTitle.trim()" class="confirm-preview-row">
                <div class="confirm-preview-label">
                  <q-icon name="title" size="16px" />
                  <span>หัวข้อ</span>
                </div>
                <div class="confirm-preview-value confirm-text-value">{{ notifTitle.trim() }}</div>
              </div>

              <!-- Message Preview -->
              <div class="confirm-preview-row confirm-preview-msg-row">
                <div class="confirm-preview-label">
                  <q-icon name="chat" size="16px" />
                  <span>ข้อความ</span>
                </div>
                <div class="confirm-msg-preview">
                  <div class="confirm-msg-bubble">
                    <div v-if="notifTitle.trim()" class="confirm-msg-title">{{ notifTitle.trim() }}</div>
                    <div class="confirm-msg-text">{{ notifMessage.trim() }}</div>
                    <img v-if="notifImagePreview" :src="notifImagePreview" class="confirm-msg-image" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="confirm-dialog-actions">
              <button class="confirm-cancel-btn" @click="showConfirmDialog = false">
                <q-icon name="close" size="16px" />
                <span>ยกเลิก</span>
              </button>
              <button class="confirm-send-btn" @click="confirmAndSendNotif">
                <q-icon name="send" size="16px" />
                <span>ยืนยันส่ง</span>
              </button>
            </div>
          </div>
        </q-dialog>

        <!-- Recent Admin Broadcasts -->
        <div class="notif-history-section">
          <div class="notif-history-header">
            <q-icon name="history" size="18px" style="color: #6b6c6f;" />
            <span class="notif-history-title">ประวัติการส่งล่าสุด</span>
          </div>
          <div v-if="adminBroadcastHistory.length === 0" class="admin-empty">
            <q-icon name="campaign" size="40px" style="color: #2a2b2e;" />
            <span>ยังไม่มีประวัติการส่ง</span>
          </div>
          <div v-for="item in adminBroadcastHistory" :key="item.id" class="notif-history-card">
            <div class="notif-history-icon">
              <q-icon name="campaign" size="16px" />
            </div>
            <div class="notif-history-content">
              <div class="notif-history-msg">{{ item.title || item.message }}</div>
              <div class="notif-history-sub" v-if="item.title && item.message !== item.title">{{ item.message }}</div>
              <img v-if="item.imageURL" :src="item.imageURL" class="notif-history-img" />
              <div class="notif-history-meta">
                <span class="notif-history-time">{{ formatBroadcastTime(item.createdAt) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Punch/Attendance Import Tab -->
      <div v-if="activeTab === 'punch'" class="admin-section">
        <div class="import-card">
          <div class="import-card-header">
            <q-icon name="fingerprint" size="20px" style="color: #ab47bc;" />
            <span class="import-card-title">นำเข้าเวลาสแกนนิ้ว</span>
          </div>

          <div class="import-card-body">
            <div class="import-info-box">
              <q-icon name="info" size="16px" />
              <span>นำเข้าไฟล์เวลาสแกนนิ้วจากเครื่อง (.xls / .xlsx) ระบบจะจับคู่ Punch ID กับผู้ใช้ในระบบ</span>
            </div>

            <!-- File Upload -->
            <div v-if="!punchFile" class="import-drop-zone"
              :class="{ 'import-drop-active': punchDragging }"
              @dragover.prevent="punchDragging = true"
              @dragleave.prevent="punchDragging = false"
              @drop.prevent="handlePunchDrop">
              <q-icon name="fingerprint" size="40px" style="color: #3a3b3e;" />
              <div class="import-drop-text">ลากไฟล์มาวางที่นี่ หรือ</div>
              <label class="import-browse-btn">
                <input type="file" accept=".xls,.xlsx" hidden @change="handlePunchFileSelect" />
                <q-icon name="folder_open" size="16px" />
                <span>เลือกไฟล์</span>
              </label>
              <div class="import-drop-hint">รองรับ .xls และ .xlsx จากเครื่องสแกนนิ้ว</div>
            </div>

            <!-- File Selected -->
            <div v-if="punchFile" class="import-file-info">
              <div class="import-file-row">
                <q-icon name="description" size="18px" style="color: #ab47bc;" />
                <span class="import-file-name">{{ punchFile.name }}</span>
                <span class="import-file-size">{{ (punchFile.size / 1024).toFixed(1) }} KB</span>
                <button class="import-clear-btn" @click="clearPunchImport">
                  <q-icon name="close" size="14px" />
                </button>
              </div>
            </div>

            <!-- Parse Error -->
            <div v-if="punchParseError" class="import-result-box import-result-warn">
              <q-icon name="error" size="20px" />
              <span>{{ punchParseError }}</span>
            </div>

            <!-- Loading -->
            <div v-if="punchParsing" class="admin-empty" style="padding: 24px 0;">
              <q-spinner size="24px" color="purple" />
              <span>กำลังอ่านไฟล์...</span>
            </div>

            <!-- Preview -->
            <div v-if="punchPreview.length > 0 && !punchParsing">
              <!-- Summary -->
              <div class="punch-summary-row">
                <div class="punch-summary-item">
                  <q-icon name="people" size="16px" />
                  <span>พนักงาน {{ punchPreview.length }} คน</span>
                </div>
                <div class="punch-summary-item">
                  <q-icon name="calendar_month" size="16px" />
                  <span>{{ punchMonth }}</span>
                </div>
                <div v-if="punchMatchedCount < punchPreview.length" class="punch-summary-item punch-summary-warn">
                  <q-icon name="warning" size="16px" />
                  <span>จับคู่ได้ {{ punchMatchedCount }}/{{ punchPreview.length }} คน</span>
                </div>
                <div v-else class="punch-summary-item punch-summary-ok">
                  <q-icon name="check_circle" size="16px" />
                  <span>จับคู่ครบทุกคน</span>
                </div>
              </div>

              <!-- Duplicate Warning -->
              <div v-if="Object.keys(punchDuplicates).length > 0" class="punch-dup-warning">
                <div class="punch-dup-header">
                  <q-icon name="warning_amber" size="18px" />
                  <span>พบข้อมูลซ้ำ {{ Object.keys(punchDuplicates).length }} คน ในเดือนนี้</span>
                </div>
                <div class="punch-dup-options">
                  <label class="punch-dup-option" @click="punchDupAction = 'overwrite'">
                    <div class="admin-toggle-track" :class="{ 'admin-toggle-active': punchDupAction === 'overwrite' }">
                      <div class="admin-toggle-thumb"></div>
                    </div>
                    <span>เขียนทับข้อมูลเดิม</span>
                  </label>
                  <label class="punch-dup-option" @click="punchDupAction = 'skip'">
                    <div class="admin-toggle-track" :class="{ 'admin-toggle-active': punchDupAction === 'skip' }">
                      <div class="admin-toggle-thumb"></div>
                    </div>
                    <span>ข้ามคนที่มีข้อมูลแล้ว</span>
                  </label>
                </div>
              </div>

              <!-- Preview Table -->
              <div class="import-table-wrapper" style="max-height: 420px;">
                <table class="import-table">
                  <thead>
                    <tr>
                      <th style="width: 40px;">#</th>
                      <th>Punch ID</th>
                      <th>ชื่อ (จากไฟล์)</th>
                      <th>แผนก (จากไฟล์)</th>
                      <th>ผู้ใช้ในระบบ</th>
                      <th>จำนวนวัน</th>
                      <th>สถานะ</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(emp, idx) in punchPreview" :key="emp.punchId">
                      <td style="color: #6b6c6f;">{{ idx + 1 }}</td>
                      <td style="font-family: monospace;">{{ emp.punchId }}</td>
                      <td>{{ emp.nameFromFile }}</td>
                      <td>{{ emp.deptFromFile }}</td>
                      <td>
                        <span v-if="emp.matchedUser" style="color: #66bb6a;">
                          {{ emp.matchedUser.firstName }} {{ emp.matchedUser.lastName }}
                        </span>
                        <span v-else style="color: #ef5350;">ไม่พบในระบบ</span>
                      </td>
                      <td>{{ emp.dayCount }} วัน</td>
                      <td>
                        <span v-if="!emp.matchedUser" class="punch-status-badge punch-status-unmatched">
                          <q-icon name="link_off" size="12px" /> ไม่จับคู่
                        </span>
                        <span v-else-if="punchDuplicates[emp.matchedUser.email]" class="punch-status-badge punch-status-dup">
                          <q-icon name="warning" size="12px" /> ซ้ำ
                        </span>
                        <span v-else class="punch-status-badge punch-status-ok">
                          <q-icon name="check" size="12px" /> พร้อม
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Actions -->
              <div class="import-actions" style="margin-top: 14px;">
                <div style="flex: 1;"></div>
                <div v-if="punchUnmatchedCount > 0" class="import-skip-hint">
                  <q-icon name="warning" size="14px" style="color: #ffb74d;" />
                  <span>จะนำเข้าเฉพาะ {{ punchImportableCount }} คนที่จับคู่ได้ (ข้าม {{ punchUnmatchedCount }} คน)</span>
                </div>
                <button class="import-submit-btn" style="background: linear-gradient(135deg, #ab47bc 0%, #7b1fa2 100%);"
                  :disabled="punchImportableCount === 0 || attendanceStore.loading"
                  @click="handlePunchImport">
                  <q-spinner v-if="attendanceStore.loading" size="16px" color="white" />
                  <q-icon v-else name="cloud_upload" size="16px" />
                  <span>{{ attendanceStore.loading ? 'กำลังนำเข้า...' : `นำเข้า ${punchImportableCount} คน` }}</span>
                </button>
              </div>
            </div>

            <!-- Import Result -->
            <div v-if="punchImportResult" class="import-result-box" :class="punchImportResult.errors.length > 0 ? 'import-result-warn' : 'import-result-success'">
              <q-icon :name="punchImportResult.errors.length > 0 ? 'warning' : 'check_circle'" size="20px" />
              <div>
                <div class="import-result-title">นำเข้าสำเร็จ {{ punchImportResult.success }} รายการ</div>
                <div v-if="punchImportResult.errors.length > 0" class="import-result-errors">
                  ผิดพลาด {{ punchImportResult.errors.length }} รายการ:
                  <div v-for="(err, i) in punchImportResult.errors" :key="i" style="font-size: 0.7rem;">{{ err }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from 'stores/auth'
import { useDepartmentsStore } from 'stores/departments'
import { useProjectsStore } from 'stores/projects'
import { useLeaveStore } from 'stores/leave'
import { useNotificationsStore } from 'stores/notifications'
import { useHolidayStore } from 'stores/holiday'
import { useAttendanceStore } from 'stores/attendance'
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from 'boot/firebase'
import * as XLSX from 'xlsx'

const authStore = useAuthStore()
const deptStore = useDepartmentsStore()
const projectsStore = useProjectsStore()
const leaveStore = useLeaveStore()
const notificationsStore = useNotificationsStore()
const holidayStore = useHolidayStore()
const attendanceStore = useAttendanceStore()

const activeTab = ref('users')
const userSearch = ref('')
const newDeptName = ref('')
const editingDept = ref(null)
const editDeptName = ref('')
const savingUser = ref(null)
const savedUser = ref(null)
const editState = ref({}) // { [email]: { role, department } }

onMounted(async () => {
  await Promise.all([
    authStore.fetchAllProfiles(),
    deptStore.fetchDepartments(),
    projectsStore.fetchAllProjects(),
    holidayStore.fetchHolidays(holidayYear.value)
  ])

  // Load broadcast history for notifications tab
  if (authStore.isSuperAdmin) {
    fetchBroadcastHistory()
  }

  // Initialize edit state for each user
  authStore.allProfiles.forEach(u => {
    editState.value[u.email || u.id] = {
      role: u.role || 'employee',
      department: u.department || '',
      skipHeadApproval: u.skipHeadApproval || false,
      punchId: u.punchId || ''
    }
  })
})

// Filtered users based on search
const filteredUsers = computed(() => {
  const s = userSearch.value.toLowerCase().trim()
  if (!s) return authStore.allProfiles
  return authStore.allProfiles.filter(u =>
    (u.email || '').toLowerCase().includes(s) ||
    (u.firstName || '').toLowerCase().includes(s) ||
    (u.lastName || '').toLowerCase().includes(s)
  )
})

// Helpers for edit state
const getEditRole = (usr) => editState.value[usr.email || usr.id]?.role || usr.role || 'employee'
const getEditDept = (usr) => editState.value[usr.email || usr.id]?.department ?? usr.department ?? ''
const getEditSkipHead = (usr) => editState.value[usr.email || usr.id]?.skipHeadApproval ?? usr.skipHeadApproval ?? false
const getEditPunchId = (usr) => editState.value[usr.email || usr.id]?.punchId ?? usr.punchId ?? ''
const setEditRole = (usr, val) => {
  const key = usr.email || usr.id
  if (!editState.value[key]) editState.value[key] = { role: usr.role || 'employee', department: usr.department || '', skipHeadApproval: usr.skipHeadApproval || false, punchId: usr.punchId || '' }
  editState.value[key].role = val
}
const setEditDept = (usr, val) => {
  const key = usr.email || usr.id
  if (!editState.value[key]) editState.value[key] = { role: usr.role || 'employee', department: usr.department || '', skipHeadApproval: usr.skipHeadApproval || false, punchId: usr.punchId || '' }
  editState.value[key].department = val
}
const setEditSkipHead = (usr, val) => {
  const key = usr.email || usr.id
  if (!editState.value[key]) editState.value[key] = { role: usr.role || 'employee', department: usr.department || '', skipHeadApproval: usr.skipHeadApproval || false, punchId: usr.punchId || '' }
  editState.value[key].skipHeadApproval = val
}
const setEditPunchId = (usr, val) => {
  const key = usr.email || usr.id
  if (!editState.value[key]) editState.value[key] = { role: usr.role || 'employee', department: usr.department || '', skipHeadApproval: usr.skipHeadApproval || false, punchId: usr.punchId || '' }
  editState.value[key].punchId = val
}
const punchIdDuplicateWarning = (usr) => {
  const pid = getEditPunchId(usr)
  if (!pid) return ''
  const key = usr.email || usr.id
  const dup = authStore.allProfiles.find(u => {
    const uKey = u.email || u.id
    if (uKey === key) return false
    const otherPid = editState.value[uKey]?.punchId ?? u.punchId ?? ''
    return otherPid === pid
  })
  return dup ? `Punch ID ซ้ำกับ ${dup.firstName || dup.email}` : ''
}
const isUserChanged = (usr) => {
  const e = editState.value[usr.email || usr.id]
  if (!e) return false
  return e.role !== (usr.role || 'employee') || e.department !== (usr.department || '') || e.skipHeadApproval !== (usr.skipHeadApproval || false) || e.punchId !== (usr.punchId || '')
}

// Get projects a user belongs to
const getUserProjects = (email) => {
  return projectsStore.allProjects.filter(p => p.members && p.members.includes(email))
}

// Count users per department
const getUserCountByDept = (deptName) => {
  return authStore.allProfiles.filter(u => u.department === deptName).length
}

// Save user role/department
const handleSaveUser = async (usr) => {
  const key = usr.email || usr.id
  const edit = editState.value[key]
  if (!edit) return

  savingUser.value = usr.id
  const success = await authStore.updateUserRole(key, {
    role: edit.role,
    department: edit.department,
    skipHeadApproval: edit.skipHeadApproval || false,
    punchId: edit.punchId || ''
  })
  savingUser.value = null
  if (success) {
    savedUser.value = usr.id
    setTimeout(() => {
      if (savedUser.value === usr.id) savedUser.value = null
    }, 2000)
  }
}

// Department CRUD
const handleAddDept = async () => {
  if (!newDeptName.value.trim()) return
  const success = await deptStore.addDepartment(newDeptName.value)
  if (success) newDeptName.value = ''
}

const startEditDept = (dept) => {
  editingDept.value = dept.id
  editDeptName.value = dept.name
}

const handleUpdateDept = async (id) => {
  if (!editDeptName.value.trim()) return
  const success = await deptStore.updateDepartment(id, editDeptName.value)
  if (success) editingDept.value = null
}

const handleDeleteDept = async (dept) => {
  const count = getUserCountByDept(dept.name)
  if (count > 0) {
    if (!confirm(`แผนก "${dept.name}" มีผู้ใช้ ${count} คน ต้องการลบหรือไม่?`)) return
  }
  await deptStore.deleteDepartment(dept.id)
}

// ====== Import Leave Data ======
const isDragging = ref(false)
const importFile = ref(null)
const importPreview = ref([])
const importParseError = ref('')
const importResult = ref(null)

// Leave type mapping (Thai -> value)
const leaveTypeMap = {
  'ลาป่วย': 'sick',
  'ลากิจ': 'personal',
  'ลาพักร้อน': 'vacation',
  'ลาคลอด': 'maternity',
  'ลาไม่รับค่าจ้าง': 'unpaid',
  'ลาอื่นๆ': 'other',
  'sick': 'sick',
  'personal': 'personal',
  'vacation': 'vacation',
  'maternity': 'maternity',
  'unpaid': 'unpaid',
  'other': 'other'
}

const getLeaveTypeLabel = (type) => {
  const found = leaveStore.leaveTypes.find(t => t.value === type)
  return found ? `${found.icon} ${found.label}` : type || '-'
}

// Validate a single row
const validateRow = (row) => {
  const errors = []
  if (!row.userId || !row.userId.trim()) errors.push('ไม่มีอีเมล')
  if (!row.firstName || !row.firstName.trim()) errors.push('ไม่มีชื่อ')
  if (!row.lastName || !row.lastName.trim()) errors.push('ไม่มีนามสกุล')
  if (!row.leaveType) errors.push('ประเภทการลาไม่ถูกต้อง')
  if (!row.startDate || !/^\d{4}-\d{2}-\d{2}$/.test(row.startDate)) errors.push('วันที่เริ่มไม่ถูกต้อง')
  if (!row.endDate || !/^\d{4}-\d{2}-\d{2}$/.test(row.endDate)) errors.push('วันที่สิ้นสุดไม่ถูกต้อง')
  if (row.startDate && row.endDate && row.startDate > row.endDate) errors.push('วันที่เริ่ม > วันที่สิ้นสุด')
  return errors
}

const validRows = computed(() => importPreview.value.filter(r => r._errors.length === 0))
const invalidRows = computed(() => importPreview.value.filter(r => r._errors.length > 0))

// Format Excel date serial number or string to YYYY-MM-DD
const formatExcelDate = (val) => {
  if (!val) return ''
  // If it's already a YYYY-MM-DD string
  if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val.trim())) return val.trim()
  // If it's a string like "2025-01-15" with extra chars
  if (typeof val === 'string') {
    const match = val.match(/(\d{4})-(\d{1,2})-(\d{1,2})/)
    if (match) return `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`
    // Try DD/MM/YYYY or D/M/YYYY
    const slashMatch = val.match(/(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})/)
    if (slashMatch) return `${slashMatch[3]}-${slashMatch[2].padStart(2, '0')}-${slashMatch[1].padStart(2, '0')}`
  }
  // If it's an Excel serial number
  if (typeof val === 'number') {
    const date = new Date((val - 25569) * 86400 * 1000)
    if (!isNaN(date.getTime())) {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    }
  }
  return String(val).trim()
}

// Parse uploaded Excel file
const parseExcel = (file) => {
  importPreview.value = []
  importParseError.value = ''
  importResult.value = null

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result)
      const wb = XLSX.read(data, { type: 'array' })
      const sheet = wb.Sheets[wb.SheetNames[0]]
      if (!sheet) {
        importParseError.value = 'ไม่พบข้อมูลใน Sheet แรก'
        return
      }

      const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' })
      if (rows.length === 0) {
        importParseError.value = 'ไม่พบข้อมูลในไฟล์ (ไฟล์ว่าง)'
        return
      }

      // Map columns
      importPreview.value = rows.map((row, idx) => {
        const rawType = String(row['ประเภทการลา'] || row['leaveType'] || '').trim()
        const mapped = {
          _rowIndex: idx + 2, // +2 for 1-based + header row
          userId: String(row['อีเมลพนักงาน'] || row['userId'] || row['email'] || '').trim(),
          firstName: String(row['ชื่อ'] || row['firstName'] || '').trim(),
          lastName: String(row['นามสกุล'] || row['lastName'] || '').trim(),
          leaveType: leaveTypeMap[rawType] || '',
          startDate: formatExcelDate(row['วันที่เริ่ม'] || row['startDate'] || ''),
          endDate: formatExcelDate(row['วันที่สิ้นสุด'] || row['endDate'] || ''),
          department: String(row['แผนก'] || row['department'] || '').trim(),
          details: String(row['รายละเอียด'] || row['details'] || '').trim(),
          submittedAt: formatExcelDate(row['วันที่ส่ง'] || row['submittedAt'] || ''),
          _errors: []
        }
        mapped._errors = validateRow(mapped)
        return mapped
      })
    } catch (err) {
      console.error('Error parsing Excel:', err)
      importParseError.value = 'ไม่สามารถอ่านไฟล์ได้ — กรุณาตรวจสอบรูปแบบไฟล์'
    }
  }
  reader.readAsArrayBuffer(file)
}

// File handlers
const handleFileSelect = (event) => {
  const file = event.target.files?.[0]
  if (file) {
    importFile.value = file
    parseExcel(file)
  }
}

const handleDrop = (event) => {
  isDragging.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
    importFile.value = file
    parseExcel(file)
  } else {
    importParseError.value = 'กรุณาใช้ไฟล์ .xlsx เท่านั้น'
  }
}

const clearImport = () => {
  importFile.value = null
  importPreview.value = []
  importParseError.value = ''
  importResult.value = null
  isDragging.value = false
}

// Download blank template
const downloadTemplate = () => {
  const headers = [
    { 'อีเมลพนักงาน': 'user@example.com', 'ชื่อ': 'สมชาย', 'นามสกุล': 'ใจดี', 'ประเภทการลา': 'ลาป่วย', 'วันที่เริ่ม': '2025-01-15', 'วันที่สิ้นสุด': '2025-01-16', 'แผนก': 'IT', 'รายละเอียด': 'ไม่สบาย', 'วันที่ส่ง': '2025-01-14' }
  ]
  const ws = XLSX.utils.json_to_sheet(headers)

  // Column widths
  ws['!cols'] = [
    { wch: 25 }, // อีเมลพนักงาน
    { wch: 15 }, // ชื่อ
    { wch: 15 }, // นามสกุล
    { wch: 15 }, // ประเภทการลา
    { wch: 14 }, // วันที่เริ่ม
    { wch: 14 }, // วันที่สิ้นสุด
    { wch: 15 }, // แผนก
    { wch: 25 }, // รายละเอียด
    { wch: 14 }  // วันที่ส่ง
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'LeaveImport')
  XLSX.writeFile(wb, 'leave-import-template.xlsx')
}

// Execute import
const handleImport = async () => {
  if (validRows.value.length === 0) return

  const confirmed = confirm(`ยืนยันนำเข้าข้อมูลการลา ${validRows.value.length} รายการ?`)
  if (!confirmed) return

  const result = await leaveStore.importLeaves(validRows.value)
  importResult.value = result

  if (result.success > 0) {
    // Clear preview after successful import
    importPreview.value = []
    importFile.value = null
  }
}

// ====== Punch/Attendance Import ======
const punchDragging = ref(false)
const punchFile = ref(null)
const punchParsing = ref(false)
const punchParseError = ref('')
const punchPreview = ref([])
const punchMonth = ref('')
const punchYear = ref('')
const punchDuplicates = ref({})
const punchDupAction = ref('overwrite')
const punchImportResult = ref(null)

const punchMatchedCount = computed(() => punchPreview.value.filter(e => e.matchedUser).length)
const punchUnmatchedCount = computed(() => punchPreview.value.filter(e => !e.matchedUser).length)
const punchImportableCount = computed(() => {
  if (punchDupAction.value === 'skip') {
    return punchPreview.value.filter(e => e.matchedUser && !punchDuplicates.value[e.matchedUser.email]).length
  }
  return punchMatchedCount.value
})

const clearPunchImport = () => {
  punchFile.value = null
  punchPreview.value = []
  punchParseError.value = ''
  punchParsing.value = false
  punchMonth.value = ''
  punchYear.value = ''
  punchDuplicates.value = {}
  punchDupAction.value = 'overwrite'
  punchImportResult.value = null
}

const handlePunchFileSelect = (event) => {
  const file = event.target.files?.[0]
  if (file) {
    punchFile.value = file
    parsePunchFile(file)
  }
}

const handlePunchDrop = (event) => {
  punchDragging.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
    punchFile.value = file
    parsePunchFile(file)
  } else {
    punchParseError.value = 'กรุณาใช้ไฟล์ .xls หรือ .xlsx'
  }
}

const parsePunchFile = (file) => {
  punchPreview.value = []
  punchParseError.value = ''
  punchImportResult.value = null
  punchParsing.value = true

  const reader = new FileReader()
  reader.onload = async (e) => {
    try {
      const data = new Uint8Array(e.target.result)
      const wb = XLSX.read(data, { type: 'array', raw: true })
      const sheet = wb.Sheets[wb.SheetNames[0]]
      if (!sheet) {
        punchParseError.value = 'ไม่พบข้อมูลใน Sheet แรก'
        punchParsing.value = false
        return
      }

      // Get raw rows as 2D array
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: true })
      if (rows.length < 3) {
        punchParseError.value = 'ไฟล์ไม่มีข้อมูลเพียงพอ'
        punchParsing.value = false
        return
      }

      // Parse title row to extract year and month
      const titleRow = String(rows[0]?.[0] || '')
      const titleMatch = titleRow.match(/(\d{4}):(\d{1,2})\/(\d{1,2})-(\d{1,2})\/(\d{1,2})/)
      let year = new Date().getFullYear()
      let month = 1
      if (titleMatch) {
        year = parseInt(titleMatch[1])
        month = parseInt(titleMatch[2])
      }
      punchYear.value = year
      punchMonth.value = `${year}-${String(month).padStart(2, '0')}`

      // Build profiles map by punchId
      const profilesByPunchId = {}
      authStore.allProfiles.forEach(p => {
        if (p.punchId) {
          profilesByPunchId[p.punchId] = p
        }
      })

      // Parse employee blocks
      const employees = []
      let i = 1 // Skip title row
      while (i < rows.length) {
        const row = rows[i]
        const cellVal = String(row?.[0] || '').trim()

        // Look for employee header: "ID:00000001  ชื่อ:..."
        const headerMatch = cellVal.match(/ID:(\d+)\s+ชื่อ:(\S+)\s+แผนก:(\S+)\s+ตารางเวลา:(\S+)/)
        if (headerMatch) {
          const punchId = headerMatch[1]
          const nameFromFile = headerMatch[2]
          const deptFromFile = headerMatch[3]
          const shift = headerMatch[4]

          // Next row should be day numbers (1-31), skip it
          i++
          // The row after that should be the time data
          i++
          if (i >= rows.length) break

          const timeRow = rows[i]
          const days = []

          for (let d = 0; d < 31; d++) {
            const cellValue = String(timeRow?.[d] || '').trim()
            if (cellValue) {
              const times = cellValue.split(/\s+/).filter(t => /^\d{1,2}:\d{2}$/.test(t))
              if (times.length > 0) {
                days.push({
                  day: d + 1,
                  date: `${year}-${String(month).padStart(2, '0')}-${String(d + 1).padStart(2, '0')}`,
                  punchIn: times[0] || null,
                  punchOut: times.length > 1 ? times[times.length - 1] : null
                })
              }
            }
          }

          const matchedUser = profilesByPunchId[punchId] || null

          employees.push({
            punchId,
            nameFromFile,
            deptFromFile,
            shift,
            matchedUser,
            dayCount: days.length,
            days
          })
        }
        i++
      }

      if (employees.length === 0) {
        punchParseError.value = 'ไม่พบข้อมูลพนักงานในไฟล์ — กรุณาตรวจสอบรูปแบบไฟล์'
        punchParsing.value = false
        return
      }

      punchPreview.value = employees

      // Check for duplicates
      const matchedUserIds = employees.filter(e => e.matchedUser).map(e => e.matchedUser.email)
      if (matchedUserIds.length > 0) {
        punchDuplicates.value = await attendanceStore.checkDuplicates(matchedUserIds, punchMonth.value)
      }
    } catch (err) {
      console.error('Error parsing punch file:', err)
      punchParseError.value = 'ไม่สามารถอ่านไฟล์ได้ — กรุณาตรวจสอบรูปแบบไฟล์'
    } finally {
      punchParsing.value = false
    }
  }
  reader.readAsArrayBuffer(file)
}

const handlePunchImport = async () => {
  if (punchImportableCount.value === 0) return

  const confirmed = confirm(`ยืนยันนำเข้าเวลาสแกนนิ้ว ${punchImportableCount.value} คน?`)
  if (!confirmed) return

  // Build records to import
  const records = []
  const overwriteUserIds = []

  for (const emp of punchPreview.value) {
    if (!emp.matchedUser) continue
    const userId = emp.matchedUser.email

    // Skip duplicates if action is 'skip'
    if (punchDupAction.value === 'skip' && punchDuplicates.value[userId]) continue

    // Mark for overwrite if needed
    if (punchDuplicates.value[userId] && punchDupAction.value === 'overwrite') {
      overwriteUserIds.push(userId)
    }

    for (const day of emp.days) {
      records.push({
        userId,
        userName: `${emp.matchedUser.firstName || ''} ${emp.matchedUser.lastName || ''}`.trim(),
        punchId: emp.punchId,
        date: day.date,
        punchIn: day.punchIn,
        punchOut: day.punchOut,
        department: emp.matchedUser.department || emp.deptFromFile,
        shift: emp.shift,
        importedBy: authStore.profile?.email || '',
        importMonth: punchMonth.value
      })
    }
  }

  const result = await attendanceStore.importAttendance(records, overwriteUserIds)
  punchImportResult.value = result

  if (result.success > 0) {
    punchPreview.value = []
    punchFile.value = null
  }
}

// ====== Company Holidays ======
const currentYear = new Date().getFullYear()
const holidayYear = ref(currentYear)
const availableYears = computed(() => {
  const years = []
  for (let y = currentYear - 1; y <= currentYear + 2; y++) {
    years.push(y)
  }
  return years
})

// Add holiday form
const newHolidayDate = ref('')
const newHolidayName = ref('')
const newHolidayType = ref('company')

// Edit holiday state
const editingHolidayDate = ref(null)
const editHolidayNewDate = ref('')
const editHolidayName = ref('')
const editHolidayType = ref('company')

// Delete holiday dialog
const showDeleteHolidayDialog = ref(false)
const deletingHoliday = ref(null)

// Copy dialog
const showCopyDialog = ref(false)
const copySourceYear = ref(currentYear - 1)

// Save result notification
const holidaySaveResult = ref(null)

// Sorted holidays for display
const editableHolidays = computed(() => {
  return [...holidayStore.holidays].sort((a, b) => a.date.localeCompare(b.date))
})

// Load holidays when year changes
const loadHolidaysForYear = async () => {
  await holidayStore.fetchHolidays(holidayYear.value)
}

// Format date for display
const formatHolidayDate = (dateStr) => {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })
}

// Get day of week
const getDayOfWeek = (dateStr) => {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString('th-TH', { weekday: 'short' })
}

// Add a holiday
const handleAddHoliday = async () => {
  if (!newHolidayDate.value || !newHolidayName.value.trim()) return

  const dateYear = parseInt(newHolidayDate.value.split('-')[0])
  if (dateYear !== holidayYear.value) {
    holidaySaveResult.value = { success: false, message: `วันที่ต้องอยู่ในปี ${holidayYear.value}` }
    setTimeout(() => { holidaySaveResult.value = null }, 3000)
    return
  }

  const success = await holidayStore.addHoliday(
    holidayYear.value,
    newHolidayDate.value,
    newHolidayName.value.trim(),
    newHolidayType.value
  )

  if (success) {
    newHolidayDate.value = ''
    newHolidayName.value = ''
    newHolidayType.value = 'company'
    holidaySaveResult.value = { success: true, message: 'เพิ่มวันหยุดเรียบร้อย' }
  } else {
    holidaySaveResult.value = { success: false, message: holidayStore.error || 'เกิดข้อผิดพลาด' }
  }
  setTimeout(() => { holidaySaveResult.value = null }, 3000)
}

// Remove a holiday (open dialog)
const handleRemoveHoliday = (h) => {
  deletingHoliday.value = h
  showDeleteHolidayDialog.value = true
}

// Confirm delete holiday
const confirmDeleteHoliday = async () => {
  if (!deletingHoliday.value) return
  showDeleteHolidayDialog.value = false
  const h = deletingHoliday.value
  deletingHoliday.value = null

  const success = await holidayStore.removeHoliday(holidayYear.value, h.date)
  if (success) {
    holidaySaveResult.value = { success: true, message: 'ลบวันหยุดเรียบร้อย' }
  } else {
    holidaySaveResult.value = { success: false, message: holidayStore.error || 'เกิดข้อผิดพลาด' }
  }
  setTimeout(() => { holidaySaveResult.value = null }, 3000)
}

// Start editing a holiday
const startEditHoliday = (h) => {
  editingHolidayDate.value = h.date
  editHolidayNewDate.value = h.date
  editHolidayName.value = h.name
  editHolidayType.value = h.type || 'company'
}

// Save edited holiday
const handleUpdateHoliday = async (oldDate) => {
  if (!editHolidayNewDate.value || !editHolidayName.value.trim()) return
  const success = await holidayStore.updateHoliday(
    holidayYear.value,
    oldDate,
    editHolidayNewDate.value,
    editHolidayName.value.trim(),
    editHolidayType.value
  )
  if (success) {
    editingHolidayDate.value = null
    holidaySaveResult.value = { success: true, message: 'แก้ไขวันหยุดเรียบร้อย' }
  } else {
    holidaySaveResult.value = { success: false, message: holidayStore.error || 'เกิดข้อผิดพลาด' }
  }
  setTimeout(() => { holidaySaveResult.value = null }, 3000)
}

// Load Thai national holiday presets
const loadThaiPresets = async () => {
  const presets = holidayStore.getThaiHolidayPresets(holidayYear.value)
  const existingDates = new Set(holidayStore.holidays.map(h => h.date))
  const newOnes = presets.filter(p => !existingDates.has(p.date))

  if (newOnes.length === 0) {
    holidaySaveResult.value = { success: true, message: 'วันหยุดนักขัตฤกษ์ทั้งหมดมีอยู่แล้ว' }
    setTimeout(() => { holidaySaveResult.value = null }, 3000)
    return
  }

  const merged = [...holidayStore.holidays, ...newOnes]
  const success = await holidayStore.saveHolidays(holidayYear.value, merged)
  if (success) {
    await holidayStore.fetchHolidays(holidayYear.value)
    holidaySaveResult.value = { success: true, message: `เพิ่มวันหยุดนักขัตฤกษ์ ${newOnes.length} วัน` }
  } else {
    holidaySaveResult.value = { success: false, message: holidayStore.error || 'เกิดข้อผิดพลาด' }
  }
  setTimeout(() => { holidaySaveResult.value = null }, 3000)
}

// Copy holidays from another year
const handleCopyFromYear = async () => {
  showCopyDialog.value = false
  const success = await holidayStore.copyFromYear(copySourceYear.value, holidayYear.value)
  if (success) {
    await holidayStore.fetchHolidays(holidayYear.value)
    holidaySaveResult.value = { success: true, message: `คัดลอกวันหยุดจากปี ${copySourceYear.value} เรียบร้อย` }
  } else {
    holidaySaveResult.value = { success: false, message: holidayStore.error || 'เกิดข้อผิดพลาด' }
  }
  setTimeout(() => { holidaySaveResult.value = null }, 3000)
}

// ====== Admin Notifications ======
const notifTarget = ref('all') // 'all' | 'department' | 'individual'
const notifDepartment = ref('')
const notifUserSearch = ref('')
const notifSelectedEmails = ref([])
const notifTitle = ref('')
const notifMessage = ref('')
const sendingNotif = ref(false)
const notifSendResult = ref(null)
const adminBroadcastHistory = ref([])
const showConfirmDialog = ref(false)
const notifImageFile = ref(null)
const notifImagePreview = ref(null)
const uploadingImage = ref(false)

// Filter users for individual selection
const filteredNotifUsers = computed(() => {
  const s = notifUserSearch.value.toLowerCase().trim()
  const profiles = authStore.allProfiles.filter(u => (u.email || u.id) !== authStore.user?.email)
  if (!s) return profiles
  return profiles.filter(u =>
    (u.email || '').toLowerCase().includes(s) ||
    (u.firstName || '').toLowerCase().includes(s) ||
    (u.lastName || '').toLowerCase().includes(s)
  )
})

// Toggle individual user selection
const toggleUserSelect = (usr) => {
  const email = usr.email || usr.id
  const idx = notifSelectedEmails.value.indexOf(email)
  if (idx >= 0) {
    notifSelectedEmails.value.splice(idx, 1)
  } else {
    notifSelectedEmails.value.push(email)
  }
}

const handleNotifImageSelect = (event) => {
  const file = event.target.files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) {
    alert('กรุณาเลือกไฟล์รูปภาพเท่านั้น')
    event.target.value = ''
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    alert('ขนาดไฟล์ต้องไม่เกิน 5MB')
    event.target.value = ''
    return
  }
  notifImageFile.value = file
  if (notifImagePreview.value) URL.revokeObjectURL(notifImagePreview.value)
  notifImagePreview.value = URL.createObjectURL(file)
  event.target.value = ''
}

const removeNotifImage = () => {
  if (notifImagePreview.value) URL.revokeObjectURL(notifImagePreview.value)
  notifImageFile.value = null
  notifImagePreview.value = null
}

// Recipient summary text
const notifRecipientSummary = computed(() => {
  if (notifTarget.value === 'all') {
    const count = authStore.allProfiles.filter(u => (u.email || u.id) !== authStore.user?.email).length
    return `จะส่งถึงพนักงานทุกคน (${count} คน)`
  }
  if (notifTarget.value === 'department') {
    if (!notifDepartment.value) return ''
    const count = authStore.allProfiles.filter(u => u.department === notifDepartment.value && (u.email || u.id) !== authStore.user?.email).length
    return `จะส่งถึงแผนก "${notifDepartment.value}" (${count} คน)`
  }
  if (notifTarget.value === 'individual') {
    if (notifSelectedEmails.value.length === 0) return ''
    return `จะส่งถึง ${notifSelectedEmails.value.length} คนที่เลือก`
  }
  return ''
})

// Validate can send
const canSendNotif = computed(() => {
  if (!notifMessage.value.trim()) return false
  if (notifTarget.value === 'department' && !notifDepartment.value) return false
  if (notifTarget.value === 'individual' && notifSelectedEmails.value.length === 0) return false
  return true
})

// Computed: recipient count for confirm dialog
const confirmRecipientCount = computed(() => {
  if (notifTarget.value === 'all') {
    return authStore.allProfiles.filter(u => (u.email || u.id) !== authStore.user?.email).length
  }
  if (notifTarget.value === 'department') {
    return authStore.allProfiles.filter(u => u.department === notifDepartment.value && (u.email || u.id) !== authStore.user?.email).length
  }
  return notifSelectedEmails.value.length
})

// Confirm and actually send
const confirmAndSendNotif = async () => {
  showConfirmDialog.value = false

  if (!canSendNotif.value) return

  sendingNotif.value = true
  notifSendResult.value = null

  try {
    let target
    if (notifTarget.value === 'all') {
      target = { type: 'all' }
    } else if (notifTarget.value === 'department') {
      target = { type: 'department', department: notifDepartment.value }
    } else {
      target = { type: 'individual', emails: [...notifSelectedEmails.value] }
    }

    let imageURL = null
    if (notifImageFile.value) {
      uploadingImage.value = true
      const timestamp = Date.now()
      const safeName = notifImageFile.value.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const filePath = `notifications/images/${timestamp}_${safeName}`
      const fileRef = storageRef(storage, filePath)
      await uploadBytes(fileRef, notifImageFile.value)
      imageURL = await getDownloadURL(fileRef)
      uploadingImage.value = false
    }

    const result = await notificationsStore.sendAdminNotification({
      target,
      title: notifTitle.value.trim() || 'ประกาศจากผู้ดูแลระบบ',
      message: notifMessage.value.trim(),
      imageURL
    })

    notifSendResult.value = { success: result.success, total: result.total }

    if (result.success > 0) {
      notifTitle.value = ''
      notifMessage.value = ''
      notifSelectedEmails.value = []
      notifDepartment.value = ''
      removeNotifImage()
      fetchBroadcastHistory()
    }
  } catch (err) {
    uploadingImage.value = false
    notifSendResult.value = { success: 0, total: 0, error: err.message || 'เกิดข้อผิดพลาด' }
  } finally {
    sendingNotif.value = false
  }
}

// Fetch recent admin broadcast history (sent by current admin)
const fetchBroadcastHistory = async () => {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('type', '==', 'admin_broadcast'),
      where('senderEmail', '==', authStore.user?.email),
      orderBy('createdAt', 'desc'),
      limit(20)
    )
    const snap = await getDocs(q)
    // Deduplicate by title+message+createdAt (since one broadcast = many docs)
    const seen = new Map()
    snap.docs.forEach(d => {
      const data = d.data()
      const key = `${data.title}|${data.message}|${data.createdAt?.seconds}`
      if (!seen.has(key)) {
        seen.set(key, { id: d.id, ...data })
      }
    })
    adminBroadcastHistory.value = Array.from(seen.values())
  } catch (err) {
    console.error('Error fetching broadcast history:', err)
  }
}

// Format broadcast time
const formatBroadcastTime = (ts) => {
  if (!ts) return ''
  const date = ts.toDate ? ts.toDate() : new Date(ts)
  const now = new Date()
  const diff = now - date
  if (diff < 60000) return 'เมื่อสักครู่'
  if (diff < 3600000) return `${Math.floor(diff / 60000)} นาทีที่แล้ว`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} ชั่วโมงที่แล้ว`
  return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

</script>

<style scoped>
.admin-page {
  background: #16181a;
  min-height: 100vh;
  padding: 24px;
}

.admin-container {
  max-width: 900px;
  margin: 0 auto;
}

/* Header */
.admin-page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.admin-header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.admin-header-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(239, 83, 80, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ef5350;
}

.admin-header-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #e1e2e5;
  letter-spacing: 0.3px;
}

.admin-header-subtitle {
  font-size: 0.78rem;
  color: #6b6c6f;
  margin-top: 2px;
}

.admin-back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 8px;
  border: 1px solid rgba(58, 59, 62, 0.4);
  background: transparent;
  color: #9ca3af;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
}

.admin-back-btn:hover {
  background: rgba(58, 59, 62, 0.3);
  color: #cecfd2;
}

/* Tabs */
.admin-tabs {
  display: flex;
  gap: 4px;
  background: rgba(30, 33, 36, 0.6);
  border-radius: 10px;
  padding: 4px;
  margin-bottom: 20px;
}

.admin-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #6b6c6f;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.admin-tab:hover {
  color: #9ca3af;
}

.admin-tab-active {
  background: rgba(92, 156, 230, 0.12);
  color: #5c9ce6;
}

.admin-tab-badge {
  background: rgba(92, 156, 230, 0.2) !important;
  color: #5c9ce6 !important;
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 10px;
}

/* Search */
.admin-search-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: rgba(30, 33, 36, 0.6);
  border: 1px solid rgba(58, 59, 62, 0.3);
  border-radius: 10px;
  margin-bottom: 16px;
}

.admin-search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #cecfd2;
  font-size: 0.82rem;
  font-family: inherit;
}

.admin-search-input::placeholder {
  color: #4b5563;
}

/* Empty */
.admin-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 40px 0;
  color: #4b5563;
  font-size: 0.82rem;
}

/* User Card */
.admin-user-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.admin-user-card {
  background: rgba(30, 33, 36, 0.5);
  border: 1px solid rgba(58, 59, 62, 0.3);
  border-radius: 12px;
  padding: 16px;
  transition: border-color 0.2s;
}

.admin-user-card:hover {
  border-color: rgba(92, 156, 230, 0.3);
}

.admin-user-top {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}

.admin-user-avatar {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: linear-gradient(135deg, #5c9ce6 0%, #3a7bd5 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.85rem;
  font-weight: 700;
  flex-shrink: 0;
  overflow: hidden;
}

.admin-user-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.admin-user-info {
  flex: 1;
  min-width: 0;
}

.admin-user-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: #e1e2e5;
}

.admin-user-email {
  font-size: 0.75rem;
  color: #6b6c6f;
  margin-top: 1px;
}

.admin-user-current-role {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 6px;
  background: rgba(58, 59, 62, 0.3);
  font-size: 0.72rem;
  color: #9ca3af;
  white-space: nowrap;
}

/* User Projects */
.admin-user-projects {
  margin-bottom: 12px;
}

.admin-user-projects-label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.72rem;
  font-weight: 600;
  color: #6b6c6f;
  margin-bottom: 6px;
  letter-spacing: 0.3px;
}

.admin-user-projects-empty .admin-user-projects-label {
  color: #4b5563;
  margin-bottom: 0;
}

.admin-user-projects-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.admin-project-chip {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 6px;
  background: rgba(92, 156, 230, 0.1);
  color: #7db8f0;
  font-size: 0.72rem;
  font-weight: 500;
  border: 1px solid rgba(92, 156, 230, 0.15);
}

.admin-user-fields {
  display: flex;
  align-items: flex-end;
  gap: 12px;
}

.admin-field {
  flex: 1;
}

.admin-field-label {
  display: block;
  font-size: 0.72rem;
  font-weight: 600;
  color: #6b6c6f;
  margin-bottom: 4px;
  letter-spacing: 0.3px;
}

.admin-select {
  width: 100%;
  padding: 7px 10px;
  border-radius: 8px;
  border: 1px solid rgba(58, 59, 62, 0.4);
  background: rgba(22, 24, 26, 0.8);
  color: #cecfd2;
  font-size: 0.8rem;
  font-family: inherit;
  outline: none;
  cursor: pointer;
  appearance: auto;
}

.admin-select:focus {
  border-color: rgba(92, 156, 230, 0.5);
}

.admin-save-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 16px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #5c9ce6 0%, #3a7bd5 100%);
  color: white;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.admin-save-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(92, 156, 230, 0.3);
}

.admin-save-btn:disabled {
  opacity: 0.4;
  cursor: default;
}

.admin-punch-id-warn {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.68rem;
  color: #ffb74d;
  margin-top: 2px;
}

.admin-save-success {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
  font-size: 0.75rem;
  color: #66bb6a;
}

/* Skip Head Approval Toggle */
.admin-skip-head-row {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid rgba(58, 59, 62, 0.2);
}

.admin-skip-head-toggle {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
}

.admin-toggle-track {
  width: 36px;
  height: 20px;
  border-radius: 10px;
  background: rgba(58, 59, 62, 0.5);
  position: relative;
  transition: background 0.2s;
  flex-shrink: 0;
}

.admin-toggle-active {
  background: rgba(206, 147, 216, 0.5);
}

.admin-toggle-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #6b6c6f;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: all 0.2s;
}

.admin-toggle-active .admin-toggle-thumb {
  left: 18px;
  background: #ce93d8;
}

.admin-skip-head-label {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.admin-skip-head-text {
  font-size: 0.78rem;
  font-weight: 600;
  color: #cecfd2;
}

.admin-skip-head-hint {
  font-size: 0.68rem;
  color: #6b6c6f;
}

/* Department */
.admin-add-dept {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}

.admin-dept-input {
  flex: 1;
  padding: 9px 14px;
  border-radius: 8px;
  border: 1px solid rgba(58, 59, 62, 0.4);
  background: rgba(30, 33, 36, 0.6);
  color: #cecfd2;
  font-size: 0.82rem;
  font-family: inherit;
  outline: none;
}

.admin-dept-input:focus {
  border-color: rgba(92, 156, 230, 0.5);
}

.admin-dept-input::placeholder {
  color: #4b5563;
}

.admin-add-dept-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 18px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #66bb6a 0%, #43a047 100%);
  color: white;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.admin-add-dept-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 187, 106, 0.3);
}

.admin-add-dept-btn:disabled {
  opacity: 0.4;
  cursor: default;
}

.admin-dept-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.admin-dept-card {
  background: rgba(30, 33, 36, 0.5);
  border: 1px solid rgba(58, 59, 62, 0.3);
  border-radius: 10px;
  overflow: hidden;
  transition: border-color 0.2s;
}

.admin-dept-card:hover {
  border-color: rgba(58, 59, 62, 0.5);
}

.admin-dept-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
}

.admin-dept-edit {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
}

.admin-dept-edit .admin-dept-input {
  border-color: rgba(92, 156, 230, 0.5);
}

.admin-dept-icon {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: rgba(92, 156, 230, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #5c9ce6;
  flex-shrink: 0;
}

.admin-dept-name {
  flex: 1;
  font-size: 0.85rem;
  font-weight: 600;
  color: #e1e2e5;
}

.admin-dept-count {
  font-size: 0.75rem;
  color: #6b6c6f;
  padding: 3px 8px;
  background: rgba(58, 59, 62, 0.2);
  border-radius: 6px;
}

.admin-dept-actions {
  display: flex;
  gap: 4px;
}

.admin-dept-action-btn {
  width: 30px;
  height: 30px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: #6b6c6f;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.admin-dept-action-btn:hover {
  background: rgba(58, 59, 62, 0.3);
  color: #cecfd2;
}

.admin-dept-delete-btn:hover {
  background: rgba(239, 83, 80, 0.12);
  color: #ef5350;
}

.admin-dept-save-btn {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  border: none;
  background: rgba(102, 187, 106, 0.15);
  color: #66bb6a;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.admin-dept-save-btn:hover {
  background: rgba(102, 187, 106, 0.25);
}

.admin-dept-cancel-btn {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  border: none;
  background: rgba(239, 83, 80, 0.1);
  color: #ef5350;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.admin-dept-cancel-btn:hover {
  background: rgba(239, 83, 80, 0.2);
}

/* ====== Import Section ====== */
.import-card {
  background: rgba(30, 33, 36, 0.5);
  border: 1px solid rgba(58, 59, 62, 0.3);
  border-radius: 14px;
  overflow: hidden;
}

.import-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 16px;
  border-bottom: 1px solid rgba(58, 59, 62, 0.2);
}

.import-card-title {
  font-size: 0.88rem;
  font-weight: 700;
  color: #cecfd2;
}

.import-card-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.import-info-box {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 10px;
  background: rgba(66, 165, 245, 0.06);
  border: 1px solid rgba(66, 165, 245, 0.12);
  font-size: 0.75rem;
  color: #42a5f5;
}

.import-template-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid rgba(102, 187, 106, 0.3);
  background: rgba(102, 187, 106, 0.08);
  color: #66bb6a;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  align-self: flex-start;
}

.import-template-btn:hover {
  background: rgba(102, 187, 106, 0.16);
  border-color: rgba(102, 187, 106, 0.5);
}

/* Upload Area */
.import-upload-area {
  border: 2px dashed rgba(58, 59, 62, 0.4);
  border-radius: 12px;
  transition: all 0.2s;
  background: rgba(24, 25, 28, 0.3);
}

.import-upload-area:hover {
  border-color: rgba(92, 156, 230, 0.3);
}

.import-upload-dragover {
  border-color: rgba(92, 156, 230, 0.6) !important;
  background: rgba(92, 156, 230, 0.04) !important;
}

.import-upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 36px 20px;
  color: #4b5563;
}

.import-upload-text {
  font-size: 0.78rem;
  color: #6b6c6f;
}

.import-upload-hint {
  font-size: 0.65rem;
  color: #4b5563;
}

.import-browse-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 16px;
  margin-top: 6px;
  border-radius: 8px;
  border: 1px solid rgba(92, 156, 230, 0.3);
  background: rgba(92, 156, 230, 0.08);
  color: #5c9ce6;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.import-browse-btn:hover {
  background: rgba(92, 156, 230, 0.16);
  border-color: rgba(92, 156, 230, 0.5);
}

.import-upload-selected {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
}

.import-file-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.import-file-name {
  font-size: 0.82rem;
  font-weight: 600;
  color: #e1e2e5;
}

.import-file-size {
  font-size: 0.68rem;
  color: #6b6c6f;
}

.import-remove-btn {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: none;
  background: rgba(239, 83, 80, 0.1);
  color: #ef5350;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;
}

.import-remove-btn:hover {
  background: rgba(239, 83, 80, 0.2);
}

/* Parse Error */
.import-error-box {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 10px;
  background: rgba(239, 83, 80, 0.06);
  border: 1px solid rgba(239, 83, 80, 0.12);
  font-size: 0.75rem;
  color: #ef5350;
}

/* Preview Section */
.import-preview-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.import-preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}

.import-preview-title {
  font-size: 0.82rem;
  font-weight: 700;
  color: #cecfd2;
}

.import-preview-summary {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.7rem;
  font-weight: 600;
}

.import-summary-total { color: #9ca3af; }
.import-summary-valid { color: #66bb6a; }
.import-summary-invalid { color: #ef5350; }

/* Preview Table */
.import-table-wrapper {
  overflow-x: auto;
  border: 1px solid rgba(58, 59, 62, 0.3);
  border-radius: 10px;
  max-height: 400px;
  overflow-y: auto;
}

.import-table-wrapper::-webkit-scrollbar { width: 4px; height: 4px; }
.import-table-wrapper::-webkit-scrollbar-thumb { background: rgba(58, 59, 62, 0.4); border-radius: 2px; }

.import-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.72rem;
}

.import-table thead {
  position: sticky;
  top: 0;
  z-index: 1;
}

.import-table th {
  padding: 8px 10px;
  background: rgba(24, 25, 28, 0.9);
  color: #6b6c6f;
  font-weight: 700;
  text-align: left;
  white-space: nowrap;
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  border-bottom: 1px solid rgba(58, 59, 62, 0.3);
}

.import-table td {
  padding: 7px 10px;
  color: #cecfd2;
  border-bottom: 1px solid rgba(58, 59, 62, 0.1);
  white-space: nowrap;
}

.import-table tbody tr:hover {
  background: rgba(58, 59, 62, 0.06);
}

.import-row-invalid {
  background: rgba(239, 83, 80, 0.04) !important;
}

.import-row-invalid td {
  color: #ef5350 !important;
}

.import-th-seq, .import-td-seq {
  width: 36px;
  text-align: center;
}

.import-td-seq {
  font-weight: 700;
  color: #6b6c6f !important;
}

.import-type-pill {
  display: inline-flex;
  padding: 2px 8px;
  border-radius: 4px;
  background: rgba(255, 183, 77, 0.08);
  font-size: 0.68rem;
}

.import-th-status {
  width: 140px;
}

.import-td-status {
  width: 140px;
}

.import-status-ok {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #66bb6a;
  font-weight: 600;
}

.import-status-error {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #ef5350;
  font-weight: 600;
  max-width: 130px;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Actions */
.import-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.import-clear-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 8px;
  border: 1px solid rgba(58, 59, 62, 0.3);
  background: transparent;
  color: #6b6c6f;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.import-clear-btn:hover {
  border-color: rgba(239, 83, 80, 0.3);
  color: #ef5350;
}

.import-skip-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.68rem;
  color: #ffb74d;
}

.import-submit-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 20px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #ffb74d 0%, #ef6c00 100%);
  color: white;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.import-submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(255, 152, 0, 0.25);
}

.import-submit-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Import Result */
.import-result-box {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  border-radius: 10px;
}

.import-result-success {
  background: rgba(102, 187, 106, 0.08);
  border: 1px solid rgba(102, 187, 106, 0.2);
  color: #66bb6a;
}

.import-result-warn {
  background: rgba(255, 183, 77, 0.08);
  border: 1px solid rgba(255, 183, 77, 0.2);
  color: #ffb74d;
}

.import-result-title {
  font-size: 0.82rem;
  font-weight: 700;
}

.import-result-errors {
  font-size: 0.72rem;
  margin-top: 2px;
  opacity: 0.8;
}

/* ====== Notification Send Tab ====== */
.notif-send-card {
  background: rgba(30, 33, 36, 0.5);
  border: 1px solid rgba(58, 59, 62, 0.3);
  border-radius: 12px;
  overflow: hidden;
}

.notif-send-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(58, 59, 62, 0.2);
}

.notif-send-title {
  font-size: 0.92rem;
  font-weight: 700;
  color: #e1e2e5;
}

.notif-send-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.notif-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.notif-field-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: #9ca3af;
  letter-spacing: 0.3px;
}

.notif-target-options {
  display: flex;
  gap: 6px;
}

.notif-target-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid rgba(58, 59, 62, 0.4);
  background: rgba(22, 24, 26, 0.6);
  color: #6b6c6f;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.notif-target-btn:hover {
  border-color: rgba(92, 156, 230, 0.3);
  color: #9ca3af;
}

.notif-target-active {
  background: rgba(92, 156, 230, 0.1);
  border-color: rgba(92, 156, 230, 0.4);
  color: #5c9ce6;
}

.notif-user-search-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(22, 24, 26, 0.6);
  border: 1px solid rgba(58, 59, 62, 0.4);
  border-radius: 8px;
}

.notif-user-list {
  max-height: 260px;
  overflow-y: auto;
  border: 1px solid rgba(58, 59, 62, 0.3);
  border-radius: 10px;
  background: rgba(22, 24, 26, 0.4);
}

.notif-user-list::-webkit-scrollbar {
  width: 5px;
}

.notif-user-list::-webkit-scrollbar-track {
  background: transparent;
}

.notif-user-list::-webkit-scrollbar-thumb {
  background: rgba(58, 59, 62, 0.5);
  border-radius: 10px;
}

.notif-user-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid rgba(58, 59, 62, 0.15);
}

.notif-user-option:last-child {
  border-bottom: none;
}

.notif-user-option:hover {
  background: rgba(92, 156, 230, 0.06);
}

.notif-user-selected {
  background: rgba(92, 156, 230, 0.08);
}

.notif-user-selected .notif-user-check {
  color: #5c9ce6;
}

.notif-user-check {
  color: #4b5563;
  flex-shrink: 0;
}

.notif-user-avatar-sm {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: linear-gradient(135deg, #5c9ce6 0%, #3a7bd5 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  flex-shrink: 0;
  overflow: hidden;
}

.notif-user-detail {
  flex: 1;
  min-width: 0;
}

.notif-user-name {
  font-size: 0.82rem;
  font-weight: 600;
  color: #e1e2e5;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.notif-user-email {
  font-size: 0.72rem;
  color: #6b6c6f;
  margin-top: 1px;
}

.notif-user-dept-chip {
  padding: 2px 8px;
  border-radius: 6px;
  background: rgba(92, 156, 230, 0.1);
  color: #7db8f0;
  font-size: 0.68rem;
  font-weight: 500;
  white-space: nowrap;
  flex-shrink: 0;
}

.notif-user-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 24px 0;
  color: #4b5563;
  font-size: 0.8rem;
}

.notif-selected-count {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  color: #5c9ce6;
  margin-top: 4px;
}

.notif-input {
  width: 100%;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid rgba(58, 59, 62, 0.4);
  background: rgba(22, 24, 26, 0.8);
  color: #cecfd2;
  font-size: 0.85rem;
  font-family: inherit;
  outline: none;
  box-sizing: border-box;
}

.notif-input:focus {
  border-color: rgba(92, 156, 230, 0.5);
}

.notif-input::placeholder {
  color: #4b5563;
}

.notif-textarea {
  width: 100%;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid rgba(58, 59, 62, 0.4);
  background: rgba(22, 24, 26, 0.8);
  color: #cecfd2;
  font-size: 0.85rem;
  font-family: inherit;
  outline: none;
  resize: vertical;
  min-height: 80px;
  box-sizing: border-box;
}

.notif-textarea:focus {
  border-color: rgba(92, 156, 230, 0.5);
}

.notif-textarea::placeholder {
  color: #4b5563;
}

.notif-image-picker {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 20px;
  border-radius: 10px;
  border: 2px dashed rgba(58, 59, 62, 0.5);
  background: rgba(22, 24, 26, 0.4);
  color: #6b6c6f;
  cursor: pointer;
  transition: all 0.2s;
}

.notif-image-picker:hover {
  border-color: rgba(92, 156, 230, 0.4);
  background: rgba(92, 156, 230, 0.04);
  color: #8bb8e8;
}

.notif-image-picker span {
  font-size: 0.8rem;
}

.notif-image-hint {
  font-size: 0.7rem !important;
  color: #4b5563;
}

.notif-image-preview-wrap {
  position: relative;
  display: inline-block;
  max-width: 260px;
}

.notif-image-preview {
  width: 100%;
  max-height: 180px;
  object-fit: cover;
  border-radius: 10px;
  border: 1px solid rgba(58, 59, 62, 0.4);
}

.notif-image-remove-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.65);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.notif-image-remove-btn:hover {
  background: rgba(220, 60, 60, 0.8);
}

.notif-summary-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 8px;
  background: rgba(92, 156, 230, 0.06);
  border: 1px solid rgba(92, 156, 230, 0.12);
  color: #7db8f0;
  font-size: 0.8rem;
}

.notif-send-actions {
  display: flex;
  justify-content: flex-end;
}

.notif-send-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, #ffb74d 0%, #ff9800 100%);
  color: #1a1a1a;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.notif-send-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(255, 183, 77, 0.35);
}

.notif-send-btn:disabled {
  opacity: 0.4;
  cursor: default;
}

.notif-send-result {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 10px;
}

.notif-result-success {
  background: rgba(102, 187, 106, 0.1);
  border: 1px solid rgba(102, 187, 106, 0.2);
  color: #66bb6a;
}

.notif-result-error {
  background: rgba(239, 83, 80, 0.1);
  border: 1px solid rgba(239, 83, 80, 0.2);
  color: #ef5350;
}

.notif-result-title {
  font-size: 0.85rem;
  font-weight: 600;
}

.notif-result-sub {
  font-size: 0.75rem;
  opacity: 0.8;
  margin-top: 2px;
}

/* Notification History */
.notif-history-section {
  margin-top: 20px;
}

.notif-history-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.notif-history-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: #9ca3af;
}

.notif-history-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  background: rgba(30, 33, 36, 0.5);
  border: 1px solid rgba(58, 59, 62, 0.2);
  border-radius: 10px;
  margin-bottom: 8px;
}

.notif-history-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(255, 183, 77, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffb74d;
  flex-shrink: 0;
}

.notif-history-content {
  flex: 1;
  min-width: 0;
}

.notif-history-msg {
  font-size: 0.85rem;
  font-weight: 600;
  color: #e1e2e5;
  line-height: 1.4;
}

.notif-history-sub {
  font-size: 0.78rem;
  color: #9ca3af;
  margin-top: 4px;
  line-height: 1.4;
}

.notif-history-img {
  max-width: 120px;
  max-height: 80px;
  border-radius: 6px;
  margin-top: 6px;
  object-fit: cover;
}

.notif-history-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 6px;
}

.notif-history-time {
  font-size: 0.72rem;
  color: #6b6c6f;
}

/* ====== Holidays Tab ====== */
.holiday-card {
  background: rgba(30, 33, 36, 0.5);
  border: 1px solid rgba(58, 59, 62, 0.3);
  border-radius: 14px;
  overflow: hidden;
}

.holiday-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 20px;
  border-bottom: 1px solid rgba(58, 59, 62, 0.25);
}

.holiday-card-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #e1e2e5;
}

.holiday-year-select {
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid rgba(58, 59, 62, 0.5);
  background: rgba(22, 24, 26, 0.8);
  color: #e1e2e5;
  font-size: 0.85rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  outline: none;
}

.holiday-year-select:focus {
  border-color: rgba(102, 187, 106, 0.5);
}

.holiday-card-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.holiday-actions-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.holiday-action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 8px;
  border: 1px solid rgba(58, 59, 62, 0.4);
  background: transparent;
  color: #9ca3af;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.holiday-action-btn:hover:not(:disabled) {
  background: rgba(58, 59, 62, 0.3);
  color: #cecfd2;
}

.holiday-action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.holiday-preset-btn:hover:not(:disabled) {
  border-color: rgba(102, 187, 106, 0.4);
  color: #66bb6a;
}

.holiday-copy-btn:hover:not(:disabled) {
  border-color: rgba(92, 156, 230, 0.4);
  color: #5c9ce6;
}

/* Add Holiday Form */
.holiday-add-form {
  display: flex;
  gap: 10px;
  align-items: flex-end;
  flex-wrap: wrap;
}

.holiday-add-fields {
  display: flex;
  gap: 8px;
  flex: 1;
  flex-wrap: wrap;
}

.holiday-date-input {
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid rgba(58, 59, 62, 0.5);
  background: rgba(22, 24, 26, 0.8);
  color: #e1e2e5;
  font-size: 0.82rem;
  font-family: inherit;
  outline: none;
  min-width: 150px;
}

.holiday-date-input:focus {
  border-color: rgba(102, 187, 106, 0.5);
}

.holiday-name-input {
  flex: 1;
  min-width: 160px;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid rgba(58, 59, 62, 0.5);
  background: rgba(22, 24, 26, 0.8);
  color: #e1e2e5;
  font-size: 0.82rem;
  font-family: inherit;
  outline: none;
}

.holiday-name-input::placeholder {
  color: #4b5563;
}

.holiday-name-input:focus {
  border-color: rgba(102, 187, 106, 0.5);
}

.holiday-type-select {
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid rgba(58, 59, 62, 0.5);
  background: rgba(22, 24, 26, 0.8);
  color: #e1e2e5;
  font-size: 0.82rem;
  font-family: inherit;
  cursor: pointer;
  outline: none;
}

.holiday-type-select:focus {
  border-color: rgba(102, 187, 106, 0.5);
}

.holiday-add-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #66bb6a 0%, #4caf50 100%);
  color: white;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
  white-space: nowrap;
}

.holiday-add-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(102, 187, 106, 0.3);
}

.holiday-add-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* Holiday List */
.holiday-list {
  border: 1px solid rgba(58, 59, 62, 0.25);
  border-radius: 10px;
  overflow: hidden;
}

.holiday-list-header {
  display: flex;
  align-items: center;
  padding: 10px 14px;
  background: rgba(22, 24, 26, 0.4);
  border-bottom: 1px solid rgba(58, 59, 62, 0.2);
}

.holiday-count-badge {
  font-size: 0.75rem;
  font-weight: 600;
  color: #66bb6a;
  background: rgba(102, 187, 106, 0.12);
  padding: 3px 10px;
  border-radius: 6px;
}

.holiday-item {
  border-bottom: 1px solid rgba(58, 59, 62, 0.15);
}

.holiday-item:last-child {
  border-bottom: none;
}

.holiday-item-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  transition: background 0.15s;
}

.holiday-item-row:hover {
  background: rgba(58, 59, 62, 0.12);
}

.holiday-item-edit {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  flex-wrap: wrap;
}

.holiday-item-date {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.82rem;
  color: #9ca3af;
  min-width: 150px;
}

.holiday-item-name {
  flex: 1;
  font-size: 0.85rem;
  font-weight: 600;
  color: #e1e2e5;
  min-width: 0;
}

.holiday-item-type {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 6px;
  white-space: nowrap;
}

.holiday-type-national {
  color: #ef5350;
  background: rgba(239, 83, 80, 0.12);
}

.holiday-type-company {
  color: #42a5f5;
  background: rgba(66, 165, 245, 0.12);
}

.holiday-type-special {
  color: #ffb74d;
  background: rgba(255, 183, 77, 0.12);
}

.holiday-item-day {
  font-size: 0.78rem;
  color: #6b6c6f;
  min-width: 30px;
  text-align: center;
}

.holiday-item-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

/* Save result */
.holiday-save-result {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 600;
}

.holiday-result-success {
  background: rgba(102, 187, 106, 0.12);
  color: #66bb6a;
  border: 1px solid rgba(102, 187, 106, 0.2);
}

.holiday-result-error {
  background: rgba(239, 83, 80, 0.12);
  color: #ef5350;
  border: 1px solid rgba(239, 83, 80, 0.2);
}

@media (max-width: 640px) {
  .admin-page { padding: 16px; }
  .admin-user-fields { flex-direction: column; gap: 8px; }
  .admin-user-fields .admin-save-btn { width: 100%; justify-content: center; }
  .admin-add-dept { flex-direction: column; }
  .import-actions { flex-direction: column; align-items: stretch; }
  .import-skip-hint { order: -1; }
  .notif-target-options { flex-direction: column; }
  .holiday-add-form { flex-direction: column; }
  .holiday-add-fields { flex-direction: column; }
  .holiday-actions-row { flex-direction: column; }
  .holiday-item-row { flex-wrap: wrap; }
  .holiday-item-date { min-width: 100%; }
  .holiday-item-edit { flex-direction: column; }
}
</style>

<style>
/* ====== Confirm Send Dialog (unscoped for teleported q-dialog) ====== */
.confirm-dialog-card {
  background: #1e2124;
  border: 1px solid rgba(58, 59, 62, 0.5);
  border-radius: 16px;
  width: 440px;
  max-width: 92vw;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 183, 77, 0.08);
}

.confirm-dialog-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px 24px 16px;
  border-bottom: 1px solid rgba(58, 59, 62, 0.25);
}

.confirm-dialog-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(255, 183, 77, 0.18) 0%, rgba(255, 152, 0, 0.10) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffb74d;
  flex-shrink: 0;
}

.confirm-dialog-header-text {
  flex: 1;
}

.confirm-dialog-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: #e1e2e5;
  letter-spacing: 0.2px;
}

.confirm-dialog-subtitle {
  font-size: 0.78rem;
  color: #6b6c6f;
  margin-top: 3px;
}

.confirm-dialog-body {
  padding: 18px 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.confirm-preview-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.confirm-preview-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  font-weight: 600;
  color: #6b6c6f;
  min-width: 90px;
  padding-top: 2px;
  flex-shrink: 0;
}

.confirm-preview-value {
  flex: 1;
  font-size: 0.85rem;
  color: #cecfd2;
}

.confirm-text-value {
  font-weight: 600;
  color: #e1e2e5;
}

.confirm-target-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
}

.confirm-chip-all {
  background: rgba(236, 64, 122, 0.12);
  color: #ec407a;
  border: 1px solid rgba(236, 64, 122, 0.2);
}

.confirm-chip-dept {
  background: rgba(92, 156, 230, 0.12);
  color: #5c9ce6;
  border: 1px solid rgba(92, 156, 230, 0.2);
}

.confirm-chip-individual {
  background: rgba(102, 187, 106, 0.12);
  color: #66bb6a;
  border: 1px solid rgba(102, 187, 106, 0.2);
}

.confirm-count-badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 6px;
  background: rgba(255, 183, 77, 0.12);
  color: #ffb74d;
  font-size: 0.82rem;
  font-weight: 700;
}

.confirm-preview-msg-row {
  flex-direction: column;
  gap: 8px;
}

.confirm-msg-preview {
  width: 100%;
}

.confirm-msg-bubble {
  padding: 14px 16px;
  border-radius: 12px;
  background: rgba(30, 33, 36, 0.8);
  border: 1px solid rgba(58, 59, 62, 0.3);
  border-left: 3px solid #ffb74d;
}

.confirm-msg-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: #ffb74d;
  margin-bottom: 6px;
}

.confirm-msg-text {
  font-size: 0.82rem;
  color: #c0c1c4;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

.confirm-msg-image {
  max-width: 100%;
  max-height: 160px;
  border-radius: 8px;
  margin-top: 8px;
  object-fit: cover;
}

.confirm-dialog-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px 20px;
  border-top: 1px solid rgba(58, 59, 62, 0.25);
}

.confirm-cancel-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 20px;
  border-radius: 10px;
  border: 1px solid rgba(58, 59, 62, 0.5);
  background: transparent;
  color: #9ca3af;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.confirm-cancel-btn:hover {
  background: rgba(58, 59, 62, 0.3);
  color: #cecfd2;
}

.confirm-send-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 24px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, #ffb74d 0%, #ff9800 100%);
  color: #1a1a1a;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.confirm-send-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(255, 183, 77, 0.35);
}

@media (max-width: 640px) {
  .confirm-dialog-card { width: 100%; }
  .confirm-preview-row:not(.confirm-preview-msg-row) { flex-direction: column; gap: 4px; }
  .confirm-preview-label { min-width: unset; }
}

/* Punch Import Styles */
.punch-summary-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 14px;
  padding: 10px 14px;
  background: rgba(24, 25, 28, 0.5);
  border-radius: 10px;
  border: 1px solid rgba(58, 59, 62, 0.2);
}

.punch-summary-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: #cecfd2;
}

.punch-summary-warn { color: #ffb74d; }
.punch-summary-ok { color: #66bb6a; }

.punch-dup-warning {
  margin-bottom: 14px;
  padding: 12px 16px;
  background: rgba(255, 183, 77, 0.06);
  border: 1px solid rgba(255, 183, 77, 0.25);
  border-radius: 10px;
}

.punch-dup-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.82rem;
  color: #ffb74d;
  margin-bottom: 10px;
  font-weight: 600;
}

.punch-dup-options {
  display: flex;
  gap: 20px;
}

.punch-dup-option {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 0.78rem;
  color: #cecfd2;
}

.punch-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 0.68rem;
  font-weight: 600;
}

.punch-status-ok {
  background: rgba(102, 187, 106, 0.12);
  color: #66bb6a;
}

.punch-status-unmatched {
  background: rgba(239, 83, 80, 0.12);
  color: #ef5350;
}

.punch-status-dup {
  background: rgba(255, 183, 77, 0.12);
  color: #ffb74d;
}
</style>
