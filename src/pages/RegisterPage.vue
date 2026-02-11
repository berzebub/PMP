<template>
    <div class="register-page">
        <!-- Loading State -->
        <div v-if="authStore.loading" class="loading-container">
            <q-spinner-dots size="50px" color="primary" />
            <div class="text-h6 text-primary q-mt-md">กำลังโหลด...</div>
        </div>

        <div v-else class="register-container">
            <!-- Header Section -->
            <div class="register-header">
                <div class="logo-section">
                    <div class="logo-icon">
                        <q-icon name="task_alt" size="48px" />
                    </div>
                    <div class="logo-text">
                        <h1 class="app-title">Task Management</h1>
                        <p class="app-subtitle">เริ่มต้นการจัดการงานของคุณ</p>
                    </div>
                </div>
            </div>

            <!-- Register Form Card -->
            <q-card class="register-card">
                <q-card-section class="card-header">
                    <h2 class="register-title">สมัครสมาชิก</h2>
                    <p class="register-subtitle">สร้างบัญชีใหม่เพื่อเริ่มใช้งาน</p>
                </q-card-section>

                <q-card-section class="card-body">
                    <q-form @submit="handleRegister" class="register-form">
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
                                :rules="[val => !!val || 'กรุณากรอกรหัสผ่าน', val => val.length >= 6 || 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร']"
                                :error="!!authStore.error" class="custom-input" placeholder="กรุณากรอกรหัสผ่าน">
                                <template v-slot:prepend>
                                    <q-icon name="lock" class="input-icon" />
                                </template>
                                <template v-slot:append>
                                    <q-icon :name="showPassword ? 'visibility_off' : 'visibility'"
                                        class="cursor-pointer password-toggle" @click="showPassword = !showPassword" />
                                </template>
                            </q-input>
                        </div>

                        <div class="input-group">
                            <label class="input-label">ยืนยันรหัสผ่าน</label>
                            <q-input v-model="confirmPassword" :type="showConfirmPassword ? 'text' : 'password'"
                                outlined
                                :rules="[val => !!val || 'กรุณายืนยันรหัสผ่าน', val => val === password || 'รหัสผ่านไม่ตรงกัน']"
                                :error="!!authStore.error" class="custom-input" placeholder="ยืนยันรหัสผ่านอีกครั้ง">
                                <template v-slot:prepend>
                                    <q-icon name="lock" class="input-icon" />
                                </template>
                                <template v-slot:append>
                                    <q-icon :name="showConfirmPassword ? 'visibility_off' : 'visibility'"
                                        class="cursor-pointer password-toggle"
                                        @click="showConfirmPassword = !showConfirmPassword" />
                                </template>
                            </q-input>
                        </div>

                        <q-banner v-if="authStore.error" class="error-banner" rounded>
                            <template v-slot:avatar>
                                <q-icon name="error" />
                            </template>
                            {{ authStore.error }}
                        </q-banner>

                        <q-btn type="submit" class="register-button" :loading="authStore.loading"
                            :disable="!email || !password || !confirmPassword || password !== confirmPassword">
                            <q-icon name="person_add" class="q-mr-sm" />
                            สมัครสมาชิก
                        </q-btn>
                    </q-form>
                </q-card-section>

                <q-separator />

                <q-card-section class="card-footer">
                    <p class="login-text">
                        มีบัญชีแล้ว?
                        <q-btn flat class="login-link" @click="$router.push('/login')">
                            เข้าสู่ระบบ
                        </q-btn>
                    </p>
                </q-card-section>
            </q-card>

            <!-- Benefits Section -->
            <div class="benefits-section">
                <div class="benefit-item">
                    <q-icon name="security" class="benefit-icon" />
                    <span>ปลอดภัยและเชื่อถือได้</span>
                </div>
                <div class="benefit-item">
                    <q-icon name="speed" class="benefit-icon" />
                    <span>ใช้งานง่ายและรวดเร็ว</span>
                </div>
                <div class="benefit-item">
                    <q-icon name="support" class="benefit-icon" />
                    <span>ทีมสนับสนุน 24/7</span>
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
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

const handleRegister = async () => {
    try {
        await authStore.register(email.value, password.value)
        router.push('/')
    } catch (error) {
        console.error('Register error:', error)
    }
}
</script>

<style scoped>
/* Override Quasar heading sizes */
.text-h6 {
  font-size: 0.875rem !important;
}

.register-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    position: relative;
}

.register-container {
    width: 100%;
    max-width: 1200px;
    display: grid;
    grid-template-columns: 1fr 400px;
    gap: 60px;
    align-items: center;
}

/* Header Section */
.register-header {
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

/* Register Card */
.register-card {
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

.register-title {
    font-size: 1.5rem;
    font-weight: 800;
    color: white;
    margin: 0 0 8px 0;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.register-subtitle {
    font-size: 0.77rem;
    color: rgba(255, 255, 255, 0.9);
    margin: 0;
    font-weight: 500;
}

.card-body {
    padding: 40px;
}

.register-form {
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

.register-button {
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

.register-button:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 40px rgba(0, 191, 166, 0.5);
    background: linear-gradient(135deg, #00D4AA, #2DD4DA);
}

.register-button:active {
    transform: translateY(-1px);
}

.register-button--disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.card-footer {
    padding: 30px 40px 40px 40px;
    text-align: center;
    background: linear-gradient(135deg, #F8F9FA, #FFFFFF);
    border-top: 1px solid rgba(0, 191, 166, 0.1);
}

.login-text {
    color: #5A6C7D;
    margin: 0;
    font-size: 0.7rem;
    font-weight: 600;
}

.login-link {
    color: #00BFA6;
    font-weight: 700;
    text-decoration: none;
    padding: 8px 16px;
    border-radius: 8px;
    transition: all 0.3s ease;
    background: linear-gradient(135deg, rgba(0, 191, 166, 0.1), rgba(38, 198, 218, 0.1));
    border: 1px solid rgba(0, 191, 166, 0.2);
}

.login-link:hover {
    background: linear-gradient(135deg, #00BFA6, #26C6DA);
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 191, 166, 0.3);
}

/* Benefits Section */
.benefits-section {
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin-top: 40px;
}

.benefit-item {
    display: flex;
    align-items: center;
    gap: 12px;
    color: #E0E0E0;
    font-size: 0.7rem;
    font-weight: 500;
    padding: 12px 0;
}

.benefit-icon {
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
    .register-container {
        grid-template-columns: 1fr;
        gap: 40px;
        text-align: center;
    }

    .register-header {
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

    .benefits-section {
        flex-direction: row;
        justify-content: center;
        flex-wrap: wrap;
        gap: 16px;
    }

    .benefit-item {
        font-size: 0.65rem;
    }
}

@media (max-width: 480px) {
    .register-page {
        padding: 10px;
    }

    .app-title {
        font-size: 1.4rem;
    }

    .logo-section {
        flex-direction: column;
        gap: 16px;
    }

    .benefits-section {
        flex-direction: column;
        align-items: center;
    }
}
</style>
