<template>
  <div class="flex min-h-screen">
    <!-- 左侧蓝色部分 -->
    <div class="hidden lg:flex lg:w-1/2 bg-primary items-center justify-center p-8">
      <div class="text-center text-white">
        <h1 class="text-5xl font-bold mb-6">电影院管理系统</h1>
        <p class="text-xl opacity-80">
          欢迎使用影院管理后台
          <br />
          高效便捷的影院运营解决方案
        </p>
      </div>
    </div>

    <!-- 右侧登录表单 -->
    <div class="w-full lg:w-1/2 flex items-center justify-center p-8">
      <!-- 小屏幕时显示白色面板 -->
      <div class="w-full max-w-md lg:bg-transparent bg-white rounded-lg shadow-md lg:shadow-none p-6 lg:p-0">
        <VaForm ref="form" class="w-full" @submit.prevent="handleLogin">
          <div class="mb-8 text-center">
            <h1 class="text-4xl font-bold mb-4">管理员登录</h1>
            <p class="text-secondary">请输入您的管理员账号和密码</p>
          </div>

          <!-- 管理员ID输入框 -->
          <VaInput
            v-model="formData.managerId"
            :rules="[(v) => !!v || '请输入管理员ID']"
            class="mb-6"
            label="管理员ID"
            placeholder="请输入管理员ID"
          />

          <!-- 密码输入框 -->
          <VaValue v-slot="isPasswordVisible" :default-value="false">
            <VaInput
              v-model="formData.password"
              :rules="[(v) => !!v || '请输入密码']"
              :type="isPasswordVisible.value ? 'text' : 'password'"
              class="mb-6"
              label="密码"
              placeholder="请输入密码"
              @clickAppendInner.stop="isPasswordVisible.value = !isPasswordVisible.value"
            >
              <template #appendInner>
                <VaIcon
                  :name="isPasswordVisible.value ? 'mso-visibility_off' : 'mso-visibility'"
                  class="cursor-pointer"
                  color="secondary"
                />
              </template>
            </VaInput>
          </VaValue>

          <!-- 登录按钮 -->
          <div class="flex justify-center mt-4">
            <VaButton @click="handleLogin"> 登录 </VaButton>
          </div>
        </VaForm>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useForm, useToast } from 'vuestic-ui'
import { managerAPI } from '../../api'

const router = useRouter()
const { validate } = useForm('form')
const { init: showToast } = useToast()

// 表单数据
const formData = reactive({
  managerId: '',
  password: '',
})

const loading = ref(false)

// 登录处理
const handleLogin = async () => {
  if (!validate()) return

  loading.value = true

  try {
    const result = await managerAPI.managerLogin({
      managerId: formData.managerId,
      password: formData.password,
    })

    if (result.status === 200) {
      showToast({
        message: '登录成功',
        color: 'success',
      })

      // 存储登录状态
      localStorage.setItem('isLoggedIn', 'true')
      localStorage.setItem('loginTime', new Date().toISOString())
      localStorage.setItem('managerId', formData.managerId)

      // 跳转到管理员首页
      router.push({ name: 'dashboard' })
    } else {
      showToast({
        message: '登录失败，请检查账号密码',
        color: 'danger',
      })
    }
  } catch (error: any) {
    console.error('Login error:', error)
    showToast({
      message: '登录失败，请检查账号密码',
      color: 'danger',
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.bg-primary {
  background-color: var(--va-primary);
}

.text-secondary {
  color: var(--va-text-secondary);
}

/* 添加渐变效果 */
.bg-primary {
  background: linear-gradient(135deg, var(--va-primary) 0%, #2c82e0 100%);
}

/* 响应式调整 */
@media (max-width: 1024px) {
  .w-full {
    padding: 1rem;
  }
}
</style>
