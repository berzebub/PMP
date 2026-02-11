<template>
  <div class="login-page">
    <!-- Loading State -->
    <div v-if="authStore.loading" class="loading-container">
      <q-spinner-dots size="50px" color="primary" />
      <div class="text-h6 text-primary q-mt-md">กำลังโหลด...</div>
    </div>

    <div v-else class="login-container">
      <!-- Header Section -->
      <div class="login-header">
        <div class="logo-section">
          <div class="logo-icon">
            <q-icon name="task_alt" size="48px" />
          </div>
          <div class="logo-text">
            <h1 class="app-title">Task Management</h1>
            <p class="app-subtitle">จัดการงานของคุณอย่างมีประสิทธิภาพ</p>
          </div>
        </div>
      </div>

      <!-- Login Form Card -->
      <q-card class="login-card">
        <q-card-section class="card-header">
          <h2 class="login-title">เข้าสู่ระบบ</h2>
          <p class="login-subtitle">กรุณากรอกข้อมูลเพื่อเข้าสู่ระบบ</p>
        </q-card-section>

        <q-card-section class="card-body">
          <q-form @submit="handleLogin" class="login-form">
            <div class="input-group">
              <label class="input-label">อีเมล</label>
              <q-input v-model="email" type="email" outlined
                :rules="[val => !!val || 'กรุณากรอกอีเมล', val => isValidEmail(val) || 'รูปแบบอีเมลไม่ถูกต้อง']"
                :error="!!authStore.error" class="custom-input" placeholder="กรุณากรอกอีเมลของคุณ">
                <template v-slot:prepend>
                  <q-icon name="email" class="input-icon" />
                </template>
              </q-input>
            </div>

            <div class="input-group">
              <label class="input-label">รหัสผ่าน</label>
              <q-input v-model="password" :type="showPassword ? 'text' : 'password'" outlined
                :rules="[val => !!val || 'กรุณากรอกรหัสผ่าน']" :error="!!authStore.error" class="custom-input"
                placeholder="กรุณากรอกรหัสผ่าน">
                <template v-slot:prepend>
                  <q-icon name="lock" class="input-icon" />
                </template>
                <template v-slot:append>
                  <q-icon :name="showPassword ? 'visibility_off' : 'visibility'" class="cursor-pointer password-toggle"
                    @click="showPassword = !showPassword" />
                </template>
              </q-input>
            </div>

            <q-banner v-if="authStore.error" class="error-banner" rounded>
              <template v-slot:avatar>
                <q-icon name="error" />
              </template>
              {{ authStore.error }}
            </q-banner>

            <q-btn type="submit" class="login-button" :loading="authStore.loading" :disable="!email || !password">
              <q-icon name="login" class="q-mr-sm" />
              เข้าสู่ระบบ
            </q-btn>
          </q-form>
        </q-card-section>

        <q-separator />

        <q-card-section class="card-footer">
          <p class="register-text">
            ยังไม่มีบัญชี?
            <q-btn flat class="register-link" @click="$router.push('/register')">
              สมัครสมาชิก
            </q-btn>
          </p>
        </q-card-section>
      </q-card>

      <!-- Features Section -->
      <div class="features-section">
        <div class="feature-item">
          <q-icon name="dashboard" class="feature-icon" />
          <span>Kanban Board</span>
        </div>
        <div class="feature-item">
          <q-icon name="calendar_month" class="feature-icon" />
          <span>Calendar View</span>
        </div>
        <div class="feature-item">
          <q-icon name="group" class="feature-icon" />
          <span>Team Collaboration</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const handleLogin = async () => {
  try {
    await authStore.login(email.value, password.value)
    router.push('/')
  } catch (error) {
    console.error('Login error:', error)
  }
}
</script>

<style scoped>
/* Override Quasar heading sizes */
.text-h6 {
  font-size: 0.875rem !important;
}

.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
}

.login-container {
  width: 100%;
  max-width: 1200px;
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 60px;
  align-items: center;
}

/* Header Section */
.login-header {
  text-align: left;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 40px;
}

.logo-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #00BFA6, #26C6DA);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 32px rgba(0, 191, 166, 0.3);
}

.logo-icon .q-icon {
  color: white;
  font-size: 40px;
}

.app-title {
  font-size: 2.1rem;
  font-weight: 700;
  background: linear-gradient(135deg, #00BFA6, #26C6DA);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 10px 0;
  line-height: 1.2;
}

.app-subtitle {
  font-size: 0.85rem;
  color: #E0E0E0;
  margin: 0;
  opacity: 0.9;
}

/* Login Card */
.login-card {
  background: linear-gradient(145deg, #ffffff, #f8f9fa);
  border: 1px solid rgba(0, 191, 166, 0.2);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.card-header {
  text-align: center;
  padding: 40px 40px 20px 40px;
  background: linear-gradient(135deg, #00BFA6, #26C6DA);
  color: white;
}

.login-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: white;
  margin: 0 0 8px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.login-subtitle {
  font-size: 0.77rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  font-weight: 500;
}

.card-body {
  padding: 40px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-label {
  font-size: 0.7rem;
  font-weight: 700;
  color: #2C3A45;
  margin: 0 0 8px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.custom-input {
  font-size: 0.7rem;
}

.custom-input .q-field__control {
  background: #FFFFFF;
  border: 2px solid #E1E5E9;
  border-radius: 12px;
  min-height: 60px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.custom-input .q-field__control:hover {
  border-color: #00BFA6;
  background: #FFFFFF;
  box-shadow: 0 4px 12px rgba(0, 191, 166, 0.1);
  transform: translateY(-1px);
}

.custom-input.q-field--focused .q-field__control {
  border-color: #00BFA6;
  background: #FFFFFF;
  box-shadow: 0 0 0 4px rgba(0, 191, 166, 0.15);
  transform: translateY(-2px);
}

.custom-input .q-field__native {
  color: #2C3A45;
  padding: 18px 20px;
  font-size: 0.77rem;
  font-weight: 600;
}

.custom-input .q-field__label {
  color: #8B95A1;
  font-size: 0.65rem;
  font-weight: 600;
}

.input-icon {
  color: #00BFA6;
  font-size: 22px;
}

.password-toggle {
  color: #8B95A1;
  font-size: 22px;
  transition: all 0.2s ease;
  padding: 8px;
  border-radius: 6px;
}

.password-toggle:hover {
  color: #00BFA6;
  background: rgba(0, 191, 166, 0.1);
}

.error-banner {
  background: rgba(239, 83, 80, 0.1);
  border: 1px solid rgba(239, 83, 80, 0.3);
  color: #EF5350;
  border-radius: 12px;
  padding: 16px;
}

.login-button {
  background: linear-gradient(135deg, #00BFA6, #26C6DA);
  color: white;
  font-size: 0.85rem;
  font-weight: 700;
  padding: 20px 40px;
  border-radius: 15px;
  text-transform: none;
  box-shadow: 0 10px 30px rgba(0, 191, 166, 0.4);
  transition: all 0.3s ease;
  min-height: 64px;
  letter-spacing: 0.5px;
}

.login-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 40px rgba(0, 191, 166, 0.5);
  background: linear-gradient(135deg, #00D4AA, #2DD4DA);
}

.login-button:active {
  transform: translateY(-1px);
}

.login-button--disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.card-footer {
  padding: 30px 40px 40px 40px;
  text-align: center;
  background: linear-gradient(135deg, #F8F9FA, #FFFFFF);
  border-top: 1px solid rgba(0, 191, 166, 0.1);
}

.register-text {
  color: #5A6C7D;
  margin: 0;
  font-size: 0.7rem;
  font-weight: 600;
}

.register-link {
  color: #00BFA6;
  font-weight: 700;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, rgba(0, 191, 166, 0.1), rgba(38, 198, 218, 0.1));
  border: 1px solid rgba(0, 191, 166, 0.2);
}

.register-link:hover {
  background: linear-gradient(135deg, #00BFA6, #26C6DA);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 191, 166, 0.3);
}

/* Features Section */
.features-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 40px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #E0E0E0;
  font-size: 0.7rem;
  font-weight: 500;
  padding: 12px 0;
}

.feature-icon {
  color: #00BFA6;
  font-size: 24px;
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

/* Responsive Design */
@media (max-width: 768px) {
  .login-container {
    grid-template-columns: 1fr;
    gap: 40px;
    text-align: center;
  }

  .login-header {
    text-align: center;
  }

  .app-title {
    font-size: 1.75rem;
  }

  .card-header,
  .card-body,
  .card-footer {
    padding: 30px 20px;
  }

  .features-section {
    flex-direction: row;
    justify-content: center;
    flex-wrap: wrap;
    gap: 16px;
  }

  .feature-item {
    font-size: 0.65rem;
  }
}

@media (max-width: 480px) {
  .login-page {
    padding: 10px;
  }

  .app-title {
    font-size: 1.4rem;
  }

  .logo-section {
    flex-direction: column;
    gap: 16px;
  }

  .features-section {
    flex-direction: column;
    align-items: center;
  }
}
</style>
