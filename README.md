# Task Management System

ระบบจัดการงานแบบ Kanban Board ที่พัฒนาด้วย Quasar Framework และ Firebase

## ฟีเจอร์หลัก

### 🔐 Authentication
- ระบบเข้าสู่ระบบด้วยอีเมลและรหัสผ่าน
- ใช้ Firebase Authentication
- ระบบสมัครสมาชิก

### 📁 Project Management
- สร้าง แก้ไข และลบโปรเจค
- จัดการสมาชิกในโปรเจค
- แสดงรายการโปรเจคในเมนูด้านซ้าย

### 📋 Task Management
- Kanban Board แสดงงานตามสถานะ (To Do, In Progress, Review, Done)
- สร้าง แก้ไข และลบงาน
- ระบบความสำคัญ (ต่ำ, ปานกลาง, สูง, เร่งด่วน)
- กำหนดวันที่ครบกำหนด

### 📝 Subtask System
- เพิ่ม subtask ในงานหลัก
- กำหนดผู้รับผิดชอบ subtask
- กำหนดวันที่ครบกำหนด subtask
- ระบบสรุปข้อมูลจาก subtask ไปยังงานหลัก

### 📅 Calendar View
- มุมมองปฏิทินสำหรับดู timeline
- แสดงงานตามวันที่ครบกำหนด
- ดูรายละเอียดงานในแต่ละวัน

### 🎨 UI/UX
- Dark theme ตามที่กำหนด
- สีหลัก: Teal (#00BFA6)
- Responsive design
- Drag & Drop สำหรับ Kanban Board

## การติดตั้ง

1. ติดตั้ง dependencies:
```bash
npm install
```

2. ตั้งค่า Firebase:
   - สร้างโปรเจคใน Firebase Console
   - เปิดใช้งาน Authentication (Email/Password)
   - เปิดใช้งาน Firestore Database
   - คัดลอก config ไปใส่ใน `src/boot/firebase.js`

3. รันโปรเจค:
```bash
npm run dev
```

## โครงสร้างโปรเจค

```
src/
├── boot/
│   └── firebase.js          # Firebase configuration
├── components/
│   ├── CalendarView.vue     # Calendar component
│   └── TaskCard.vue         # Task card component
├── layouts/
│   └── MainLayout.vue       # Main layout with sidebar
├── pages/
│   ├── IndexPage.vue        # Home page
│   ├── LoginPage.vue        # Login page
│   ├── RegisterPage.vue     # Register page
│   ├── ProjectPage.vue      # Project page with Kanban/Calendar
│   └── ProjectSettingsPage.vue # Project settings
├── router/
│   ├── index.js            # Router configuration
│   └── routes.js           # Route definitions
├── stores/
│   ├── auth.js             # Authentication store
│   ├── projects.js         # Projects store
│   └── tasks.js            # Tasks store
└── css/
    └── app.scss            # Global styles and theme
```

## การใช้งาน

### 1. สมัครสมาชิก/เข้าสู่ระบบ
- ไปที่หน้า Login หรือ Register
- กรอกอีเมลและรหัสผ่าน

### 2. สร้างโปรเจค
- คลิกปุ่ม "สร้างโปรเจคใหม่" ในเมนูด้านซ้าย
- กรอกชื่อและคำอธิบายโปรเจค

### 3. จัดการงาน
- เลือกโปรเจคจากเมนูด้านซ้าย
- ใช้ Kanban Board เพื่อจัดการงาน
- คลิกที่งานเพื่อดูรายละเอียดและจัดการ subtask

### 4. ดู Timeline
- เปลี่ยนเป็นมุมมอง Calendar
- ดูงานตามวันที่ครบกำหนด

### 5. ตั้งค่าโปรเจค
- คลิกปุ่ม Settings ในหน้าโปรเจค
- จัดการข้อมูลโปรเจคและสมาชิก

## เทคโนโลยีที่ใช้

- **Frontend**: Vue 3 + Quasar Framework
- **State Management**: Pinia
- **Backend**: Firebase (Authentication + Firestore)
- **Styling**: SCSS
- **Icons**: Material Icons

## สีที่ใช้

| สี | ค่า | ใช้สำหรับ |
|---|---|---|
| Primary Background | `#0E141B` | พื้นหลังหลัก |
| Surface Background | `#1A222C` | พื้นหลัง card/sidebar |
| Primary Accent | `#00BFA6` | สีหลัก (ปุ่ม, highlight) |
| Secondary Accent | `#26C6DA` | สีรอง |
| Text Primary | `#E0E0E0` | ข้อความหลัก |
| Text Secondary | `#9E9E9E` | ข้อความรอง |
| Border | `#2C3A45` | เส้นแบ่ง |
| Success | `#1DE9B6` | งานเสร็จแล้ว |
| Warning | `#FFD54F` | งานใกล้ครบกำหนด |
| Error | `#EF5350` | งานเกินกำหนด |

## การพัฒนาต่อ

### ฟีเจอร์ที่สามารถเพิ่มได้:
1. **Real-time Collaboration**: แสดงผู้ใช้งานที่กำลังออนไลน์
2. **File Attachments**: แนบไฟล์ในงาน
3. **Comments System**: ระบบคอมเมนต์ในงาน
4. **Notifications**: การแจ้งเตือน
5. **Advanced Filtering**: ระบบกรองงานที่ซับซ้อน
6. **Time Tracking**: ติดตามเวลาทำงาน
7. **Reports & Analytics**: รายงานและสถิติ
8. **Mobile App**: แอปมือถือ

### การปรับปรุง:
1. เพิ่ม Unit Tests
2. เพิ่ม E2E Tests
3. ปรับปรุง Performance
4. เพิ่ม PWA features
5. Internationalization (i18n)