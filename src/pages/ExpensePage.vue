<template>
  <q-page class="exp-page">
    <div class="exp-container">
      <!-- Header -->
      <div class="exp-page-header">
        <div class="exp-header-left">
          <div class="exp-header-icon">
            <q-icon name="receipt_long" size="26px" />
          </div>
          <div>
            <div class="exp-header-title">Expense Reimbursement</div>
            <div class="exp-header-subtitle">ขออนุมัติเบิกค่าใช้จ่าย</div>
          </div>
        </div>
        <div class="exp-header-right"></div>
      </div>

      <!-- HR Approval Section -->
      <div v-if="showManageSection" class="exp-card exp-manage-card">
        <div class="exp-card-header">
          <q-icon name="admin_panel_settings" size="18px" style="color: #ce93d8;" />
          <span class="exp-card-title">จัดการคำขอเบิก</span>
          <q-badge v-if="expenseStore.pendingActionCount > 0"
            :label="expenseStore.pendingActionCount + ' รายการ'" class="exp-pending-badge" />
          <div style="flex:1"></div>
          <button class="exp-refresh-btn" :disabled="expenseStore.fetching" @click="refreshPending" title="รีเฟรช">
            <q-icon name="refresh" size="15px" :class="{ 'exp-spin': expenseStore.fetching }" />
          </button>
        </div>

        <div class="exp-manage-list">
          <div v-if="expenseStore.pendingExpenses.length === 0" class="exp-empty">
            <q-icon name="check_circle_outline" size="40px" style="color: #2a2b2e;" />
            <span>ไม่มีรายการรอดำเนินการ</span>
          </div>

          <div v-for="exp in expenseStore.pendingExpenses" :key="exp.id" class="exp-manage-item">
            <div class="exp-manage-item-top">
              <div class="exp-manage-avatar">
                <img v-if="authStore.getPhotoURL(exp.userId)" :src="authStore.getPhotoURL(exp.userId)" class="exp-manage-avatar-img" />
                <span v-else>{{ exp.firstName?.charAt(0) || exp.userId?.charAt(0)?.toUpperCase() || 'U' }}</span>
              </div>
              <div class="exp-manage-info">
                <div class="exp-manage-name">{{ exp.firstName }} {{ exp.lastName }}</div>
                <div class="exp-manage-dept">{{ exp.department || '-' }} &middot; {{ formatTimestamp(exp.submittedAt) }}</div>
              </div>
              <div class="exp-manage-amount">{{ formatMoney(exp.totalAmount) }} ฿</div>
            </div>

            <!-- Items summary -->
            <div class="exp-manage-items-summary">
              <div v-for="item in exp.items" :key="item.seq" class="exp-manage-item-line">
                <span class="exp-manage-item-seq">{{ item.seq }}.</span>
                <span class="exp-manage-item-desc">{{ item.description }}</span>
                <span class="exp-manage-item-amt">{{ formatMoney(item.amount) }}</span>
                <a v-if="item.receiptURL" :href="item.receiptURL" target="_blank" class="exp-manage-receipt-link">
                  <q-icon name="attachment" size="12px" /> ใบเสร็จ
                </a>
              </div>
              <div v-if="exp.note" class="exp-manage-note">
                <q-icon name="notes" size="12px" /> {{ exp.note }}
              </div>
              <div v-if="exp.receiveMethod" class="exp-manage-note" style="color: #42a5f5;">
                <q-icon :name="exp.receiveMethod === 'promptpay' ? 'qr_code' : exp.receiveMethod === 'transfer' ? 'account_balance' : 'payments'" size="12px" />
                <template v-if="exp.receiveMethod === 'promptpay'">
                  PromptPay {{ exp.promptPayPhone }} ({{ exp.accountName || '-' }})
                </template>
                <template v-else-if="exp.receiveMethod === 'transfer'">
                  {{ exp.bankName }} {{ exp.accountNumber }} ({{ exp.accountName || '-' }})
                </template>
                <template v-else>
                  รับเงินสด
                </template>
              </div>
            </div>

            <!-- Status & Actions -->
            <div class="exp-manage-actions">
              <div class="exp-manage-status"
                :style="{ color: getStatusInfo(exp.status).color, background: getStatusInfo(exp.status).color + '15' }">
                <q-icon :name="getStatusInfo(exp.status).icon" size="13px" />
                <span>{{ getStatusInfo(exp.status).label }}</span>
              </div>
              <div style="flex:1"></div>

              <!-- pending_hr: Print / CEO approved / Reject -->
              <template v-if="exp.status === 'pending_hr'">
                <button class="exp-action-btn exp-btn-print" @click="doPrint(exp)">
                  <q-icon name="print" size="14px" />
                  <span>พิมพ์</span>
                </button>
                <button class="exp-action-btn exp-btn-approve" @click="openCEOConfirm(exp)">
                  <q-icon name="check" size="14px" />
                  <span>อนุมัติ</span>
                </button>
                <button class="exp-action-btn exp-btn-reject" @click="openRejectDialog(exp)">
                  <q-icon name="close" size="14px" />
                  <span>ไม่อนุมัติ</span>
                </button>
              </template>

              <!-- approved: Pay -->
              <template v-if="exp.status === 'approved'">
                <button class="exp-action-btn exp-btn-pay" @click="openPayDialog(exp)">
                  <q-icon name="payments" size="14px" />
                  <span>จ่ายเงิน</span>
                </button>
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Grid -->
      <div class="exp-grid">
        <!-- Left: Submit Form -->
        <div class="exp-card exp-form-card">
          <div class="exp-card-header">
            <q-icon name="post_add" size="18px" style="color: #26a69a;" />
            <span class="exp-card-title">ส่งใบเบิกค่าใช้จ่าย</span>
          </div>

          <!-- Success message -->
          <div v-if="showSuccess" class="exp-success">
            <div class="exp-success-icon">✅</div>
            <div class="exp-success-title">ส่งใบเบิกเรียบร้อยแล้ว!</div>
            <div class="exp-success-desc">ใบเบิกของคุณอยู่ระหว่างรอ HR ตรวจสอบ</div>
            <button class="exp-new-btn" @click="resetForm">
              <q-icon name="add" size="16px" />
              <span>ส่งใบเบิกใหม่</span>
            </button>
          </div>

          <!-- Form -->
          <div v-else class="exp-form-body">
            <!-- Name row (auto-fill) -->
            <div v-if="authStore.profile.firstName || authStore.profile.lastName" class="exp-profile-hint">
              <q-icon name="person" size="14px" />
              <span>ข้อมูลจากโปรไฟล์ของคุณ</span>
            </div>
            <div class="exp-form-row">
              <div class="exp-field">
                <label class="exp-field-label">ชื่อ</label>
                <input :value="authStore.profile.firstName || authStore.user?.email?.split('@')[0] || ''" class="exp-input" readonly />
              </div>
              <div class="exp-field">
                <label class="exp-field-label">นามสกุล</label>
                <input :value="authStore.profile.lastName || ''" class="exp-input" readonly />
              </div>
            </div>

            <!-- Items table -->
            <div class="exp-field">
              <label class="exp-field-label">รายการค่าใช้จ่าย <span class="exp-required">*</span></label>
              <div class="exp-items-table">
                <div class="exp-items-header">
                  <span class="exp-col-seq">#</span>
                  <span class="exp-col-desc">รายการ</span>
                  <span class="exp-col-amt">จำนวนเงิน</span>
                  <span class="exp-col-receipt">ใบเสร็จ</span>
                  <span class="exp-col-action"></span>
                </div>
                <div v-for="(item, idx) in formItems" :key="idx" class="exp-items-row">
                  <span class="exp-col-seq exp-seq-num">{{ idx + 1 }}</span>
                  <div class="exp-col-desc">
                    <input v-model="item.description" class="exp-input exp-input-sm" placeholder="เช่น ค่าเดินทาง" />
                  </div>
                  <div class="exp-col-amt">
                    <input v-model.number="item.amount" type="number" min="0" step="0.01"
                      class="exp-input exp-input-sm exp-input-money" placeholder="0.00" />
                  </div>
                  <div class="exp-col-receipt">
                    <label class="exp-receipt-btn" :class="{ 'exp-receipt-attached': receiptFiles[idx + 1] }">
                      <q-icon :name="receiptFiles[idx + 1] ? 'check_circle' : 'attach_file'" size="14px" />
                      <input type="file" accept="image/*,application/pdf" style="display:none;"
                        @change="e => handleReceipt(e, idx + 1)" />
                    </label>
                  </div>
                  <div class="exp-col-action">
                    <button v-if="formItems.length > 1" class="exp-remove-btn" @click="removeItem(idx)">
                      <q-icon name="close" size="14px" />
                    </button>
                  </div>
                </div>
              </div>

              <button class="exp-add-item-btn" @click="addItem">
                <q-icon name="add_circle_outline" size="16px" />
                <span>เพิ่มรายการ</span>
              </button>
            </div>

            <!-- Total -->
            <div class="exp-total-row">
              <span class="exp-total-label">ยอดรวมทั้งสิ้น</span>
              <span class="exp-total-value">{{ formatMoney(totalAmount) }} ฿</span>
            </div>

            <!-- Receive Method -->
            <div class="exp-bank-section">
              <div class="exp-bank-header">
                <q-icon name="account_balance" size="14px" style="color: #42a5f5;" />
                <span>วิธีรับเงิน</span>
              </div>
              <div class="exp-receive-methods">
                <label class="exp-receive-option" :class="{ 'exp-receive-active': formReceiveMethod === 'promptpay' }">
                  <input type="radio" v-model="formReceiveMethod" value="promptpay" class="exp-radio" />
                  <q-icon name="qr_code" size="16px" />
                  <span>PromptPay</span>
                </label>
                <label class="exp-receive-option" :class="{ 'exp-receive-active': formReceiveMethod === 'transfer' }">
                  <input type="radio" v-model="formReceiveMethod" value="transfer" class="exp-radio" />
                  <q-icon name="account_balance" size="16px" />
                  <span>โอนผ่านธนาคาร</span>
                </label>
                <label class="exp-receive-option" :class="{ 'exp-receive-active': formReceiveMethod === 'cash' }">
                  <input type="radio" v-model="formReceiveMethod" value="cash" class="exp-radio" />
                  <q-icon name="payments" size="16px" />
                  <span>เงินสด</span>
                </label>
              </div>

              <!-- PromptPay fields -->
              <div v-if="formReceiveMethod === 'promptpay'" class="exp-form-row q-mt-sm">
                <div class="exp-field">
                  <label class="exp-field-label">เบอร์โทรศัพท์ PromptPay</label>
                  <input v-model="formPromptPayPhone" class="exp-input" placeholder="0xx-xxx-xxxx" maxlength="15" />
                </div>
                <div class="exp-field">
                  <label class="exp-field-label">ชื่อบัญชี</label>
                  <input v-model="formAccountName" class="exp-input" placeholder="ชื่อ-นามสกุล" maxlength="100" />
                </div>
              </div>

              <!-- Bank transfer fields -->
              <div v-if="formReceiveMethod === 'transfer'" class="exp-form-row exp-form-row-3 q-mt-sm">
                <div class="exp-field">
                  <label class="exp-field-label">ธนาคาร</label>
                  <select v-model="formBankName" class="exp-input exp-select">
                    <option value="">-- เลือกธนาคาร --</option>
                    <option v-for="b in bankOptions" :key="b" :value="b">{{ b }}</option>
                  </select>
                </div>
                <div class="exp-field">
                  <label class="exp-field-label">เลขที่บัญชี</label>
                  <input v-model="formAccountNumber" class="exp-input" placeholder="xxx-x-xxxxx-x" maxlength="20" />
                </div>
                <div class="exp-field">
                  <label class="exp-field-label">ชื่อเจ้าของบัญชี</label>
                  <input v-model="formAccountName" class="exp-input" placeholder="ชื่อ-นามสกุล" maxlength="100" />
                </div>
              </div>
            </div>

            <!-- Note -->
            <div class="exp-field">
              <label class="exp-field-label">หมายเหตุ (ไม่บังคับ)</label>
              <textarea v-model="formNote" class="exp-textarea"
                placeholder="ระบุหมายเหตุเพิ่มเติม..." rows="2" maxlength="500"></textarea>
            </div>

            <!-- Error -->
            <div v-if="formError" class="exp-error">
              <q-icon name="error_outline" size="16px" />
              <span>{{ formError }}</span>
            </div>

            <!-- Submit -->
            <button class="exp-submit-btn" :disabled="expenseStore.submitting || !isFormValid" @click="handleSubmit">
              <q-spinner v-if="expenseStore.submitting" size="18px" color="white" class="q-mr-sm" />
              <q-icon v-else name="send" size="18px" class="q-mr-sm" />
              <span>{{ expenseStore.submitting ? 'กำลังส่ง...' : 'ส่งใบเบิก' }}</span>
            </button>
          </div>
        </div>

        <!-- Right: History -->
        <div class="exp-card exp-history-card">
          <div class="exp-card-header exp-history-header">
            <div class="exp-history-title-row">
              <q-icon name="history" size="18px" style="color: #42a5f5;" />
              <span class="exp-card-title">ประวัติการเบิก</span>
              <q-badge v-if="expenseStore.myPendingCount > 0" :label="expenseStore.myPendingCount + ' รอ'" class="exp-pending-badge" />
            </div>
            <div class="exp-history-controls">
              <!-- Tabs -->
              <div class="exp-tabs">
                <button class="exp-tab" :class="{ 'exp-tab-active': historyTab === 'my' }" @click="historyTab = 'my'">ของฉัน</button>
                <button v-if="showManageSection" class="exp-tab" :class="{ 'exp-tab-active': historyTab === 'all' }" @click="switchToAll">ทั้งหมด</button>
              </div>
              <button class="exp-refresh-btn" :disabled="expenseStore.fetching" @click="refreshHistory" title="รีเฟรช">
                <q-icon name="refresh" size="15px" :class="{ 'exp-spin': expenseStore.fetching }" />
              </button>
              <button class="exp-export-btn"
                :disabled="currentHistoryList.length === 0"
                @click="exportToExcel"
                title="Export เป็น Excel">
                <q-icon name="download" size="15px" />
                <span>Export</span>
              </button>
            </div>
          </div>

          <!-- My Expenses -->
          <div class="exp-history-list">
            <div v-if="currentHistoryList.length === 0" class="exp-empty">
              <q-icon name="receipt" size="40px" style="color: #2a2b2e;" />
              <span>ยังไม่มีประวัติการเบิก</span>
            </div>

            <div v-for="exp in currentHistoryList" :key="exp.id" class="exp-history-item" @click="openDetailDialog(exp)">
              <div class="exp-history-top">
                <div class="exp-history-info">
                  <span class="exp-history-count">{{ exp.items?.length || 0 }} รายการ</span>
                  <span v-if="historyTab === 'all'" class="exp-history-user">{{ exp.firstName }} {{ exp.lastName }}</span>
                </div>
                <div class="exp-history-status"
                  :style="{ color: getStatusInfo(exp.status).color, background: getStatusInfo(exp.status).color + '15' }">
                  <q-icon :name="getStatusInfo(exp.status).icon" size="13px" />
                  <span>{{ getStatusInfo(exp.status).label }}</span>
                </div>
              </div>

              <div class="exp-history-items-preview">
                <span v-for="(item, i) in (exp.items || []).slice(0, 3)" :key="i" class="exp-history-item-pill">
                  {{ item.description }}
                </span>
                <span v-if="(exp.items || []).length > 3" class="exp-history-item-more">+{{ exp.items.length - 3 }}</span>
              </div>

              <div class="exp-history-bottom">
                <span class="exp-history-amount">{{ formatMoney(exp.totalAmount) }} ฿</span>
                <span class="exp-history-date">{{ formatTimestamp(exp.submittedAt) }}</span>
                <button v-if="historyTab === 'my' && exp.status === 'pending_hr'"
                  class="exp-cancel-btn" @click.stop="openCancelConfirm(exp.id)">
                  <q-icon name="close" size="13px" />
                  <span>ยกเลิก</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Detail Dialog -->
    <q-dialog v-model="showDetailDialog">
      <q-card class="exp-detail-dialog">
        <q-card-section class="row items-center q-pb-sm">
          <q-icon name="receipt_long" size="22px" style="color: #26a69a;" class="q-mr-sm" />
          <div class="exp-detail-title">รายละเอียดใบเบิก</div>
          <q-space />
          <q-btn icon="close" flat round dense style="color: #6b6c6f;" @click="showDetailDialog = false" />
        </q-card-section>
        <q-separator style="background: rgba(44, 58, 69, 0.4);" />
        <q-card-section v-if="detailExpense">
          <div class="exp-detail-header-info">
            <div><strong>ชื่อ:</strong> {{ detailExpense.firstName }} {{ detailExpense.lastName }}</div>
            <div><strong>แผนก:</strong> {{ detailExpense.department || '-' }}</div>
            <div><strong>วันที่ส่ง:</strong> {{ formatTimestamp(detailExpense.submittedAt) }}</div>
            <div class="exp-detail-status"
              :style="{ color: getStatusInfo(detailExpense.status).color }">
              <q-icon :name="getStatusInfo(detailExpense.status).icon" size="14px" />
              {{ getStatusInfo(detailExpense.status).label }}
            </div>
          </div>

          <div class="exp-detail-table">
            <div class="exp-detail-table-header">
              <span class="exp-detail-col-seq">#</span>
              <span class="exp-detail-col-desc">รายการ</span>
              <span class="exp-detail-col-amt">จำนวนเงิน</span>
              <span class="exp-detail-col-receipt">ใบเสร็จ</span>
            </div>
            <div v-for="item in detailExpense.items" :key="item.seq" class="exp-detail-table-row">
              <span class="exp-detail-col-seq">{{ item.seq }}</span>
              <span class="exp-detail-col-desc">{{ item.description }}</span>
              <span class="exp-detail-col-amt">{{ formatMoney(item.amount) }}</span>
              <span class="exp-detail-col-receipt">
                <a v-if="item.receiptURL" :href="item.receiptURL" target="_blank" class="exp-receipt-link">
                  <q-icon name="visibility" size="13px" /> ดู
                </a>
                <span v-else style="color: #4b5563;">-</span>
              </span>
            </div>
            <div class="exp-detail-table-total">
              <span></span>
              <span class="exp-detail-total-label">ยอดรวม</span>
              <span class="exp-detail-total-value">{{ formatMoney(detailExpense.totalAmount) }} ฿</span>
              <span></span>
            </div>
          </div>

          <div v-if="detailExpense.note" class="exp-detail-note">
            <strong>หมายเหตุ:</strong> {{ detailExpense.note }}
          </div>

          <div v-if="detailExpense.receiveMethod" class="exp-detail-bank">
            <q-icon :name="detailExpense.receiveMethod === 'promptpay' ? 'qr_code' : detailExpense.receiveMethod === 'transfer' ? 'account_balance' : 'payments'" size="14px" style="color: #42a5f5;" />
            <div>
              <div class="exp-detail-bank-label">วิธีรับเงิน</div>
              <template v-if="detailExpense.receiveMethod === 'promptpay'">
                <div>PromptPay {{ detailExpense.promptPayPhone }}</div>
                <div v-if="detailExpense.accountName" style="color: #6b6c6f;">{{ detailExpense.accountName }}</div>
              </template>
              <template v-else-if="detailExpense.receiveMethod === 'transfer'">
                <div>{{ detailExpense.bankName }} {{ detailExpense.accountNumber }}</div>
                <div v-if="detailExpense.accountName" style="color: #6b6c6f;">{{ detailExpense.accountName }}</div>
              </template>
              <template v-else>
                <div>รับเงินสด</div>
              </template>
            </div>
          </div>

          <!-- Approval trail -->
          <div v-if="detailExpense.hrReviewedByName" class="exp-trail">
            <q-icon name="badge" size="13px" style="color: #ce93d8;" />
            <span>HR ตรวจสอบ: {{ detailExpense.hrReviewedByName }}</span>
          </div>
          <div v-if="detailExpense.ceoApprovedAt" class="exp-trail">
            <q-icon name="verified" size="13px" style="color: #42a5f5;" />
            <span>CEO อนุมัติแล้ว</span>
          </div>
          <div v-if="detailExpense.paidByName" class="exp-trail">
            <q-icon name="check_circle" size="13px" style="color: #66bb6a;" />
            <span>จ่ายโดย {{ detailExpense.paidByName }} ({{ detailExpense.paymentMethod === 'transfer' ? 'โอนเงิน' : 'เงินสด' }})</span>
          </div>
          <div v-if="detailExpense.paymentSlipURL" class="exp-trail">
            <a :href="detailExpense.paymentSlipURL" target="_blank" class="exp-receipt-link">
              <q-icon name="image" size="13px" /> ดูสลิปโอนเงิน
            </a>
          </div>
          <div v-if="detailExpense.paymentNote" class="exp-trail">
            <q-icon name="notes" size="13px" style="color: #9e9e9e;" />
            <span>{{ detailExpense.paymentNote }}</span>
          </div>
          <div v-if="detailExpense.status === 'rejected'" class="exp-trail exp-trail-reject">
            <q-icon name="cancel" size="13px" style="color: #ef5350;" />
            <span>ไม่อนุมัติโดย {{ detailExpense.rejectedByName }}: {{ detailExpense.rejectionReason || '-' }}</span>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Reject Dialog -->
    <q-dialog v-model="showRejectDialog">
      <q-card class="exp-reject-dialog">
        <q-card-section class="row items-center q-pb-sm">
          <q-icon name="cancel" size="22px" style="color: #ef5350;" class="q-mr-sm" />
          <div class="exp-detail-title">ไม่อนุมัติใบเบิก</div>
          <q-space />
          <q-btn icon="close" flat round dense style="color: #6b6c6f;" @click="showRejectDialog = false" />
        </q-card-section>
        <q-separator style="background: rgba(44, 58, 69, 0.4);" />
        <q-card-section>
          <div v-if="rejectingExpense" class="exp-reject-info">
            <span>{{ rejectingExpense.firstName }} {{ rejectingExpense.lastName }}</span>
            <span class="exp-reject-amount">{{ formatMoney(rejectingExpense.totalAmount) }} ฿</span>
          </div>
          <label class="exp-field-label">เหตุผลที่ไม่อนุมัติ</label>
          <textarea v-model="rejectReason" class="exp-textarea" placeholder="ระบุเหตุผล..." rows="3"></textarea>
          <div class="row justify-end q-mt-md q-gutter-sm">
            <q-btn flat label="ยกเลิก" style="color: #6b6c6f;" @click="showRejectDialog = false" />
            <q-btn label="ยืนยันไม่อนุมัติ" class="exp-btn-confirm-reject" :loading="expenseStore.processing"
              @click="handleReject" />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Pay Dialog -->
    <q-dialog v-model="showPayDialog">
      <q-card class="exp-pay-dialog">
        <q-card-section class="row items-center q-pb-sm">
          <q-icon name="payments" size="22px" style="color: #66bb6a;" class="q-mr-sm" />
          <div class="exp-detail-title">จ่ายเงิน</div>
          <q-space />
          <q-btn icon="close" flat round dense style="color: #6b6c6f;" @click="showPayDialog = false" />
        </q-card-section>
        <q-separator style="background: rgba(44, 58, 69, 0.4);" />
        <q-card-section v-if="payingExpense">
          <div class="exp-pay-info">
            <span>{{ payingExpense.firstName }} {{ payingExpense.lastName }}</span>
            <span class="exp-pay-amount">{{ formatMoney(payingExpense.totalAmount) }} ฿</span>
          </div>

          <div v-if="payingExpense.receiveMethod || payingExpense.bankName || payingExpense.accountNumber || payingExpense.promptPayPhone" class="exp-pay-bank-info">
            <q-icon :name="payingExpense.receiveMethod === 'promptpay' ? 'qr_code' : payingExpense.receiveMethod === 'transfer' || payingExpense.bankName ? 'account_balance' : 'payments'" size="16px" style="color: #42a5f5;" />
            <div style="flex: 1;">
              <div style="font-size: 0.65rem; color: #6b6c6f; margin-bottom: 4px;">ผู้ขอเบิกต้องการรับเงินผ่าน</div>
              <template v-if="payingExpense.receiveMethod === 'promptpay'">
                <div style="font-weight: 700; font-size: 0.82rem;">PromptPay</div>
                <div class="exp-pay-bank-detail">
                  <span>เบอร์โทร:</span>
                  <strong>{{ payingExpense.promptPayPhone || '-' }}</strong>
                </div>
                <div v-if="payingExpense.accountName" class="exp-pay-bank-detail">
                  <span>ชื่อบัญชี:</span>
                  <strong>{{ payingExpense.accountName }}</strong>
                </div>
              </template>
              <template v-else-if="payingExpense.receiveMethod === 'transfer' || payingExpense.bankName">
                <div style="font-weight: 700; font-size: 0.82rem;">โอนผ่านธนาคาร</div>
                <div v-if="payingExpense.bankName" class="exp-pay-bank-detail">
                  <span>ธนาคาร:</span>
                  <strong>{{ payingExpense.bankName }}</strong>
                </div>
                <div v-if="payingExpense.accountNumber" class="exp-pay-bank-detail">
                  <span>เลขที่บัญชี:</span>
                  <strong>{{ payingExpense.accountNumber }}</strong>
                </div>
                <div v-if="payingExpense.accountName" class="exp-pay-bank-detail">
                  <span>ชื่อบัญชี:</span>
                  <strong>{{ payingExpense.accountName }}</strong>
                </div>
              </template>
              <template v-else-if="payingExpense.receiveMethod === 'cash'">
                <div style="font-weight: 700; font-size: 0.82rem;">รับเงินสด</div>
              </template>
            </div>
          </div>
          <div v-else class="exp-pay-bank-info" style="border-color: rgba(255, 183, 77, 0.2); background: rgba(255, 183, 77, 0.04);">
            <q-icon name="info" size="14px" style="color: #ffb74d;" />
            <div style="font-size: 0.72rem; color: #9ca3af;">ผู้ขอเบิกไม่ได้ระบุวิธีรับเงิน</div>
          </div>

          <label class="exp-field-label">วิธีจ่ายเงิน <span class="exp-required">*</span></label>
          <div class="exp-pay-methods">
            <button class="exp-pay-method" :class="{ 'exp-pay-method-active': payMethod === 'transfer' }"
              @click="payMethod = 'transfer'">
              <q-icon name="account_balance" size="18px" />
              <span>โอนเงิน</span>
            </button>
            <button class="exp-pay-method" :class="{ 'exp-pay-method-active': payMethod === 'cash' }"
              @click="payMethod = 'cash'">
              <q-icon name="payments" size="18px" />
              <span>เงินสด</span>
            </button>
          </div>

          <!-- Transfer: upload slip -->
          <div v-if="payMethod === 'transfer'" class="exp-field q-mt-md">
            <label class="exp-field-label">อัปโหลดสลิปโอนเงิน</label>
            <label class="exp-slip-upload">
              <q-icon :name="paySlipFile ? 'check_circle' : 'cloud_upload'" size="24px" />
              <span>{{ paySlipFile ? paySlipFile.name : 'เลือกรูปสลิป' }}</span>
              <input type="file" accept="image/*,application/pdf" style="display:none;" @change="handlePaySlip" />
            </label>
          </div>

          <!-- Cash or transfer note -->
          <div class="exp-field q-mt-md">
            <label class="exp-field-label">หมายเหตุ</label>
            <textarea v-model="payNote" class="exp-textarea" placeholder="เช่น เลขที่อ้างอิง, ผู้รับเงิน..." rows="2"></textarea>
          </div>

          <div class="row justify-end q-mt-md q-gutter-sm">
            <q-btn flat label="ยกเลิก" style="color: #6b6c6f;" @click="showPayDialog = false" />
            <q-btn label="ยืนยันจ่ายเงิน" class="exp-btn-confirm-pay" :loading="expenseStore.processing"
              :disable="!payMethod" @click="handlePay" />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- CEO Confirm Dialog -->
    <q-dialog v-model="showCEOConfirm">
      <q-card class="exp-confirm-dialog">
        <q-card-section class="row items-center q-pb-sm">
          <q-icon name="verified" size="22px" style="color: #42a5f5;" class="q-mr-sm" />
          <div class="exp-detail-title">ยืนยัน CEO อนุมัติ</div>
          <q-space />
          <q-btn icon="close" flat round dense style="color: #6b6c6f;" @click="showCEOConfirm = false" />
        </q-card-section>
        <q-separator style="background: rgba(44, 58, 69, 0.4);" />
        <q-card-section v-if="confirmingExpense">
          <div class="exp-confirm-info">
            <span>{{ confirmingExpense.firstName }} {{ confirmingExpense.lastName }}</span>
            <span class="exp-confirm-amount">{{ formatMoney(confirmingExpense.totalAmount) }} ฿</span>
          </div>
          <div class="exp-confirm-msg">
            <q-icon name="info" size="16px" style="color: #42a5f5;" />
            <span>คุณยืนยันว่า CEO ได้เซ็นอนุมัติเอกสารนี้แล้ว?</span>
          </div>
          <div class="row justify-end q-mt-md q-gutter-sm">
            <q-btn flat label="ยกเลิก" style="color: #6b6c6f;" @click="showCEOConfirm = false" />
            <q-btn label="ยืนยัน" class="exp-btn-confirm-approve" :loading="expenseStore.processing"
              @click="confirmCEOApprove" />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Cancel Confirm Dialog -->
    <q-dialog v-model="showCancelConfirm">
      <q-card class="exp-confirm-dialog">
        <q-card-section class="row items-center q-pb-sm">
          <q-icon name="cancel" size="22px" style="color: #ef5350;" class="q-mr-sm" />
          <div class="exp-detail-title">ยืนยันยกเลิกใบเบิก</div>
          <q-space />
          <q-btn icon="close" flat round dense style="color: #6b6c6f;" @click="showCancelConfirm = false" />
        </q-card-section>
        <q-separator style="background: rgba(44, 58, 69, 0.4);" />
        <q-card-section>
          <div class="exp-confirm-msg">
            <q-icon name="warning" size="16px" style="color: #ffb74d;" />
            <span>คุณต้องการยกเลิกใบเบิกนี้หรือไม่? การยกเลิกไม่สามารถย้อนกลับได้</span>
          </div>
          <div class="row justify-end q-mt-md q-gutter-sm">
            <q-btn flat label="ไม่ใช่" style="color: #6b6c6f;" @click="showCancelConfirm = false" />
            <q-btn label="ยืนยันยกเลิก" class="exp-btn-confirm-reject" :loading="expenseStore.processing"
              @click="confirmCancel" />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Print Area (hidden, for printing only) -->
    <div id="exp-print-area" class="exp-print-area">
      <div v-if="printData" class="exp-print-content">
        <div class="exp-print-header">
          <h2>ใบขออนุมัติเบิกค่าใช้จ่าย</h2>
        </div>
        <div class="exp-print-info">
          <div class="exp-print-info-row">
            <span><strong>ชื่อ-นามสกุล:</strong> {{ printData.firstName }} {{ printData.lastName }}</span>
            <span><strong>แผนก:</strong> {{ printData.department || '-' }}</span>
          </div>
          <div class="exp-print-info-row">
            <span><strong>วันที่ยื่น:</strong> {{ formatTimestamp(printData.submittedAt) }}</span>
            <span><strong>เลขที่:</strong> {{ printData.id }}</span>
          </div>
        </div>

        <table class="exp-print-table">
          <thead>
            <tr>
              <th style="width:50px;">ลำดับ</th>
              <th>รายการ</th>
              <th style="width:120px; text-align:right;">จำนวนเงิน (บาท)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in printData.items" :key="item.seq">
              <td style="text-align:center;">{{ item.seq }}</td>
              <td>{{ item.description }}</td>
              <td style="text-align:right;">{{ formatMoney(item.amount) }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="text-align:right; font-weight:bold;">รวมทั้งสิ้น</td>
              <td style="text-align:right; font-weight:bold;">{{ formatMoney(printData.totalAmount) }}</td>
            </tr>
          </tfoot>
        </table>

        <div v-if="printData.note" class="exp-print-note">
          <strong>หมายเหตุ:</strong> {{ printData.note }}
        </div>

        <div v-if="printData.receiveMethod" class="exp-print-note">
          <strong>วิธีรับเงิน:</strong>
          <template v-if="printData.receiveMethod === 'promptpay'">
            PromptPay {{ printData.promptPayPhone }}
            <span v-if="printData.accountName"> ({{ printData.accountName }})</span>
          </template>
          <template v-else-if="printData.receiveMethod === 'transfer'">
            {{ printData.bankName }} {{ printData.accountNumber }}
            <span v-if="printData.accountName"> ({{ printData.accountName }})</span>
          </template>
          <template v-else>เงินสด</template>
        </div>

        <div class="exp-print-signatures">
          <div class="exp-print-sig">
            <div class="exp-print-sig-line"></div>
            <div>ผู้ขอเบิก</div>
            <div class="exp-print-sig-name">({{ printData.firstName }} {{ printData.lastName }})</div>
          </div>
          <div class="exp-print-sig">
            <div class="exp-print-sig-line"></div>
            <div>HR ผู้ตรวจสอบ</div>
            <div class="exp-print-sig-name">&nbsp;</div>
          </div>
          <div class="exp-print-sig">
            <div class="exp-print-sig-line"></div>
            <div>CEO ผู้อนุมัติ</div>
            <div class="exp-print-sig-name">&nbsp;</div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useExpenseStore } from 'stores/expense'
import { useAuthStore } from 'stores/auth'
import { useNotificationsStore } from 'stores/notifications'
import * as XLSX from 'xlsx'

const expenseStore = useExpenseStore()
const authStore = useAuthStore()
const notificationsStore = useNotificationsStore()

const historyTab = ref('my')
const showSuccess = ref(false)
const formError = ref('')

// Form items
const formItems = ref([{ description: '', amount: null }])
const formNote = ref('')
const receiptFiles = ref({})
const formReceiveMethod = ref('')
const formPromptPayPhone = ref('')
const formBankName = ref('')
const formAccountNumber = ref('')
const formAccountName = ref('')

const bankOptions = [
  'กสิกรไทย (KBANK)',
  'กรุงเทพ (BBL)',
  'ไทยพาณิชย์ (SCB)',
  'กรุงไทย (KTB)',
  'กรุงศรีอยุธยา (BAY)',
  'ทหารไทยธนชาต (TTB)',
  'ออมสิน (GSB)',
  'ธ.ก.ส. (BAAC)',
  'ซีไอเอ็มบี ไทย (CIMBT)',
  'ยูโอบี (UOB)',
  'แลนด์ แอนด์ เฮ้าส์ (LHBANK)',
  'เกียรตินาคินภัทร (KKP)',
  'อื่นๆ'
]

// Dialogs
const showDetailDialog = ref(false)
const detailExpense = ref(null)
const showRejectDialog = ref(false)
const rejectingExpense = ref(null)
const rejectReason = ref('')
const showPayDialog = ref(false)
const payingExpense = ref(null)
const payMethod = ref('')
const paySlipFile = ref(null)
const payNote = ref('')
const printData = ref(null)
const showCEOConfirm = ref(false)
const confirmingExpense = ref(null)
const showCancelConfirm = ref(false)
const cancellingExpenseId = ref(null)

// Show manage section for HR / super_admin
const showManageSection = computed(() => {
  const role = authStore.profile.role
  return role === 'hr' || role === 'super_admin'
})

// Total amount
const totalAmount = computed(() => {
  return formItems.value.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
})

// Form validation
const isFormValid = computed(() => {
  return formItems.value.length > 0 &&
    formItems.value.every(item => item.description.trim() && Number(item.amount) > 0) &&
    totalAmount.value > 0
})

// Current history list based on tab
const currentHistoryList = computed(() => {
  return historyTab.value === 'my' ? expenseStore.myExpenses : expenseStore.allExpenses
})

// Helpers
const getStatusInfo = (status) => {
  return expenseStore.statusLabels[status] || { label: status, color: '#9e9e9e', icon: 'info' }
}

const formatMoney = (amount) => {
  return Number(amount || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const formatTimestamp = (timestamp) => {
  if (!timestamp) return ''
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }) +
    ' ' + date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
}

// Item management
const addItem = () => {
  formItems.value.push({ description: '', amount: null })
}

const removeItem = (idx) => {
  formItems.value.splice(idx, 1)
  // Re-index receipt files to match new item positions
  const oldFiles = { ...receiptFiles.value }
  const newFiles = {}
  for (let i = 0; i < formItems.value.length; i++) {
    const oldSeq = i < idx ? i + 1 : i + 2
    if (oldFiles[oldSeq]) {
      newFiles[i + 1] = oldFiles[oldSeq]
    }
  }
  receiptFiles.value = newFiles
}

const handleReceipt = (event, seq) => {
  const file = event.target.files?.[0]
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      alert('ขนาดไฟล์ต้องไม่เกิน 5MB')
      return
    }
    receiptFiles.value[seq] = file
  }
}

// Submit
const handleSubmit = async () => {
  formError.value = ''

  if (!isFormValid.value) {
    formError.value = 'กรุณากรอกรายการและจำนวนเงินให้ครบทุกรายการ'
    return
  }

  const result = await expenseStore.submitExpense({
    items: formItems.value,
    note: formNote.value,
    receiptFiles: receiptFiles.value,
    receiveMethod: formReceiveMethod.value,
    promptPayPhone: formReceiveMethod.value === 'promptpay' ? formPromptPayPhone.value : '',
    bankName: formReceiveMethod.value === 'transfer' ? formBankName.value : '',
    accountNumber: formReceiveMethod.value === 'transfer' ? formAccountNumber.value : '',
    accountName: formReceiveMethod.value !== 'cash' ? formAccountName.value : ''
  })

  if (result) {
    showSuccess.value = true

    // Notify HR / super_admin users
    try {
      if (authStore.allProfiles.length === 0) {
        await authStore.fetchAllProfiles()
      }
      const managers = authStore.allProfiles.filter(p => p.role === 'hr' || p.role === 'super_admin')
      for (const mgr of managers) {
        await notificationsStore.createNotification({
          recipientEmail: mgr.email || mgr.id,
          type: 'expense_submitted',
          title: 'มีใบเบิกค่าใช้จ่ายใหม่',
          message: `${authStore.fullName} ส่งใบเบิกค่าใช้จ่าย ${formatMoney(totalAmount.value)} บาท`
        })
      }
    } catch (e) {
      console.error('Error sending expense notification:', e)
    }

    if (showManageSection.value) {
      await expenseStore.fetchPendingExpenses()
    }
  } else {
    formError.value = 'เกิดข้อผิดพลาด กรุณาลองใหม่'
  }
}

const resetForm = () => {
  showSuccess.value = false
  formItems.value = [{ description: '', amount: null }]
  formNote.value = ''
  receiptFiles.value = {}
  formReceiveMethod.value = ''
  formPromptPayPhone.value = ''
  formBankName.value = ''
  formAccountNumber.value = ''
  formAccountName.value = ''
  formError.value = ''
}

// Cancel
const openCancelConfirm = (id) => {
  cancellingExpenseId.value = id
  showCancelConfirm.value = true
}

const confirmCancel = async () => {
  if (!cancellingExpenseId.value) return
  await expenseStore.cancelExpense(cancellingExpenseId.value)
  showCancelConfirm.value = false
  cancellingExpenseId.value = null
}

// History tabs
const refreshPending = async () => {
  await expenseStore.fetchPendingExpenses()
}

const refreshHistory = async () => {
  if (historyTab.value === 'my') {
    await expenseStore.fetchMyExpenses()
  } else {
    await expenseStore.fetchAllExpenses()
  }
  if (showManageSection.value) {
    await expenseStore.fetchPendingExpenses()
  }
}

const switchToAll = async () => {
  historyTab.value = 'all'
  await expenseStore.fetchAllExpenses()
}

// Detail dialog
const openDetailDialog = (exp) => {
  detailExpense.value = exp
  showDetailDialog.value = true
}

// Reject dialog
const openRejectDialog = (exp) => {
  rejectingExpense.value = exp
  rejectReason.value = ''
  showRejectDialog.value = true
}

const handleReject = async () => {
  if (!rejectingExpense.value) return
  const success = await expenseStore.rejectExpense(rejectingExpense.value.id, rejectReason.value)
  if (success) {
    try {
      await notificationsStore.createNotification({
        recipientEmail: rejectingExpense.value.userId,
        type: 'expense_rejected',
        title: 'ใบเบิกค่าใช้จ่ายไม่อนุมัติ',
        message: `ใบเบิก ${formatMoney(rejectingExpense.value.totalAmount)} บาท ไม่ได้รับการอนุมัติ${rejectReason.value ? ' — ' + rejectReason.value : ''}`
      })
    } catch (e) {
      console.error('Error sending reject notification:', e)
    }
    showRejectDialog.value = false

    await expenseStore.fetchMyExpenses()
    if (expenseStore.allExpenses.length > 0) {
      await expenseStore.fetchAllExpenses()
    }
  }
}

// Mark as sent to CEO (status change only)

const doPrint = (exp) => {
  printData.value = exp
  setTimeout(() => {
    const printArea = document.getElementById('exp-print-area')
    const content = printArea.innerHTML
    const printWindow = window.open('', '_blank', 'width=800,height=600')
    const doc = printWindow.document

    // Set color scheme via meta
    const meta = doc.createElement('meta')
    meta.setAttribute('name', 'color-scheme')
    meta.setAttribute('content', 'only light')
    doc.head.appendChild(meta)

    // Title
    doc.title = 'ใบขออนุมัติเบิกค่าใช้จ่าย'

    // Style
    const style = doc.createElement('style')
    style.textContent = `
      :root { color-scheme: only light !important; }
      *, *::before, *::after { color-scheme: light !important; }
      html { background-color: #ffffff !important; }
      body { background-color: #ffffff !important; color: #000000 !important; font-family: "Sarabun", "Segoe UI", Tahoma, sans-serif; padding: 30px; margin: 0; -webkit-print-color-adjust: exact; }
      h2 { text-align: center; margin-bottom: 20px; font-size: 18px; color: #000 !important; }
      .exp-print-info-row { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 14px; color: #000 !important; }
      .exp-print-info-row span { color: #000 !important; }
      table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px; }
      th, td { border: 1px solid #333 !important; padding: 8px 10px; color: #000 !important; }
      th { background-color: #f0f0f0 !important; font-weight: bold; }
      tfoot td { border-top: 2px solid #333 !important; }
      .exp-print-note { margin: 12px 0; font-size: 13px; color: #000 !important; }
      .exp-print-signatures { display: flex; justify-content: space-between; margin-top: 60px; text-align: center; }
      .exp-print-sig { width: 28%; }
      .exp-print-sig-line { border-bottom: 1px solid #333 !important; margin-bottom: 6px; height: 40px; }
      .exp-print-sig-name { font-size: 12px; color: #666 !important; margin-top: 4px; }
      .exp-print-sig div { color: #000 !important; }
      .exp-print-header, .exp-print-info, .exp-print-content { color: #000 !important; }
      strong { color: #000 !important; }
      @media print { body { padding: 15px; background: #fff !important; } }
    `
    doc.head.appendChild(style)

    // Body content
    doc.body.style.cssText = 'background-color:#ffffff !important; color:#000000 !important;'
    doc.body.innerHTML = content

    printWindow.focus()
    setTimeout(() => printWindow.print(), 400)
  }, 100)
}

// CEO Approve - confirm dialog
const openCEOConfirm = (exp) => {
  confirmingExpense.value = exp
  showCEOConfirm.value = true
}

const confirmCEOApprove = async () => {
  if (!confirmingExpense.value) return
  await handleCEOApprove(confirmingExpense.value)
  showCEOConfirm.value = false
}

const handleCEOApprove = async (exp) => {
  const success = await expenseStore.markCEOApproved(exp.id)
  if (success) {
    try {
      await notificationsStore.createNotification({
        recipientEmail: exp.userId,
        type: 'expense_approved',
        title: 'CEO อนุมัติใบเบิกค่าใช้จ่ายแล้ว',
        message: `ใบเบิก ${formatMoney(exp.totalAmount)} บาท ได้รับการอนุมัติจาก CEO แล้ว รอ HR จ่ายเงิน`
      })
    } catch (e) {
      console.error('Error sending approve notification:', e)
    }

    await expenseStore.fetchMyExpenses()
    if (expenseStore.allExpenses.length > 0) {
      await expenseStore.fetchAllExpenses()
    }
  }
}

// Pay dialog
const openPayDialog = (exp) => {
  payingExpense.value = exp
  payMethod.value = ''
  paySlipFile.value = null
  payNote.value = ''
  showPayDialog.value = true
}

const handlePaySlip = (event) => {
  const file = event.target.files?.[0]
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      alert('ขนาดไฟล์ต้องไม่เกิน 5MB')
      return
    }
    paySlipFile.value = file
  }
}

const handlePay = async () => {
  if (!payingExpense.value || !payMethod.value) return
  const success = await expenseStore.markPaid(payingExpense.value.id, {
    method: payMethod.value,
    slipFile: paySlipFile.value,
    note: payNote.value
  })
  if (success) {
    try {
      await notificationsStore.createNotification({
        recipientEmail: payingExpense.value.userId,
        type: 'expense_paid',
        title: 'จ่ายเงินเบิกค่าใช้จ่ายแล้ว',
        message: `ใบเบิก ${formatMoney(payingExpense.value.totalAmount)} บาท ได้รับการจ่ายเงินแล้ว (${payMethod.value === 'transfer' ? 'โอนเงิน' : 'เงินสด'})`
      })
    } catch (e) {
      console.error('Error sending payment notification:', e)
    }
    showPayDialog.value = false

    await expenseStore.fetchMyExpenses()
    if (expenseStore.allExpenses.length > 0) {
      await expenseStore.fetchAllExpenses()
    }
  }
}

// Export to Excel
const exportToExcel = () => {
  const expenses = currentHistoryList.value
  if (!expenses || expenses.length === 0) return

  const rows = []
  expenses.forEach(exp => {
    const statusInfo = getStatusInfo(exp.status)
    const submitted = exp.submittedAt
      ? (exp.submittedAt.toDate ? exp.submittedAt.toDate() : new Date(exp.submittedAt))
      : null

    ;(exp.items || []).forEach(item => {
      rows.push({
        'ชื่อ-นามสกุล': `${exp.firstName || ''} ${exp.lastName || ''}`.trim(),
        'แผนก': exp.department || '',
        'ลำดับ': item.seq,
        'รายการ': item.description,
        'จำนวนเงิน': item.amount,
        'ยอดรวมทั้งใบ': exp.totalAmount,
        'สถานะ': statusInfo.label,
        'วิธีรับเงิน': exp.receiveMethod === 'promptpay' ? 'PromptPay' : exp.receiveMethod === 'transfer' ? 'โอนธนาคาร' : exp.receiveMethod === 'cash' ? 'เงินสด' : '',
        'PromptPay': exp.promptPayPhone || '',
        'ธนาคาร': exp.bankName || '',
        'เลขที่บัญชี': exp.accountNumber || '',
        'ชื่อบัญชี': exp.accountName || '',
        'หมายเหตุ': exp.note || '',
        'วันที่ส่ง': submitted ? submitted.toLocaleDateString('th-TH') : ''
      })
    })
  })

  if (rows.length === 0) return

  const ws = XLSX.utils.json_to_sheet(rows)
  const colWidths = Object.keys(rows[0]).map(key => {
    const maxLen = Math.max(key.length, ...rows.map(r => String(r[key] || '').length))
    return { wch: Math.min(maxLen + 2, 40) }
  })
  ws['!cols'] = colWidths

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'ประวัติการเบิกค่าใช้จ่าย')

  const today = new Date().toISOString().slice(0, 10)
  XLSX.writeFile(wb, `expense-history-${historyTab.value}-${today}.xlsx`)
}

// onMounted
const approvalsFetched = ref(false)

onMounted(async () => {
  await expenseStore.fetchMyExpenses()

  if (showManageSection.value) {
    approvalsFetched.value = true
    await expenseStore.fetchPendingExpenses()
  }
})

watch(() => authStore.profile, async () => {
  if (showManageSection.value && !approvalsFetched.value) {
    approvalsFetched.value = true
    await expenseStore.fetchPendingExpenses()
  }
}, { deep: true })
</script>

<style scoped>
/* ====== Page ====== */
.exp-page {
  background: #17181a;
  min-height: 100vh;
  padding: 24px;
}

.exp-container {
  max-width: 1000px;
  margin: 0 auto;
}

/* ====== Header ====== */
.exp-page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.exp-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.exp-header-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(38, 166, 154, 0.12);
  color: #26a69a;
  display: flex;
  align-items: center;
  justify-content: center;
}

.exp-header-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #e0e1e4;
}

.exp-header-subtitle {
  font-size: 0.72rem;
  color: #6b6c6f;
  margin-top: 2px;
}

.exp-back-btn {
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

.exp-back-btn:hover {
  border-color: rgba(92, 156, 230, 0.3);
  color: #5c9ce6;
}

/* ====== Grid ====== */
.exp-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

/* ====== Card ====== */
.exp-card {
  background: rgba(30, 33, 36, 0.7);
  border: 1px solid rgba(58, 59, 62, 0.3);
  border-radius: 14px;
  backdrop-filter: blur(10px);
  overflow: hidden;
}

.exp-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 16px;
  border-bottom: 1px solid rgba(58, 59, 62, 0.2);
}

.exp-card-title {
  font-size: 0.82rem;
  font-weight: 700;
  color: #cecfd2;
}

.exp-pending-badge {
  background: rgba(255, 183, 77, 0.15) !important;
  color: #ffb74d !important;
  font-size: 0.58rem !important;
}

/* ====== Form ====== */
.exp-form-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.exp-profile-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.68rem;
  color: #5c9ce6;
}

.exp-form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.exp-field-label {
  display: block;
  font-size: 0.7rem;
  font-weight: 600;
  color: #9ca3af;
  margin-bottom: 5px;
}

.exp-required {
  color: #ef5350;
}

.exp-input {
  width: 100%;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid rgba(58, 59, 62, 0.4);
  background: rgba(24, 25, 28, 0.6);
  color: #e0e1e4;
  font-size: 0.78rem;
  outline: none;
  transition: border-color 0.15s;
  box-sizing: border-box;
}

.exp-input:focus {
  border-color: rgba(38, 166, 154, 0.5);
}

.exp-input[readonly] {
  opacity: 0.7;
  cursor: default;
}

.exp-input-sm {
  padding: 6px 8px;
  font-size: 0.74rem;
}

.exp-input-money {
  text-align: right;
}

.exp-textarea {
  width: 100%;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid rgba(58, 59, 62, 0.4);
  background: rgba(24, 25, 28, 0.6);
  color: #e0e1e4;
  font-size: 0.78rem;
  outline: none;
  resize: vertical;
  font-family: inherit;
  box-sizing: border-box;
}

.exp-textarea:focus {
  border-color: rgba(38, 166, 154, 0.5);
}

.exp-select {
  appearance: auto;
  cursor: pointer;
}

/* ====== Bank Section ====== */
.exp-bank-section {
  padding: 12px 14px;
  border-radius: 10px;
  background: rgba(66, 165, 245, 0.04);
  border: 1px solid rgba(66, 165, 245, 0.12);
}

.exp-bank-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.72rem;
  font-weight: 600;
  color: #42a5f5;
  margin-bottom: 10px;
}

.exp-receive-methods {
  display: flex;
  gap: 8px;
  margin-bottom: 4px;
}

.exp-receive-option {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid rgba(58, 59, 62, 0.3);
  background: transparent;
  color: #6b6c6f;
  font-size: 0.72rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.exp-receive-option:hover {
  border-color: rgba(66, 165, 245, 0.3);
  color: #9ca3af;
}

.exp-receive-active {
  border-color: rgba(66, 165, 245, 0.5);
  background: rgba(66, 165, 245, 0.08);
  color: #42a5f5;
}

.exp-radio {
  display: none;
}

.q-mt-sm {
  margin-top: 10px;
}

.exp-form-row-3 {
  grid-template-columns: 1fr 1fr 1fr;
}

/* ====== Items Table ====== */
.exp-items-table {
  border: 1px solid rgba(58, 59, 62, 0.3);
  border-radius: 10px;
  overflow: hidden;
}

.exp-items-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  background: rgba(24, 25, 28, 0.5);
  font-size: 0.65rem;
  font-weight: 700;
  color: #6b6c6f;
  text-transform: uppercase;
}

.exp-items-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-top: 1px solid rgba(58, 59, 62, 0.15);
}

.exp-items-row:hover {
  background: rgba(58, 59, 62, 0.06);
}

.exp-col-seq {
  width: 28px;
  text-align: center;
  font-size: 0.7rem;
  color: #6b6c6f;
  flex-shrink: 0;
}

.exp-seq-num {
  font-weight: 700;
  color: #9ca3af;
}

.exp-col-desc {
  flex: 1;
  min-width: 0;
}

.exp-col-amt {
  width: 100px;
  flex-shrink: 0;
}

.exp-col-receipt {
  width: 32px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.exp-col-action {
  width: 28px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.exp-receipt-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 6px;
  border: 1px solid rgba(58, 59, 62, 0.3);
  background: transparent;
  color: #6b6c6f;
  cursor: pointer;
  transition: all 0.15s;
}

.exp-receipt-btn:hover {
  border-color: rgba(38, 166, 154, 0.4);
  color: #26a69a;
}

.exp-receipt-attached {
  border-color: rgba(102, 187, 106, 0.4);
  color: #66bb6a;
  background: rgba(102, 187, 106, 0.08);
}

.exp-remove-btn {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: #6b6c6f;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.exp-remove-btn:hover {
  background: rgba(239, 83, 80, 0.12);
  color: #ef5350;
}

.exp-add-item-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  border-radius: 8px;
  border: 1px dashed rgba(58, 59, 62, 0.3);
  background: transparent;
  color: #6b6c6f;
  font-size: 0.72rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  margin-top: 8px;
}

.exp-add-item-btn:hover {
  border-color: rgba(38, 166, 154, 0.4);
  color: #26a69a;
}

/* ====== Total ====== */
.exp-total-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-radius: 10px;
  background: rgba(38, 166, 154, 0.06);
  border: 1px solid rgba(38, 166, 154, 0.15);
}

.exp-total-label {
  font-size: 0.78rem;
  font-weight: 700;
  color: #9ca3af;
}

.exp-total-value {
  font-size: 1.05rem;
  font-weight: 800;
  color: #26a69a;
}

/* ====== Submit ====== */
.exp-submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, #26a69a 0%, #00897b 100%);
  color: white;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.exp-submit-btn:hover:not(:disabled) {
  filter: brightness(1.1);
  transform: translateY(-1px);
}

.exp-submit-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* ====== Success ====== */
.exp-success {
  padding: 32px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.exp-success-icon {
  font-size: 2rem;
}

.exp-success-title {
  font-size: 0.92rem;
  font-weight: 700;
  color: #e0e1e4;
}

.exp-success-desc {
  font-size: 0.72rem;
  color: #6b6c6f;
}

.exp-new-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px;
  margin-top: 8px;
  border-radius: 8px;
  border: 1px solid rgba(38, 166, 154, 0.3);
  background: transparent;
  color: #26a69a;
  font-size: 0.72rem;
  font-weight: 600;
  cursor: pointer;
}

.exp-new-btn:hover {
  background: rgba(38, 166, 154, 0.08);
}

/* ====== Error ====== */
.exp-error {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 8px;
  background: rgba(239, 83, 80, 0.08);
  color: #ef5350;
  font-size: 0.72rem;
}

/* ====== Empty ====== */
.exp-empty {
  padding: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #4b5563;
  font-size: 0.72rem;
}

/* ====== History ====== */
.exp-history-list {
  max-height: 500px;
  overflow-y: auto;
}

.exp-history-list::-webkit-scrollbar { width: 3px; }
.exp-history-list::-webkit-scrollbar-thumb { background: rgba(58, 59, 62, 0.3); border-radius: 2px; }

.exp-history-item {
  padding: 12px 16px;
  border-bottom: 1px solid rgba(58, 59, 62, 0.12);
  cursor: pointer;
  transition: background 0.15s;
}

.exp-history-item:hover {
  background: rgba(58, 59, 62, 0.08);
}

.exp-history-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.exp-history-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.exp-history-count {
  font-size: 0.72rem;
  font-weight: 700;
  color: #cecfd2;
}

.exp-history-user {
  font-size: 0.68rem;
  color: #6b6c6f;
}

.exp-history-status {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 0.62rem;
  font-weight: 700;
}

.exp-history-items-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 8px;
}

.exp-history-item-pill {
  padding: 2px 8px;
  border-radius: 4px;
  background: rgba(58, 59, 62, 0.2);
  font-size: 0.62rem;
  color: #9ca3af;
}

.exp-history-item-more {
  font-size: 0.62rem;
  color: #6b6c6f;
  padding: 2px 4px;
}

.exp-history-bottom {
  display: flex;
  align-items: center;
  gap: 10px;
}

.exp-history-amount {
  font-size: 0.82rem;
  font-weight: 800;
  color: #26a69a;
}

.exp-history-date {
  font-size: 0.62rem;
  color: #4b5563;
}

.exp-cancel-btn {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 2px 8px;
  margin-left: auto;
  border-radius: 5px;
  border: 1px solid rgba(239, 83, 80, 0.2);
  background: transparent;
  color: #ef5350;
  font-size: 0.62rem;
  cursor: pointer;
}

.exp-cancel-btn:hover {
  background: rgba(239, 83, 80, 0.08);
}

/* ====== History Header ====== */
.exp-history-header {
  flex-wrap: wrap;
}

.exp-history-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.exp-history-controls {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
}

/* ====== Tabs ====== */
.exp-tabs {
  display: flex;
  background: rgba(36, 37, 40, 0.6);
  border-radius: 8px;
  padding: 2px;
}

.exp-tab {
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

.exp-tab:hover { color: #9e9e9e; }
.exp-tab-active { background: rgba(92, 156, 230, 0.12); color: #5c9ce6; }

.exp-refresh-btn {
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

.exp-refresh-btn:hover:not(:disabled) {
  border-color: rgba(92, 156, 230, 0.3);
  color: #5c9ce6;
}

.exp-refresh-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.exp-spin {
  animation: exp-spin-anim 0.8s linear infinite;
}

@keyframes exp-spin-anim {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.exp-export-btn {
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

.exp-export-btn:hover:not(:disabled) {
  background: rgba(76, 175, 80, 0.18);
  border-color: rgba(76, 175, 80, 0.4);
}

.exp-export-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

/* ====== Manage Section ====== */
.exp-manage-card {
  margin-bottom: 16px;
}

.exp-manage-list {
  max-height: 400px;
  overflow-y: auto;
}

.exp-manage-item {
  padding: 14px 16px;
  border-bottom: 1px solid rgba(58, 59, 62, 0.12);
}

.exp-manage-item-top {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.exp-manage-avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(38, 166, 154, 0.12);
  color: #26a69a;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 700;
  flex-shrink: 0;
  overflow: hidden;
}

.exp-manage-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.exp-manage-info {
  flex: 1;
  min-width: 0;
}

.exp-manage-name {
  font-size: 0.78rem;
  font-weight: 700;
  color: #e0e1e4;
}

.exp-manage-dept {
  font-size: 0.62rem;
  color: #6b6c6f;
}

.exp-manage-amount {
  font-size: 0.92rem;
  font-weight: 800;
  color: #26a69a;
  flex-shrink: 0;
}

.exp-manage-items-summary {
  padding: 8px 12px;
  border-radius: 8px;
  background: rgba(24, 25, 28, 0.4);
  margin-bottom: 10px;
}

.exp-manage-item-line {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 3px 0;
  font-size: 0.7rem;
}

.exp-manage-item-seq {
  color: #6b6c6f;
  font-weight: 700;
  width: 18px;
}

.exp-manage-item-desc {
  flex: 1;
  color: #cecfd2;
}

.exp-manage-item-amt {
  color: #9ca3af;
  font-weight: 600;
}

.exp-manage-receipt-link {
  color: #42a5f5;
  font-size: 0.62rem;
  text-decoration: none;
  margin-left: 4px;
}

.exp-manage-receipt-link:hover {
  text-decoration: underline;
}

.exp-manage-note {
  font-size: 0.65rem;
  color: #6b6c6f;
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.exp-manage-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.exp-manage-status {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 0.62rem;
  font-weight: 700;
}

/* ====== Action Buttons ====== */
.exp-action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 12px;
  border-radius: 7px;
  border: none;
  font-size: 0.68rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.exp-btn-print {
  background: rgba(38, 166, 154, 0.12);
  color: #26a69a;
}

.exp-btn-print:hover {
  background: rgba(38, 166, 154, 0.22);
}

.exp-btn-send-ceo {
  background: rgba(255, 183, 77, 0.12);
  color: #ffb74d;
}

.exp-btn-send-ceo:hover {
  background: rgba(255, 183, 77, 0.22);
}

.exp-btn-approve {
  background: rgba(66, 165, 245, 0.12);
  color: #42a5f5;
}

.exp-btn-approve:hover {
  background: rgba(66, 165, 245, 0.22);
}

.exp-btn-pay {
  background: rgba(102, 187, 106, 0.12);
  color: #66bb6a;
}

.exp-btn-pay:hover {
  background: rgba(102, 187, 106, 0.22);
}

.exp-btn-reject {
  background: rgba(239, 83, 80, 0.1);
  color: #ef5350;
}

.exp-btn-reject:hover {
  background: rgba(239, 83, 80, 0.18);
}

/* ====== Detail Dialog ====== */
.exp-detail-dialog,
.exp-reject-dialog,
.exp-pay-dialog {
  background: #1e2124;
  border: 1px solid rgba(58, 59, 62, 0.4);
  border-radius: 14px;
  min-width: 480px;
  max-width: 560px;
  color: #e0e1e4;
}

.exp-detail-title {
  font-size: 0.88rem;
  font-weight: 700;
  color: #e0e1e4;
}

.exp-detail-header-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.75rem;
  color: #9ca3af;
  margin-bottom: 14px;
}

.exp-detail-status {
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 700;
  margin-top: 4px;
}

.exp-detail-table {
  border: 1px solid rgba(58, 59, 62, 0.3);
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 12px;
}

.exp-detail-table-header {
  display: flex;
  padding: 8px 10px;
  background: rgba(24, 25, 28, 0.5);
  font-size: 0.65rem;
  font-weight: 700;
  color: #6b6c6f;
}

.exp-detail-table-row {
  display: flex;
  padding: 7px 10px;
  font-size: 0.74rem;
  color: #cecfd2;
  border-top: 1px solid rgba(58, 59, 62, 0.12);
}

.exp-detail-table-total {
  display: flex;
  padding: 8px 10px;
  border-top: 2px solid rgba(58, 59, 62, 0.3);
  font-size: 0.78rem;
}

.exp-detail-col-seq { width: 30px; flex-shrink: 0; }
.exp-detail-col-desc { flex: 1; }
.exp-detail-col-amt { width: 100px; text-align: right; flex-shrink: 0; }
.exp-detail-col-receipt { width: 60px; text-align: center; flex-shrink: 0; }

.exp-detail-total-label {
  flex: 1;
  font-weight: 700;
  color: #9ca3af;
  text-align: right;
  padding-right: 10px;
}

.exp-detail-total-value {
  width: 100px;
  text-align: right;
  font-weight: 800;
  color: #26a69a;
}

.exp-detail-note {
  font-size: 0.72rem;
  color: #9ca3af;
  margin-bottom: 12px;
}

.exp-detail-bank {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  background: rgba(66, 165, 245, 0.06);
  border: 1px solid rgba(66, 165, 245, 0.12);
  font-size: 0.72rem;
  color: #cecfd2;
  margin-bottom: 12px;
}

.exp-detail-bank-label {
  font-size: 0.62rem;
  color: #6b6c6f;
  margin-bottom: 2px;
}

.exp-trail {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.68rem;
  color: #9ca3af;
  padding: 3px 0;
}

.exp-trail-reject {
  color: #ef5350;
}

.exp-receipt-link {
  color: #42a5f5;
  text-decoration: none;
  font-size: 0.68rem;
  display: inline-flex;
  align-items: center;
  gap: 3px;
}

.exp-receipt-link:hover {
  text-decoration: underline;
}

/* ====== Reject Dialog ====== */
.exp-reject-info, .exp-pay-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-radius: 8px;
  background: rgba(24, 25, 28, 0.5);
  font-size: 0.78rem;
  color: #cecfd2;
  margin-bottom: 14px;
}

.exp-reject-amount, .exp-pay-amount {
  font-weight: 800;
  color: #26a69a;
}

.exp-btn-confirm-reject {
  background: rgba(239, 83, 80, 0.15) !important;
  color: #ef5350 !important;
}

.exp-btn-confirm-pay {
  background: rgba(102, 187, 106, 0.15) !important;
  color: #66bb6a !important;
}

.exp-btn-confirm-approve {
  background: rgba(66, 165, 245, 0.15) !important;
  color: #42a5f5 !important;
}

.exp-confirm-dialog {
  background: #1e2124;
  border: 1px solid rgba(58, 59, 62, 0.4);
  border-radius: 14px;
  min-width: 400px;
  max-width: 480px;
  color: #e0e1e4;
}

.exp-confirm-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-radius: 8px;
  background: rgba(24, 25, 28, 0.5);
  font-size: 0.78rem;
  color: #cecfd2;
  margin-bottom: 14px;
}

.exp-confirm-amount {
  font-weight: 800;
  color: #26a69a;
}

.exp-confirm-msg {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.78rem;
  color: #9ca3af;
}

/* ====== Pay Dialog ====== */
.exp-pay-bank-info {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 10px;
  background: rgba(66, 165, 245, 0.06);
  border: 1px solid rgba(66, 165, 245, 0.15);
  font-size: 0.74rem;
  color: #cecfd2;
  margin-bottom: 14px;
}

.exp-pay-bank-detail {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.72rem;
  color: #9ca3af;
  margin-top: 3px;
}

.exp-pay-bank-detail strong {
  color: #e0e1e4;
  font-weight: 600;
}

.exp-pay-methods {
  display: flex;
  gap: 10px;
}

.exp-pay-method {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 14px;
  border-radius: 10px;
  border: 1px solid rgba(58, 59, 62, 0.3);
  background: transparent;
  color: #6b6c6f;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.exp-pay-method:hover {
  border-color: rgba(102, 187, 106, 0.3);
  color: #9ca3af;
}

.exp-pay-method-active {
  border-color: rgba(102, 187, 106, 0.5);
  background: rgba(102, 187, 106, 0.08);
  color: #66bb6a;
}

.exp-slip-upload {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px;
  border-radius: 10px;
  border: 1px dashed rgba(58, 59, 62, 0.4);
  background: transparent;
  color: #6b6c6f;
  font-size: 0.78rem;
  cursor: pointer;
  transition: all 0.15s;
}

.exp-slip-upload:hover {
  border-color: rgba(102, 187, 106, 0.4);
  color: #66bb6a;
}

/* ====== Print Area ====== */
.exp-print-area {
  position: absolute;
  left: -9999px;
  top: -9999px;
  width: 210mm;
  background: white;
  color: black;
}

.exp-print-content {
  padding: 20px;
}

.exp-print-header h2 {
  text-align: center;
  margin-bottom: 20px;
  font-size: 18px;
}

.exp-print-info {
  margin-bottom: 16px;
}

.exp-print-info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 14px;
}

.exp-print-table {
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0;
  font-size: 14px;
}

.exp-print-table th,
.exp-print-table td {
  border: 1px solid #333;
  padding: 8px 10px;
}

.exp-print-table th {
  background: #f0f0f0;
  font-weight: bold;
}

.exp-print-table tfoot td {
  border-top: 2px solid #333;
}

.exp-print-note {
  margin: 12px 0;
  font-size: 13px;
}

.exp-print-signatures {
  display: flex;
  justify-content: space-between;
  margin-top: 60px;
  text-align: center;
}

.exp-print-sig {
  width: 28%;
}

.exp-print-sig-line {
  border-bottom: 1px solid #333;
  margin-bottom: 6px;
  height: 40px;
}

.exp-print-sig-name {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

/* ====== Responsive ====== */
@media (max-width: 768px) {
  .exp-grid {
    grid-template-columns: 1fr;
  }

  .exp-form-row {
    grid-template-columns: 1fr;
  }

  .exp-form-row-3 {
    grid-template-columns: 1fr;
  }

  .exp-receive-methods {
    flex-direction: column;
  }

  .exp-detail-dialog,
  .exp-reject-dialog,
  .exp-pay-dialog {
    min-width: 90vw;
  }

  /* History header: stack title + controls */
  .exp-history-title-row {
    width: 100%;
  }

  .exp-history-controls {
    width: 100%;
    margin-left: 0;
    margin-top: 8px;
  }
}
</style>
