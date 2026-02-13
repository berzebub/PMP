<template>
  <q-page class="project-page">
    <!-- Loading State (initial load only, not during operations) -->
    <div v-if="isPageLoading" class="loading-container">
      <q-spinner-dots size="50px" color="primary" />
      <div class="text-h6 text-primary q-mt-md">กำลังโหลด...</div>
    </div>

    <!-- No Project State -->
    <div v-else-if="!projectsStore.currentProject" class="no-project-container">
      <div class="text-center">
        <q-icon name="folder_open" size="64px" class="text-secondary q-mb-md" />
        <div class="text-h5 text-primary q-mb-md">ไม่พบโปรเจค</div>
        <div class="text-body1 text-secondary q-mb-lg">โปรเจคที่คุณกำลังมองหาอาจถูกลบหรือคุณไม่มีสิทธิ์เข้าถึง</div>
        <q-btn color="primary" size="lg" icon="home" label="กลับหน้าหลัก" @click="$router.push('/')" />
      </div>
    </div>

    <!-- Project Content -->
    <div v-else>
      <!-- Project Header -->
      <div class="q-pa-md">
        <div class="project-header-row row items-center justify-between">
          <div>
            <div class="text-h5 text-primary">{{ projectsStore.currentProject?.name }}</div>
            <div class="text-subtitle2 text-secondary">{{ projectsStore.currentProject?.description }}</div>
          </div>
          <div class="row q-gutter-xs">
            <!-- <q-btn color="primary" icon="assignment" label="เพิ่ม Task" @click="showCreateTaskDialog = true" /> -->

            <q-btn :flat="viewMode !== 'kanban'" :outline="viewMode === 'kanban'" icon="view_column"
              @click="viewMode = 'kanban'" class="header-icon-btn"
              :style="viewMode === 'kanban' ? 'color: #cecfd2; border-color: #cecfd2;' : 'color: #6b6c6f;'">
              <q-tooltip>มุมมอง Kanban</q-tooltip>
            </q-btn>
            <q-btn :flat="viewMode !== 'calendar'" :outline="viewMode === 'calendar'" icon="calendar_month"
              @click="viewMode = 'calendar'" class="header-icon-btn"
              :style="viewMode === 'calendar' ? 'color: #5c9ce6; border-color: #5c9ce6;' : 'color: #5c9ce6;'">
              <q-tooltip>มุมมองปฏิทิน</q-tooltip>
            </q-btn>
            <q-btn :flat="viewMode !== 'gantt'" :outline="viewMode === 'gantt'" icon="waterfall_chart"
              @click="viewMode = 'gantt'" class="header-icon-btn"
              :style="viewMode === 'gantt' ? 'color: #4caf50; border-color: #4caf50;' : 'color: #4caf50;'">
              <q-tooltip>มุมมอง Gantt Chart</q-tooltip>
            </q-btn>
            <q-btn flat icon="delete_outline" @click="goToTrash" class="header-icon-btn" style="color: #ef5350;">
              <q-tooltip>ถังขยะ</q-tooltip>
            </q-btn>
            <q-btn flat icon="settings" @click="goToSettings" class="header-icon-btn" style="color: #ffa726;">
              <q-tooltip>การตั้งค่าโปรเจค</q-tooltip>
            </q-btn>
          </div>
        </div>
      </div>

      <!-- Kanban Board View -->
      <div v-if="viewMode === 'kanban'" class="kanban-container q-pa-md">


        <!-- Empty State -->
        <div v-if="sortedColumns.length === 0" class="empty-columns-state">
          <div class="empty-state-icon-wrapper">
            <q-icon name="view_week" size="48px" style="color: #5c9ce6;" />
          </div>
          <div class="empty-state-title">ยังไม่มีคอลัมน์</div>
          <div class="empty-state-subtitle">เริ่มต้นจัดระเบียบงานด้วยการสร้างคอลัมน์แรก</div>
          <button class="empty-state-btn" @click="showCreateColumnDialog = true">
            <q-icon name="add" size="20px" />
            <span>สร้างคอลัมน์แรก</span>
          </button>
        </div>

        <!-- Kanban Columns -->
        <div v-else class="row q-gutter-md kanban-columns-row">
          <div v-for="(status, index) in sortedColumns" :key="status.id" class="kanban-column"
            :class="{
              'is-dragging-column': isDraggingColumn && draggedColumn?.id === status.id,
              'drop-target-left': isDraggingColumn && dragOverColumnIndex === index && draggedColumn?.id !== status.id && shouldShowLeftIndicator(index),
              'drop-target-right': isDraggingColumn && dragOverColumnIndex === index && draggedColumn?.id !== status.id && !shouldShowLeftIndicator(index)
            }"
            @dragover="handleColumnDragOver($event, index)" @drop="handleColumnDrop($event, index)">
            <div class="column-header" :style="{ backgroundColor: status.color }">
              <!-- Column Drag Handle (desktop only) -->
              <div v-if="!isMobile" class="column-drag-handle"
                draggable="true"
                @dragstart.stop="handleColumnDragStart($event, status, index)"
                @dragend.stop="handleColumnDragEnd"
                @mousedown.stop
                title="ลากเพื่อเรียงลำดับคอลัมน์">
                <q-icon name="drag_indicator" size="sm" />
              </div>

              <div class="column-header-content">
                <div class="text-h6 text-white">{{ status.name }}</div>
                <q-badge color="white" text-color="black">
                  {{ tasksWithReordering[status.id]?.length || 0 }}
                </q-badge>
              </div>
              <q-btn-dropdown flat round icon="more_vert" size="sm" class="text-white" @mousedown.stop @click.stop>
                <q-list>
                  <q-item clickable v-close-popup @click="editColumn(status)">
                    <q-item-section avatar>
                      <q-icon name="edit" />
                    </q-item-section>
                    <q-item-section>แก้ไข</q-item-section>
                  </q-item>
                  <q-separator />
                  <q-item clickable v-close-popup @click="deleteColumn(status)" class="text-negative">
                    <q-item-section avatar>
                      <q-icon name="delete" />
                    </q-item-section>
                    <q-item-section>ลบ</q-item-section>
                  </q-item>
                </q-list>
              </q-btn-dropdown>
            </div>

            <div class="column-content"
              :class="{
                'drag-over': isDragging && draggedTask?.status !== status.id,
                'reordering': isDragging && draggedTask?.status === status.id
              }"
              @drop="handleDrop($event, status.id)" @dragover.prevent
              @dragenter.prevent="handleDragEnter($event, status.id)" @dragleave="handleDragLeave"
              @dragend="handleDragEnd">
              <TaskCard v-for="(task, index) in tasksWithReordering[status.id]" :key="task.id" :task="task"
                :draggable="true"
                :class="{ 'drag-over': draggedOverTask?.id === task.id && draggedTask?.status === status.id }"
                @click.stop="handleTaskClick($event, task)"
                @dragstart="handleTaskDragStart($event, task)"
                @dragend="handleTaskDragEnd"
                @dragover="handleTaskDragOver($event, task, index, status.id)"
                @dragenter="handleTaskDragEnter($event, task, index, status.id)"
                @dragleave="handleTaskDragLeave($event, task, index, status.id)" />

              <q-btn flat class="full-width add-task-btn" icon="add" label="เพิ่ม Task"
                @click="createTaskInColumn(status.id)" />
            </div>
          </div>

          <!-- Add Column Button -->
          <div class="add-column-container">
            <q-btn flat class="add-column-btn" icon="add" label="เพิ่มคอลัมน์" @click="showCreateColumnDialog = true" />
          </div>
        </div>
      </div>

      <!-- Calendar View -->
      <div v-else-if="viewMode === 'calendar'" class="calendar-container">
        <CalendarView />
      </div>

      <!-- Gantt Chart View -->
      <div v-else-if="viewMode === 'gantt'" class="gantt-container">
        <GanttChart @task-click="selectTask" />
      </div>

      <!-- Create Task Dialog -->
      <q-dialog v-model="showCreateTaskDialog" persistent no-shake>
        <div class="dialog-redesign dialog-create-task">
          <!-- Header -->
          <div class="dialog-header">
            <div class="dialog-header-left">
              <div class="dialog-header-icon" style="background: rgba(92,156,230,0.12);">
                <q-icon name="add_task" size="20px" style="color: #5c9ce6;" />
              </div>
              <span class="dialog-header-title">สร้าง Task ใหม่</span>
            </div>
            <button class="dialog-close-btn" :disabled="isCreatingTask" @click="showCreateTaskDialog = false">
              <q-icon name="close" size="18px" />
            </button>
          </div>

          <!-- Body -->
          <div class="dialog-body dialog-body-scroll">
            <!-- Title -->
            <div class="field-group">
              <label class="field-label">ชื่อ Task</label>
              <q-input dark v-model="newTask.title" outlined dense hide-bottom-space
                class="field-input field-title" placeholder="เช่น ออกแบบหน้า Login" />
            </div>

            <!-- Description -->
            <div class="field-group">
              <label class="field-label">คำอธิบาย</label>
              <q-input dark v-model="newTask.description" outlined type="textarea" rows="2" dense hide-bottom-space
                class="field-input" placeholder="เพิ่มรายละเอียด..." />
            </div>

            <!-- Meta Grid -->
            <div class="field-meta-grid">
              <!-- Priority -->
              <div class="field-group">
                <label class="field-label">
                  <q-icon name="flag" size="14px" class="field-label-icon" />
                  ความเร่งด่วน
                </label>
                <div class="priority-pills">
                  <button v-for="priority in priorityOptions" :key="priority.value"
                    class="priority-pill" :class="{ 'priority-pill-active': newTask.priority === priority.value, ['priority-' + priority.value]: newTask.priority === priority.value }"
                    @click="newTask.priority = priority.value">
                    {{ priority.label }}
                  </button>
                </div>
              </div>

              <!-- Due Date -->
              <div class="field-group">
                <label class="field-label">
                  <q-icon name="event" size="14px" class="field-label-icon" />
                  กำหนดส่ง
                </label>
                <button class="due-date-picker-btn" @click="showNewTaskDatePicker = true">
                  <q-icon name="calendar_month" size="16px" />
                  <span>{{ newTask.dueDate ? formatDate(newTask.dueDate) : 'เลือกวันที่' }}</span>
                </button>
                <div v-if="newTaskSubtaskDueDateInfo.hasConflict" class="q-mt-xs">
                  <button class="auto-adjust-link" @click="autoAdjustNewTaskDueDate">
                    <q-icon name="sync" size="14px" /> ปรับอัตโนมัติ
                  </button>
                </div>
              </div>

              <!-- Assigned To -->
              <div class="field-group field-group-full">
                <label class="field-label">
                  <q-icon name="group" size="14px" class="field-label-icon" />
                  ผู้รับผิดชอบ
                </label>
                <q-select v-model="newTask.assignedTo" :options="projectMembers" option-value="email"
                  option-label="name" emit-value map-options multiple outlined dense dark use-chips
                  class="field-input" placeholder="เลือกผู้รับผิดชอบ">
                  <template v-slot:selected-item="scope">
                    <q-chip removable dense @remove="scope.removeAtIndex(scope.index)" :tabindex="scope.tabindex"
                      class="q-ma-none field-chip">
                      <q-avatar text-color="white" size="xs" class="field-chip-avatar"><img v-if="scope.opt.photoURL" :src="scope.opt.photoURL" style="width:100%;height:100%;object-fit:cover;" /><span v-else>{{ scope.opt.avatar }}</span></q-avatar>
                      {{ scope.opt.name }}
                    </q-chip>
                  </template>
                </q-select>
              </div>
            </div>

            <!-- Due Date Warnings -->
            <div v-if="newTaskSubtaskDueDateInfo.hasSubtasks" class="field-notice q-mt-sm">
              <div v-if="newTaskSubtaskDueDateInfo.hasConflict" class="field-notice-warn">
                <q-icon name="warning_amber" size="16px" />
                Subtask ล่าสุดครบกำหนด {{ formatDate(newTaskSubtaskDueDateInfo.latestDueDate) }} (หลัง Task หลัก)
              </div>
              <div v-else-if="newTaskSubtaskDueDateInfo.latestDueDate" class="field-notice-info">
                <q-icon name="info_outline" size="16px" />
                Subtask ล่าสุดครบกำหนด {{ formatDate(newTaskSubtaskDueDateInfo.latestDueDate) }}
              </div>
            </div>

            <!-- Subtasks Section (unchanged structure, already redesigned) -->
            <div class="q-mt-lg subtasks-section-redesign">
              <div class="subtask-section-header">
                <div class="subtask-section-title">
                  <q-icon name="checklist" size="18px" />
                  <span>Subtasks</span>
                </div>
                <span v-if="newTaskSubtasks.length > 0" class="subtask-counter">
                  {{ newTaskSubtasks.filter(s => s.completed).length }}/{{ newTaskSubtasks.length }}
                </span>
              </div>
              <div v-if="newTaskSubtasks.length > 0" class="subtask-progress-bar">
                <div class="subtask-progress-fill"
                  :style="{ width: (newTaskSubtasks.filter(s => s.completed).length / newTaskSubtasks.length * 100) + '%' }"></div>
              </div>
              <div class="subtask-list">
                <div v-for="(subtask, index) in newTaskSubtasks" :key="index">
                  <div v-if="editingNewTaskSubtaskIndex !== index" class="subtask-row" :class="{ 'subtask-done': subtask.completed }">
                    <q-checkbox v-model="subtask.completed" size="xs" color="green-6" keep-color @click.stop class="subtask-checkbox" />
                    <div class="subtask-body" @click="startEditNewTaskSubtask(index)">
                      <div class="subtask-title">{{ subtask.title }}</div>
                      <div v-if="subtask.description" class="subtask-desc">{{ subtask.description }}</div>
                      <div class="subtask-tags">
                        <span v-if="subtask.dueDate" class="subtask-tag"><q-icon name="schedule" size="10px" /> {{ formatDate(subtask.dueDate) }}</span>
                        <span v-if="subtask.assignedTo && subtask.assignedTo.length > 0" class="subtask-tag">
                          <q-icon name="person" size="10px" />
                          <span v-if="Array.isArray(subtask.assignedTo)">{{ subtask.assignedTo.map(email => { const m = projectMembers.find(p => p.email === email); return m ? m.name : email.split('@')[0] }).join(', ') }}</span>
                          <span v-else>{{ (() => { const m = projectMembers.find(p => p.email === subtask.assignedTo); return m ? m.name : subtask.assignedTo.split('@')[0] })() }}</span>
                        </span>
                      </div>
                    </div>
                    <div class="subtask-actions-row">
                      <button class="subtask-action-icon" @click="startEditNewTaskSubtask(index)"><q-icon name="edit" size="14px" /><q-tooltip>แก้ไข</q-tooltip></button>
                      <button class="subtask-action-icon subtask-action-delete" @click="removeNewTaskSubtask(index)"><q-icon name="close" size="14px" /><q-tooltip>ลบ</q-tooltip></button>
                    </div>
                  </div>
                  <div v-else class="subtask-inline-form">
                    <q-input v-model="editingNewTaskSubtask.title" placeholder="ชื่อรายการ" outlined dense dark class="subtask-form-input" @keyup.enter="saveEditNewTaskSubtask" @keyup.esc="cancelEditNewTaskSubtask" />
                    <div class="subtask-form-bar">
                      <div class="subtask-form-bar-left">
                        <button class="subtask-btn-save" @click="saveEditNewTaskSubtask"><q-icon name="check" size="14px" /> บันทึก</button>
                        <button class="subtask-btn-cancel" @click="cancelEditNewTaskSubtask">ยกเลิก</button>
                      </div>
                      <div class="subtask-form-bar-right">
                        <button class="subtask-form-icon-btn" @click="showEditNewTaskSubtaskDialog = true"><q-icon name="person_add" size="16px" /><q-tooltip>มอบหมาย</q-tooltip></button>
                        <button class="subtask-form-icon-btn" @click="showEditNewTaskSubtaskDatePicker = true"><q-icon name="event" size="16px" /><q-tooltip>วันครบกำหนด</q-tooltip></button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="showNewTaskInlineSubtaskForm" class="subtask-inline-form">
                <q-input v-model="newTaskSubtask.title" placeholder="ชื่อรายการ" outlined dense dark class="subtask-form-input" @keyup.enter="addNewTaskSubtask" @keyup.esc="cancelNewTaskInlineSubtask" autofocus />
                <div class="subtask-form-bar">
                  <div class="subtask-form-bar-left">
                    <button class="subtask-btn-save" @click="addNewTaskSubtask"><q-icon name="add" size="14px" /> เพิ่ม</button>
                    <button class="subtask-btn-cancel" @click="cancelNewTaskInlineSubtask">ยกเลิก</button>
                  </div>
                  <div class="subtask-form-bar-right">
                    <button class="subtask-form-icon-btn" @click="showNewTaskSubtaskAssignDialogInline = true"><q-icon name="person_add" size="16px" /><q-tooltip>มอบหมาย</q-tooltip></button>
                    <button class="subtask-form-icon-btn" @click="showNewTaskSubtaskDatePickerInline = true"><q-icon name="event" size="16px" /><q-tooltip>วันครบกำหนด</q-tooltip></button>
                  </div>
                </div>
              </div>
              <button v-else class="add-subtask-btn" @click="startNewTaskInlineSubtask">
                <q-icon name="add_circle_outline" size="18px" /><span>เพิ่ม Subtask</span>
              </button>
            </div>

            <!-- Attachments -->
            <div class="q-mt-lg subtasks-section-redesign">
              <div class="subtask-section-header">
                <div class="subtask-section-title">
                  <q-icon name="attach_file" size="18px" style="color: #ffa726;" />
                  <span>ไฟล์แนบ</span>
                </div>
                <span v-if="newTaskAttachments.length > 0" class="subtask-counter">{{ newTaskAttachments.length }}</span>
              </div>
              <div class="q-mt-sm">
                <button class="attachment-upload-redesign" @click="$refs.newTaskFileInput.click()">
                  <q-icon name="cloud_upload" size="18px" />
                  <span>แนบไฟล์/รูปภาพ</span>
                  <span class="attachment-hint">สูงสุด 100MB</span>
                </button>
                <input ref="newTaskFileInput" type="file" multiple hidden
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.7z,.mp4,.mp3"
                  @change="handleNewTaskFileSelect" />
                <div v-if="newTaskAttachments.length > 0" class="attachment-list q-mt-sm">
                  <div v-for="(att, index) in newTaskAttachments" :key="index" class="attachment-item">
                    <div v-if="att.preview" class="attachment-preview"><img :src="att.preview" :alt="att.name" /></div>
                    <q-icon v-else :name="getFileIcon(att.type)" size="28px" :style="{ color: getFileIconColor(att.type) }" />
                    <div class="attachment-info">
                      <div class="attachment-name">{{ att.name }}</div>
                      <div class="attachment-size">{{ formatFileSize(att.size) }}</div>
                    </div>
                    <q-btn flat round icon="close" size="xs" color="grey-5" @click="removeNewTaskAttachment(index)" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="dialog-footer">
            <button class="dialog-btn-secondary" :disabled="isCreatingTask" @click="showCreateTaskDialog = false">ยกเลิก</button>
            <button class="dialog-btn-primary" :disabled="!newTask.title?.trim() || isCreatingTask" @click="handleCreateTask">
              <q-spinner-dots v-if="isCreatingTask" size="16px" color="white" />
              <q-icon v-else name="add" size="16px" />
              <span>{{ isCreatingTask ? 'กำลังสร้าง...' : 'สร้าง Task' }}</span>
            </button>
          </div>
        </div>
      </q-dialog>

      <!-- Task Detail Dialog -->
      <q-dialog v-model="showTaskDetailDialog">
        <div class="dialog-redesign dialog-detail-task">
          <!-- Header -->
          <div class="dialog-header">
            <div class="dialog-header-left">
              <div class="dialog-header-icon" style="background: rgba(92,156,230,0.12);">
                <q-icon name="edit_note" size="20px" style="color: #5c9ce6;" />
              </div>
              <span class="dialog-header-title">รายละเอียด Task</span>
            </div>
            <div class="dialog-header-actions">
              <q-btn-dropdown flat round icon="more_vert" size="sm" class="toolbar-action-btn">
                <q-list dense class="dropdown-menu-list">
                  <q-item clickable v-close-popup @click="showMoveColumnSheet">
                    <q-item-section avatar><q-icon name="drive_file_move" color="grey-4" /></q-item-section>
                    <q-item-section>ย้ายไปคอลัมน์...</q-item-section>
                  </q-item>
                  <q-separator dark />
                  <q-item clickable v-close-popup @click="duplicateTask(selectedTask)">
                    <q-item-section avatar><q-icon name="content_copy" color="grey-4" /></q-item-section>
                    <q-item-section>คัดลอก Task</q-item-section>
                  </q-item>
                  <q-separator dark />
                  <q-item clickable v-close-popup @click="moveTaskToTrash(selectedTask)" class="text-negative">
                    <q-item-section avatar><q-icon name="delete_outline" color="red-5" /></q-item-section>
                    <q-item-section>ย้ายไปถังขยะ</q-item-section>
                  </q-item>
                </q-list>
              </q-btn-dropdown>
              <button class="dialog-close-btn" @click="showTaskDetailDialog = false">
                <q-icon name="close" color=red size="18px" />
              </button>
            </div>
          </div>

          <!-- Two-column body -->
          <div class="detail-two-col">
            <!-- Left Column -->
            <div class="detail-left dialog-body-scroll">
              <!-- Title -->
              <div class="field-group">
                <label class="field-label"><q-icon name="title" size="14px" class="field-label-icon" /> ชื่อ Task</label>
                <q-input dark v-model="editingTask.title" outlined dense hide-bottom-space
                  class="field-input field-title" placeholder="กรุณากรอกชื่อ Task" @blur="autoSaveTask" />
              </div>

              <!-- Description -->
              <div class="field-group">
                <label class="field-label"><q-icon name="description" size="14px" class="field-label-icon" /> คำอธิบาย</label>
                <q-input dark v-model="editingTask.description" outlined type="textarea" rows="3" dense hide-bottom-space
                  class="field-input" placeholder="เพิ่มรายละเอียด..." @blur="autoSaveTask" />
              </div>

              <!-- Meta Grid -->
              <div class="field-meta-grid">
                <!-- Priority -->
                <div class="field-group">
                  <label class="field-label"><q-icon name="flag" size="14px" class="field-label-icon" /> ความเร่งด่วน</label>
                  <div class="priority-pills">
                    <button v-for="priority in priorityOptions" :key="priority.value"
                      class="priority-pill" :class="{ 'priority-pill-active': editingTask.priority === priority.value, ['priority-' + priority.value]: editingTask.priority === priority.value }"
                      @click="editingTask.priority = priority.value; autoSaveTask()">
                      {{ priority.label }}
                    </button>
                  </div>
                </div>

                <!-- Due Date -->
                <div class="field-group">
                  <label class="field-label"><q-icon name="event" size="14px" class="field-label-icon" /> กำหนดส่ง</label>
                  <button class="due-date-picker-btn" @click="showDatePicker = true">
                    <q-icon name="calendar_month" size="16px" />
                    <span>{{ editingTask.dueDate ? formatDate(editingTask.dueDate) : 'เลือกวันที่' }}</span>
                  </button>
                  <div v-if="subtaskDueDateInfo.hasConflict" class="q-mt-xs">
                    <button class="auto-adjust-link" @click="autoAdjustDueDate">
                      <q-icon name="sync" size="14px" /> ปรับอัตโนมัติ
                    </button>
                  </div>
                </div>

                <!-- Assigned To -->
                <div class="field-group field-group-full">
                  <label class="field-label"><q-icon name="group" size="14px" class="field-label-icon" /> ผู้รับผิดชอบ</label>
                  <q-select v-model="editingTask.assignedTo" :options="projectMembers" option-value="email"
                    option-label="name" emit-value map-options multiple outlined dense dark use-chips
                    class="field-input" placeholder="เลือกผู้รับผิดชอบ" @update:model-value="autoSaveTask">
                    <template v-slot:selected-item="scope">
                      <q-chip removable dense @remove="scope.removeAtIndex(scope.index)" :tabindex="scope.tabindex"
                        class="q-ma-none field-chip">
                        <q-avatar text-color="white" size="xs" class="field-chip-avatar"><img v-if="scope.opt.photoURL" :src="scope.opt.photoURL" style="width:100%;height:100%;object-fit:cover;" /><span v-else>{{ scope.opt.avatar }}</span></q-avatar>
                        {{ scope.opt.name }}
                      </q-chip>
                    </template>
                  </q-select>
                </div>
              </div>

              <!-- Due Date Warnings -->
              <div v-if="subtaskDueDateInfo.hasSubtasks && subtaskDueDateInfo.hasConflict" class="field-notice q-mt-sm">
                <div class="field-notice-warn">
                  <q-icon name="warning_amber" size="16px" />
                  Subtask ล่าสุดครบกำหนด {{ formatDate(subtaskDueDateInfo.latestDueDate) }} (หลัง Task หลัก)
                </div>
              </div>

                  <!-- Subtasks Section -->
                  <div class="q-mt-lg subtasks-section-redesign">
                    <div class="subtask-section-header">
                      <div class="subtask-section-title">
                        <q-icon name="checklist" size="18px" />
                        <span>Subtasks</span>
                      </div>
                      <span v-if="tasksStore.subtasks.length > 0" class="subtask-counter">
                        {{ tasksStore.subtasks.filter(s => s.completed).length }}/{{ tasksStore.subtasks.length }}
                      </span>
                    </div>

                    <!-- Progress Bar -->
                    <div v-if="tasksStore.subtasks.length > 0" class="subtask-progress-bar">
                      <div class="subtask-progress-fill"
                        :style="{ width: (tasksStore.subtasks.filter(s => s.completed).length / tasksStore.subtasks.length * 100) + '%' }">
                      </div>
                    </div>

                    <!-- Subtask List -->
                    <div class="subtask-list">
                      <div v-for="subtask in tasksStore.subtasks" :key="subtask.id">
                        <!-- Normal Display Mode -->
                        <div v-if="editingSubtaskId !== subtask.id" class="subtask-row" :class="{ 'subtask-done': subtask.completed }">
                          <q-checkbox v-model="subtask.completed" size="xs" color="green-6" keep-color
                            @update:model-value="toggleSubtask(subtask)" @click.stop class="subtask-checkbox" />
                          <div class="subtask-body" @click="startEditSubtask(subtask)">
                            <div class="subtask-title">{{ subtask.title }}</div>
                            <div v-if="subtask.description" class="subtask-desc">{{ subtask.description }}</div>
                            <div class="subtask-tags">
                              <span v-if="subtask.dueDate" class="subtask-tag">
                                <q-icon name="schedule" size="10px" />
                                {{ formatDate(subtask.dueDate) }}
                              </span>
                              <span v-if="subtask.assignedTo && subtask.assignedTo.length > 0" class="subtask-tag">
                                <q-icon name="person" size="10px" />
                                {{ subtask.assignedTo.map(email => {
                                  const member = projectMembers.find(m => m.email === email)
                                  return member ? member.name : email.split('@')[0]
                                }).join(', ') }}
                              </span>
                            </div>
                          </div>
                          <div class="subtask-actions-row">
                            <button class="subtask-action-icon" @click.stop="startEditSubtask(subtask)">
                              <q-icon name="edit" size="14px" />
                              <q-tooltip>แก้ไข</q-tooltip>
                            </button>
                            <button class="subtask-action-icon subtask-action-delete" @click.stop="deleteSubtask(subtask)">
                              <q-icon name="close" size="14px" />
                              <q-tooltip>ลบ</q-tooltip>
                            </button>
                          </div>
                        </div>

                        <!-- Inline Edit Mode -->
                        <div v-else class="subtask-inline-form">
                          <q-input
                            v-model="editingSubtask.title"
                            placeholder="ชื่อรายการ"
                            outlined dense dark
                            class="subtask-form-input"
                            @keyup.enter="handleUpdateSubtask"
                            @keyup.esc="cancelEditSubtask"
                          />
                          <div class="subtask-form-bar">
                            <div class="subtask-form-bar-left">
                              <button class="subtask-btn-save" @click="handleUpdateSubtask">
                                <q-icon name="check" size="14px" />
                                บันทึก
                              </button>
                              <button class="subtask-btn-cancel" @click="cancelEditSubtask">
                                ยกเลิก
                              </button>
                            </div>
                            <div class="subtask-form-bar-right">
                              <button class="subtask-form-icon-btn" @click="showEditSubtaskAssignDialog = true">
                                <q-icon name="person_add" size="16px" />
                                <q-tooltip>มอบหมาย</q-tooltip>
                              </button>
                              <button class="subtask-form-icon-btn" @click="showEditSubtaskDatePicker = true">
                                <q-icon name="event" size="16px" />
                                <q-tooltip>วันครบกำหนด</q-tooltip>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Inline Subtask Creation Form -->
                    <div v-if="showInlineSubtaskForm" class="subtask-inline-form">
                      <q-input
                        v-model="newSubtask.title"
                        placeholder="ชื่อรายการ"
                        outlined dense dark
                        class="subtask-form-input"
                        @keyup.enter="handleCreateSubtask"
                        @keyup.esc="showInlineSubtaskForm = false"
                        autofocus
                      />
                      <div class="subtask-form-bar">
                        <div class="subtask-form-bar-left">
                          <button class="subtask-btn-save" @click="handleCreateSubtask">
                            <q-icon name="add" size="14px" />
                            เพิ่ม
                          </button>
                          <button class="subtask-btn-cancel" @click="cancelInlineSubtask">
                            ยกเลิก
                          </button>
                        </div>
                        <div class="subtask-form-bar-right">
                          <button class="subtask-form-icon-btn" @click="showSubtaskAssignDialog = true">
                            <q-icon name="person_add" size="16px" />
                            <q-tooltip>มอบหมาย</q-tooltip>
                          </button>
                          <button class="subtask-form-icon-btn" @click="showSubtaskDatePicker = true">
                            <q-icon name="event" size="16px" />
                            <q-tooltip>วันครบกำหนด</q-tooltip>
                          </button>
                        </div>
                      </div>
                    </div>

                    <!-- Add Subtask Button -->
                    <button v-else class="add-subtask-btn" @click="startCreateSubtask">
                      <q-icon name="add_circle_outline" size="18px" />
                      <span>เพิ่ม Subtask</span>
                    </button>
                  </div>

                <!-- Attachments Section -->
                <div class="q-mt-lg subtasks-section-redesign">
                  <div class="subtask-section-header">
                    <div class="subtask-section-title">
                      <q-icon name="attach_file" size="18px" style="color: #ffa726;" />
                      <span>ไฟล์แนบ</span>
                    </div>
                    <span v-if="taskAttachments.length > 0" class="subtask-counter" style="background: rgba(255,167,38,0.1); color: #ffa726;">
                      {{ taskAttachments.length }}
                    </span>
                  </div>

                  <button class="attachment-upload-redesign" @click="$refs.taskDetailFileInput.click()">
                    <q-icon name="cloud_upload" size="18px" />
                    <span>อัปโหลดไฟล์</span>
                    <span class="attachment-hint">สูงสุด 100MB</span>
                  </button>
                  <input ref="taskDetailFileInput" type="file" multiple hidden
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.7z,.mp4,.mp3"
                    @change="handleTaskDetailFileSelect" />

                  <!-- Uploading Progress -->
                  <div v-for="(item, idx) in uploadingFiles" :key="'upload-' + idx" class="attachment-uploading">
                    <q-icon name="cloud_upload" size="20px" style="color: #5c9ce6;" />
                    <div class="attachment-info" style="flex: 1;">
                      <div class="attachment-name">{{ item.value?.name || item.name }}</div>
                      <q-linear-progress :value="(item.value?.progress || item.progress || 0) / 100"
                        color="blue-5" track-color="grey-9" size="4px" rounded class="q-mt-xs" />
                    </div>
                  </div>

                  <!-- Attachments List -->
                  <div v-if="taskAttachments.length > 0" class="attachment-list">
                    <div v-for="att in taskAttachments" :key="att.id" class="attachment-item">
                      <div v-if="isImageFile(att.fileType)" class="attachment-preview">
                        <img :src="att.downloadURL" :alt="att.fileName" @click="openLink(att.downloadURL)" />
                      </div>
                      <q-icon v-else :name="getFileIcon(att.fileType)" size="28px" :style="{ color: getFileIconColor(att.fileType) }" />
                      <div class="attachment-info">
                        <div class="attachment-name">
                          <a :href="att.downloadURL" target="_blank" class="attachment-link">{{ att.fileName }}</a>
                        </div>
                        <div class="attachment-meta">
                          <span class="attachment-size">{{ formatFileSize(att.fileSize) }}</span>
                          <span class="attachment-uploader">โดย {{ att.uploadedByName || att.uploadedBy }}</span>
                        </div>
                      </div>
                      <div class="attachment-actions">
                        <q-btn flat round icon="download" size="xs" color="grey-5" @click="openLink(att.downloadURL)"><q-tooltip>ดาวน์โหลด</q-tooltip></q-btn>
                        <q-btn flat round icon="delete_outline" size="xs" color="grey-5" @click="deleteAttachment(att)"><q-tooltip>ลบ</q-tooltip></q-btn>
                      </div>
                    </div>
                  </div>

                  <div v-else-if="uploadingFiles.length === 0" class="no-attachments">
                    <q-icon name="cloud_off" size="28px" style="color: #374151;" />
                    <div style="color: #5a5b5e; font-size: 0.72rem;">ยังไม่มีไฟล์แนบ</div>
                  </div>
                </div>
            </div>

            <!-- Right Column: Comments & Activity -->
            <div class="detail-right">
              <div class="detail-right-inner">
                <div class="detail-right-header">
                  <q-icon name="forum" size="18px" style="color: #5c9ce6;" />
                  <span>ความคิดเห็นและกิจกรรม</span>
                </div>

                <!-- Comment Input with Mention -->
                <div class="comment-input-redesign" style="position: relative;">
                  <div
                    ref="commentInputRef"
                    class="mention-input"
                    contenteditable="true"
                    :data-placeholder="'เขียนความคิดเห็น... พิมพ์ @ เพื่อ tag'"
                    @input="onCommentInput"
                    @keydown="onCommentKeydown"
                    @blur="onCommentBlur"
                  ></div>

                  <!-- Mention Dropdown -->
                  <div v-if="showMentionDropdown && filteredMentionMembers.length > 0" class="mention-dropdown" :style="{ top: mentionDropdownPos.top + 'px', left: mentionDropdownPos.left + 'px' }">
                    <div class="mention-dropdown-header">
                      <q-icon name="alternate_email" size="14px" />
                      <span>สมาชิก</span>
                    </div>
                    <div class="mention-dropdown-list">
                      <div v-for="member in filteredMentionMembers" :key="member.email"
                        class="mention-dropdown-item"
                        @mousedown.prevent="insertMention(member)">
                        <div class="mention-item-avatar">
                          <img v-if="member.photoURL" :src="member.photoURL" class="mention-avatar-img" />
                          <span v-else>{{ member.avatar }}</span>
                        </div>
                        <div class="mention-item-info">
                          <span class="mention-item-name">{{ member.name }}</span>
                          <span class="mention-item-email">{{ member.email }}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="comment-input-footer">
                    <span class="mention-hint">
                      <q-icon name="alternate_email" size="12px" /> พิมพ์ @ เพื่อแท็ก
                    </span>
                    <button class="dialog-btn-primary dialog-btn-sm" :disabled="!commentHasContent" @click="addComment">
                      <q-icon name="send" size="14px" /> ส่ง
                    </button>
                  </div>
                </div>

                <!-- Comments & Activity List -->
                <div class="comments-feed">
                  <template v-for="item in taskComments" :key="item.id">
                    <!-- Activity Item -->
                    <div v-if="item.type === 'activity'" class="activity-item">
                      <div class="activity-icon-wrapper" :class="getActivityIconClass(item.activityType)">
                        <q-icon :name="getActivityIcon(item.activityType)" size="18px" class="activity-icon" />
                      </div>
                      <div class="activity-content">
                        <div class="activity-header">
                          <span class="activity-user">{{ item.userName || item.userEmail?.split('@')[0] }}</span>
                          <span class="activity-time">{{ formatDateTime(item.createdAt) }}</span>
                        </div>
                        <div class="activity-text">
                          <span>{{ item.text }}</span>
                          <div v-if="item.fromStatus && item.toStatus" class="activity-badges">
                            <q-badge :label="getColumnName(item.fromStatus)" class="activity-badge-from" />
                            <q-icon name="arrow_forward" size="14px" style="color: #6b7280;" />
                            <q-badge :label="getColumnName(item.toStatus)" class="activity-badge-to" />
                          </div>
                          <div v-else-if="item.toStatus && !item.fromStatus" class="activity-badges">
                            <q-badge :label="getColumnName(item.toStatus)" class="activity-badge-to" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Comment Item -->
                    <div v-else class="comment-item">
                      <div class="comment-avatar">
                        <img v-if="authStore.getPhotoURL(item.userEmail)" :src="authStore.getPhotoURL(item.userEmail)" class="comment-avatar-img" />
                        <span v-else>{{ item.userEmail?.charAt(0).toUpperCase() || 'U' }}</span>
                      </div>
                      <div class="comment-content">
                        <div class="comment-header">
                          <span class="comment-author">{{ item.userName || item.userEmail?.split('@')[0] }}</span>
                          <span class="comment-time">{{ formatDateTime(item.createdAt) }}</span>
                        </div>
                        <div class="comment-text" v-html="linkifyText(item.text)"></div>
                      </div>
                    </div>
                  </template>

                  <div v-if="taskComments.length === 0" class="no-comments">
                    <q-icon name="chat_bubble_outline" size="40px" style="color: #2a2b2e;" />
                    <div style="color: #5a5b5e; font-size: 0.75rem; margin-top: 6px;">ยังไม่มีความคิดเห็น</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </q-dialog>

      <!-- Date Picker Dialog -->
      <q-dialog v-model="showDatePicker">
        <div class="datepicker-dialog-redesign">
          <div class="datepicker-header">
            <q-icon name="calendar_month" size="20px" />
            <span>เลือกวันที่ครบกำหนด</span>
          </div>
          <div class="datepicker-body">
            <q-date v-model="editingTask.dueDate" dark minimal flat class="datepicker-calendar" />
          </div>
          <div class="datepicker-footer">
            <div class="datepicker-selected" v-if="editingTask.dueDate">
              <q-icon name="event_available" size="14px" />
              {{ formatDate(editingTask.dueDate) }}
            </div>
            <div class="datepicker-selected datepicker-no-date" v-else>ยังไม่ได้เลือก</div>
            <div class="datepicker-btns">
              <button class="datepicker-btn-clear" v-if="editingTask.dueDate" @click="editingTask.dueDate = null">ล้าง</button>
              <button class="datepicker-btn-cancel" @click="showDatePicker = false">ยกเลิก</button>
              <button class="datepicker-btn-confirm" @click="showDatePicker = false; autoSaveTask()">ตกลง</button>
            </div>
          </div>
        </div>
      </q-dialog>

      <!-- New Task Date Picker Dialog -->
      <q-dialog v-model="showNewTaskDatePicker" persistent>
        <div class="datepicker-dialog-redesign">
          <div class="datepicker-header">
            <q-icon name="calendar_month" size="20px" />
            <span>เลือกวันที่ครบกำหนด</span>
          </div>
          <div class="datepicker-body">
            <q-date v-model="newTask.dueDate" dark minimal flat class="datepicker-calendar" />
          </div>
          <div class="datepicker-footer">
            <div class="datepicker-selected" v-if="newTask.dueDate">
              <q-icon name="event_available" size="14px" />
              {{ formatDate(newTask.dueDate) }}
            </div>
            <div class="datepicker-selected datepicker-no-date" v-else>ยังไม่ได้เลือก</div>
            <div class="datepicker-btns">
              <button class="datepicker-btn-clear" v-if="newTask.dueDate" @click="newTask.dueDate = null">ล้าง</button>
              <button class="datepicker-btn-cancel" @click="showNewTaskDatePicker = false">ยกเลิก</button>
              <button class="datepicker-btn-confirm" @click="showNewTaskDatePicker = false">ตกลง</button>
            </div>
          </div>
        </div>
      </q-dialog>

      <!-- Create New Task Subtask Dialog -->
      <q-dialog v-model="showCreateNewTaskSubtaskDialog">
        <q-card class="create-subtask-card">
          <q-card-section class="card-header">
            <div class="text-h6 text-white">เพิ่ม Subtask</div>
          </q-card-section>

          <q-card-section class="card-body">
            <q-form @submit="addNewTaskSubtask" class="q-gutter-md">
              <div class="input-group">
                <label class="input-label">ชื่อ Subtask</label>
                <q-input dense hide-bottom-space="" v-model="newTaskSubtask.title" outlined
                  :rules="[val => !!val || 'กรุณากรอกชื่อ Subtask']" class="custom-input"
                  placeholder="กรุณากรอกชื่อ Subtask" />
              </div>

              <div class="input-group">
                <label class="input-label">คำอธิบาย</label>
                <q-input v-model="newTaskSubtask.description" outlined type="textarea" rows="3" class="custom-input"
                  placeholder="กรุณากรอกคำอธิบาย" />
              </div>

              <div class="input-group">
                <label class="input-label">วันที่ครบกำหนด</label>
                <q-btn :label="newTaskSubtask.dueDate ? formatDate(newTaskSubtask.dueDate) : 'กำหนดวันที่'" icon="event"
                  @click="showNewTaskSubtaskDatePicker = true" class="due-date-btn text-black"
                  :class="{ 'has-date': newTaskSubtask.dueDate }" />
              </div>

              <div class="input-group">
                <label class="input-label">มอบหมายให้</label>
                <div class="members-selection">
                  <div v-for="member in projectMembers" :key="member.email" class="member-option">
                    <q-checkbox v-model="newTaskSubtask.assignedTo" :val="member.email" />
                    <q-avatar color="primary" text-color="white" size="sm">
                      <img v-if="member.photoURL" :src="member.photoURL" style="width:100%;height:100%;object-fit:cover;" />
                      <span v-else>{{ member.avatar }}</span>
                    </q-avatar>
                    <span class="member-name">{{ member.name }}</span>
                  </div>
                </div>
              </div>

              <div class="row justify-end q-gutter-sm">
                <q-btn flat label="ยกเลิก" @click="showCreateNewTaskSubtaskDialog = false" class="cancel-btn" />
                <q-btn type="submit" label="เพิ่ม" class="create-btn" />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </q-dialog>

      <!-- Edit New Task Subtask Dialog -->
      <q-dialog v-model="showEditNewTaskSubtaskDialog">
        <q-card class="create-subtask-card">
          <q-card-section class="card-header">
            <div class="text-h6 text-white">แก้ไข Subtask</div>
          </q-card-section>

          <q-card-section class="card-body">
            <q-form @submit="updateNewTaskSubtask" class="q-gutter-md">
              <div class="input-group">
                <label class="input-label">ชื่อ Subtask</label>
                <q-input dense hide-bottom-space="" v-model="editingNewTaskSubtask.title" outlined
                  :rules="[val => !!val || 'กรุณากรอกชื่อ Subtask']" class="custom-input"
                  placeholder="กรุณากรอกชื่อ Subtask" />
              </div>

              <div class="input-group">
                <label class="input-label">คำอธิบาย</label>
                <q-input v-model="editingNewTaskSubtask.description" outlined type="textarea" rows="3"
                  class="custom-input" placeholder="กรุณากรอกคำอธิบาย" />
              </div>

              <div class="input-group">
                <label class="input-label">วันที่ครบกำหนด</label>
                <q-btn
                  :label="editingNewTaskSubtask.dueDate ? formatDate(editingNewTaskSubtask.dueDate) : 'กำหนดวันที่'"
                  icon="event" @click="showEditNewTaskSubtaskDatePicker = true" class="due-date-btn text-black"
                  :class="{ 'has-date': editingNewTaskSubtask.dueDate }" />
              </div>

              <div class="input-group">
                <label class="input-label">มอบหมายให้</label>
                <div class="members-selection">
                  <div v-for="member in projectMembers" :key="member.email" class="member-option">
                    <q-checkbox v-model="editingNewTaskSubtask.assignedTo" :val="member.email" />
                    <q-avatar color="primary" text-color="white" size="sm">
                      <img v-if="member.photoURL" :src="member.photoURL" style="width:100%;height:100%;object-fit:cover;" />
                      <span v-else>{{ member.avatar }}</span>
                    </q-avatar>
                    <span class="member-name">{{ member.name }}</span>
                  </div>
                </div>
              </div>

              <div class="row justify-end q-gutter-sm">
                <q-btn flat label="ยกเลิก" @click="showEditNewTaskSubtaskDialog = false" class="cancel-btn" />
                <q-btn type="submit" label="บันทึก" class="create-btn" />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </q-dialog>

      <!-- New Task Subtask Date Picker Dialog -->
      <q-dialog v-model="showNewTaskSubtaskDatePicker" persistent>
        <div class="datepicker-dialog-redesign">
          <div class="datepicker-header">
            <q-icon name="calendar_month" size="20px" />
            <span>กำหนดวันที่ Subtask</span>
          </div>
          <div class="datepicker-body">
            <q-date v-model="newTaskSubtask.dueDate" dark minimal flat class="datepicker-calendar" />
          </div>
          <div class="datepicker-footer">
            <div class="datepicker-selected" v-if="newTaskSubtask.dueDate">
              <q-icon name="event_available" size="14px" />
              {{ formatDate(newTaskSubtask.dueDate) }}
            </div>
            <div class="datepicker-selected datepicker-no-date" v-else>ยังไม่ได้เลือก</div>
            <div class="datepicker-btns">
              <button class="datepicker-btn-clear" v-if="newTaskSubtask.dueDate" @click="newTaskSubtask.dueDate = null">ล้าง</button>
              <button class="datepicker-btn-cancel" @click="showNewTaskSubtaskDatePicker = false">ยกเลิก</button>
              <button class="datepicker-btn-confirm" @click="showNewTaskSubtaskDatePicker = false">ตกลง</button>
            </div>
          </div>
        </div>
      </q-dialog>

      <!-- Edit New Task Subtask Date Picker Dialog -->
      <q-dialog v-model="showEditNewTaskSubtaskDatePicker" persistent>
        <div class="datepicker-dialog-redesign">
          <div class="datepicker-header">
            <q-icon name="calendar_month" size="20px" />
            <span>กำหนดวันที่ Subtask</span>
          </div>
          <div class="datepicker-body">
            <q-date v-model="editingNewTaskSubtask.dueDate" dark minimal flat class="datepicker-calendar" />
          </div>
          <div class="datepicker-footer">
            <div class="datepicker-selected" v-if="editingNewTaskSubtask.dueDate">
              <q-icon name="event_available" size="14px" />
              {{ formatDate(editingNewTaskSubtask.dueDate) }}
            </div>
            <div class="datepicker-selected datepicker-no-date" v-else>ยังไม่ได้เลือก</div>
            <div class="datepicker-btns">
              <button class="datepicker-btn-clear" v-if="editingNewTaskSubtask.dueDate" @click="editingNewTaskSubtask.dueDate = null">ล้าง</button>
              <button class="datepicker-btn-cancel" @click="showEditNewTaskSubtaskDatePicker = false">ยกเลิก</button>
              <button class="datepicker-btn-confirm" @click="showEditNewTaskSubtaskDatePicker = false">ตกลง</button>
            </div>
          </div>
        </div>
      </q-dialog>

      <!-- Create Subtask Dialog -->
      <q-dialog v-model="showCreateSubtaskDialog">
        <q-card class="create-subtask-card">
          <q-card-section class="card-header">
            <div class="text-h6 text-white">สร้าง Subtask ใหม่</div>
          </q-card-section>

          <q-card-section class="card-body">
            <q-form @submit="handleCreateSubtask" class="q-gutter-md">
              <div class="input-group">
                <label class="input-label">ชื่อ Subtask</label>
                <q-input v-model="newSubtask.title" outlined :rules="[val => !!val || 'กรุณากรอกชื่อ Subtask']"
                  class="custom-input" placeholder="กรุณากรอกชื่อ Subtask" />
              </div>

              <div class="input-group">
                <label class="input-label">คำอธิบาย</label>
                <q-input v-model="newSubtask.description" outlined type="textarea" rows="2" class="custom-input"
                  placeholder="กรุณากรอกคำอธิบาย" />
              </div>

              <div class="input-group">
                <label class="input-label">วันที่ครบกำหนด</label>
                <q-input v-model="newSubtask.dueDate" type="date" outlined class="custom-input" />
              </div>

              <div class="input-group">
                <label class="input-label">มอบหมายให้</label>
                <div class="member-selection">
                  <div v-for="member in projectMembers" :key="member.email" class="member-card"
                    :class="{ 'selected': newSubtask.assignedTo.includes(member.email) }"
                    @click="toggleMemberSelection(member.email)">
                    <q-avatar color="secondary" text-color="white" size="sm">
                      <img v-if="member.photoURL" :src="member.photoURL" style="width:100%;height:100%;object-fit:cover;" />
                      <span v-else>{{ member.avatar }}</span>
                    </q-avatar>
                    <div class="member-info">
                      <div class="member-name">{{ member.name }}</div>
                      <div class="member-email">{{ member.email }}</div>
                    </div>
                    <q-icon v-if="newSubtask.assignedTo.includes(member.email)" name="check_circle" color="primary"
                      size="sm" />
                  </div>
                </div>
              </div>

              <div class="row justify-end q-gutter-sm">
                <q-btn flat label="ยกเลิก" @click="showCreateSubtaskDialog = false" class="cancel-btn" />
                <q-btn type="submit" label="สร้าง" :loading="tasksStore.loading" class="create-btn" />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </q-dialog>

      <!-- Edit Subtask Dialog -->
      <q-dialog v-model="showEditSubtaskDialog">
        <q-card class="create-subtask-card">
          <q-card-section class="card-header">
            <div class="text-h6 text-white">แก้ไข Subtask</div>
          </q-card-section>

          <q-card-section class="card-body">
            <q-form @submit="handleUpdateSubtask" class="q-gutter-md">
              <div class="input-group">
                <label class="input-label">ชื่อ Subtask</label>
                <q-input v-model="editingSubtask.title" outlined :rules="[val => !!val || 'กรุณากรอกชื่อ Subtask']"
                  class="custom-input" placeholder="กรุณากรอกชื่อ Subtask" />
              </div>

              <div class="input-group">
                <label class="input-label">คำอธิบาย</label>
                <q-input v-model="editingSubtask.description" outlined type="textarea" rows="2" class="custom-input"
                  placeholder="กรุณากรอกคำอธิบาย" />
              </div>

              <div class="input-group">
                <label class="input-label">วันที่ครบกำหนด</label>
                <q-input v-model="editingSubtask.dueDate" type="date" outlined class="custom-input" />
              </div>

              <div class="input-group">
                <label class="input-label">มอบหมายให้</label>
                <div class="member-selection">
                  <div v-for="member in projectMembers" :key="member.email" class="member-card"
                    :class="{ 'selected': editingSubtask.assignedTo.includes(member.email) }"
                    @click="toggleEditMemberSelection(member.email)">
                    <q-avatar color="secondary" text-color="white" size="sm">
                      <img v-if="member.photoURL" :src="member.photoURL" style="width:100%;height:100%;object-fit:cover;" />
                      <span v-else>{{ member.avatar }}</span>
                    </q-avatar>
                    <div class="member-info">
                      <div class="member-name">{{ member.name }}</div>
                      <div class="member-email">{{ member.email }}</div>
                    </div>
                    <q-icon v-if="editingSubtask.assignedTo.includes(member.email)" name="check_circle" color="primary"
                      size="sm" />
                  </div>
                </div>
              </div>

              <div class="row justify-end q-gutter-sm">
                <q-btn flat label="ยกเลิก" @click="showEditSubtaskDialog = false" class="cancel-btn" />
                <q-btn type="submit" label="บันทึก" :loading="tasksStore.loading" class="create-btn" />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </q-dialog>

      <!-- Inline Subtask Date Picker Dialog -->
      <q-dialog v-model="showSubtaskDatePicker" persistent>
        <div class="datepicker-dialog-redesign">
          <div class="datepicker-header">
            <q-icon name="calendar_month" size="20px" />
            <span>กำหนดวันที่ Subtask</span>
          </div>
          <div class="datepicker-body">
            <q-date v-model="newSubtask.dueDate" dark minimal flat class="datepicker-calendar" />
          </div>
          <div class="datepicker-footer">
            <div class="datepicker-selected" v-if="newSubtask.dueDate">
              <q-icon name="event_available" size="14px" />
              {{ formatDate(newSubtask.dueDate) }}
            </div>
            <div class="datepicker-selected datepicker-no-date" v-else>ยังไม่ได้เลือก</div>
            <div class="datepicker-btns">
              <button class="datepicker-btn-clear" v-if="newSubtask.dueDate" @click="newSubtask.dueDate = null">ล้าง</button>
              <button class="datepicker-btn-cancel" @click="showSubtaskDatePicker = false">ยกเลิก</button>
              <button class="datepicker-btn-confirm" @click="showSubtaskDatePicker = false">ตกลง</button>
            </div>
          </div>
        </div>
      </q-dialog>

      <!-- Inline Subtask Assign Dialog -->
      <q-dialog v-model="showSubtaskAssignDialog">
        <div class="assign-dialog-redesign">
          <div class="assign-dialog-header">
            <q-icon name="person_add" size="20px" />
            <span>มอบหมายงาน</span>
          </div>
          <div class="assign-dialog-body">
            <div class="assign-member-list">
              <div v-for="member in projectMembers" :key="member.email"
                class="assign-member-row" :class="{ 'assign-member-selected': newSubtask.assignedTo.includes(member.email) }"
                @click="toggleSubtaskAssignee(member.email)">
                <div class="assign-avatar" :class="{ 'assign-avatar-active': newSubtask.assignedTo.includes(member.email) }">
                  <img v-if="member.photoURL" :src="member.photoURL" class="assign-avatar-img" />
                  <span v-else>{{ member.avatar }}</span>
                </div>
                <div class="assign-member-info">
                  <div class="assign-member-name">{{ member.name }}</div>
                  <div class="assign-member-email">{{ member.email }}</div>
                </div>
                <div class="assign-check" v-if="newSubtask.assignedTo.includes(member.email)">
                  <q-icon name="check" size="14px" />
                </div>
              </div>
            </div>
          </div>
          <div class="assign-dialog-footer">
            <button class="assign-close-btn" @click="showSubtaskAssignDialog = false">เสร็จสิ้น</button>
          </div>
        </div>
      </q-dialog>

      <!-- Edit Subtask Date Picker Dialog -->
      <q-dialog v-model="showEditSubtaskDatePicker" persistent>
        <div class="datepicker-dialog-redesign">
          <div class="datepicker-header">
            <q-icon name="calendar_month" size="20px" />
            <span>กำหนดวันที่ Subtask</span>
          </div>
          <div class="datepicker-body">
            <q-date v-model="editingSubtask.dueDate" dark minimal flat class="datepicker-calendar" />
          </div>
          <div class="datepicker-footer">
            <div class="datepicker-selected" v-if="editingSubtask.dueDate">
              <q-icon name="event_available" size="14px" />
              {{ formatDate(editingSubtask.dueDate) }}
            </div>
            <div class="datepicker-selected datepicker-no-date" v-else>ยังไม่ได้เลือก</div>
            <div class="datepicker-btns">
              <button class="datepicker-btn-clear" v-if="editingSubtask.dueDate" @click="editingSubtask.dueDate = null">ล้าง</button>
              <button class="datepicker-btn-cancel" @click="showEditSubtaskDatePicker = false">ยกเลิก</button>
              <button class="datepicker-btn-confirm" @click="showEditSubtaskDatePicker = false">ตกลง</button>
            </div>
          </div>
        </div>
      </q-dialog>

      <!-- Edit Subtask Assign Dialog -->
      <q-dialog v-model="showEditSubtaskAssignDialog">
        <div class="assign-dialog-redesign">
          <div class="assign-dialog-header">
            <q-icon name="person_add" size="20px" />
            <span>มอบหมายงาน</span>
          </div>
          <div class="assign-dialog-body">
            <div class="assign-member-list">
              <div v-for="member in projectMembers" :key="member.email"
                class="assign-member-row" :class="{ 'assign-member-selected': editingSubtask.assignedTo.includes(member.email) }"
                @click="toggleEditSubtaskAssignee(member.email)">
                <div class="assign-avatar" :class="{ 'assign-avatar-active': editingSubtask.assignedTo.includes(member.email) }">
                  <img v-if="member.photoURL" :src="member.photoURL" class="assign-avatar-img" />
                  <span v-else>{{ member.avatar }}</span>
                </div>
                <div class="assign-member-info">
                  <div class="assign-member-name">{{ member.name }}</div>
                  <div class="assign-member-email">{{ member.email }}</div>
                </div>
                <div class="assign-check" v-if="editingSubtask.assignedTo.includes(member.email)">
                  <q-icon name="check" size="14px" />
                </div>
              </div>
            </div>
          </div>
          <div class="assign-dialog-footer">
            <button class="assign-close-btn" @click="showEditSubtaskAssignDialog = false">เสร็จสิ้น</button>
          </div>
        </div>
      </q-dialog>

      <!-- New Task Inline Subtask Date Picker Dialog -->
      <q-dialog v-model="showNewTaskSubtaskDatePickerInline" persistent>
        <div class="datepicker-dialog-redesign">
          <div class="datepicker-header">
            <q-icon name="calendar_month" size="20px" />
            <span>กำหนดวันที่ Subtask</span>
          </div>
          <div class="datepicker-body">
            <q-date v-model="newTaskSubtask.dueDate" dark minimal flat class="datepicker-calendar" />
          </div>
          <div class="datepicker-footer">
            <div class="datepicker-selected" v-if="newTaskSubtask.dueDate">
              <q-icon name="event_available" size="14px" />
              {{ formatDate(newTaskSubtask.dueDate) }}
            </div>
            <div class="datepicker-selected datepicker-no-date" v-else>ยังไม่ได้เลือก</div>
            <div class="datepicker-btns">
              <button class="datepicker-btn-clear" v-if="newTaskSubtask.dueDate" @click="newTaskSubtask.dueDate = null">ล้าง</button>
              <button class="datepicker-btn-cancel" @click="showNewTaskSubtaskDatePickerInline = false">ยกเลิก</button>
              <button class="datepicker-btn-confirm" @click="showNewTaskSubtaskDatePickerInline = false">ตกลง</button>
            </div>
          </div>
        </div>
      </q-dialog>

      <!-- New Task Inline Subtask Assign Dialog -->
      <q-dialog v-model="showNewTaskSubtaskAssignDialogInline">
        <div class="assign-dialog-redesign">
          <div class="assign-dialog-header">
            <q-icon name="person_add" size="20px" />
            <span>มอบหมายงาน</span>
          </div>
          <div class="assign-dialog-body">
            <div class="assign-member-list">
              <div v-for="member in projectMembers" :key="member.email"
                class="assign-member-row" :class="{ 'assign-member-selected': newTaskSubtask.assignedTo.includes(member.email) }"
                @click="toggleNewTaskSubtaskAssignee(member.email)">
                <div class="assign-avatar" :class="{ 'assign-avatar-active': newTaskSubtask.assignedTo.includes(member.email) }">
                  <img v-if="member.photoURL" :src="member.photoURL" class="assign-avatar-img" />
                  <span v-else>{{ member.avatar }}</span>
                </div>
                <div class="assign-member-info">
                  <div class="assign-member-name">{{ member.name }}</div>
                  <div class="assign-member-email">{{ member.email }}</div>
                </div>
                <div class="assign-check" v-if="newTaskSubtask.assignedTo.includes(member.email)">
                  <q-icon name="check" size="14px" />
                </div>
              </div>
            </div>
          </div>
          <div class="assign-dialog-footer">
            <button class="assign-close-btn" @click="showNewTaskSubtaskAssignDialogInline = false">เสร็จสิ้น</button>
          </div>
        </div>
      </q-dialog>

      <!-- Create/Edit Column Dialog -->
      <q-dialog v-model="showCreateColumnDialog">
        <q-card class="create-column-card">
          <q-card-section class="row items-center q-pb-sm">
            <q-icon name="view_week" size="22px" style="color: #5c9ce6;" class="q-mr-sm" />
            <div class="column-dialog-title">{{ editingColumn ? 'แก้ไขคอลัมน์' : 'สร้างคอลัมน์ใหม่' }}</div>
            <q-space />
            <q-btn icon="close" flat round dense style="color: #6b6c6f;"
              @click="cancelCreateColumn" />
          </q-card-section>

          <q-separator style="background: rgba(44, 58, 69, 0.4);" />

          <q-card-section class="q-pt-lg">
            <div class="q-gutter-md">
              <div>
                <label class="column-field-label">ชื่อคอลัมน์</label>
                <q-input v-model="newColumn.name" outlined dense dark
                  placeholder="กรุณากรอกชื่อคอลัมน์" class="column-dialog-input" />
              </div>

              <div>
                <label class="column-field-label">สีคอลัมน์</label>
                <div class="column-color-picker">
                  <div v-for="color in columnColors" :key="color"
                    class="column-color-dot"
                    :class="{ 'column-color-selected': newColumn.color === color }"
                    :style="{ backgroundColor: color }"
                    @click="newColumn.color = color">
                    <q-icon v-if="newColumn.color === color" name="check" size="14px"
                      style="color: #fff; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.5));" />
                  </div>
                </div>
              </div>

              <!-- Preview -->
              <div v-if="newColumn.name" class="column-preview">
                <div class="column-preview-bar" :style="{ background: newColumn.color }"></div>
                <span class="column-preview-name">{{ newColumn.name }}</span>
              </div>

              <div class="row justify-end q-gutter-sm q-mt-md">
                <q-btn flat label="ยกเลิก" class="column-cancel-btn"
                  @click="cancelCreateColumn" />
                <q-btn :label="editingColumn ? 'บันทึก' : 'สร้าง'" class="column-create-btn"
                  :disable="!newColumn.name?.trim()"
                  @click="handleCreateColumn" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'stores/auth'
import { useProjectsStore } from 'stores/projects'
import { useTasksStore } from 'stores/tasks'
import { useNotificationsStore } from 'stores/notifications'
import { useWorklogStore } from 'stores/worklog'
import CalendarView from 'components/CalendarView.vue'
import GanttChart from 'components/GanttChart.vue'
import TaskCard from 'components/TaskCard.vue'
import { updateDoc, doc } from 'firebase/firestore'
import { db } from 'boot/firebase'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const authStore = useAuthStore()
const projectsStore = useProjectsStore()
const tasksStore = useTasksStore()
const notificationsStore = useNotificationsStore()
const worklogStore = useWorklogStore()
console.log('tasksStore instance:', tasksStore)
console.log('tasksStore.taskStatuses:', tasksStore.taskStatuses)

const isPageLoading = ref(true)
const viewMode = ref('kanban')
const showCreateTaskDialog = ref(false)
const isCreatingTask = ref(false)
const showTaskDetailDialog = ref(false)
const showCreateSubtaskDialog = ref(false)
const showEditSubtaskDialog = ref(false)
const showCreateColumnDialog = ref(false)
const showDatePicker = ref(false)
const showNewTaskDatePicker = ref(false)
const showInlineSubtaskForm = ref(false)
const showSubtaskDatePicker = ref(false)
const showSubtaskAssignDialog = ref(false)
const editingSubtaskId = ref(null)
const showEditSubtaskDatePicker = ref(false)
const showEditSubtaskAssignDialog = ref(false)
const showNewTaskInlineSubtaskForm = ref(false)
const editingNewTaskSubtaskIndex = ref(null)
const showNewTaskSubtaskDatePickerInline = ref(false)
const showNewTaskSubtaskAssignDialogInline = ref(false)
const showCreateNewTaskSubtaskDialog = ref(false)
const showEditNewTaskSubtaskDialog = ref(false)
const showNewTaskSubtaskDatePicker = ref(false)
const showEditNewTaskSubtaskDatePicker = ref(false)
const selectedTask = ref(null)
const subtasks = ref([])
let subtasksUnsubscribe = null
let projectSubtasksUnsubscribe = null
const editingColumn = ref(null)
const editingTask = ref({
  title: '',
  description: '',
  status: '',
  priority: 'medium',
  dueDate: null,
  assignedTo: []
})

// Mobile detection
const isMobile = computed(() => $q.platform.is.mobile || $q.screen.lt.sm)

// Drag and drop state
const draggedTask = ref(null)
const isDragging = ref(false)
const draggedOverTask = ref(null)
const dragOverIndex = ref(-1)
const tempTasks = ref([])

// Column drag and drop state
const draggedColumn = ref(null)
const isDraggingColumn = ref(false)
const draggedOverColumn = ref(null)
const dragOverColumnIndex = ref(-1)

const newTask = ref({
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  dueDate: null,
  assignedTo: []
})

const newSubtask = ref({
  title: '',
  description: '',
  dueDate: null,
  assignedTo: []
})

const editingSubtask = ref({
  id: null,
  title: '',
  description: '',
  dueDate: null,
  assignedTo: []
})

const newTaskSubtasks = ref([])

const newTaskSubtask = ref({
  title: '',
  description: '',
  dueDate: null,
  assignedTo: []
})

const editingNewTaskSubtask = ref({
  index: null,
  title: '',
  description: '',
  dueDate: null,
  assignedTo: []
})

const newColumn = ref({
  name: '',
  color: '#9E9E9E'
})

// Attachment state
const newTaskAttachments = ref([]) // For create task dialog (pending files)
const taskAttachments = ref([]) // For task detail dialog (uploaded)
const uploadingFiles = ref([]) // Currently uploading files with progress
let attachmentsUnsubscribe = null

const columnColors = [
  '#9E9E9E', '#cecfd2', '#FFD54F', '#cecfd2', '#FF7043',
  '#AB47BC', '#42A5F5', '#66BB6A', '#EF5350', '#FFA726'
]

// Helper to get column name from status id
const getColumnName = (statusId) => {
  const column = sortedColumns.value.find(col => col.id === statusId)
  return column?.name || statusId
}

// Helper to get activity icon based on type
const getActivityIcon = (activityType) => {
  const icons = {
    task_created: 'add_circle',
    status_change: 'swap_horiz',
    task_deleted: 'delete',
    task_restored: 'restore'
  }
  return icons[activityType] || 'info'
}

// Helper to get activity icon wrapper class based on type
const getActivityIconClass = (activityType) => {
  const classes = {
    task_created: 'activity-icon-created',
    status_change: 'activity-icon-moved',
    task_deleted: 'activity-icon-deleted',
    task_restored: 'activity-icon-restored'
  }
  return classes[activityType] || ''
}

// Comments state
const newComment = ref('')
const taskComments = ref([])
let commentsUnsubscribe = null

// Mention state
const commentInputRef = ref(null)
const showMentionDropdown = ref(false)
const mentionQuery = ref('')
const mentionStartIndex = ref(-1)
const mentionDropdownPos = ref({ top: 0, left: 0 })
const filteredMentionMembers = computed(() => {
  if (!mentionQuery.value) return projectMembers.value
  const q = mentionQuery.value.toLowerCase()
  return projectMembers.value.filter(m =>
    m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)
  )
})

const priorityOptions = [
  { label: 'ต่ำ', value: 'low' },
  { label: 'ปานกลาง', value: 'medium' },
  { label: 'สูง', value: 'high' },
  { label: 'เร่งด่วน', value: 'urgent' }
]

// Computed property for sorted columns
const sortedColumns = computed(() => {
  // Try both .value and direct access
  const taskStatusesArray = tasksStore.taskStatuses.value || tasksStore.taskStatuses

  if (!taskStatusesArray || !Array.isArray(taskStatusesArray)) {
    return []
  }
  return [...taskStatusesArray].sort((a, b) => (a.order || 0) - (b.order || 0))
})

// Computed property for project members
const projectMembers = computed(() => {
  return projectsStore.currentProject?.members?.map(email => ({
    uid: email, // For compatibility
    email: email,
    name: email.split('@')[0], // Use email prefix as name
    avatar: email.charAt(0).toUpperCase(),
    photoURL: authStore.getPhotoURL(email)
  })) || []
})

// Computed property for subtask due date analysis (Edit Task)
const subtaskDueDateInfo = computed(() => {
  const subtasks = tasksStore.subtasks || []

  if (subtasks.length === 0) {
    return {
      hasSubtasks: false,
      latestDueDate: null,
      hasConflict: false,
      completedCount: 0,
      totalCount: 0,
      progress: 0
    }
  }

  // Find latest subtask due date
  const subtasksWithDates = subtasks.filter(s => s.dueDate)
  const latestDueDate = subtasksWithDates.length > 0
    ? new Date(Math.max(...subtasksWithDates.map(s => new Date(s.dueDate))))
    : null

  // Check if any subtask due date is after task due date
  const taskDueDate = editingTask.value?.dueDate ? new Date(editingTask.value.dueDate) : null
  const hasConflict = latestDueDate && taskDueDate && latestDueDate > taskDueDate

  // Calculate progress
  const completedCount = subtasks.filter(s => s.completed).length
  const totalCount = subtasks.length
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return {
    hasSubtasks: true,
    latestDueDate,
    hasConflict,
    completedCount,
    totalCount,
    progress,
    subtasksWithDates: subtasksWithDates.length
  }
})

// Computed property for new task subtasks due date analysis
const newTaskSubtaskDueDateInfo = computed(() => {
  const subtasks = newTaskSubtasks.value || []

  if (subtasks.length === 0) {
    return {
      hasSubtasks: false,
      latestDueDate: null,
      hasConflict: false,
      totalCount: 0
    }
  }

  // Find latest subtask due date
  const subtasksWithDates = subtasks.filter(s => s.dueDate)
  const latestDueDate = subtasksWithDates.length > 0
    ? new Date(Math.max(...subtasksWithDates.map(s => new Date(s.dueDate))))
    : null

  // Check if any subtask due date is after task due date
  const taskDueDate = newTask.value?.dueDate ? new Date(newTask.value.dueDate) : null
  const hasConflict = latestDueDate && taskDueDate && latestDueDate > taskDueDate

  return {
    hasSubtasks: true,
    latestDueDate,
    hasConflict,
    totalCount: subtasks.length,
    subtasksWithDates: subtasksWithDates.length
  }
})

// Computed property for tasks with live reordering
const tasksWithReordering = computed(() => {
  const result = {}

  // Use sortedColumns instead of taskStatuses
  const taskStatusesArray = sortedColumns.value

  if (!taskStatusesArray || !Array.isArray(taskStatusesArray)) {
    return result
  }

  taskStatusesArray.forEach(status => {
    let tasksInStatus = tasksStore.tasks.filter(task => {
      // Handle both string and object status
      const taskStatus = typeof task.status === 'string' ? task.status : task.status?.id
      return taskStatus === status.id
    })

    // Sort by order first, then by createdAt
    tasksInStatus = tasksInStatus.sort((a, b) => {
      const orderA = a.order || 0
      const orderB = b.order || 0
      if (orderA !== orderB) return orderA - orderB
      return new Date(a.createdAt) - new Date(b.createdAt)
    })

    // If we're dragging within the same status, apply live reordering
    if (isDragging.value && draggedTask.value && draggedTask.value.status === status.id) {
      const draggedTaskId = draggedTask.value.id
      const draggedIndex = tasksInStatus.findIndex(task => task.id === draggedTaskId)

      if (draggedIndex !== -1 && dragOverIndex.value >= 0 && dragOverIndex.value !== draggedIndex) {
        // Remove dragged task from its current position
        const [draggedTaskData] = tasksInStatus.splice(draggedIndex, 1)

        // Insert at new position
        tasksInStatus.splice(dragOverIndex.value, 0, draggedTaskData)
      }
    }

    result[status.id] = tasksInStatus
  })

  return result
})

// Watch for dialog close to cleanup subtasks, comments and attachments subscription
watch(showTaskDetailDialog, (newValue) => {
  if (!newValue) {
    cleanupSubtasks()
    cleanupComments()
    cleanupAttachments()
  }
})

// Keyboard shortcut: Delete key to move task to trash when detail dialog is open
const handleKeydown = (event) => {
  if (event.key === 'Delete' && showTaskDetailDialog.value && selectedTask.value) {
    // Don't trigger if user is typing in an input/textarea
    const tag = event.target.tagName.toLowerCase()
    const isEditable = tag === 'input' || tag === 'textarea' || event.target.isContentEditable
    if (isEditable) return

    event.preventDefault()
    moveTaskToTrash(selectedTask.value)
  }
}

// Load project data (reusable for initial load and project switching)
let tasksUnsubscribe = null

const loadProject = async (projectId) => {
  if (!projectId) {
    router.push('/')
    return
  }

  isPageLoading.value = true

  // Cleanup previous project subscriptions
  if (tasksUnsubscribe) {
    tasksUnsubscribe()
    tasksUnsubscribe = null
  }
  cleanupSubtasks()
  cleanupProjectSubtasks()
  cleanupComments()
  cleanupAttachments()

  // Close any open dialogs
  showTaskDetailDialog.value = false
  showCreateTaskDialog.value = false
  showCreateColumnDialog.value = false

  try {
    // Always fetch projects to ensure we have the latest data
    await projectsStore.fetchProjects()

    // Set current project
    const project = projectsStore.projects.find(p => p.id === projectId)
    if (project) {
      projectsStore.setCurrentProject(project)

      // Fetch columns first, then tasks
      await tasksStore.fetchColumns(projectId)
      await tasksStore.fetchTasks(projectId)
      tasksUnsubscribe = tasksStore.subscribeToTasks(projectId)

      // Subscribe to all project subtasks for real-time updates
      projectSubtasksUnsubscribe = tasksStore.subscribeToProjectSubtasks(projectId)
      await tasksStore.fetchProjectSubtasks(projectId)
    } else {
      console.error('Project not found:', projectId)
      router.push('/')
    }
  } catch (error) {
    console.error('Error loading project:', error)
    router.push('/')
  } finally {
    isPageLoading.value = false

    // If there's a pending task to open (from notification), try now that tasks are loaded
    await nextTick()
    tryOpenPendingTask()
  }
}

// Watch for route param changes (project switching)
watch(() => route.params.id, (newId, oldId) => {
  if (newId && newId !== oldId) {
    loadProject(newId)
  }
})

// Watch for pending task to open (from notification click)
watch(() => notificationsStore.pendingOpenTaskId, (taskId) => {
  if (!taskId) return
  tryOpenPendingTask()
})

const tryOpenPendingTask = () => {
  const taskId = notificationsStore.pendingOpenTaskId
  if (!taskId) return false

  const task = tasksStore.tasks.find(t => t.id === taskId)
  if (task) {
    notificationsStore.pendingOpenTaskId = null
    selectTask(task)
    return true
  }
  return false
}

onMounted(() => {
  // Register keyboard shortcut
  document.addEventListener('keydown', handleKeydown)

  // Initial load
  loadProject(route.params.id)
})

// Cleanup subscriptions and event listeners when component unmounts
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  if (tasksUnsubscribe) {
    tasksUnsubscribe()
    tasksUnsubscribe = null
  }
  cleanupSubtasks()
  cleanupProjectSubtasks()
})

const createTaskInColumn = (statusId) => {
  newTask.value.status = statusId
  showCreateTaskDialog.value = true
}

const handleCreateTask = async () => {
  if (isCreatingTask.value) return
  if (!newTask.value.title?.trim()) {
    $q.notify({ type: 'warning', message: 'กรุณากรอกชื่อ Task', position: 'top' })
    return
  }
  isCreatingTask.value = true

  try {
    // Calculate order for new task
    const tasksInStatus = tasksStore.tasks.filter(task => task.status === newTask.value.status)
    const maxOrder = Math.max(...tasksInStatus.map(task => task.order || 0), -1)
    const newOrder = maxOrder + 1

    const taskData = {
      ...newTask.value,
      order: newOrder
    }

    const taskId = await tasksStore.createTask(taskData)

    // Create subtasks if any
    if (newTaskSubtasks.value.length > 0) {
      const currentProject = projectsStore.currentProject
      const senderName = authStore.user.displayName || authStore.user.email.split('@')[0]
      for (const subtask of newTaskSubtasks.value) {
        await tasksStore.createSubtask({
          ...subtask,
          taskId: taskId
        })
        // Send notifications to subtask assignees
        const subtaskAssignees = subtask.assignedTo || []
        for (const email of subtaskAssignees) {
          if (email === authStore.user.email) continue
          await notificationsStore.createNotification({
            recipientEmail: email,
            type: 'assign',
            title: 'คุณได้รับมอบหมาย Subtask ใหม่',
            message: `${senderName} มอบหมาย Subtask "${subtask.title}" ในงาน "${taskData.title}" ให้คุณ`,
            projectId: currentProject?.id,
            projectName: currentProject?.name,
            taskId: taskId,
            taskTitle: taskData.title
          })
        }
      }
    }

    // Upload pending attachments
    if (newTaskAttachments.value.length > 0) {
      await uploadPendingAttachments(taskId)
    }

    // Log activity: task created
    const createdInColumn = sortedColumns.value.find(col => col.id === taskData.status)
    const columnName = createdInColumn?.name || taskData.status

    try {
      await tasksStore.createActivity({
        taskId: taskId,
        text: `สร้าง Task ในคอลัมน์ "${columnName}"`,
        activityType: 'task_created',
        fromStatus: null,
        toStatus: taskData.status,
        userEmail: authStore.user.email,
        userName: authStore.user.displayName || authStore.user.email.split('@')[0]
      })
    } catch (activityError) {
      console.error('Error logging task creation activity:', activityError)
    }

    // Send notifications to assigned users
    if (taskData.assignedTo && taskData.assignedTo.length > 0) {
      const currentProject = projectsStore.currentProject
      for (const email of taskData.assignedTo) {
        await notificationsStore.createNotification({
          recipientEmail: email,
          type: 'assign',
          title: 'คุณได้รับมอบหมายงานใหม่',
          message: `${authStore.user.displayName || authStore.user.email.split('@')[0]} มอบหมายงาน "${taskData.title}" ให้คุณ`,
          projectId: currentProject?.id,
          projectName: currentProject?.name,
          taskId: taskId,
          taskTitle: taskData.title
        })
      }
    }

    // Reset form and close dialog only after everything is done
    newTask.value = {
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      dueDate: null,
      assignedTo: []
    }
    newTaskSubtasks.value = []
    newTaskAttachments.value = []
    showCreateTaskDialog.value = false

    // Show success notification
    $q.notify({
      type: 'positive',
      message: 'สร้าง Task สำเร็จ!',
      position: 'top'
    })
  } catch (error) {
    console.error('Error creating task:', error)

    // Show error notification
    $q.notify({
      type: 'negative',
      message: `เกิดข้อผิดพลาด: ${error.message}`,
      position: 'top'
    })
  } finally {
    isCreatingTask.value = false
  }
}

const handleTaskClick = (event, task) => {
  // Don't select task if clicking on drag handle
  if (event.target.closest('.drag-handle')) {
    return
  }
  selectTask(task)
}

const selectTask = async (task) => {
  selectedTask.value = task
  editingTask.value = {
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate,
    assignedTo: Array.isArray(task.assignedTo) ? [...task.assignedTo] : (task.assignedTo ? [task.assignedTo] : [])
  }

  // Initialize tracking for auto-save notification diff
  lastSavedAssignedTo = [...(editingTask.value.assignedTo || [])]

  // Unsubscribe from previous subtasks if any
  if (subtasksUnsubscribe) {
    subtasksUnsubscribe()
  }

  // Subscribe to subtasks changes for real-time updates
  if (task.id) {
    subtasksUnsubscribe = tasksStore.subscribeToSubtasks(task.id)

    // Subscribe to comments for real-time updates
    commentsUnsubscribe = tasksStore.subscribeToComments(task.id, (comments) => {
      taskComments.value = comments
    })

    // Subscribe to attachments for real-time updates
    attachmentsUnsubscribe = tasksStore.subscribeToAttachments(task.id, (attachments) => {
      taskAttachments.value = attachments
    })
  }

  showTaskDetailDialog.value = true
}

// Auto-save task without closing dialog (Trello-style with Optimistic Update)
let autoSaveTimeout = null
let lastSavedAssignedTo = [] // Track previous assignedTo for notification diff
const autoSaveTask = async () => {
  // Clear previous timeout
  if (autoSaveTimeout) {
    clearTimeout(autoSaveTimeout)
  }

  // Validate required fields
  if (!editingTask.value.title || editingTask.value.title.trim() === '') {
    return
  }

  // Capture current assignedTo before debounce to detect changes
  const currentAssigned = [...(editingTask.value.assignedTo || [])]

  // Debounce: wait 500ms before saving
  autoSaveTimeout = setTimeout(async () => {
    try {
      // Detect newly assigned members
      const previousAssigned = lastSavedAssignedTo
      const newlyAssigned = currentAssigned.filter(email => !previousAssigned.includes(email))
      const removedAssigned = previousAssigned.filter(email => !currentAssigned.includes(email))

      // Optimistic Update: Update local state immediately
      const taskIndex = tasksStore.tasks.findIndex(t => t.id === selectedTask.value.id)
      let previousTaskData = null

      if (taskIndex !== -1) {
        // Backup current data for potential rollback
        previousTaskData = { ...tasksStore.tasks[taskIndex] }

        // Update local state immediately (no flicker)
        tasksStore.tasks[taskIndex] = {
          ...tasksStore.tasks[taskIndex],
          ...editingTask.value,
          updatedAt: new Date(),
          _localUpdateTime: Date.now() // Flag to prevent Firebase listener from overwriting
        }
      }

      // Send update to Firebase in background with silent mode
      await tasksStore.updateTask(selectedTask.value.id, editingTask.value, { silent: true })

      // Send notifications to newly assigned users
      if (newlyAssigned.length > 0) {
        const currentProject = projectsStore.currentProject
        for (const email of newlyAssigned) {
          await notificationsStore.createNotification({
            recipientEmail: email,
            type: 'assign',
            title: 'คุณได้รับมอบหมายงานใหม่',
            message: `${authStore.user.displayName || authStore.user.email.split('@')[0]} มอบหมายงาน "${editingTask.value.title}" ให้คุณ`,
            projectId: currentProject?.id,
            projectName: currentProject?.name,
            taskId: selectedTask.value.id,
            taskTitle: editingTask.value.title
          })
        }
      }

      // Send notifications to removed users
      if (removedAssigned.length > 0) {
        const currentProject = projectsStore.currentProject
        for (const email of removedAssigned) {
          await notificationsStore.createNotification({
            recipientEmail: email,
            type: 'assign',
            title: 'คุณถูกถอดจากงาน',
            message: `${authStore.user.displayName || authStore.user.email.split('@')[0]} ถอดคุณออกจากงาน "${editingTask.value.title}"`,
            projectId: currentProject?.id,
            projectName: currentProject?.name,
            taskId: selectedTask.value.id,
            taskTitle: editingTask.value.title
          })
        }
      }

      // Update tracking
      lastSavedAssignedTo = [...currentAssigned]

      // Success - local state already updated, no need to do anything
    } catch (error) {
      console.error('Error auto-saving task:', error)

      // Rollback on error
      if (taskIndex !== -1 && previousTaskData) {
        tasksStore.tasks[taskIndex] = previousTaskData
      }

      $q.notify({
        type: 'negative',
        message: `เกิดข้อผิดพลาดในการบันทึก: ${error.message}`,
        position: 'top'
      })
    }
  }, 500)
}

const handleUpdateTask = async () => {
  try {
    // Detect newly assigned members
    const oldAssigned = selectedTask.value.assignedTo || []
    const newAssigned = editingTask.value.assignedTo || []
    const newlyAssigned = newAssigned.filter(email => !oldAssigned.includes(email))

    await tasksStore.updateTask(selectedTask.value.id, editingTask.value)

    // Send notifications to newly assigned users
    if (newlyAssigned.length > 0) {
      const currentProject = projectsStore.currentProject
      for (const email of newlyAssigned) {
        await notificationsStore.createNotification({
          recipientEmail: email,
          type: 'assign',
          title: 'คุณได้รับมอบหมายงานใหม่',
          message: `${authStore.user.displayName || authStore.user.email.split('@')[0]} มอบหมายงาน "${editingTask.value.title}" ให้คุณ`,
          projectId: currentProject?.id,
          projectName: currentProject?.name,
          taskId: selectedTask.value.id,
          taskTitle: editingTask.value.title
        })
      }
    }

    // Update local task data
    const taskIndex = tasksStore.tasks.findIndex(t => t.id === selectedTask.value.id)
    if (taskIndex !== -1) {
      tasksStore.tasks[taskIndex] = {
        ...tasksStore.tasks[taskIndex],
        ...editingTask.value,
        updatedAt: new Date()
      }
    }

    showTaskDetailDialog.value = false

    // Show success notification
    $q.notify({
      type: 'positive',
      message: 'อัปเดต Task สำเร็จ!',
      position: 'top'
    })
  } catch (error) {
    console.error('Error updating task:', error)

    // Show error notification
    $q.notify({
      type: 'negative',
      message: `เกิดข้อผิดพลาด: ${error.message}`,
      position: 'top'
    })
  }
}

// Cleanup function to unsubscribe from subtasks when dialog is closed
const cleanupSubtasks = () => {
  if (subtasksUnsubscribe) {
    subtasksUnsubscribe()
    subtasksUnsubscribe = null
  }
}

// Cleanup function for project subtasks subscription
const cleanupProjectSubtasks = () => {
  if (projectSubtasksUnsubscribe) {
    projectSubtasksUnsubscribe()
    projectSubtasksUnsubscribe = null
  }
}

const toggleSubtask = async (subtask) => {
  try {
    await tasksStore.toggleSubtask(subtask.id)
    // Fire-and-forget worklog entry (subtask.completed already flipped by v-model)
    if (subtask.completed) {
      worklogStore.addAutoEntry(`✅ เสร็จสิ้น: ${subtask.title}`)
    } else {
      worklogStore.addAutoEntry(`↩️ ยกเลิกเสร็จสิ้น: ${subtask.title}`)
    }
  } catch (error) {
    console.error('Error toggling subtask:', error)
    $q.notify({
      type: 'negative',
      message: `เกิดข้อผิดพลาด: ${error.message}`,
      position: 'top'
    })
  }
}

const handleCreateSubtask = async () => {
  // Validate title
  if (!newSubtask.value.title || newSubtask.value.title.trim() === '') {
    $q.notify({
      type: 'warning',
      message: 'กรุณากรอกชื่อ Subtask',
      position: 'top'
    })
    return
  }

  try {
    const subtaskTitle = newSubtask.value.title
    const subtaskAssignees = [...(newSubtask.value.assignedTo || [])]

    await tasksStore.createSubtask({
      ...newSubtask.value,
      taskId: selectedTask.value.id
    })
    newSubtask.value = {
      title: '',
      description: '',
      dueDate: null,
      assignedTo: []
    }
    showCreateSubtaskDialog.value = false
    showInlineSubtaskForm.value = false
    // No need to refresh subtasks manually - real-time subscription will handle it

    // Send notifications to assigned users
    if (subtaskAssignees.length > 0) {
      const currentProject = projectsStore.currentProject
      const senderName = authStore.user.displayName || authStore.user.email.split('@')[0]
      const parentTitle = selectedTask.value?.title || ''
      for (const email of subtaskAssignees) {
        if (email === authStore.user.email) continue // Don't notify yourself
        await notificationsStore.createNotification({
          recipientEmail: email,
          type: 'assign',
          title: 'คุณได้รับมอบหมาย Subtask ใหม่',
          message: `${senderName} มอบหมาย Subtask "${subtaskTitle}" ในงาน "${parentTitle}" ให้คุณ`,
          projectId: currentProject?.id,
          projectName: currentProject?.name,
          taskId: selectedTask.value?.id,
          taskTitle: parentTitle
        })
      }
    }

    $q.notify({
      type: 'positive',
      message: 'เพิ่ม Subtask สำเร็จ',
      position: 'top'
    })
  } catch (error) {
    console.error('Error creating subtask:', error)
    $q.notify({
      type: 'negative',
      message: 'เกิดข้อผิดพลาดในการเพิ่ม Subtask',
      position: 'top'
    })
  }
}

const cancelInlineSubtask = () => {
  newSubtask.value = {
    title: '',
    description: '',
    dueDate: null,
    assignedTo: []
  }
  showInlineSubtaskForm.value = false
}

const toggleSubtaskAssignee = (memberEmail) => {
  const index = newSubtask.value.assignedTo.indexOf(memberEmail)
  if (index > -1) {
    newSubtask.value.assignedTo.splice(index, 1)
  } else {
    newSubtask.value.assignedTo.push(memberEmail)
  }
}

const toggleMemberSelection = (memberEmail) => {
  const index = newSubtask.value.assignedTo.indexOf(memberEmail)
  if (index > -1) {
    // Remove member if already selected
    newSubtask.value.assignedTo.splice(index, 1)
  } else {
    // Add member if not selected
    newSubtask.value.assignedTo.push(memberEmail)
  }
}

const toggleEditMemberSelection = (memberEmail) => {
  const index = editingSubtask.value.assignedTo.indexOf(memberEmail)
  if (index > -1) {
    // Remove member if already selected
    editingSubtask.value.assignedTo.splice(index, 1)
  } else {
    // Add member if not selected
    editingSubtask.value.assignedTo.push(memberEmail)
  }
}

// Keep old editSubtask for dialog (if still needed elsewhere)
let originalSubtaskAssignedTo = []

const editSubtask = (subtask) => {
  const assignedTo = Array.isArray(subtask.assignedTo) ? [...subtask.assignedTo] : (subtask.assignedTo ? [subtask.assignedTo] : [])
  originalSubtaskAssignedTo = [...assignedTo]
  editingSubtask.value = {
    id: subtask.id,
    title: subtask.title,
    description: subtask.description || '',
    dueDate: subtask.dueDate || null,
    assignedTo
  }
  showEditSubtaskDialog.value = true
}

// Start creating new subtask (inline form)
const startCreateSubtask = () => {
  // Close edit form if open
  editingSubtaskId.value = null
  // Open create form
  showInlineSubtaskForm.value = true
}

// New inline edit mode
const startEditSubtask = (subtask) => {
  editingSubtaskId.value = subtask.id
  const assignedTo = Array.isArray(subtask.assignedTo) ? [...subtask.assignedTo] : (subtask.assignedTo ? [subtask.assignedTo] : [])
  originalSubtaskAssignedTo = [...assignedTo]
  editingSubtask.value = {
    id: subtask.id,
    title: subtask.title,
    description: subtask.description || '',
    dueDate: subtask.dueDate || null,
    assignedTo
  }
  // Close create form if open
  showInlineSubtaskForm.value = false
}

const cancelEditSubtask = () => {
  editingSubtaskId.value = null
  editingSubtask.value = {
    id: null,
    title: '',
    description: '',
    dueDate: null,
    assignedTo: []
  }
}

const toggleEditSubtaskAssignee = (memberEmail) => {
  const index = editingSubtask.value.assignedTo.indexOf(memberEmail)
  if (index > -1) {
    editingSubtask.value.assignedTo.splice(index, 1)
  } else {
    editingSubtask.value.assignedTo.push(memberEmail)
  }
}

const handleUpdateSubtask = async () => {
  // Validate title
  if (!editingSubtask.value.title || editingSubtask.value.title.trim() === '') {
    $q.notify({
      type: 'warning',
      message: 'กรุณากรอกชื่อ Subtask',
      position: 'top'
    })
    return
  }

  try {
    const currentAssigned = editingSubtask.value.assignedTo || []
    const subtaskTitle = editingSubtask.value.title

    await tasksStore.updateSubtask(editingSubtask.value.id, {
      title: editingSubtask.value.title,
      description: editingSubtask.value.description,
      dueDate: editingSubtask.value.dueDate,
      assignedTo: currentAssigned
    })

    showEditSubtaskDialog.value = false
    editingSubtaskId.value = null

    // No need to refresh subtasks manually - real-time subscription will handle it

    // Send notifications for assignment changes
    const newlyAssigned = currentAssigned.filter(e => !originalSubtaskAssignedTo.includes(e))
    const removedAssigned = originalSubtaskAssignedTo.filter(e => !currentAssigned.includes(e))
    const currentProject = projectsStore.currentProject
    const senderName = authStore.user.displayName || authStore.user.email.split('@')[0]
    const parentTitle = selectedTask.value?.title || ''

    if (newlyAssigned.length > 0) {
      for (const email of newlyAssigned) {
        if (email === authStore.user.email) continue
        await notificationsStore.createNotification({
          recipientEmail: email,
          type: 'assign',
          title: 'คุณได้รับมอบหมาย Subtask ใหม่',
          message: `${senderName} มอบหมาย Subtask "${subtaskTitle}" ในงาน "${parentTitle}" ให้คุณ`,
          projectId: currentProject?.id,
          projectName: currentProject?.name,
          taskId: selectedTask.value?.id,
          taskTitle: parentTitle
        })
      }
    }

    if (removedAssigned.length > 0) {
      for (const email of removedAssigned) {
        if (email === authStore.user.email) continue
        await notificationsStore.createNotification({
          recipientEmail: email,
          type: 'assign',
          title: 'คุณถูกถอดจาก Subtask',
          message: `${senderName} ถอดคุณออกจาก Subtask "${subtaskTitle}" ในงาน "${parentTitle}"`,
          projectId: currentProject?.id,
          projectName: currentProject?.name,
          taskId: selectedTask.value?.id,
          taskTitle: parentTitle
        })
      }
    }

    originalSubtaskAssignedTo = []

    $q.notify({
      type: 'positive',
      message: 'อัปเดต Subtask สำเร็จ!',
      position: 'top'
    })
  } catch (error) {
    console.error('Error updating subtask:', error)
    $q.notify({
      type: 'negative',
      message: `เกิดข้อผิดพลาด: ${error.message}`,
      position: 'top'
    })
  }
}

const deleteSubtask = async (subtask) => {
  $q.dialog({
    title: 'ยืนยันการลบ',
    message: `คุณต้องการลบ Subtask "${subtask.title}" หรือไม่?`,
    cancel: {
      label: 'ยกเลิก',
      flat: true,
      color: 'grey'
    },
    ok: {
      label: 'ลบ',
      flat: true,
      color: 'negative'
    },
    persistent: true
  }).onOk(async () => {
    try {
      await tasksStore.deleteSubtask(subtask.id)

      $q.notify({
        type: 'positive',
        message: 'ลบ Subtask สำเร็จ!',
        position: 'top'
      })
    } catch (error) {
      console.error('Error deleting subtask:', error)
      $q.notify({
        type: 'negative',
        message: `เกิดข้อผิดพลาดในการลบ Subtask: ${error.message}`,
        position: 'top'
      })
    }
  })
}

// Linkify: convert URLs and @mentions in text to rich HTML (XSS-safe)
const linkifyText = (text) => {
  if (!text) return ''
  // Escape HTML first to prevent XSS
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
  // Match URLs
  let result = escaped.replace(/(https?:\/\/[^\s<]+)/g, (url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="comment-link">${url}</a>`
  })
  // Match @mentions (e.g., @username)
  result = result.replace(/@([\w.\-]+(?:@[\w.\-]+)?)/g, (match, name) => {
    return `<span class="mention-highlight">@${name}</span>`
  })
  return result
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('th-TH')
}

const formatDateTime = (timestamp) => {
  if (!timestamp) return ''
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  const now = new Date()
  const diffInSeconds = Math.floor((now - date) / 1000)

  if (diffInSeconds < 60) return 'เมื่อสักครู่'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} นาทีที่แล้ว`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ชั่วโมงที่แล้ว`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} วันที่แล้ว`

  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Auto-adjust task due date based on latest subtask due date
const autoAdjustDueDate = () => {
  if (subtaskDueDateInfo.value.latestDueDate) {
    editingTask.value.dueDate = subtaskDueDateInfo.value.latestDueDate.toISOString().split('T')[0]
    $q.notify({
      type: 'positive',
      message: 'ปรับกำหนดส่งอัตโนมัติเรียบร้อย',
      position: 'top'
    })
  }
}

// Auto-adjust new task due date based on latest subtask due date
const autoAdjustNewTaskDueDate = () => {
  if (newTaskSubtaskDueDateInfo.value.latestDueDate) {
    newTask.value.dueDate = newTaskSubtaskDueDateInfo.value.latestDueDate.toISOString().split('T')[0]
    $q.notify({
      type: 'positive',
      message: 'ปรับกำหนดส่งอัตโนมัติเรียบร้อย',
      position: 'top'
    })
  }
}

const getPriorityColor = (priority) => {
  const colors = {
    low: 'green-5',
    medium: 'amber-6',
    high: 'deep-orange-4',
    urgent: 'red-5'
  }
  return colors[priority] || colors.medium
}

// --- Mention / Comment helpers ---
const commentHasContent = computed(() => {
  return newComment.value.trim().length > 0
})

// Extract plain text from contenteditable (preserving @mention names)
const getCommentText = () => {
  const el = commentInputRef.value
  if (!el) return ''
  let text = ''
  el.childNodes.forEach(node => {
    if (node.nodeType === Node.TEXT_NODE) {
      text += node.textContent
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      if (node.classList?.contains('mention-chip-inline')) {
        text += node.textContent
      } else {
        text += node.textContent
      }
    }
  })
  return text
}

// Sync contenteditable → newComment ref (for reactivity / send button)
const syncComment = () => {
  newComment.value = getCommentText()
}

// Get caret pixel position inside the contenteditable
const getCaretCoords = () => {
  const sel = window.getSelection()
  if (!sel || sel.rangeCount === 0) return null
  const range = sel.getRangeAt(0).cloneRange()
  range.collapse(true)
  const rect = range.getClientRects()[0]
  if (!rect) return null
  const parentRect = commentInputRef.value?.getBoundingClientRect()
  if (!parentRect) return null
  return {
    top: rect.bottom - parentRect.top + 4,
    left: rect.left - parentRect.left
  }
}

// Find the current word being typed (to detect @query)
const getCurrentMentionQuery = () => {
  const sel = window.getSelection()
  if (!sel || sel.rangeCount === 0) return null
  const range = sel.getRangeAt(0)
  const node = range.startContainer
  if (node.nodeType !== Node.TEXT_NODE) return null
  const text = node.textContent
  const cursorPos = range.startOffset
  // Search backward for @
  let atPos = -1
  for (let i = cursorPos - 1; i >= 0; i--) {
    if (text[i] === '@') {
      // Make sure @ is at the start or preceded by a space/newline
      if (i === 0 || /\s/.test(text[i - 1])) {
        atPos = i
      }
      break
    }
    if (/\s/.test(text[i])) break
  }
  if (atPos === -1) return null
  const query = text.substring(atPos + 1, cursorPos)
  return { query, node, atPos, cursorPos }
}

const onCommentInput = () => {
  syncComment()
  // Check for @mention trigger
  const mention = getCurrentMentionQuery()
  if (mention) {
    mentionQuery.value = mention.query
    mentionStartIndex.value = mention.atPos
    const coords = getCaretCoords()
    if (coords) {
      mentionDropdownPos.value = coords
    }
    showMentionDropdown.value = true
  } else {
    showMentionDropdown.value = false
    mentionQuery.value = ''
  }
}

const onCommentKeydown = (e) => {
  if (showMentionDropdown.value) {
    if (e.key === 'Escape') {
      showMentionDropdown.value = false
      e.preventDefault()
    }
    if (e.key === 'Enter' && filteredMentionMembers.value.length > 0) {
      e.preventDefault()
      insertMention(filteredMentionMembers.value[0])
    }
  }
  // Ctrl/Cmd + Enter to send
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault()
    if (commentHasContent.value) addComment()
  }
}

const onCommentBlur = () => {
  // Delay to allow mousedown on dropdown items
  setTimeout(() => {
    showMentionDropdown.value = false
  }, 200)
}

const insertMention = (member) => {
  const mention = getCurrentMentionQuery()
  if (!mention) {
    showMentionDropdown.value = false
    return
  }

  const { node, atPos, cursorPos } = mention
  const text = node.textContent
  const before = text.substring(0, atPos)
  const after = text.substring(cursorPos)

  // Create text before mention
  const beforeNode = document.createTextNode(before)

  // Create mention chip element
  const chip = document.createElement('span')
  chip.className = 'mention-chip-inline'
  chip.contentEditable = 'false'
  chip.setAttribute('data-email', member.email)
  chip.textContent = '@' + member.name

  // Create text after (with leading space)
  const afterNode = document.createTextNode('\u00A0' + after)

  // Replace the text node
  const parent = node.parentNode
  parent.insertBefore(beforeNode, node)
  parent.insertBefore(chip, node)
  parent.insertBefore(afterNode, node)
  parent.removeChild(node)

  // Move cursor after the chip
  const sel = window.getSelection()
  const range = document.createRange()
  range.setStart(afterNode, 1)
  range.collapse(true)
  sel.removeAllRanges()
  sel.addRange(range)

  showMentionDropdown.value = false
  mentionQuery.value = ''
  syncComment()
}

const clearCommentInput = () => {
  if (commentInputRef.value) {
    commentInputRef.value.innerHTML = ''
  }
  newComment.value = ''
}

// Comments functions
const addComment = async () => {
  const text = getCommentText().trim()
  if (!text || !selectedTask.value) return

  // Extract mentioned emails from the mention chips
  const mentionedEmails = []
  if (commentInputRef.value) {
    commentInputRef.value.querySelectorAll('.mention-chip-inline').forEach(chip => {
      const email = chip.getAttribute('data-email')
      if (email) mentionedEmails.push(email)
    })
  }

  try {
    const commentData = {
      taskId: selectedTask.value.id,
      text: text,
      mentions: mentionedEmails,
      userEmail: authStore.user.email,
      userName: authStore.user.displayName || authStore.user.email.split('@')[0],
      createdAt: new Date()
    }

    await tasksStore.createComment(commentData)

    // Send notifications to mentioned users
    if (mentionedEmails.length > 0) {
      const currentProject = projectsStore.currentProject
      for (const email of mentionedEmails) {
        await notificationsStore.createNotification({
          recipientEmail: email,
          type: 'mention',
          title: 'คุณถูกแท็กในความคิดเห็น',
          message: `${authStore.user.displayName || authStore.user.email.split('@')[0]} แท็กคุณในคอมเมนท์ของ "${selectedTask.value.title}"`,
          projectId: currentProject?.id,
          projectName: currentProject?.name,
          taskId: selectedTask.value.id,
          taskTitle: selectedTask.value.title
        })
      }
    }

    clearCommentInput()

    $q.notify({
      type: 'positive',
      message: 'เพิ่มความคิดเห็นสำเร็จ!',
      position: 'top'
    })
  } catch (error) {
    console.error('Error adding comment:', error)
    $q.notify({
      type: 'negative',
      message: `เกิดข้อผิดพลาด: ${error.message}`,
      position: 'top'
    })
  }
}

const fetchComments = async (taskId) => {
  if (!taskId) return

  try {
    const comments = await tasksStore.fetchComments(taskId)
    taskComments.value = comments
  } catch (error) {
    console.error('Error fetching comments:', error)
  }
}

const cleanupComments = () => {
  if (commentsUnsubscribe) {
    commentsUnsubscribe()
    commentsUnsubscribe = null
  }
  taskComments.value = []
  clearCommentInput()
}

// Attachment functions
const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

const getFileIcon = (fileType) => {
  if (!fileType) return 'insert_drive_file'
  if (fileType.startsWith('image/')) return 'image'
  if (fileType.startsWith('video/')) return 'videocam'
  if (fileType.startsWith('audio/')) return 'audiotrack'
  if (fileType.includes('pdf')) return 'picture_as_pdf'
  if (fileType.includes('word') || fileType.includes('document')) return 'description'
  if (fileType.includes('sheet') || fileType.includes('excel')) return 'table_chart'
  if (fileType.includes('presentation') || fileType.includes('powerpoint')) return 'slideshow'
  if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('7z')) return 'folder_zip'
  return 'insert_drive_file'
}

const getFileIconColor = (fileType) => {
  if (!fileType) return '#9ca3af'
  if (fileType.startsWith('image/')) return '#5c9ce6'
  if (fileType.startsWith('video/')) return '#ab47bc'
  if (fileType.includes('pdf')) return '#ef5350'
  if (fileType.includes('word') || fileType.includes('document')) return '#42a5f5'
  if (fileType.includes('sheet') || fileType.includes('excel')) return '#4caf50'
  if (fileType.includes('presentation')) return '#ffa726'
  return '#9ca3af'
}

const isImageFile = (fileType) => {
  return fileType && fileType.startsWith('image/')
}

// Handle file selection for new task (pending upload)
const handleNewTaskFileSelect = (event) => {
  const files = Array.from(event.target.files || [])
  for (const file of files) {
    if (file.size > MAX_FILE_SIZE) {
      $q.notify({
        type: 'negative',
        message: `ไฟล์ "${file.name}" มีขนาดเกิน 100MB`,
        position: 'top'
      })
      continue
    }
    newTaskAttachments.value.push({
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      preview: isImageFile(file.type) ? URL.createObjectURL(file) : null
    })
  }
  // Reset file input
  event.target.value = ''
}

const removeNewTaskAttachment = (index) => {
  const attachment = newTaskAttachments.value[index]
  if (attachment.preview) {
    URL.revokeObjectURL(attachment.preview)
  }
  newTaskAttachments.value.splice(index, 1)
}

// Upload pending attachments after task creation
const uploadPendingAttachments = async (taskId) => {
  for (const attachment of newTaskAttachments.value) {
    try {
      await tasksStore.uploadAttachment(taskId, attachment.file)
    } catch (err) {
      console.error('Error uploading attachment:', err)
    }
  }
  // Cleanup previews
  newTaskAttachments.value.forEach(a => {
    if (a.preview) URL.revokeObjectURL(a.preview)
  })
  newTaskAttachments.value = []
}

// Handle file selection for task detail (upload immediately)
const handleTaskDetailFileSelect = async (event) => {
  const files = Array.from(event.target.files || [])
  if (!selectedTask.value) return

  for (const file of files) {
    if (file.size > MAX_FILE_SIZE) {
      $q.notify({
        type: 'negative',
        message: `ไฟล์ "${file.name}" มีขนาดเกิน 100MB`,
        position: 'top'
      })
      continue
    }

    const uploadItem = ref({
      name: file.name,
      progress: 0,
      uploading: true
    })
    uploadingFiles.value.push(uploadItem)

    try {
      await tasksStore.uploadAttachment(
        selectedTask.value.id,
        file,
        (progress) => {
          uploadItem.value.progress = progress
        }
      )

      $q.notify({
        type: 'positive',
        message: `อัปโหลด "${file.name}" สำเร็จ`,
        position: 'top',
        timeout: 2000
      })
    } catch (err) {
      console.error('Error uploading file:', err)
      $q.notify({
        type: 'negative',
        message: `อัปโหลด "${file.name}" ล้มเหลว: ${err.message}`,
        position: 'top'
      })
    } finally {
      const idx = uploadingFiles.value.indexOf(uploadItem)
      if (idx !== -1) uploadingFiles.value.splice(idx, 1)
    }
  }
  event.target.value = ''
}

const deleteAttachment = async (attachment) => {
  $q.dialog({
    title: 'ลบไฟล์แนบ',
    message: `ต้องการลบ "${attachment.fileName}" หรือไม่?`,
    cancel: { label: 'ยกเลิก', flat: true },
    ok: { label: 'ลบ', color: 'negative' },
    dark: true
  }).onOk(async () => {
    try {
      await tasksStore.deleteAttachment(attachment)
      $q.notify({
        type: 'positive',
        message: 'ลบไฟล์แนบสำเร็จ',
        position: 'top'
      })
    } catch (err) {
      console.error('Error deleting attachment:', err)
      $q.notify({
        type: 'negative',
        message: `ลบไฟล์แนบล้มเหลว: ${err.message}`,
        position: 'top'
      })
    }
  })
}

const openLink = (url) => {
  window.open(url, '_blank')
}

const cleanupAttachments = () => {
  if (attachmentsUnsubscribe) {
    attachmentsUnsubscribe()
    attachmentsUnsubscribe = null
  }
  taskAttachments.value = []
  uploadingFiles.value = []
}

const goToSettings = () => {
  router.push(`/project/${route.params.id}/settings`)
}

const goToTrash = () => {
  router.push(`/project/${route.params.id}/trash`)
}

// Column management functions
const handleCreateColumn = async () => {
  if (!newColumn.value.name?.trim()) return
  try {
    if (editingColumn.value) {
      await tasksStore.updateColumn(editingColumn.value.id, newColumn.value)
      $q.notify({
        type: 'positive',
        message: 'แก้ไขคอลัมน์สำเร็จ!',
        position: 'top'
      })
    } else {
      await tasksStore.addColumn(newColumn.value)
      $q.notify({
        type: 'positive',
        message: 'สร้างคอลัมน์สำเร็จ!',
        position: 'top'
      })
    }

    cancelCreateColumn()
  } catch (error) {
    console.error('Error managing column:', error)
    $q.notify({
      type: 'negative',
      message: `เกิดข้อผิดพลาด: ${error.message}`,
      position: 'top'
    })
  }
}

const cancelCreateColumn = () => {
  newColumn.value = { name: '', color: '#9E9E9E' }
  editingColumn.value = null
  showCreateColumnDialog.value = false
}

const editColumn = (column) => {
  editingColumn.value = column
  newColumn.value = {
    name: column.name,
    color: column.color
  }
  showCreateColumnDialog.value = true
}

const deleteColumn = async (column) => {
  $q.dialog({
    title: 'ยืนยันการลบ',
    message: `คุณต้องการลบคอลัมน์ "${column.name}" หรือไม่?`,
    cancel: true,
    persistent: true,
    ok: {
      label: 'ลบ',
      color: 'negative'
    },
    cancel: {
      label: 'ยกเลิก',
      color: 'primary'
    }
  }).onOk(async () => {
    try {
      await tasksStore.deleteColumn(column.id)
      $q.notify({
        type: 'positive',
        message: 'ลบคอลัมน์สำเร็จ!',
        position: 'top'
      })
    } catch (error) {
      console.error('Error deleting column:', error)
      $q.notify({
        type: 'negative',
        message: `เกิดข้อผิดพลาดในการลบคอลัมน์: ${error.message}`,
        position: 'top'
      })
    }
  })
}

// Silent update function that doesn't trigger loading state
const updateTaskSilently = async (taskId, updateData) => {
  try {
    const taskRef = doc(db, 'tasks', taskId)
    await updateDoc(taskRef, {
      ...updateData,
      updatedAt: new Date()
    })
  } catch (err) {
    console.error('Error updating task in database:', taskId, err)
    throw err
  }
}

// New Task Subtask Management Functions
// Start creating new task subtask (inline form)
const startNewTaskInlineSubtask = () => {
  // Close edit form if open
  editingNewTaskSubtaskIndex.value = null
  // Open create form
  showNewTaskInlineSubtaskForm.value = true
}

// Cancel new task inline subtask creation
const cancelNewTaskInlineSubtask = () => {
  newTaskSubtask.value = {
    title: '',
    description: '',
    dueDate: null,
    assignedTo: []
  }
  showNewTaskInlineSubtaskForm.value = false
}

// Toggle assignee for new task subtask
const toggleNewTaskSubtaskAssignee = (memberEmail) => {
  const index = newTaskSubtask.value.assignedTo.indexOf(memberEmail)
  if (index > -1) {
    newTaskSubtask.value.assignedTo.splice(index, 1)
  } else {
    newTaskSubtask.value.assignedTo.push(memberEmail)
  }
}

const addNewTaskSubtask = () => {
  if (!newTaskSubtask.value.title.trim()) {
    $q.notify({
      type: 'warning',
      message: 'กรุณากรอกชื่อ Subtask',
      position: 'top'
    })
    return
  }

  newTaskSubtasks.value.push({
    ...newTaskSubtask.value,
    completed: false
  })

  // Reset form
  newTaskSubtask.value = {
    title: '',
    description: '',
    dueDate: null,
    assignedTo: []
  }

  showCreateNewTaskSubtaskDialog.value = false
  showNewTaskInlineSubtaskForm.value = false

  $q.notify({
    type: 'positive',
    message: 'เพิ่ม Subtask สำเร็จ!',
    position: 'top'
  })
}

// Old dialog edit (keep for compatibility)
const editNewTaskSubtask = (index) => {
  const subtask = newTaskSubtasks.value[index]
  editingNewTaskSubtask.value = {
    index: index,
    title: subtask.title,
    description: subtask.description,
    dueDate: subtask.dueDate,
    assignedTo: [...subtask.assignedTo]
  }
  showEditNewTaskSubtaskDialog.value = true
}

// New inline edit mode
const startEditNewTaskSubtask = (index) => {
  editingNewTaskSubtaskIndex.value = index
  const subtask = newTaskSubtasks.value[index]
  editingNewTaskSubtask.value = {
    index: index,
    title: subtask.title,
    description: subtask.description,
    dueDate: subtask.dueDate,
    assignedTo: [...subtask.assignedTo]
  }
  // Close create form if open
  showNewTaskInlineSubtaskForm.value = false
}

// Cancel edit new task subtask
const cancelEditNewTaskSubtask = () => {
  editingNewTaskSubtaskIndex.value = null
  editingNewTaskSubtask.value = {
    index: null,
    title: '',
    description: '',
    dueDate: null,
    assignedTo: []
  }
}

// Save edit new task subtask
const saveEditNewTaskSubtask = () => {
  if (!editingNewTaskSubtask.value.title.trim()) {
    $q.notify({
      type: 'warning',
      message: 'กรุณากรอกชื่อ Subtask',
      position: 'top'
    })
    return
  }

  const index = editingNewTaskSubtask.value.index
  newTaskSubtasks.value[index] = {
    ...newTaskSubtasks.value[index],
    title: editingNewTaskSubtask.value.title,
    description: editingNewTaskSubtask.value.description,
    dueDate: editingNewTaskSubtask.value.dueDate,
    assignedTo: editingNewTaskSubtask.value.assignedTo
  }

  editingNewTaskSubtaskIndex.value = null

  $q.notify({
    type: 'positive',
    message: 'อัปเดต Subtask สำเร็จ!',
    position: 'top'
  })
}

const updateNewTaskSubtask = () => {
  if (!editingNewTaskSubtask.value.title.trim()) {
    $q.notify({
      type: 'negative',
      message: 'กรุณากรอกชื่อ Subtask',
      position: 'top'
    })
    return
  }

  const index = editingNewTaskSubtask.value.index
  newTaskSubtasks.value[index] = {
    ...newTaskSubtasks.value[index],
    title: editingNewTaskSubtask.value.title,
    description: editingNewTaskSubtask.value.description,
    dueDate: editingNewTaskSubtask.value.dueDate,
    assignedTo: editingNewTaskSubtask.value.assignedTo
  }

  showEditNewTaskSubtaskDialog.value = false

  $q.notify({
    type: 'positive',
    message: 'อัปเดต Subtask สำเร็จ!',
    position: 'top'
  })
}

const removeNewTaskSubtask = (index) => {
  newTaskSubtasks.value.splice(index, 1)
  $q.notify({
    type: 'positive',
    message: 'ลบ Subtask สำเร็จ!',
    position: 'top'
  })
}

// Handle reordering within the same column
const handleReorder = async (taskId, newIndex, status) => {
  try {

    // Get tasks in the same status
    const tasksInStatus = tasksStore.tasks.filter(task => task.status === status)
    const sortedTasks = [...tasksInStatus].sort((a, b) => {
      const orderA = a.order || 0
      const orderB = b.order || 0
      if (orderA !== orderB) return orderA - orderB
      return new Date(a.createdAt) - new Date(b.createdAt)
    })

    // Check if tasks have order field
    const tasksWithoutOrder = sortedTasks.filter(task => task.order === undefined)

    if (tasksWithoutOrder.length > 0) {
      // Set default order for tasks without order
      tasksWithoutOrder.forEach((task, index) => {
        task.order = index
        const taskInStore = tasksStore.tasks.find(t => t.id === task.id)
        if (taskInStore) {
          taskInStore.order = index
        }
      })
    }

    // Find the task being moved
    const taskIndex = sortedTasks.findIndex(task => task.id === taskId)
    if (taskIndex === -1) {
      return
    }

    // Remove the task from its current position
    const [movedTask] = sortedTasks.splice(taskIndex, 1)

    // Insert it at the new position
    sortedTasks.splice(newIndex, 0, movedTask)

    // Check which tasks need database update BEFORE updating UI
    const updatePromises = []

    sortedTasks.forEach((task, index) => {
      if (task.order !== index) {
        updatePromises.push(updateTaskSilently(task.id, { order: index }))
      }
    })

    // Update UI immediately (optimistic update) AFTER checking database updates
    sortedTasks.forEach((task, index) => {
      if (task.order !== index) {
        const taskInStore = tasksStore.tasks.find(t => t.id === task.id)
        if (taskInStore) {
          taskInStore.order = index
        }
      }
    })

    // Also update tasks that didn't have order field
    tasksWithoutOrder.forEach((task, index) => {
      updatePromises.push(updateTaskSilently(task.id, { order: index }))
    })

    if (updatePromises.length > 0) {
      await Promise.all(updatePromises)
    }

    // Show success notification
    $q.notify({
      type: 'positive',
      message: 'เรียงลำดับ Task สำเร็จ!',
      position: 'top'
    })
  } catch (error) {
    console.error('Error reordering task:', error)

    // Show error notification
    $q.notify({
      type: 'negative',
      message: `เกิดข้อผิดพลาดในการเรียงลำดับ: ${error.message}`,
      position: 'top'
    })
  }
}


const duplicateTask = async (task) => {
  try {
    const duplicatedTask = {
      title: `${task.title} (คัดลอก)`,
      description: task.description,
      status: 'todo',
      priority: task.priority,
      dueDate: task.dueDate
    }
    await tasksStore.createTask(duplicatedTask)

    // Show success notification
    $q.notify({
      type: 'positive',
      message: 'คัดลอก Task สำเร็จ!',
      position: 'top'
    })
  } catch (error) {
    console.error('Error duplicating task:', error)

    // Show error notification
    $q.notify({
      type: 'negative',
      message: `เกิดข้อผิดพลาดในการคัดลอก Task: ${error.message}`,
      position: 'top'
    })
  }
}

// Move task to trash (soft delete)
const moveTaskToTrash = async (task) => {
  $q.dialog({
    title: 'ย้ายไปถังขยะ',
    message: `คุณต้องการย้าย Task "${task.title}" ไปถังขยะหรือไม่?`,
    html: true,
    cancel: true,
    persistent: true,
    ok: {
      label: 'ย้ายไปถังขยะ',
      color: 'negative',
      icon: 'delete_outline'
    },
    cancel: {
      label: 'ยกเลิก',
      color: 'grey-7'
    }
  }).onOk(async () => {
    try {
      await tasksStore.moveToTrash(task.id)
      showTaskDetailDialog.value = false

      // Show success notification with undo option
      $q.notify({
        type: 'positive',
        message: 'ย้าย Task ไปถังขยะแล้ว',
        caption: 'สามารถกู้คืนได้จากถังขยะ',
        icon: 'delete_outline',
        position: 'top',
        timeout: 4000
      })
    } catch (error) {
      console.error('Error moving task to trash:', error)

      // Show error notification
      $q.notify({
        type: 'negative',
        message: `เกิดข้อผิดพลาด: ${error.message}`,
        position: 'top'
      })
    }
  })
}

// Permanent delete task
const deleteTask = async (task) => {
  $q.dialog({
    title: 'ยืนยันการลบถาวร',
    message: `คุณต้องการลบ Task "${task.title}" ถาวรหรือไม่? <br><span class="text-negative">การกระทำนี้ไม่สามารถย้อนกลับได้</span>`,
    html: true,
    cancel: true,
    persistent: true,
    ok: {
      label: 'ลบถาวร',
      color: 'negative'
    },
    cancel: {
      label: 'ยกเลิก',
      color: 'primary'
    }
  }).onOk(async () => {
    try {
      await tasksStore.deleteTask(task.id)
      showTaskDetailDialog.value = false

      // Show success notification
      $q.notify({
        type: 'positive',
        message: 'ลบ Task ถาวรแล้ว',
        position: 'top'
      })
    } catch (error) {
      console.error('Error deleting task:', error)

      // Show error notification
      $q.notify({
        type: 'negative',
        message: `เกิดข้อผิดพลาดในการลบ Task: ${error.message}`,
        position: 'top'
      })
    }
  })
}


// Task drag and drop functions
const handleTaskDragStart = (event, task) => {
  // Stop propagation to prevent column drag
  event.stopPropagation()

  draggedTask.value = task
  isDragging.value = true
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/html', event.target.innerHTML)

  // Find the task card element
  const taskCard = event.target.closest('.task-card')
  if (taskCard) {
    taskCard.classList.add('is-dragging')
  }
}

const handleTaskDragEnd = (event) => {
  // Stop propagation to prevent column drag
  event.stopPropagation()

  // Reset state first
  isDragging.value = false
  draggedTask.value = null
  draggedOverTask.value = null
  dragOverIndex.value = -1

  // Remove visual feedback from all task cards
  document.querySelectorAll('.task-card.is-dragging').forEach(card => {
    card.classList.remove('is-dragging')
  })

  // Remove all drag indicators
  document.querySelectorAll('.drag-over, .drop-indicator, .drag-placeholder, .drop-indicator-top, .drop-indicator-bottom').forEach(el => {
    el.classList.remove('drag-over', 'drop-indicator', 'drag-placeholder', 'drop-indicator-top', 'drop-indicator-bottom')
  })

  // Remove all column drag-over classes
  document.querySelectorAll('.column-content').forEach(column => {
    column.classList.remove('drag-over')
  })

  // Force update Vue reactivity
  nextTick(() => {
    // Cleanup completed
  })
}

const handleDragEnter = (event, statusId) => {
  event.preventDefault()

  if (draggedTask.value) {
    // Add visual feedback for column
    const columnContent = event.currentTarget.closest('.column-content') || event.currentTarget
    if (columnContent && columnContent.classList.contains('column-content')) {
      // Only show drag-over if dragging to different column
      if (draggedTask.value.status !== statusId) {
        columnContent.classList.add('drag-over')
      }
    }
  }
}

const handleDragLeave = (event) => {
  // Only remove if we're actually leaving the column (not child elements)
  const columnContent = event.currentTarget
  if (columnContent && columnContent.classList.contains('column-content')) {
    // Check if we're leaving to outside the column
    const rect = columnContent.getBoundingClientRect()
    const x = event.clientX
    const y = event.clientY

    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      columnContent.classList.remove('drag-over')
    }
  }
}

// Task card drag events for reordering (improved)
const handleTaskDragOver = (event, task, index, statusId) => {
  // Stop propagation to prevent column drag
  event.stopPropagation()
  event.preventDefault()

  if (!draggedTask.value || draggedTask.value.id === task.id) {
    return
  }

  // Only allow reordering within same column
  if (draggedTask.value.status === statusId) {
    draggedOverTask.value = task
    dragOverIndex.value = index

    // Add visual indicator
    // Remove previous indicators
    document.querySelectorAll('.drop-indicator-top, .drop-indicator-bottom').forEach(el => {
      el.classList.remove('drop-indicator-top', 'drop-indicator-bottom')
    })

    // Find the task card element (not the content inside)
    const taskCard = event.currentTarget.closest('.task-card') || event.currentTarget

    // Determine if we should show indicator above or below with larger zones
    const rect = taskCard.getBoundingClientRect()
    const relativeY = event.clientY - rect.top
    const cardHeight = rect.height

    // Expand the drop zones - top 60% for above, bottom 60% for below (overlapping)
    // This creates larger hit areas making it easier to drop
    const isAbove = relativeY < cardHeight * 0.5

    if (isAbove) {
      taskCard.classList.add('drop-indicator-top')
    } else {
      taskCard.classList.add('drop-indicator-bottom')
    }
  }
}

const handleTaskDragEnter = (event, task, index, statusId) => {
  // Stop propagation to prevent column drag
  event.stopPropagation()

  if (draggedTask.value && draggedTask.value.status === statusId && draggedTask.value.id !== task.id) {
    event.preventDefault()
    draggedOverTask.value = task
    dragOverIndex.value = index

    // Find the task card and add appropriate indicator
    const taskCard = event.currentTarget.closest('.task-card')
    if (taskCard) {
      const rect = taskCard.getBoundingClientRect()
      const relativeY = event.clientY - rect.top
      const cardHeight = rect.height
      const isAbove = relativeY < cardHeight * 0.5

      // Remove old indicators
      document.querySelectorAll('.drop-indicator-top, .drop-indicator-bottom').forEach(el => {
        el.classList.remove('drop-indicator-top', 'drop-indicator-bottom')
      })

      // Add new indicator
      if (isAbove) {
        taskCard.classList.add('drop-indicator-top')
      } else {
        taskCard.classList.add('drop-indicator-bottom')
      }
    }
  }
}

const handleTaskDragLeave = (event, task, index, statusId) => {
  // Stop propagation to prevent column drag
  event.stopPropagation()

  if (draggedTask.value && draggedTask.value.status === statusId) {
    // Only remove indicators if we're actually leaving the element
    const relatedTarget = event.relatedTarget
    const currentTarget = event.currentTarget

    // Check if we're leaving to a child element
    if (relatedTarget && currentTarget.contains(relatedTarget)) {
      return
    }

    // Remove drop indicators
    const taskCard = event.currentTarget.closest('.task-card')
    if (taskCard) {
      taskCard.classList.remove('drop-indicator-top', 'drop-indicator-bottom')
    }
  }
}

// Column drag and drop functions
const handleColumnDragStart = (event, column, index) => {
  // Only start column drag if not dragging a task
  if (isDragging.value) {
    event.preventDefault()
    event.stopPropagation()
    return
  }

  draggedColumn.value = column
  isDraggingColumn.value = true
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/html', event.target.outerHTML)
}

const handleColumnDragEnd = (event) => {
  // Reset state
  isDraggingColumn.value = false
  draggedColumn.value = null
  draggedOverColumn.value = null
  dragOverColumnIndex.value = -1
}

const shouldShowLeftIndicator = (targetIndex) => {
  if (!draggedColumn.value) return false
  const draggedIndex = sortedColumns.value.findIndex(col => col.id === draggedColumn.value.id)
  return draggedIndex > targetIndex
}

const handleColumnDragOver = (event, index) => {
  // Only handle column drag if not dragging a task
  if (isDragging.value) {
    return
  }

  if (draggedColumn.value && draggedColumn.value.id !== sortedColumns.value[index]?.id) {
    event.preventDefault()
    draggedOverColumn.value = sortedColumns.value[index]
    dragOverColumnIndex.value = index
  }
}

const handleColumnDrop = async (event, targetIndex) => {
  // Only handle column drop if not dragging a task
  if (isDragging.value) {
    return
  }

  event.preventDefault()

  if (!draggedColumn.value) return

  const sourceIndex = sortedColumns.value.findIndex(col => col.id === draggedColumn.value.id)
  if (sourceIndex === -1 || sourceIndex === targetIndex) return

  try {
    await tasksStore.reorderColumns(draggedColumn.value.id, targetIndex)
    $q.notify({
      type: 'positive',
      message: 'เรียงลำดับคอลัมน์สำเร็จ!',
      position: 'top'
    })
  } catch (error) {
    console.error('Error reordering columns:', error)
    $q.notify({
      type: 'negative',
      message: `เกิดข้อผิดพลาดในการเรียงลำดับคอลัมน์: ${error.message}`,
      position: 'top'
    })
  }

  // Reset state
  isDraggingColumn.value = false
  draggedColumn.value = null
  draggedOverColumn.value = null
  dragOverColumnIndex.value = -1
}

const handleDrop = async (event, targetStatus) => {
  event.preventDefault()

  // Store original task and drag over index before resetting state
  const originalTask = draggedTask.value ? { ...draggedTask.value } : null
  const originalDragOverIndex = dragOverIndex.value
  const originalDraggedOverTask = draggedOverTask.value

  // Reset drag state immediately
  isDragging.value = false
  draggedTask.value = null
  draggedOverTask.value = null
  dragOverIndex.value = -1

  // Remove drag-over class from all columns immediately
  const allColumns = document.querySelectorAll('.column-content')
  allColumns.forEach(column => {
    column.classList.remove('drag-over')
  })

  // Also remove from any parent elements that might have the class
  const allElements = document.querySelectorAll('.drag-over')
  allElements.forEach(element => {
    element.classList.remove('drag-over')
  })

  // Force remove from all possible elements
  const allPossibleElements = document.querySelectorAll('[class*="drag-over"]')
  allPossibleElements.forEach(element => {
    element.classList.remove('drag-over')
  })

  // Also remove from the current target
  event.target.classList.remove('drag-over')

  if (!originalTask) return

  const sourceStatus = originalTask.status

  // Check if dropped in the same column for reordering
  if (sourceStatus === targetStatus) {
    // If no target task, move to end of column (dropped on empty space)
    if (!originalDraggedOverTask) {
      // Get sorted tasks in the column
      const tasksInStatus = tasksStore.tasks.filter(task => task.status === targetStatus)
      const sortedTasks = [...tasksInStatus].sort((a, b) => {
        const orderA = a.order || 0
        const orderB = b.order || 0
        if (orderA !== orderB) return orderA - orderB
        return new Date(a.createdAt) - new Date(b.createdAt)
      })

      // Move to last position
      const newIndex = sortedTasks.length - 1
      const currentIndex = sortedTasks.findIndex(task => task.id === originalTask.id)

      if (currentIndex !== -1 && currentIndex !== newIndex) {
        await handleReorder(originalTask.id, newIndex, targetStatus)
      }
      return
    }

    // Get sorted tasks in the column
    const tasksInStatus = tasksStore.tasks.filter(task => task.status === targetStatus)
    const sortedTasks = [...tasksInStatus].sort((a, b) => {
      const orderA = a.order || 0
      const orderB = b.order || 0
      if (orderA !== orderB) return orderA - orderB
      return new Date(a.createdAt) - new Date(b.createdAt)
    })

    // Find indices
    const draggedIndex = sortedTasks.findIndex(task => task.id === originalTask.id)
    const targetIndex = sortedTasks.findIndex(task => task.id === originalDraggedOverTask.id)

    if (draggedIndex === -1 || targetIndex === -1 || draggedIndex === targetIndex) {
      return
    }

    // Reorder
    await handleReorder(originalTask.id, targetIndex, targetStatus)
    return
  }

  try {
    // Update in database first, then update UI
    await updateTaskSilently(originalTask.id, {
      status: targetStatus,
      updatedAt: new Date()
    })

    // Update UI after successful database update
    const taskIndex = tasksStore.tasks.findIndex(t => t.id === originalTask.id)
    if (taskIndex !== -1) {
      tasksStore.tasks[taskIndex].status = targetStatus
      tasksStore.tasks[taskIndex].updatedAt = new Date()
    }

    // Log activity: task moved between columns
    const fromColumn = sortedColumns.value.find(col => col.id === sourceStatus)
    const toColumn = sortedColumns.value.find(col => col.id === targetStatus)
    const fromName = fromColumn?.name || sourceStatus
    const toName = toColumn?.name || targetStatus

    try {
      await tasksStore.createActivity({
        taskId: originalTask.id,
        text: `ย้าย Task จาก "${fromName}" ไป "${toName}"`,
        activityType: 'status_change',
        fromStatus: sourceStatus,
        toStatus: targetStatus,
        userEmail: authStore.user.email,
        userName: authStore.user.displayName || authStore.user.email.split('@')[0]
      })
    } catch (activityError) {
      console.error('Error logging activity:', activityError)
    }

  } catch (error) {
    console.error('Error in handleDrop:', error)

    // Show error notification
    $q.notify({
      type: 'negative',
      message: `เกิดข้อผิดพลาดในการย้าย Task: ${error.message}`,
      position: 'top'
    })

    // Ensure drag-over classes are removed even on error
    const allColumns = document.querySelectorAll('.column-content')
    allColumns.forEach(column => {
      column.classList.remove('drag-over')
    })

    // Also remove from any parent elements that might have the class
    const allElements = document.querySelectorAll('.drag-over')
    allElements.forEach(element => {
      element.classList.remove('drag-over')
    })

    // Force remove from all possible elements
    const allPossibleElements = document.querySelectorAll('[class*="drag-over"]')
    allPossibleElements.forEach(element => {
      element.classList.remove('drag-over')
    })
  }
}

// Show dialog to pick target column for moving a task
const showMoveColumnSheet = () => {
  const columns = sortedColumns.value
    .filter(col => col.id !== selectedTask.value?.status)
  if (!columns.length) return

  const options = columns.map(col => ({ label: col.name, value: col.id }))

  $q.dialog({
    title: 'ย้าย Task ไปคอลัมน์...',
    dark: true,
    options: {
      type: 'radio',
      model: options[0].value,
      items: options
    },
    cancel: { flat: true, label: 'ยกเลิก' },
    ok: { label: 'ย้าย', color: 'primary' },
    persistent: false
  }).onOk(targetColumnId => {
    handleMoveToColumn(selectedTask.value, targetColumnId)
  })
}

// Move task to a different column
const handleMoveToColumn = async (task, targetColumnId) => {
  if (!task || task.status === targetColumnId) return

  const sourceStatus = task.status

  try {
    await updateTaskSilently(task.id, {
      status: targetColumnId,
      updatedAt: new Date()
    })

    // Update UI
    const taskIndex = tasksStore.tasks.findIndex(t => t.id === task.id)
    if (taskIndex !== -1) {
      tasksStore.tasks[taskIndex].status = targetColumnId
      tasksStore.tasks[taskIndex].updatedAt = new Date()
    }

    // Log activity
    const fromColumn = sortedColumns.value.find(col => col.id === sourceStatus)
    const toColumn = sortedColumns.value.find(col => col.id === targetColumnId)
    const fromName = fromColumn?.name || sourceStatus
    const toName = toColumn?.name || targetColumnId

    try {
      await tasksStore.createActivity({
        taskId: task.id,
        text: `ย้าย Task จาก "${fromName}" ไป "${toName}"`,
        activityType: 'status_change',
        fromStatus: sourceStatus,
        toStatus: targetColumnId,
        userEmail: authStore.user.email,
        userName: authStore.user.displayName || authStore.user.email.split('@')[0]
      })
    } catch (activityError) {
      console.error('Error logging activity:', activityError)
    }

    $q.notify({
      type: 'positive',
      message: `ย้าย Task ไป "${toName}" สำเร็จ!`,
      position: 'top'
    })
  } catch (error) {
    console.error('Error moving task:', error)
    $q.notify({
      type: 'negative',
      message: `เกิดข้อผิดพลาดในการย้าย Task: ${error.message}`,
      position: 'top'
    })
  }
}

</script>

<style scoped>
/* Override Quasar heading sizes */
.text-h5 {
  font-size: 1.05rem !important;
}

.text-h6 {
  font-size: 0.875rem !important;
}

.project-page {
  background: transparent;
  min-height: 100vh;
}

/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  text-align: center;
}

/* No Project State */
.no-project-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 40px 20px;
}

/* Create Task Card */
.create-task-card {
  min-width: 600px;
  background: #f0f0f0;
  border: 1px solid #3a3b3e;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.card-header {
  background: linear-gradient(135deg, #242528, #242528);
  color: white;
  text-align: center;
  padding: 20px;
  border-radius: 16px 16px 0 0;
}

.card-header .text-h6 {
  color: white;
  font-weight: 800;
  margin: 0;
  font-size: 0.7rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card-body {
  padding: 30px;
  background-color: #f0f0f0;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}

.detail-field {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 8px;
}

.detail-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #9e9e9e;
  display: flex;
  align-items: center;
  letter-spacing: 0.02em;
}

.detail-label .q-icon {
  color: #5c9ce6;
}

.section-header {
  display: flex;
  align-items: center;
}

.section-title {
  font-size: 1rem;
  font-weight: 700;
  color: #cecfd2;
  letter-spacing: 0.01em;
}

.input-label {
  font-size: 0.7rem;
  font-weight: 700;
  color: #9e9e9e;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.custom-input .q-field__control {
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  min-height: 50px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.custom-input .q-field__control:hover {
  border-color: #cecfd2;
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 4px 12px rgba(206, 207, 210, 0.2);
}

.custom-input.q-field--focused .q-field__control {
  border-color: #cecfd2;
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 0 0 3px rgba(206, 207, 210, 0.2);
}

.custom-input .q-field__native {
  color: #FFFFFF;
  padding: 12px 16px;
  font-size: 0.7rem;
  font-weight: 500;
}

.custom-input .q-field__label {
  color: #E0E0E0;
  font-size: 0.65rem;
  font-weight: 600;
}

.custom-select .q-field__control {
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  min-height: 50px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.custom-select .q-field__control:hover {
  border-color: #cecfd2;
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 4px 12px rgba(206, 207, 210, 0.2);
}

.custom-select.q-field--focused .q-field__control {
  border-color: #cecfd2;
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 0 0 3px rgba(206, 207, 210, 0.2);
}

.custom-select .q-field__native {
  color: #FFFFFF;
  padding: 12px 16px;
  font-size: 0.7rem;
  font-weight: 500;
}

.custom-select .q-field__label {
  color: #E0E0E0;
  font-size: 0.65rem;
  font-weight: 600;
}

.cancel-btn {
  color: #6C757D !important;
  font-weight: 600;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  background: rgba(108, 117, 125, 0.1) !important;
  color: #495057 !important;
}

.create-btn {
  background: linear-gradient(135deg, #cecfd2, #cecfd2) !important;
  color: #18191a !important;
  font-weight: 700;
  padding: 8px 24px;
  border-radius: 8px;
  text-transform: none;
  box-shadow: 0 4px 12px rgba(206, 207, 210, 0.3);
  transition: all 0.3s ease;
  min-width: 80px;
}

.create-btn:hover {
  background: linear-gradient(135deg, #e0e1e4, #e0e1e4) !important;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(206, 207, 210, 0.4);
}

.create-btn:active {
  transform: translateY(0);
}

/* ===== Dialog Redesign System ===== */
.dialog-redesign {
  background: #1a1b1e;
  border: 1px solid rgba(58, 59, 62, 0.5);
  border-radius: 16px;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.6);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.dialog-create-task {
  width: 580px;
  max-height: 85vh;
}

.dialog-detail-task {
  width: 92vw;
  max-width: 1200px;
  max-height: 85vh;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-bottom: 1px solid rgba(58, 59, 62, 0.4);
  flex-shrink: 0;
}

.dialog-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.dialog-header-icon {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dialog-header-title {
  font-size: 0.92rem;
  font-weight: 700;
  color: #e0e1e4;
}

.dialog-header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.dialog-close-btn {
  width: 30px;
  height: 30px;
  border: none;
  background: transparent;
  color: #5a5b5e;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.dialog-close-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef5350;
}

.dialog-body {
  padding: 20px;
}

.dialog-body-scroll {
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}

.dialog-body-scroll::-webkit-scrollbar { width: 4px; }
.dialog-body-scroll::-webkit-scrollbar-thumb { background: rgba(58,59,62,0.4); border-radius: 2px; }

.dialog-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding: 14px 20px;
  border-top: 1px solid rgba(58, 59, 62, 0.4);
  flex-shrink: 0;
}

.dialog-btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 7px 18px;
  border: none;
  border-radius: 8px;
  background: #5c9ce6;
  color: #fff;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.dialog-btn-primary:hover:not(:disabled) {
  background: #6eabe9;
  box-shadow: 0 4px 14px rgba(92, 156, 230, 0.3);
}

.dialog-btn-primary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.dialog-btn-sm {
  padding: 5px 12px;
  font-size: 0.72rem;
}

.dialog-btn-secondary {
  padding: 7px 16px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #6b6c6f;
  font-size: 0.78rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.dialog-btn-secondary:hover:not(:disabled) {
  background: rgba(58, 59, 62, 0.3);
  color: #9e9e9e;
}

.dialog-btn-secondary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Field System */
.field-group {
  margin-bottom: 16px;
}

.field-group-full {
  grid-column: 1 / -1;
}

.field-label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.72rem;
  font-weight: 600;
  color: #6b6c6f;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
}

.field-label-icon {
  color: #5c9ce6;
}

.field-input :deep(.q-field__control) {
  background: #222326;
  border: 1px solid rgba(58, 59, 62, 0.5);
  border-radius: 8px;
  min-height: 38px;
}

.field-input :deep(.q-field__native) {
  color: #e0e1e4;
  font-size: 0.82rem;
}

.field-input :deep(.q-field__native)::placeholder {
  color: #4a4b4e;
}

.field-input :deep(.q-field__control):hover {
  border-color: #5a5b5e;
}

.field-input :deep(.q-field--focused .q-field__control),
.field-input:deep(.q-field--focused .q-field__control) {
  border-color: #5c9ce6;
  box-shadow: 0 0 0 2px rgba(92, 156, 230, 0.1);
}

.field-title :deep(.q-field__native) {
  font-size: 0.95rem !important;
  font-weight: 600;
}

.field-chip {
  background: rgba(92, 156, 230, 0.12) !important;
  color: #9ec5f0 !important;
  font-size: 0.72rem !important;
  border-radius: 6px !important;
}

.field-chip-avatar {
  background: rgba(92, 156, 230, 0.25) !important;
}

.field-meta-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 20px;
}

/* Priority Pills */
.priority-pills {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.priority-pill {
  padding: 5px 14px;
  border: 1px solid rgba(58, 59, 62, 0.5);
  border-radius: 20px;
  background: transparent;
  color: #6b6c6f;
  font-size: 0.72rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.priority-pill:hover {
  border-color: #5a5b5e;
  color: #9e9e9e;
}

.priority-pill-active {
  font-weight: 600;
  color: #fff;
}

.priority-pill-active.priority-low {
  background: rgba(76, 175, 80, 0.15);
  border-color: #4caf50;
  color: #66bb6a;
}

.priority-pill-active.priority-medium {
  background: rgba(255, 183, 77, 0.15);
  border-color: #ffb74d;
  color: #ffb74d;
}

.priority-pill-active.priority-high {
  background: rgba(255, 152, 0, 0.15);
  border-color: #ff9800;
  color: #ffa726;
}

.priority-pill-active.priority-urgent {
  background: rgba(239, 83, 80, 0.15);
  border-color: #ef5350;
  color: #ef5350;
}

/* Due Date Picker Button */
.due-date-picker-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border: 1px solid rgba(58, 59, 62, 0.5);
  border-radius: 8px;
  background: #222326;
  color: #9e9e9e;
  font-size: 0.78rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.due-date-picker-btn:hover {
  border-color: #5c9ce6;
  color: #5c9ce6;
}

.auto-adjust-link {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  border: none;
  background: none;
  color: #ffb74d;
  font-size: 0.7rem;
  cursor: pointer;
  padding: 0;
  transition: color 0.15s;
}

.auto-adjust-link:hover {
  color: #ffa726;
}

/* Field Notices */
.field-notice-warn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 6px;
  background: rgba(255, 183, 77, 0.08);
  color: #ffb74d;
  font-size: 0.72rem;
}

.field-notice-info {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 6px;
  background: rgba(92, 156, 230, 0.06);
  color: #7eadd8;
  font-size: 0.72rem;
}

.detail-progress-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.7rem;
  color: #6b6c6f;
}

.detail-progress-row .progress-percent {
  color: #4caf50;
  font-weight: 600;
}

/* Upload Button Redesign */
.attachment-upload-redesign {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border: 1px dashed rgba(58, 59, 62, 0.5);
  border-radius: 8px;
  background: transparent;
  color: #6b6c6f;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.15s ease;
  margin-top: 8px;
}

.attachment-upload-redesign:hover {
  border-color: rgba(92, 156, 230, 0.3);
  color: #5c9ce6;
  background: rgba(92, 156, 230, 0.04);
}

.attachment-hint {
  color: #3a3b3e;
  font-size: 0.65rem;
  margin-left: 4px;
}

/* Two-Column Detail Layout */
.detail-two-col {
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.detail-left {
  flex: 3;
  padding: 24px;
  border-right: 1px solid rgba(58, 59, 62, 0.3);
  background: #1a1b1e;
}

.detail-right {
  flex: 2;
  background: #151617;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.detail-right-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 20px;
  overflow: hidden;
}

.detail-right-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.82rem;
  font-weight: 600;
  color: #cecfd2;
  margin-bottom: 16px;
  flex-shrink: 0;
}

/* Comment Input Redesign */
.comment-input-redesign {
  margin-bottom: 16px;
  flex-shrink: 0;
}

.comment-input-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 8px;
  gap: 8px;
}

.mention-hint {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 0.65rem;
  color: #4a4b4e;
  margin-right: auto;
}

/* Contenteditable mention input */
.mention-input {
  min-height: 40px;
  max-height: 120px;
  overflow-y: auto;
  padding: 10px 12px;
  border: 1px solid rgba(92, 156, 230, 0.15);
  border-radius: 8px;
  background: rgba(24, 25, 27, 0.6);
  color: #b0b1b4;
  font-size: 0.8rem;
  line-height: 1.6;
  outline: none;
  word-break: break-word;
  white-space: pre-wrap;
  transition: border-color 0.25s ease, box-shadow 0.25s ease;
}

.mention-input:focus {
  border-color: rgba(92, 156, 230, 0.4);
  box-shadow: 0 0 0 2px rgba(92, 156, 230, 0.08);
}

.mention-input:empty::before {
  content: attr(data-placeholder);
  color: #4a4b4e;
  pointer-events: none;
}

.mention-input::-webkit-scrollbar { width: 3px; }
.mention-input::-webkit-scrollbar-thumb { background: rgba(58,59,62,0.4); border-radius: 2px; }

/* Inline mention chip (inside the input) */
.mention-chip-inline {
  display: inline-flex;
  align-items: center;
  padding: 1px 7px;
  margin: 0 1px;
  border-radius: 4px;
  background: rgba(92, 156, 230, 0.15);
  color: #5c9ce6;
  font-size: 0.78rem;
  font-weight: 600;
  vertical-align: baseline;
  user-select: all;
  cursor: default;
}

/* Mention dropdown */
.mention-dropdown {
  position: absolute;
  z-index: 100;
  min-width: 220px;
  max-width: 300px;
  background: #1e2023;
  border: 1px solid rgba(92, 156, 230, 0.2);
  border-radius: 10px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.45), 0 0 0 1px rgba(92,156,230,0.05);
  overflow: hidden;
  animation: mention-in 0.15s ease;
}

@keyframes mention-in {
  from { opacity: 0; transform: translateY(-6px); }
  to { opacity: 1; transform: translateY(0); }
}

.mention-dropdown-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  font-size: 0.68rem;
  font-weight: 600;
  color: #5c9ce6;
  background: rgba(92, 156, 230, 0.05);
  border-bottom: 1px solid rgba(255,255,255,0.04);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.mention-dropdown-list {
  max-height: 180px;
  overflow-y: auto;
  padding: 4px 0;
}

.mention-dropdown-list::-webkit-scrollbar { width: 3px; }
.mention-dropdown-list::-webkit-scrollbar-thumb { background: rgba(58,59,62,0.4); border-radius: 2px; }

.mention-dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  cursor: pointer;
  transition: background 0.15s ease;
}

.mention-dropdown-item:hover {
  background: rgba(92, 156, 230, 0.1);
}

.mention-item-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(92, 156, 230, 0.12);
  color: #5c9ce6;
  font-size: 0.7rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}

.mention-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.mention-item-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.mention-item-name {
  font-size: 0.78rem;
  font-weight: 600;
  color: #d0d1d4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mention-item-email {
  font-size: 0.65rem;
  color: #5a5b5e;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Mention highlight in displayed comments */
.comment-text :deep(.mention-highlight) {
  color: #5c9ce6;
  font-weight: 600;
  background: rgba(92, 156, 230, 0.1);
  padding: 1px 4px;
  border-radius: 3px;
  cursor: default;
}

/* Comments Feed */
.comments-feed {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.comments-feed::-webkit-scrollbar { width: 3px; }
.comments-feed::-webkit-scrollbar-thumb { background: rgba(58,59,62,0.3); border-radius: 2px; }

.comment-avatar {
  width: 30px;
  height: 30px;
  min-width: 30px;
  border-radius: 50%;
  background: rgba(58, 59, 62, 0.4);
  color: #6b6c6f;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.72rem;
  font-weight: 700;
  overflow: hidden;
}

.comment-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Create Subtask Card */
.create-subtask-card {
  min-width: 500px;
  background: #242528;
  border: 1px solid #3a3b3e;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.project-header {
  border-bottom: 1px solid rgba(44, 58, 69, 0.5);
}

.header-icon-btn {
  border-radius: 8px !important;
  transition: all 0.2s ease !important;
  opacity: 0.85;
}

.header-icon-btn:hover {
  opacity: 1;
  transform: translateY(-1px);
  background: rgba(255, 255, 255, 0.06) !important;
}

.kanban-container {
  overflow-x: auto;
}

.kanban-columns-row {
  flex-wrap: nowrap;
}

.kanban-column {
  min-width: 300px;
  background: rgba(36, 37, 40, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  border: 1px solid rgba(58, 59, 62, 0.5);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.kanban-column.is-dragging-column {
  opacity: 0.7 !important;
  transform: scale(1.02) rotate(2deg) !important;
  box-shadow: 0 12px 40px rgba(76, 175, 80, 0.4) !important;
  border: 2px solid #4CAF50 !important;
  z-index: 1000 !important;
  cursor: grabbing !important;
}

.column-header {
  padding: 16px;
  border-radius: 8px 8px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s ease;
  user-select: none;
  position: relative;
}

.column-header:hover {
  filter: brightness(1.05);
}

/* Column Drag Handle Styles */
.column-drag-handle {
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  cursor: grab;
  opacity: 0.3;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 10;
  color: rgba(255, 255, 255, 0.6);
}

.column-header:hover .column-drag-handle {
  opacity: 1;
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.4);
}

.column-drag-handle:hover {
  background: rgba(76, 175, 80, 0.3);
  border-color: rgba(76, 175, 80, 0.6);
  color: #fff;
  transform: translateY(-50%) scale(1.15);
  box-shadow: 0 0 12px rgba(76, 175, 80, 0.4);
}

.column-drag-handle:active {
  cursor: grabbing;
  background: rgba(76, 175, 80, 0.4);
  transform: translateY(-50%) scale(1.05);
  box-shadow: 0 0 8px rgba(76, 175, 80, 0.5);
}

.column-header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex: 1;
  padding-left: 40px;
}

.column-content {
  padding: 16px;
  min-height: 400px;
  transition: all 0.2s ease;
  background: var(--primary-bg);
}

.column-content.drag-over {
  background: rgba(206, 207, 210, 0.1);
  border: 2px dashed #cecfd2;
  border-radius: 8px;
  transform: scale(1.02);
}

.column-content.reordering {
  background: rgba(76, 175, 80, 0.05);
  border: 2px solid rgba(76, 175, 80, 0.2);
  border-radius: 8px;
}

.task-card {
  background: rgba(36, 37, 40, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(58, 59, 62, 0.5);
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 12px;
  position: relative;
}

.task-card:hover {
  border-color: #cecfd2;
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(206, 207, 210, 0.2);
}

.task-card.is-dragging {
  opacity: 0.5;
  transform: rotate(5deg);
  box-shadow: 0 8px 24px rgba(206, 207, 210, 0.3);
}

.task-card.drag-over {
  border: 2px dashed #4CAF50;
  background: rgba(76, 175, 80, 0.1);
  transform: scale(1.02);
  box-shadow: 0 4px 20px rgba(76, 175, 80, 0.3);
}

/* Expand hit area for task cards during drag */
.column-content.reordering .task-card {
  padding: 4px 0;
  margin-bottom: 16px;
}

.column-content.reordering .task-card:last-child {
  margin-bottom: 40px;
}

.add-task-btn {
  color: #9E9E9E;
  border: 2px dashed rgba(44, 58, 69, 0.5);
  margin-top: 8px;
}

.add-task-btn:hover {
  border-color: #cecfd2;
  color: #cecfd2;
}

.assigned-to {
  color: #cecfd2;
  display: flex;
  align-items: center;
  gap: 4px;
  border:1px solid;
  border-radius: 8px;
  padding:4px;
  font-size: 0.7rem;
}

/* Member Selection */
.member-selection {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
}

.member-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: all 0.2s ease;
}

.member-card:hover {
  background-color: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
}

.member-card.selected {
  background-color: rgba(206, 207, 210, 0.2);
  border-color: #cecfd2;
}

.member-info {
  flex: 1;
}

.member-name {
  font-size: 0.6rem;
  font-weight: 500;
  color: #FFFFFF;
}

.member-email {
  font-size: 0.55rem;
  color: #B0BEC5;
}

.text-primary {
  color: #cecfd2;
}

.text-secondary {
  color: #9E9E9E;
}

.bg-surface {
  background: rgba(36, 37, 40, 0.9);
  backdrop-filter: blur(10px);
}

.create-task-card,
.create-subtask-card {
  min-width: 500px;
  background: rgba(36, 37, 40, 0.9);
  backdrop-filter: blur(10px);
}

.create-column-card {
  min-width: 420px;
  max-width: 480px;
  background: #1e2124 !important;
  border: 1px solid rgba(44, 58, 69, 0.5);
  border-radius: 14px !important;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5) !important;
}

.task-detail-card {
  min-width: 500px;
  background: rgba(26, 34, 44, 0.95) !important;
  backdrop-filter: blur(15px) !important;
  border: 1px solid rgba(44, 58, 69, 0.6) !important;
  border-radius: 16px !important;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4) !important;
}

/* Task Detail Card Wide (2-Column Layout) */
.task-detail-card-wide {
  min-width: 1000px;
  max-width: 1200px;
  width: 90vw;
  background: #18191a !important;
  border: 1px solid #3a3b3e !important;
  border-radius: 16px !important;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.7) !important;
  overflow: hidden;
}

.task-detail-body {
  padding: 0 !important;
}

.task-details-column {
  border-right: 1px solid #3a3b3e;
  padding: 32px !important;
  max-height: 70vh;
  overflow-y: auto;
  background: #18191a;
}

.task-details-column::-webkit-scrollbar {
  width: 6px;
}

.task-details-column::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 3px;
}

.task-details-column::-webkit-scrollbar-thumb {
  background: #3a3b3e;
  border-radius: 3px;
}

.task-details-column::-webkit-scrollbar-thumb:hover {
  background: #5a5b5e;
}

.comments-column {
  padding: 32px !important;
  display: flex;
  flex-direction: column;
  max-height: 70vh;
  background: #111213 !important;
}

.comments-section-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* Task Detail Dialog Specific Styles */
.task-detail-card .custom-input .q-field__control {
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  min-height: 50px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.task-detail-card .custom-input .q-field__control:hover {
  border-color: #cecfd2;
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 6px 16px rgba(0, 191, 166, 0.3);
}

.task-detail-card .custom-input.q-field--focused .q-field__control {
  border-color: #cecfd2;
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 0 0 3px rgba(0, 191, 166, 0.3);
}

.task-detail-card .custom-input .q-field__native {
  color: #FFFFFF;
  padding: 12px 16px;
  font-size: 0.7rem;
  font-weight: 500;
}

.task-detail-card .custom-input .q-field__label {
  color: #B0BEC5;
  font-size: 0.65rem;
  font-weight: 600;
}

.task-detail-card .custom-select .q-field__control {
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  min-height: 50px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.task-detail-card .custom-select .q-field__control:hover {
  border-color: #cecfd2;
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 6px 16px rgba(0, 191, 166, 0.3);
}

.task-detail-card .custom-select.q-field--focused .q-field__control {
  border-color: #cecfd2;
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 0 0 3px rgba(0, 191, 166, 0.3);
}

.task-detail-card .custom-select .q-field__native {
  color: #FFFFFF;
  padding: 12px 16px;
  font-size: 0.7rem;
  font-weight: 500;
}

.task-detail-card .custom-select .q-field__label {
  color: #B0BEC5;
  font-size: 0.65rem;
  font-weight: 600;
}

.task-detail-card .priority-btn {
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.05);
  color: #B0BEC5;
}

.task-detail-card .priority-btn.selected {
  border: 1px solid #cecfd2;
  background: rgba(0, 191, 166, 0.2);
  color: #FFFFFF;
  box-shadow: 0 4px 12px rgba(0, 191, 166, 0.3);
}

.task-detail-card .due-date-btn {
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.05);
  color: #B0BEC5;
}

.task-detail-card .due-date-btn:hover {
  border: 1px solid #cecfd2;
  background: rgba(0, 191, 166, 0.1);
  color: #cecfd2;
}

.task-detail-card .text-primary {
  color: #cecfd2 !important;
}

.task-detail-card .text-secondary {
  color: #B0BEC5 !important;
}

/* Column Dialog Styles */
.column-dialog-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #cecfd2;
}

.column-field-label {
  display: block;
  font-size: 0.78rem;
  font-weight: 600;
  color: #9ca3af;
  margin-bottom: 6px;
}

.column-dialog-input :deep(.q-field__control) {
  background: rgba(30, 33, 36, 0.8) !important;
  border-color: rgba(58, 59, 62, 0.5) !important;
  border-radius: 8px !important;
}

.column-dialog-input :deep(.q-field__control:hover) {
  border-color: rgba(92, 156, 230, 0.3) !important;
}

.column-dialog-input :deep(.q-field__control.q-field__control--focused) {
  border-color: #5c9ce6 !important;
}

.column-dialog-input :deep(.q-field__native) {
  color: #cecfd2 !important;
  font-size: 0.85rem !important;
}

.column-dialog-input :deep(.q-field__native::placeholder) {
  color: #4b5563 !important;
}

.column-color-picker {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 4px;
}

.column-color-dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
  display: flex;
  align-items: center;
  justify-content: center;
}

.column-color-dot:hover {
  transform: scale(1.15);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.column-color-selected {
  border-color: #fff !important;
  transform: scale(1.15);
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.15), 0 2px 8px rgba(0, 0, 0, 0.3);
}

.column-preview {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 8px;
  background: rgba(30, 33, 36, 0.6);
  border: 1px solid rgba(44, 58, 69, 0.3);
}

.column-preview-bar {
  width: 4px;
  height: 22px;
  border-radius: 2px;
  transition: background 0.2s;
}

.column-preview-name {
  font-size: 0.82rem;
  font-weight: 600;
  color: #cecfd2;
}

.column-cancel-btn {
  color: #6b6c6f !important;
  font-size: 0.8rem !important;
  border-radius: 8px !important;
}

.column-cancel-btn:hover {
  background: rgba(58, 59, 62, 0.3) !important;
  color: #9ca3af !important;
}

.column-create-btn {
  background: rgba(92, 156, 230, 0.15) !important;
  color: #5c9ce6 !important;
  font-size: 0.8rem !important;
  font-weight: 600 !important;
  border-radius: 8px !important;
  border: 1px solid rgba(92, 156, 230, 0.2) !important;
}

.column-create-btn:hover {
  background: rgba(92, 156, 230, 0.25) !important;
}

.column-create-btn.disabled {
  opacity: 0.4 !important;
}

/* Column Drop Indicators */
.drop-target-left {
  position: relative;
}

.drop-target-left::before {
  content: '';
  position: absolute;
  left: -12px;
  top: 0;
  bottom: 0;
  width: 6px;
  background: linear-gradient(180deg, #4CAF50, #66BB6A);
  border-radius: 3px;
  box-shadow: 0 0 12px rgba(76, 175, 80, 0.8), 0 2px 8px rgba(76, 175, 80, 0.4);
  animation: pulse-line 1s ease-in-out infinite;
  z-index: 100;
}

.drop-target-right {
  position: relative;
}

.drop-target-right::after {
  content: '';
  position: absolute;
  right: -12px;
  top: 0;
  bottom: 0;
  width: 6px;
  background: linear-gradient(180deg, #4CAF50, #66BB6A);
  border-radius: 3px;
  box-shadow: 0 0 12px rgba(76, 175, 80, 0.8), 0 2px 8px rgba(76, 175, 80, 0.4);
  animation: pulse-line 1s ease-in-out infinite;
  z-index: 100;
}

/* Drag and Drop Visual Indicators */
.is-dragging {
  opacity: 0.7 !important;
  transform: scale(1.02) rotate(3deg) !important;
  box-shadow: 0 12px 40px rgba(76, 175, 80, 0.4) !important;
  cursor: grabbing !important;
  border: 2px solid #4CAF50 !important;
  z-index: 1000 !important;
}

.drop-indicator-top {
  position: relative;
}

.drop-indicator-top::before {
  content: '';
  position: absolute;
  top: -10px;
  left: -8px;
  right: -8px;
  height: 12px;
  background: linear-gradient(90deg, #4CAF50, #66BB6A);
  border-radius: 6px;
  box-shadow: 0 0 20px rgba(76, 175, 80, 1), 0 4px 16px rgba(76, 175, 80, 0.6);
  animation: pulse-line 1s ease-in-out infinite;
  z-index: 100;
  pointer-events: none;
}

.drop-indicator-bottom {
  position: relative;
}

.drop-indicator-bottom::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: -8px;
  right: -8px;
  height: 12px;
  background: linear-gradient(90deg, #4CAF50, #66BB6A);
  border-radius: 6px;
  box-shadow: 0 0 20px rgba(76, 175, 80, 1), 0 4px 16px rgba(76, 175, 80, 0.6);
  animation: pulse-line 1s ease-in-out infinite;
  z-index: 100;
  pointer-events: none;
}

@keyframes pulse-line {
  0%, 100% {
    opacity: 0.8;
    transform: scale(1);
    box-shadow: 0 0 16px rgba(76, 175, 80, 0.7), 0 4px 16px rgba(76, 175, 80, 0.4);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
    box-shadow: 0 0 28px rgba(76, 175, 80, 1), 0 6px 24px rgba(76, 175, 80, 0.6);
  }
}

.column-content.drag-over {
  background: rgba(76, 175, 80, 0.1) !important;
  border: 2px dashed #4CAF50 !important;
  box-shadow: 0 0 20px rgba(76, 175, 80, 0.3) !important;
}

/* Add Column Button */
.add-column-container {
  min-width: 300px;
  display: flex;
  align-items: flex-start;
  padding-top: 16px;
}

.add-column-btn {
  background: rgba(36, 37, 40, 0.9);
  backdrop-filter: blur(10px);
  border: 2px dashed rgba(58, 59, 62, 0.5);
  border-radius: 8px;
  color: #9E9E9E;
  padding: 16px;
  min-height: 60px;
  width: 100%;
  transition: all 0.2s ease;
}

.add-column-btn:hover {
  border-color: #cecfd2;
  color: #cecfd2;
  background: rgba(206, 207, 210, 0.1);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(206, 207, 210, 0.2);
}

/* Empty State */
.empty-columns-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 40px;
  background: rgba(26, 28, 30, 0.7);
  backdrop-filter: blur(10px);
  border: 1px dashed rgba(58, 59, 62, 0.5);
  border-radius: 16px;
  margin: 40px auto;
  max-width: 420px;
}

.empty-state-icon-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(92, 156, 230, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.empty-state-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: #cecfd2;
  margin-bottom: 8px;
}

.empty-state-subtitle {
  font-size: 0.82rem;
  color: #6b6c6f;
  margin-bottom: 28px;
  text-align: center;
  line-height: 1.5;
}

.empty-state-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  border-radius: 10px;
  border: 1px solid rgba(92, 156, 230, 0.25);
  background: rgba(92, 156, 230, 0.1);
  color: #5c9ce6;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.empty-state-btn:hover {
  background: rgba(92, 156, 230, 0.2);
  border-color: rgba(92, 156, 230, 0.4);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(92, 156, 230, 0.15);
}

/* Task Toolbar */
.task-toolbar {
  background: #242528;
  border-bottom: 1px solid #3a3b3e;
  border-radius: 16px 16px 0 0;
  padding: 16px 24px;
}

.toolbar-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #cecfd2;
  letter-spacing: 0.01em;
}

.toolbar-action-btn {
  color: #9e9e9e !important;
  transition: all 0.2s ease;
}

.toolbar-action-btn:hover {
  color: #cecfd2 !important;
  background: rgba(92, 156, 230, 0.08) !important;
}

.toolbar-close-btn {
  color: #6b6c6f !important;
  transition: all 0.2s ease;
}

.toolbar-close-btn:hover {
  color: #cecfd2 !important;
  background: rgba(239, 68, 68, 0.15) !important;
}

.dropdown-menu-list {
  background: #242528 !important;
  border: 1px solid #3a3b3e;
}

.toolbar-section {
  margin-right: 16px;
}

.status-select .q-field__control {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.3);
  min-height: 36px;
}

.status-select .q-field__native {
  color: #242528;
  font-weight: 600;
}

.status-select .q-field__label {
  color: #242528;
  font-weight: 600;
}

/* Compact Form Styles */
.title-input .q-field__native {
  font-size: 0.95rem !important;
  font-weight: 600;
  color: #cecfd2 !important;
}

.compact-select .q-field__control {
  min-height: 40px;
}

.priority-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.priority-btn {
  min-width: 70px;
  font-size: 0.7rem;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.2s ease;
  border: 1px solid #3a3b3e !important;
  font-weight: 500;
}

.priority-btn.selected {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  border-color: transparent !important;
  font-weight: 600;
}

.due-date-btn {
  min-width: 140px;
  font-size: 0.7rem;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.2s ease;
  border: 1px solid #3a3b3e !important;
}

.due-date-btn:hover {
  transform: scale(1.02);
  border-color: #5c9ce6 !important;
  box-shadow: 0 0 0 1px rgba(92, 156, 230, 0.15);
}

/* ===== Date Picker Dialog Redesign ===== */
.datepicker-dialog-redesign {
  background: #1e2124;
  border: 1px solid rgba(58, 59, 62, 0.5);
  border-radius: 14px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  min-width: 320px;
}

.datepicker-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(58, 59, 62, 0.3);
  color: #5c9ce6;
  font-size: 0.88rem;
  font-weight: 600;
}

.datepicker-header span {
  color: #e0e1e4;
}

.datepicker-body {
  padding: 8px 12px;
  display: flex;
  justify-content: center;
}

.datepicker-calendar {
  background: transparent !important;
  box-shadow: none !important;
  width: 100%;
  max-width: 320px;
}

.datepicker-calendar :deep(.q-date__header) {
  display: none;
}

.datepicker-calendar :deep(.q-date__view) {
  padding: 0;
}

.datepicker-calendar :deep(.q-date__navigation) {
  padding: 4px 0;
}

.datepicker-calendar :deep(.q-date__navigation .q-btn) {
  color: #cecfd2 !important;
}

.datepicker-calendar :deep(.q-date__calendar-weekdays > div) {
  color: #5a5b5e;
  font-size: 0.72rem;
  font-weight: 600;
}

.datepicker-calendar :deep(.q-date__calendar-item .q-btn) {
  color: #cecfd2 !important;
  font-weight: 400;
}

.datepicker-calendar :deep(.q-date__calendar-item .q-btn:hover) {
  background: rgba(92, 156, 230, 0.1) !important;
  color: #fff !important;
}

.datepicker-calendar :deep(.q-date__calendar-item .q-btn--unelevated) {
  background: #5c9ce6 !important;
  color: #fff !important;
  font-weight: 600;
  border-radius: 8px;
}

.datepicker-calendar :deep(.q-date__calendar-item--out .q-btn) {
  color: #3a3b3e !important;
}

.datepicker-calendar :deep(.q-date__today) {
  border: 1px solid rgba(92, 156, 230, 0.4);
  border-radius: 8px;
}

.datepicker-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-top: 1px solid rgba(58, 59, 62, 0.3);
  gap: 12px;
}

.datepicker-selected {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.75rem;
  font-weight: 500;
  color: #5c9ce6;
  background: rgba(92, 156, 230, 0.08);
  padding: 4px 10px;
  border-radius: 6px;
}

.datepicker-no-date {
  color: #5a5b5e;
  background: rgba(58, 59, 62, 0.2);
}

.datepicker-btns {
  display: flex;
  gap: 6px;
}

.datepicker-btn-clear {
  padding: 5px 12px;
  border: none;
  border-radius: 6px;
  background: rgba(239, 83, 80, 0.1);
  color: #ef5350;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.datepicker-btn-clear:hover {
  background: rgba(239, 83, 80, 0.2);
}

.datepicker-btn-cancel {
  padding: 5px 14px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #6b6c6f;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.datepicker-btn-cancel:hover {
  background: rgba(58, 59, 62, 0.3);
  color: #9e9e9e;
}

.datepicker-btn-confirm {
  padding: 5px 18px;
  border: none;
  border-radius: 6px;
  background: #5c9ce6;
  color: #fff;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.datepicker-btn-confirm:hover {
  background: #6eabe9;
  box-shadow: 0 2px 10px rgba(92, 156, 230, 0.3);
}

/* Comments & Activity Styles */
.comment-input-section {
  border-bottom: 1px solid #3a3b3e;
  padding-bottom: 16px;
  margin-bottom: 16px;
}

.comment-input .q-field__control {
  background: #242528 !important;
  border: 1px solid #3a3b3e !important;
  border-radius: 10px;
  min-height: 60px;
}

.comment-input .q-field__control:hover {
  border-color: #5a5b5e !important;
  background: #242528 !important;
}

.comment-input.q-field--focused .q-field__control {
  border-color: #5c9ce6 !important;
  background: #242528 !important;
  box-shadow: 0 0 0 2px rgba(92, 156, 230, 0.15) !important;
}

.comment-input .q-field__native {
  color: #cecfd2 !important;
  padding: 12px;
  font-size: 0.8rem;
}

.comment-submit-btn {
  background: #cecfd2 !important;
  color: #18191a !important;
  font-weight: 600;
  border-radius: 8px;
  padding: 6px 20px;
  text-transform: none;
  font-size: 0.75rem;
  transition: all 0.2s ease;
}

.comment-submit-btn:hover {
  background: #e0e1e4 !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(206, 207, 210, 0.3);
}

.comment-submit-btn:disabled {
  opacity: 0.3;
  background: #3a3b3e !important;
  color: #6b6c6f !important;
}

.comments-list {
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
  margin-top: 8px;
}

.comments-list::-webkit-scrollbar {
  width: 5px;
}

.comments-list::-webkit-scrollbar-track {
  background: transparent;
}

.comments-list::-webkit-scrollbar-thumb {
  background: #3a3b3e;
  border-radius: 3px;
}

.comments-list::-webkit-scrollbar-thumb:hover {
  background: #5a5b5e;
}

.comment-item {
  display: flex;
  gap: 12px;
  padding: 14px 12px;
  border-radius: 10px;
  margin-bottom: 4px;
  transition: background 0.2s ease;
  animation: fadeInUp 0.3s ease;
}

.comment-item:hover {
  background: rgba(58, 59, 62, 0.3);
}

.comment-item:last-child {
  border-bottom: none;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.comment-author {
  font-weight: 600;
  color: #cecfd2;
  font-size: 0.8rem;
}

.comment-time {
  font-size: 0.7rem;
  color: #6b6c6f;
}

.comment-text {
  color: #b0b1b4;
  font-size: 0.8rem;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

.comment-text :deep(.comment-link) {
  color: #5c9ce6;
  text-decoration: none;
  border-bottom: 1px solid rgba(92, 156, 230, 0.3);
  transition: all 0.2s ease;
  word-break: break-all;
}

.comment-text :deep(.comment-link:hover) {
  color: #7ab4f5;
  border-bottom-color: #7ab4f5;
  text-shadow: 0 0 8px rgba(92, 156, 230, 0.25);
}

/* Activity Items */
.activity-item {
  display: flex;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  margin-bottom: 4px;
  transition: background 0.2s ease;
  animation: fadeInUp 0.3s ease;
  align-items: flex-start;
}

.activity-item:hover {
  background: rgba(58, 59, 62, 0.2);
}

.activity-icon-wrapper {
  width: 36px;
  height: 36px;
  min-width: 36px;
  border-radius: 50%;
  background: rgba(92, 156, 230, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #5c9ce6;
}

.activity-icon {
  color: inherit;
}

.activity-icon-created {
  background: rgba(76, 175, 80, 0.12) !important;
  color: #4caf50 !important;
}

.activity-icon-moved {
  background: rgba(92, 156, 230, 0.12) !important;
  color: #5c9ce6 !important;
}

.activity-icon-deleted {
  background: rgba(239, 83, 80, 0.12) !important;
  color: #ef5350 !important;
}

.activity-icon-restored {
  background: rgba(255, 213, 79, 0.12) !important;
  color: #ffd54f !important;
}

.activity-content {
  flex: 1;
}

.activity-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 4px;
}

.activity-user {
  font-weight: 600;
  color: #9ca3af;
  font-size: 0.78rem;
}

.activity-time {
  font-size: 0.7rem;
  color: #6b6c6f;
}

.activity-text {
  color: #8b8d91;
  font-size: 0.78rem;
  line-height: 1.5;
}

.activity-badges {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 5px;
}

.activity-badge-from {
  background: rgba(107, 114, 128, 0.25) !important;
  color: #9ca3af !important;
  font-size: 0.7rem !important;
  padding: 2px 8px !important;
  border-radius: 4px !important;
}

.activity-badge-to {
  background: rgba(92, 156, 230, 0.15) !important;
  color: #5c9ce6 !important;
  font-size: 0.7rem !important;
  padding: 2px 8px !important;
  border-radius: 4px !important;
}

.no-comments {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  height: 100%;
}

/* Attachments Section */
.attachments-section {
  border-top: 1px solid rgba(44, 58, 69, 0.3);
  padding-top: 16px;
}

.attachment-upload-btn {
  color: #ffa726 !important;
  font-size: 0.78rem !important;
  border: 1px dashed rgba(255, 167, 38, 0.3) !important;
  border-radius: 8px !important;
  padding: 6px 14px !important;
  transition: all 0.2s ease !important;
}

.attachment-upload-btn:hover {
  border-color: rgba(255, 167, 38, 0.6) !important;
  background: rgba(255, 167, 38, 0.06) !important;
}

.attachment-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 8px;
  background: rgba(30, 33, 36, 0.6);
  border: 1px solid rgba(44, 58, 69, 0.25);
  transition: all 0.2s ease;
}

.attachment-item:hover {
  background: rgba(44, 58, 69, 0.3);
  border-color: rgba(44, 58, 69, 0.5);
}

.attachment-preview {
  width: 40px;
  height: 40px;
  min-width: 40px;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
}

.attachment-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.attachment-info {
  flex: 1;
  overflow: hidden;
}

.attachment-name {
  font-size: 0.78rem;
  color: #cecfd2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.attachment-link {
  color: #cecfd2;
  text-decoration: none;
  transition: color 0.2s;
}

.attachment-link:hover {
  color: #5c9ce6;
}

.attachment-size {
  font-size: 0.68rem;
  color: #6b6c6f;
}

.attachment-meta {
  display: flex;
  gap: 8px;
  align-items: center;
}

.attachment-uploader {
  font-size: 0.65rem;
  color: #4b5563;
}

.attachment-actions {
  display: flex;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.2s;
}

.attachment-item:hover .attachment-actions {
  opacity: 1;
}

.attachment-uploading {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 8px;
  background: rgba(92, 156, 230, 0.06);
  border: 1px solid rgba(92, 156, 230, 0.15);
  margin-bottom: 6px;
}

.no-attachments {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  text-align: center;
}

.no-comments-text {
  font-size: 0.85rem;
  color: #6b6c6f;
}

/* Apply styles to wide layout */
.task-detail-card-wide .custom-input .q-field__control {
  background: #242528;
  border: 1px solid #3a3b3e;
  border-radius: 10px;
  min-height: 44px;
  transition: all 0.2s ease;
}

.task-detail-card-wide .custom-input .q-field__control:hover {
  border-color: #5a5b5e;
  background: #242528;
}

.task-detail-card-wide .custom-input.q-field--focused .q-field__control {
  border-color: #5c9ce6;
  background: #242528;
  box-shadow: 0 0 0 2px rgba(92, 156, 230, 0.15);
}

.task-detail-card-wide .custom-input .q-field__native {
  color: #cecfd2;
  padding: 10px 14px;
  font-size: 0.85rem;
  font-weight: 400;
}

.task-detail-card-wide .custom-input .q-field__label {
  color: #9e9e9e;
  font-size: 0.8rem;
  font-weight: 500;
}

/* Due Date Warning & Info Styles */
.due-date-warning {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: rgba(245, 158, 11, 0.08);
  border: 1px solid rgba(245, 158, 11, 0.25);
  border-radius: 10px;
  font-size: 0.75rem;
  animation: fadeInUp 0.3s ease;
}

.due-date-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: rgba(206, 207, 210, 0.04);
  border: 1px solid rgba(206, 207, 210, 0.15);
  border-radius: 10px;
  font-size: 0.75rem;
  animation: fadeInUp 0.3s ease;
}

.subtask-progress-info {
  padding: 10px 14px;
  background: #242528;
  border-radius: 10px;
  border: 1px solid #3a3b3e;
}

.progress-label {
  font-size: 0.75rem;
  color: #9e9e9e;
  font-weight: 500;
}

.progress-percent {
  font-size: 0.8rem;
  color: #4caf50;
  font-weight: 700;
}

.subtask-progress-bar {
  border-radius: 6px;
  overflow: hidden;
}

.subtask-progress-bar :deep(.q-linear-progress__track) {
  background: #3a3b3e !important;
  opacity: 1 !important;
}

.subtask-progress-bar :deep(.q-linear-progress__model) {
  background: linear-gradient(90deg, #388e3c, #4caf50) !important;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
  transition: width 0.5s ease;
}

.auto-adjust-btn {
  border: 1px solid rgba(255, 152, 0, 0.3);
  background: rgba(255, 152, 0, 0.1);
  transition: all 0.3s ease;
}

.auto-adjust-btn:hover {
  border: 1px solid rgba(255, 152, 0, 0.5);
  background: rgba(255, 152, 0, 0.2);
  transform: translateY(-1px);
}

.text-warning {
  color: #FF9800 !important;
}

/* ===== Subtask Section Redesign ===== */
.subtasks-section-redesign {
  border-top: 1px solid rgba(58, 59, 62, 0.4);
  padding-top: 16px;
}

.subtask-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.subtask-section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #4caf50;
  font-size: 0.85rem;
  font-weight: 600;
}

.subtask-section-title span {
  color: #cecfd2;
}

.subtask-counter {
  font-size: 0.72rem;
  font-weight: 600;
  color: #6b6c6f;
  background: rgba(58, 59, 62, 0.3);
  padding: 2px 10px;
  border-radius: 10px;
}

/* Progress Bar */
.subtask-progress-bar {
  height: 3px;
  background: rgba(58, 59, 62, 0.3);
  border-radius: 2px;
  margin-bottom: 12px;
  overflow: hidden;
}

.subtask-progress-fill {
  height: 100%;
  background: #4caf50;
  border-radius: 2px;
  transition: width 0.4s ease;
}

/* Subtask List */
.subtask-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

/* Subtask Row (Display Mode) */
.subtask-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 8px;
  border-radius: 8px;
  transition: background 0.15s ease;
}

.subtask-row:hover {
  background: rgba(58, 59, 62, 0.2);
}

.subtask-row:hover .subtask-actions-row {
  opacity: 1;
}

.subtask-checkbox {
  flex-shrink: 0;
}

.subtask-body {
  flex: 1;
  min-width: 0;
  cursor: pointer;
}

.subtask-title {
  font-size: 0.82rem;
  font-weight: 500;
  color: #cecfd2;
  line-height: 1.3;
}

.subtask-done .subtask-title {
  text-decoration: line-through;
  color: #5a5b5e;
}

.subtask-desc {
  font-size: 0.7rem;
  color: #6b6c6f;
  margin-top: 2px;
}

.subtask-done .subtask-desc {
  text-decoration: line-through;
  color: #4a4b4e;
}

.subtask-tags {
  display: flex;
  gap: 6px;
  margin-top: 4px;
  flex-wrap: wrap;
}

.subtask-tag {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 0.65rem;
  color: #6b6c6f;
  background: rgba(58, 59, 62, 0.25);
  padding: 1px 7px;
  border-radius: 4px;
}

/* Action Icons on Row */
.subtask-actions-row {
  display: flex;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.15s ease;
  flex-shrink: 0;
}

.subtask-action-icon {
  width: 26px;
  height: 26px;
  border: none;
  background: transparent;
  color: #6b6c6f;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.subtask-action-icon:hover {
  background: rgba(92, 156, 230, 0.1);
  color: #5c9ce6;
}

.subtask-action-delete:hover {
  background: rgba(239, 83, 80, 0.1);
  color: #ef5350;
}

/* Inline Form (Create / Edit) */
.subtask-inline-form {
  background: rgba(30, 31, 34, 0.8);
  border: 1px solid rgba(58, 59, 62, 0.5);
  border-radius: 10px;
  padding: 12px;
  margin-top: 6px;
  margin-bottom: 6px;
  animation: subtaskFadeIn 0.2s ease;
}

@keyframes subtaskFadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

.subtask-form-input {
  margin-bottom: 10px;
}

.subtask-form-input :deep(.q-field__control) {
  background: #18191a;
  border: 1px solid rgba(58, 59, 62, 0.5);
  border-radius: 8px;
  min-height: 38px;
}

.subtask-form-input :deep(.q-field__native) {
  color: #e0e1e4;
  font-size: 0.82rem;
}

.subtask-form-input :deep(.q-field__native)::placeholder {
  color: #5a5b5e;
}

.subtask-form-input :deep(.q-field__control):hover {
  border-color: #5a5b5e;
}

.subtask-form-input :deep(.q-field--focused .q-field__control) {
  border-color: #5c9ce6;
  box-shadow: 0 0 0 2px rgba(92, 156, 230, 0.12);
}

/* Form Action Bar */
.subtask-form-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.subtask-form-bar-left {
  display: flex;
  gap: 6px;
}

.subtask-form-bar-right {
  display: flex;
  gap: 2px;
}

.subtask-btn-save {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 14px;
  border: none;
  border-radius: 6px;
  background: #5c9ce6;
  color: #fff;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.subtask-btn-save:hover {
  background: #6eabe9;
  box-shadow: 0 2px 8px rgba(92, 156, 230, 0.3);
}

.subtask-btn-cancel {
  padding: 5px 12px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #6b6c6f;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.subtask-btn-cancel:hover {
  background: rgba(58, 59, 62, 0.3);
  color: #9e9e9e;
}

.subtask-form-icon-btn {
  width: 30px;
  height: 30px;
  border: none;
  background: transparent;
  color: #5a5b5e;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.subtask-form-icon-btn:hover {
  background: rgba(58, 59, 62, 0.3);
  color: #9e9e9e;
}

/* Add Subtask Button */
.add-subtask-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
  padding: 7px 14px;
  border: 1px dashed rgba(58, 59, 62, 0.5);
  border-radius: 8px;
  background: transparent;
  color: #6b6c6f;
  font-size: 0.78rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-subtask-btn:hover {
  border-color: rgba(92, 156, 230, 0.3);
  color: #5c9ce6;
  background: rgba(92, 156, 230, 0.05);
}

.icon-action-btn {
  transition: all 0.2s ease;
  color: #6b6c6f !important;
}

.icon-action-btn:hover {
  background: rgba(92, 156, 230, 0.1) !important;
  color: #5c9ce6 !important;
}

/* ===== Assign Dialog Redesign ===== */
.assign-dialog-redesign {
  background: #1e2124;
  border: 1px solid rgba(58, 59, 62, 0.5);
  border-radius: 14px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5);
  min-width: 320px;
  max-width: 400px;
  overflow: hidden;
}

.assign-dialog-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(58, 59, 62, 0.3);
  color: #5c9ce6;
  font-size: 0.88rem;
  font-weight: 600;
}

.assign-dialog-header span {
  color: #e0e1e4;
}

.assign-dialog-body {
  padding: 8px;
}

.assign-member-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-height: 320px;
  overflow-y: auto;
}

.assign-member-list::-webkit-scrollbar {
  width: 3px;
}

.assign-member-list::-webkit-scrollbar-thumb {
  background: rgba(58, 59, 62, 0.5);
  border-radius: 2px;
}

.assign-member-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.assign-member-row:hover {
  background: rgba(58, 59, 62, 0.25);
}

.assign-member-selected {
  background: rgba(92, 156, 230, 0.08);
}

.assign-member-selected:hover {
  background: rgba(92, 156, 230, 0.12);
}

.assign-avatar {
  width: 34px;
  height: 34px;
  min-width: 34px;
  border-radius: 50%;
  background: rgba(58, 59, 62, 0.4);
  color: #6b6c6f;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  transition: all 0.15s ease;
  overflow: hidden;
}

.assign-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.assign-avatar-active {
  background: rgba(92, 156, 230, 0.15);
  color: #5c9ce6;
}

.assign-member-info {
  flex: 1;
  min-width: 0;
}

.assign-member-name {
  font-size: 0.82rem;
  font-weight: 500;
  color: #e0e1e4;
  line-height: 1.2;
}

.assign-member-selected .assign-member-name {
  color: #fff;
  font-weight: 600;
}

.assign-member-email {
  font-size: 0.68rem;
  color: #5a5b5e;
  margin-top: 1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.assign-check {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #5c9ce6;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  animation: assignCheckPop 0.2s ease;
}

@keyframes assignCheckPop {
  0% { transform: scale(0); }
  70% { transform: scale(1.15); }
  100% { transform: scale(1); }
}

.assign-dialog-footer {
  padding: 12px 16px;
  border-top: 1px solid rgba(58, 59, 62, 0.3);
  display: flex;
  justify-content: flex-end;
}

.assign-close-btn {
  padding: 6px 20px;
  border: none;
  border-radius: 8px;
  background: #5c9ce6;
  color: #fff;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.assign-close-btn:hover {
  background: #6eabe9;
  box-shadow: 0 2px 10px rgba(92, 156, 230, 0.3);
}

/* Mobile responsive kanban */
@media (max-width: 599px) {
  .kanban-container {
    padding: 8px !important;
    overflow-x: visible;
  }

  .kanban-columns-row {
    flex-wrap: wrap !important;
    flex-direction: column !important;
    margin: 0 !important;
    gap: 12px;
  }

  .kanban-columns-row > .kanban-column {
    min-width: 0 !important;
    width: 100% !important;
    flex: none !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  .column-header {
    padding: 10px 12px;
  }

  .column-header-content {
    padding-left: 0;
  }

  .column-header-content .text-h6 {
    font-size: 0.82rem !important;
  }

  .column-content {
    padding: 8px;
    min-height: 0;
  }

  .project-header-row {
    flex-direction: column;
    gap: 8px;
  }

  .project-header-row .text-h5 {
    font-size: 0.95rem !important;
  }

  .project-header-row .text-subtitle2 {
    font-size: 0.72rem !important;
  }

  .header-icon-btn {
    padding: 4px !important;
    min-height: 32px !important;
    min-width: 32px !important;
  }

  /* Task Detail Dialog mobile layout */
  .dialog-detail-task {
    width: 100vw !important;
    max-width: 100vw !important;
    max-height: 95vh !important;
    border-radius: 12px 12px 0 0 !important;
    margin: 0 !important;
  }

  .detail-two-col {
    flex-direction: column !important;
    overflow-y: auto !important;
  }

  .detail-left {
    flex: none !important;
    border-right: none !important;
    border-bottom: 1px solid rgba(58, 59, 62, 0.3);
    padding: 16px !important;
  }

  .detail-right {
    flex: none !important;
    min-height: 300px;
  }

  .detail-right-inner {
    padding: 14px !important;
  }

  .dialog-header {
    padding: 10px 14px !important;
  }

  .dialog-header-title {
    font-size: 0.85rem !important;
  }
}
</style>
